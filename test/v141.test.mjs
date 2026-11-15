// Pimba v1.4.1 — testes da correção de rolagem lateral no celular (node --test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizar, renderResultado } from '../assets/js/render.js';
import { LOTERIAS } from '../assets/js/loterias.js';
import { fixture } from './mock-caixa.mjs';

test('toda tabela do resultado fica dentro de .tabela-rolagem (não estica a página no celular)', () => {
  for (const l of LOTERIAS) {
    const html = renderResultado(normalizar(fixture(l.api, 100), l), l);
    const tabelas = (html.match(/<table/g) || []).length;
    const embrulhadas = (html.match(/<div class="tabela-rolagem"><table/g) || []).length;
    assert.ok(tabelas > 0, l.slug);
    assert.equal(embrulhadas, tabelas, `${l.slug}: tabela fora de .tabela-rolagem`);
  }
});

test('CSS: coluna única do layout-2 usa minmax(0, 1fr) para não crescer além da tela', () => {
  const css = readFileSync(new URL('../assets/css/style.css', import.meta.url), 'utf8');
  assert.match(css, /@media \(max-width: 920px\) \{ \.layout-2 \{ grid-template-columns: minmax\(0, 1fr\); \} \}/);
});
