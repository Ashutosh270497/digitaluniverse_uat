import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../', import.meta.url));

const importsIn = (source, filename) => {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const imports = [];
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      imports.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      assert.ok(ts.isStringLiteral(node.arguments[0]), `${filename}: dynamic import must be explicit`);
      imports.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return imports;
};

test('relative imports resolve and browser/shared code respect runtime boundaries', async () => {
  for (const directory of ['src', 'shared', 'server', 'api', 'build']) {
    const files = await readdir(resolve(root, directory), { recursive: true });
    for (const filename of files.filter((name) => /\.(?:js|jsx|ts)$/.test(name) && !name.endsWith('.d.ts'))) {
      const absolute = resolve(root, directory, filename);
      const owner = relative(root, absolute).split(sep).join('/');
      for (const specifier of importsIn(await readFile(absolute, 'utf8'), absolute)) {
        if (!specifier.startsWith('.')) {
          if (directory === 'src') assert.ok(!specifier.startsWith('node:'), `${owner} imports ${specifier}`);
          if (directory === 'shared') assert.fail(`${owner} must not depend on platform or package code`);
          continue;
        }
        const target = resolve(dirname(absolute), specifier);
        await access(target);
        const targetPath = relative(root, target).split(sep).join('/');
        if (directory === 'src') {
          assert.ok(/^(src|shared)\//.test(targetPath), `${owner} must not import ${targetPath}`);
        }
        if (directory === 'shared') {
          assert.ok(targetPath.startsWith('shared/'), `${owner} must not import ${targetPath}`);
        }
        if (owner.startsWith('src/components/')) {
          assert.ok(!targetPath.startsWith('src/pages/'), `${owner} must not depend on a page`);
        }
      }
    }
  }
});
