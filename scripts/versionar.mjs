// Pimba v1.6.2 — versiona os imports entre módulos do navegador (usado pelo build)
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * v1.6.2 — os scripts da página levam ?v=<versão>, mas os imports entre módulos (from './render.js') não levavam.
 * Depois de um deploy, o navegador juntava o conferidor.js novo com o render.js antigo do cache (1 hora) e o
 * módulo inteiro falhava ("does not provide an export named ..."): a grade do conferidor sumia.
 * Aqui todo import relativo de dist/assets/js ganha o mesmo ?v=, então uma versão nova nunca mistura arquivos.
 */
export function versionarImportsTexto(js, versao) {
  return js.replace(/(\bfrom\s*|\bimport\s*\(?\s*)(['"])(\.{1,2}\/[^'"?]+\.m?js)\2/g, (_, pre, q, cam) => `${pre}${q}${cam}?v=${versao}${q}`);
}
export function versionarImports(pasta, versao) {
  for (const nome of readdirSync(pasta)) {
    if (!/\.m?js$/.test(nome)) continue;
    const arq = join(pasta, nome);
    writeFileSync(arq, versionarImportsTexto(readFileSync(arq, 'utf8'), versao));
  }
}
