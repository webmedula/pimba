// Pimba v1.6.2 — testes: os imports entre módulos do navegador levam ?v=<versão> (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from '../src/config.js';
import { versionarImportsTexto } from '../scripts/versionar.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('versionarImportsTexto põe ?v= nos imports relativos e não mexe no resto', () => {
  const js = `import { a } from './render.js';\nimport {b} from "../x/stats.mjs";\nexport { c } from './c.js';\nconst m = import('./lazy.js');\nimport x from 'https://cdn/x.js';\nconst s = 'from ./texto.js';`;
  const out = versionarImportsTexto(js, '9.9.9');
  assert.match(out, /from '\.\/render\.js\?v=9\.9\.9'/);
  assert.match(out, /from "\.\.\/x\/stats\.mjs\?v=9\.9\.9"/);
  assert.match(out, /export \{ c \} from '\.\/c\.js\?v=9\.9\.9'/);
  assert.match(out, /import\('\.\/lazy\.js\?v=9\.9\.9'\)/);
  assert.match(out, /'https:\/\/cdn\/x\.js'/);
  assert.match(out, /'from \.\/texto\.js'/);
  assert.equal(versionarImportsTexto(out, '9.9.9'), out, 'rodar de novo não duplica o ?v=');
});

test('no dist, nenhum módulo importa outro sem a versão (conferidor não mistura arquivo novo com antigo do cache)', () => {
  execFileSync(process.execPath, [join(ROOT, 'scripts/build.mjs')], { stdio: 'ignore' });
  const pasta = join(ROOT, 'dist/assets/js');
  let imports = 0;
  for (const nome of readdirSync(pasta).filter((n) => n.endsWith('.js'))) {
    const js = readFileSync(join(pasta, nome), 'utf8');
    for (const [, cam] of js.matchAll(/\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
      imports++;
      assert.ok(cam.endsWith(`?v=${SITE.versao}`), `${nome} importa ${cam} sem ?v=${SITE.versao}`);
    }
  }
  assert.ok(imports > 10, 'esperava achar os imports dos módulos');
  const conf = readFileSync(join(pasta, 'conferidor.js'), 'utf8');
  assert.match(conf, new RegExp(`from '\\./render\\.js\\?v=${SITE.versao.replace(/\./g, '\\.')}'`));
});
