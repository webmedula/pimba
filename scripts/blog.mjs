// Pimba v1.6.0 — blog: dados estruturados e utilidades. Os artigos ficam em conteudo/blog/.
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** '2026-11-24' → '24 de novembro de 2026' */
export function dataLonga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** Dados estruturados BlogPosting (Google: artigo com data, autor e editor). */
export function ldArtigo(a, site) {
  const url = `${site.url}/blog/${a.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.titulo,
    description: a.descricao,
    datePublished: a.data,
    dateModified: a.atualizado || a.data,
    inLanguage: 'pt-BR',
    mainEntityOfPage: url,
    url,
    image: `${site.url}/assets/img/og.png`,
    wordCount: a.palavras,
    articleSection: a.categoria,
    author: { '@type': 'Organization', name: 'Equipe Pimba', url: `${site.url}/sobre/` },
    publisher: { '@type': 'Organization', name: 'Pimba', url: site.url, logo: { '@type': 'ImageObject', url: `${site.url}/assets/img/app/icon-512.png` } },
  };
}

/** Artigos relacionados: primeiro os da mesma categoria, depois os linkados no texto, depois os demais. */
export function relacionados(a, todos, n = 3) {
  const linkados = new Set([...a.html.matchAll(/href="\/blog\/([a-z0-9-]+)\/"/g)].map((m) => m[1]));
  const pontos = (b) => (b.categoria === a.categoria ? 2 : 0) + (linkados.has(b.slug) ? 1 : 0);
  return todos.filter((b) => b.slug !== a.slug).map((b, i) => ({ b, p: pontos(b), i })).sort((x, y) => y.p - x.p || x.i - y.i).slice(0, n).map((x) => x.b);
}
