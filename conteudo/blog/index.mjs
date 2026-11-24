// Pimba v1.6.0 — lista de artigos do blog, na ordem em que aparecem em /blog/.
// Para publicar um artigo novo: crie o objeto num dos arquivos desta pasta (slug, titulo, descricao,
// categoria, data AAAA-MM-DD, html) e rode `npm run build`. Ele entra sozinho no índice e no sitemap.
import { MODALIDADES } from './modalidades.mjs';
import { CHANCES } from './chances.mjs';
import { PRATICOS } from './praticos.mjs';

export const CATEGORIAS = ['Como jogar', 'Chances e matemática', 'Bolões', 'Dicas práticas', 'Segurança'];

export const ARTIGOS = [...MODALIDADES, ...CHANCES, ...PRATICOS].map((a) => {
  const html = a.html();
  const palavras = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return { ...a, html, palavras, leitura: Math.max(1, Math.round(palavras / 200)) };
});

export const POR_SLUG_BLOG = Object.fromEntries(ARTIGOS.map((a) => [a.slug, a]));
