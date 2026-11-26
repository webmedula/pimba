// Pimba v1.6.3 — normalização dos dados da Caixa e renderização (usado no Worker e no navegador)

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export { esc };

export const brl = (v) =>
  typeof v === 'number' && !Number.isNaN(v)
    ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—';

export const brlCurto = (v) => {
  if (typeof v !== 'number' || !v) return '—';
  if (v >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} milhões`;
  if (v >= 1e3) return `R$ ${(v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mil`;
  return brl(v);
};

/**
 * Time do Coração (Timemania) ou Mês de Sorte (Dia de Sorte). A CAIXA manda esse campo em todas as loterias,
 * e nas outras ele vem preenchido com caracteres invisíveis (\u0000), o que fazia aparecer um "Time:" vazio.
 */
export const limparExtra = (s) => String(s ?? '').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200d\ufeff]/g, '').trim();
export const extraDe = (r, lot) => (lot?.extra && r ? limparExtra(r.timeMes) : '');

export const fmtInt = (n) => (typeof n === 'number' ? n.toLocaleString('pt-BR') : '—');

/** Converte o JSON bruto da API da Caixa num formato estável para o site. */
export function normalizar(raw, lot) {
  if (!raw || typeof raw !== 'object' || !raw.numero) throw new Error('Resposta inválida da Caixa');
  const premios = (raw.listaRateioPremio || []).map((p) => ({
    faixa: p.faixa,
    descricao: p.descricaoFaixa || `${p.faixa}ª faixa`,
    ganhadores: p.numeroDeGanhadores ?? 0,
    valor: p.valorPremio ?? 0,
  }));
  const jogos = (raw.listaResultadoEquipeEsportiva || []).map((j) => ({
    n: j.nuSequencial,
    mandante: j.nomeEquipeUm,
    visitante: j.nomeEquipeDois,
    golsM: j.nuGolEquipeUm,
    golsV: j.nuGolEquipeDois,
    dia: j.diaSemana || '',
  }));
  return {
    slug: lot.slug,
    nome: lot.nome,
    concurso: raw.numero,
    data: raw.dataApuracao || '',
    dezenas: raw.listaDezenas || [],
    ordem: raw.dezenasSorteadasOrdemSorteio || [],
    dezenas2: raw.listaDezenasSegundoSorteio || [],
    trevos: raw.trevosSorteados || [],
    timeMes: lot.extra ? limparExtra(raw.nomeTimeCoracaoMesSorte) : '',
    acumulado: !!raw.acumulado,
    premios,
    jogos,
    ganhadoresLocais: (raw.listaMunicipioUFGanhadores || []).map((g) => ({
      cidade: g.municipio, uf: g.uf, ganhadores: g.ganhadores, canal: g.nomeFatansiaUL || '',
    })),
    local: [raw.localSorteio, raw.nomeMunicipioUFSorteio].filter(Boolean).join(' — '),
    arrecadado: raw.valorArrecadado ?? null,
    anterior: raw.numeroConcursoAnterior || (raw.numero > 1 ? raw.numero - 1 : null),
    ultimo: raw.ultimoConcurso !== false,
    proximo: {
      concurso: raw.numeroConcursoProximo || raw.numero + 1,
      data: raw.dataProximoConcurso || '',
      estimativa: raw.valorEstimadoProximoConcurso ?? null,
    },
    acumuladoEspecial: raw.valorAcumuladoConcursoEspecial ?? null,
  };
}

const pad = (d, lot) => {
  const s = String(d).replace(/^0+(?=\d)/, '');
  if (lot.tipo === 'federal') return String(d);
  if (lot.zeroPad) return s.padStart(2, '0');
  if (lot.tipo === 'colunas') return s;
  return s.padStart(2, '0');
};

export function bolas(lista, lot, cls = '') {
  return `<ul class="bolas ${cls}" style="--cor:${lot.cor};--cor-texto:${lot.corTexto || '#fff'}">${lista
    .map((d) => `<li>${esc(pad(d, lot))}</li>`)
    .join('')}</ul>`;
}

export const SITE_CAIXA = 'https://loterias.caixa.gov.br/';

/** v1.6.3 — aviso para resultado guardado que a CAIXA não conseguiu confirmar agora. */
const avisoDesatualizado = (r, cls) =>
  r.desatualizado
    ? `<p class="${cls}">A CAIXA não está respondendo agora: este é o último resultado que conseguimos buscar e pode já haver um concurso mais novo.</p>`
    : '';

/** Bloco compacto (cards da home e lista de resultados). */
export function renderCard(r, lot) {
  if (!r) {
    return `<article class="card-res" style="--cor:${lot.cor}"><header><h3><a href="/resultados/${lot.slug}/">${esc(lot.nome)}</a></h3></header><p class="muted">A CAIXA não está respondendo para a ${esc(lot.nome)} agora. <a href="/resultados/${lot.slug}/" data-tentar="${lot.slug}">Tentar de novo</a> ou ver no <a href="${SITE_CAIXA}" target="_blank" rel="noopener">site da CAIXA</a>.</p></article>`;
  }
  let corpo = '';
  if (lot.tipo === 'loteca') {
    corpo = `<p class="muted">${r.jogos.length} jogos — veja o placar completo.</p>`;
  } else if (lot.tipo === 'federal') {
    corpo = `<p class="federal-mini">1º prêmio: <strong>${esc(r.dezenas[0] || '—')}</strong></p>`;
  } else {
    corpo = bolas(r.dezenas, lot, 'mini');
    if (r.trevos.length) corpo += `<p class="extra">Trevos: ${r.trevos.map(esc).join(' e ')}</p>`;
    if (extraDe(r, lot)) corpo += `<p class="extra">${lot.extra === 'mes' ? 'Mês' : 'Time'}: ${esc(extraDe(r, lot))}</p>`;
  }
  const status = r.acumulado
    ? `<span class="tag tag-acum">Acumulou!</span>`
    : lot.tipo === 'federal' || lot.tipo === 'loteca' ? '' : `<span class="tag">Saiu</span>`;
  const prox = r.proximo.estimativa
    ? `<p class="prox">Próximo (${esc(r.proximo.data)}): <strong>${brlCurto(r.proximo.estimativa)}</strong></p>`
    : '';
  return `<article class="card-res" style="--cor:${lot.cor}">
  <header><h3><a href="/resultados/${lot.slug}/">${esc(lot.nome)}</a></h3>${status}</header>
  <p class="muted">Concurso ${fmtInt(r.concurso)} · ${esc(r.data)}</p>
  ${corpo}
  ${prox}
  ${avisoDesatualizado(r, 'aviso-mini')}
  <a class="link-mais" href="/resultados/${lot.slug}/${r.concurso}/">Ver prêmios →</a>
</article>`;
}

/** Bloco completo da página de resultado. */
export function renderResultado(r, lot) {
  let sorteio = '';
  if (lot.tipo === 'loteca') {
    sorteio = `<div class="tabela-rolagem"><table class="tabela loteca"><thead><tr><th>#</th><th>Mandante</th><th>Placar</th><th>Visitante</th></tr></thead><tbody>${r.jogos
      .map((j) => `<tr><td>${j.n}</td><td>${esc(j.mandante)}</td><td class="placar">${j.golsM ?? '-'} × ${j.golsV ?? '-'}</td><td>${esc(j.visitante)}</td></tr>`)
      .join('')}</tbody></table></div>`;
  } else if (lot.tipo === 'federal') {
    sorteio = `<div class="tabela-rolagem"><table class="tabela"><thead><tr><th>Prêmio</th><th>Bilhete</th><th>Valor</th></tr></thead><tbody>${r.dezenas
      .map((b, i) => `<tr><td>${i + 1}º</td><td class="bilhete">${esc(b)}</td><td>${brl(r.premios[i]?.valor)}</td></tr>`)
      .join('')}</tbody></table></div>`;
  } else {
    sorteio = `<h2 class="h-sorteio">${r.dezenas2.length ? '1º sorteio' : 'Números sorteados'}</h2>${bolas(r.dezenas, lot, 'grandes')}`;
    if (r.dezenas2.length) sorteio += `<h2 class="h-sorteio">2º sorteio</h2>${bolas(r.dezenas2, lot, 'grandes')}`;
    if (r.trevos.length) sorteio += `<h2 class="h-sorteio">Trevos</h2>${bolas(r.trevos, lot, 'grandes trevos')}`;
    if (extraDe(r, lot)) sorteio += `<p class="extra-grande">${lot.extra === 'mes' ? 'Mês de Sorte' : 'Time do Coração'}: <strong>${esc(extraDe(r, lot))}</strong></p>`;
    if (r.ordem.length && lot.tipo === 'dezenas' && !lot.duplo) {
      sorteio += `<p class="muted small">Ordem do sorteio: ${r.ordem.map((d) => esc(pad(d, lot))).join(' · ')}</p>`;
    }
  }

  const premios = lot.tipo === 'federal' ? '' : !r.premios.length ? `<h2>Premiação</h2>
<p class="muted">A premiação deste concurso não está disponível agora. Confira no <a href="${SITE_CAIXA}" target="_blank" rel="noopener">site oficial das Loterias CAIXA</a>.</p>` : `<h2>Premiação</h2>
<div class="tabela-rolagem"><table class="tabela premios"><thead><tr><th>Faixa</th><th>Ganhadores</th><th>Prêmio</th></tr></thead><tbody>${r.premios
    .map((p) => `<tr data-faixa="${esc(p.descricao)}"><td>${esc(p.descricao)}</td><td>${p.ganhadores ? fmtInt(p.ganhadores) : 'Não houve'}</td><td>${p.ganhadores ? brl(p.valor) : '—'}</td></tr>`)
    .join('')}</tbody></table></div>`;

  const locais = r.ganhadoresLocais.length
    ? `<h3>Onde saiu o prêmio principal</h3><ul class="lista-locais">${r.ganhadoresLocais
        .map((g) => `<li>${esc(g.cidade)}/${esc(g.uf)} — ${fmtInt(g.ganhadores)} aposta(s)${g.canal ? ` (${esc(g.canal)})` : ''}</li>`)
        .join('')}</ul>`
    : '';

  const destaque = r.acumulado
    ? `<div class="faixa-acum">Acumulou! Estimativa para o concurso ${fmtInt(r.proximo.concurso)}: <strong>${brl(r.proximo.estimativa)}</strong></div>`
    : r.proximo.estimativa
      ? `<div class="faixa-prox">Próximo concurso (${fmtInt(r.proximo.concurso)}): estimativa de <strong>${brl(r.proximo.estimativa)}</strong></div>`
      : '';

  const nav = `<nav class="nav-concursos" aria-label="Outros concursos">
  ${r.concurso > 1 ? `<a href="/resultados/${lot.slug}/${r.concurso - 1}/" rel="prev">← Concurso ${fmtInt(r.concurso - 1)}</a>` : '<span></span>'}
  ${!r.ultimo ? `<a href="/resultados/${lot.slug}/${r.concurso + 1}/" rel="next">Concurso ${fmtInt(r.concurso + 1)} →</a>` : `<span class="muted">Último resultado</span>`}
</nav>`;

  return `${avisoDesatualizado(r, 'aviso')}<div class="res-topo" style="--cor:${lot.cor}">
  <p class="res-meta">Concurso <strong>${fmtInt(r.concurso)}</strong> · ${esc(r.data)}${r.local ? ` · ${esc(r.local)}` : ''}</p>
  ${sorteio}
</div>
${destaque}
${premios}
${locais}
${r.proximo.data ? `<p class="muted">Próximo sorteio: ${esc(r.proximo.data)}.</p>` : ''}
${r.arrecadado ? `<p class="muted small">Arrecadação total: ${brl(r.arrecadado)}.</p>` : ''}
${nav}
<p class="muted small">Fonte: Loterias CAIXA. Confira sempre o resultado oficial antes de descartar seu bilhete.</p>`;
}

/** Texto para <title> e meta description. */
export function seo(r, lot) {
  const nums = lot.tipo === 'dezenas' || lot.tipo === 'colunas' ? r.dezenas.map((d) => pad(d, lot)).join('-') : '';
  return {
    title: `Resultado ${lot.nome} ${r.concurso} (${r.data})${nums ? ` — ${nums}` : ''} | Pimba`,
    description: `Resultado da ${lot.nome} concurso ${r.concurso}, sorteado em ${r.data}${nums ? `: ${nums}` : ''}. ${r.acumulado ? 'Acumulou! ' : ''}Veja ganhadores, prêmios por faixa e a estimativa do próximo concurso.`,
  };
}
