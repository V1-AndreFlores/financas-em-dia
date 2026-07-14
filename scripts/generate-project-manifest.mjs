import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const root = resolve(process.cwd());
const outputName = 'MANIFESTO_PROJETO.json';
const ignoredDirectories = new Set([
  '.git',
  '.expo',
  'node_modules',
  'dist',
  'dist-web',
  'dist-android',
  'dist-ios',
]);

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const result = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const absolutePath = resolve(directory, entry);
    const fileStat = await stat(absolutePath);

    if (fileStat.isDirectory()) {
      result.push(...(await collectFiles(absolutePath)));
      continue;
    }

    const projectPath = relative(root, absolutePath).replaceAll('\\\\', '/');

    if (projectPath === outputName) {
      continue;
    }

    const content = await readFile(absolutePath);
    const sha256 = createHash('sha256').update(content).digest('hex');

    result.push({ path: projectPath, size: content.length, sha256 });
  }

  return result;
}

const files = (await collectFiles(root)).sort((a, b) => a.path.localeCompare(b.path));
const manifest = {
  project: 'Finanças em Dia',
  baselineVersion: '1.1.4',
  generatedAt: new Date().toISOString(),
  algorithm: 'SHA-256',
  fileCount: files.length,
  files,
};

await writeFile(resolve(root, outputName), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifesto gerado com ${files.length} arquivos.`);
