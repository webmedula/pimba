// Pimba v1.1.0 — calendário de sorteios: datas e horários calculados a partir de LOTERIAS[].sorteios
// Usado no build (páginas /calendario/), no navegador (próximos sorteios e "hoje tem") e nos testes.
import { LOTERIAS } from './loterias.js';

export const DIAS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
export const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
/** Ordem de exibição da semana: segunda a domingo. */
export const SEMANA = [1, 2, 3, 4, 5, 6, 0];

const d2 = (n) => String(n).padStart(2, '0');

/** Data e hora atuais no horário de Brasília, sem depender do fuso do visitante ou do servidor. */
export function agoraBrasilia(data = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(data).map((p) => [p.type, p.value]),
  );
  const ano = +partes.year, mes = +partes.month, dia = +partes.day;
  return { ano, mes, dia, hora: +partes.hour, minuto: +partes.minute, diaSemana: new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay() };
}

/** Loterias com sorteio num dia da semana (0 = domingo), em ordem de horário e nome. */
export function sorteiosDoDia(diaSemana) {
  return LOTERIAS.filter((l) => l.sorteios)
    .flatMap((l) => l.sorteios.filter(([d]) => d === diaSemana).map(([, hora]) => ({ lot: l, hora })))
    .sort((a, b) => a.hora - b.hora || a.lot.nome.localeCompare(b.lot.nome, 'pt-BR'));
}

/**
 * Próximas datas de sorteio previstas pela grade semanal.
 * Inclui o dia de hoje enquanto o horário do sorteio não passou.
 * Não conhece feriados nem concursos especiais: a data oficial é a que a CAIXA divulga.
 */
export function proximosSorteios(lot, agora = agoraBrasilia(), qtd = 6) {
  if (!lot.sorteios?.length) return [];
  const saida = [];
  const base = Date.UTC(agora.ano, agora.mes - 1, agora.dia);
  for (let i = 0; saida.length < qtd && i < 60; i++) {
    const dt = new Date(base + i * 86400000);
    const ds = dt.getUTCDay();
    for (const [d, hora] of lot.sorteios) {
      if (d !== ds) continue;
      if (i === 0 && agora.hora * 60 + agora.minuto >= hora * 60) continue;
      saida.push({
        data: `${d2(dt.getUTCDate())}/${d2(dt.getUTCMonth() + 1)}/${dt.getUTCFullYear()}`,
        iso: `${dt.getUTCFullYear()}-${d2(dt.getUTCMonth() + 1)}-${d2(dt.getUTCDate())}`,
        diaSemana: ds,
        hora,
        hoje: i === 0,
      });
    }
  }
  return saida.slice(0, qtd);
}

/** "Hoje", "Amanhã" ou o nome do dia, para listas de próximos sorteios. */
export function rotuloDia(s, agora = agoraBrasilia()) {
  if (s.hoje) return 'Hoje';
  const amanha = new Date(Date.UTC(agora.ano, agora.mes - 1, agora.dia) + 86400000);
  if (s.iso === amanha.toISOString().slice(0, 10)) return 'Amanhã';
  return DIAS[s.diaSemana];
}
