#!/usr/bin/env node
// Manifest + skill checks for this plugin repo. No dependencies.
//
// Exit 0 on a clean tree. Exit 1 and print every failure when something
// drifted: version mismatch, a skill directory that does not match its
// frontmatter name, a description over the listing budget, or leftover
// placeholder text in a SKILL.md.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESCRIPTION_BUDGET = 1536;
const failures = [];

const fail = (msg) => {
  failures.push(msg);
};

const read = (rel) => {
  const path = join(root, rel);
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    fail(`${rel}: cannot read (${err.code ?? err.message})`);
    return null;
  }
};

const loadJson = (rel) => {
  const raw = read(rel);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch (err) {
    fail(`${rel}: JSON parse error: ${err.message}`);
    return null;
  }
};

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const requireString = (obj, key, rel, extra = '') => {
  const value = obj[key];
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${rel}: missing or empty "${key}"${extra}`);
    return null;
  }
  return value.trim();
};

const SEMVER = /^\d+\.\d+\.\d+$/;
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLACEHOLDER =
  /\bTODO\b|\bFIXME\b|\bTBD\b|\bXXX\b|\blorem ipsum\b|\[insert[^\]]*\]|<\s*placeholder\s*>/i;

function parseFrontmatter(raw, rel) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    fail(`${rel}: missing YAML frontmatter delimited by ---`);
    return null;
  }
  const fields = {};
  let key = null;
  let folded = false;
  let chunks = [];

  const flush = () => {
    if (key === null) return;
    fields[key] = chunks.join(folded ? ' ' : '\n').trim();
    key = null;
    folded = false;
    chunks = [];
  };

  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    const indented = /^(?:  |\t)\s*(.*)$/.exec(line);
    if (kv) {
      flush();
      key = kv[1];
      const rest = kv[2];
      if (rest === '>' || rest === '>-' || rest === '|' || rest === '|-') {
        folded = true;
        chunks = [];
      } else {
        folded = false;
        chunks = [rest.replace(/^['"]|['"]$/g, '')];
      }
      continue;
    }
    if (key !== null && indented) {
      chunks.push(indented[1]);
      continue;
    }
    if (line.trim() === '' && key !== null) continue;
    fail(`${rel}: unparseable frontmatter line: ${JSON.stringify(line)}`);
  }
  flush();
  return fields;
}

const plugin = loadJson('.claude-plugin/plugin.json');
const marketplace = loadJson('.claude-plugin/marketplace.json');

let pluginName = null;
let pluginVersion = null;

if (plugin !== null) {
  if (!isPlainObject(plugin)) {
    fail('.claude-plugin/plugin.json: root must be an object');
  } else {
    pluginName = requireString(plugin, 'name', '.claude-plugin/plugin.json');
    pluginVersion = requireString(plugin, 'version', '.claude-plugin/plugin.json');
    requireString(plugin, 'description', '.claude-plugin/plugin.json');
    if (pluginName !== null && !KEBAB.test(pluginName)) {
      fail(`.claude-plugin/plugin.json: name "${pluginName}" is not kebab-case`);
    }
    if (pluginVersion !== null && !SEMVER.test(pluginVersion)) {
      fail(`.claude-plugin/plugin.json: version "${pluginVersion}" is not x.y.z`);
    }
    if (!isPlainObject(plugin.author) || typeof plugin.author.name !== 'string' || plugin.author.name.trim() === '') {
      fail('.claude-plugin/plugin.json: author.name is required');
    }
  }
}

if (marketplace !== null) {
  if (!isPlainObject(marketplace)) {
    fail('.claude-plugin/marketplace.json: root must be an object');
  } else {
    const marketName = requireString(marketplace, 'name', '.claude-plugin/marketplace.json');
    if (marketName !== null && !KEBAB.test(marketName)) {
      fail(`.claude-plugin/marketplace.json: name "${marketName}" is not kebab-case`);
    }
    if (!isPlainObject(marketplace.owner) || typeof marketplace.owner.name !== 'string' || marketplace.owner.name.trim() === '') {
      fail('.claude-plugin/marketplace.json: owner.name is required');
    }
    if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
      fail('.claude-plugin/marketplace.json: plugins must be a non-empty array');
    } else {
      const entry = marketplace.plugins.find(
        (item) => isPlainObject(item) && item.name === pluginName,
      ) ?? marketplace.plugins[0];
      if (!isPlainObject(entry)) {
        fail('.claude-plugin/marketplace.json: plugins[0] must be an object');
      } else {
        const entryName = requireString(entry, 'name', '.claude-plugin/marketplace.json plugins[]');
        const entryVersion = requireString(entry, 'version', '.claude-plugin/marketplace.json plugins[]');
        requireString(entry, 'description', '.claude-plugin/marketplace.json plugins[]');
        if (entry.source !== './') {
          fail(`.claude-plugin/marketplace.json: expected plugins[].source "./", got ${JSON.stringify(entry.source)}`);
        }
        if (pluginName !== null && entryName !== null && entryName !== pluginName) {
          fail(`plugin name drift: plugin.json "${pluginName}" vs marketplace "${entryName}"`);
        }
        if (pluginVersion !== null && entryVersion !== null && entryVersion !== pluginVersion) {
          fail(`plugin version drift: plugin.json "${pluginVersion}" vs marketplace "${entryVersion}"`);
        }
      }
    }
  }
}

const skillsRoot = join(root, 'skills');
let skillDirs = [];
try {
  skillDirs = readdirSync(skillsRoot).filter((name) => {
    const path = join(skillsRoot, name);
    return statSync(path).isDirectory();
  });
} catch (err) {
  fail(`skills/: cannot read (${err.code ?? err.message})`);
}

if (skillDirs.length === 0 && failures.every((msg) => !msg.startsWith('skills/'))) {
  fail('skills/: no skill directories found');
}

for (const name of skillDirs) {
  const rel = `skills/${name}/SKILL.md`;
  const raw = read(rel);
  if (raw === null) continue;
  const fields = parseFrontmatter(raw, rel);
  if (fields === null) continue;
  const fmName = fields.name;
  if (!fmName) {
    fail(`${rel}: frontmatter missing "name"`);
  } else if (fmName !== name) {
    fail(`${rel}: frontmatter name "${fmName}" does not match directory "${name}"`);
  }
  const description = fields.description;
  if (!description) {
    fail(`${rel}: frontmatter missing "description"`);
  } else if (description.length > DESCRIPTION_BUDGET) {
    fail(`${rel}: description is ${description.length} characters (budget ${DESCRIPTION_BUDGET})`);
  }
  if (PLACEHOLDER.test(raw)) {
    const hit = raw.match(PLACEHOLDER)[0];
    fail(`${rel}: unresolved placeholder text (${JSON.stringify(hit)})`);
  }
}

if (failures.length > 0) {
  console.error(`validate: ${failures.length} failure(s)`);
  for (const msg of failures) console.error(`  - ${msg}`);
  process.exit(1);
}

const skillList = skillDirs.join(', ') || '(none)';
console.log(`validate: ok — plugin ${pluginName}@${pluginVersion}, skills: ${skillList}`);
console.log(`  marketplace ${relative(root, join(root, '.claude-plugin/marketplace.json')).replaceAll('\\', '/')}`);
