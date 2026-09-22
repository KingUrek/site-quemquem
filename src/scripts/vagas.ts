import type { vagas, local, disponibilidade, recebimento } from "../data/vagas";
import { agoraLocal, dataValida, formatarData, periodosDisponiveis, proximasDatas, eventoAgenda, mascaraTelefone } from "../lib/recrutamento";

type Config = { vagas: typeof vagas; local: typeof local; disponibilidade: typeof disponibilidade; recebimento: typeof recebimento };
type Estado = {
  versao: 2; id: string; etapa: string;
  dados: { vaga: string; nome: string; whatsapp: string; cidade: string };
  respostas: Record<string, string>;
  visita: { modo: string; data: string; periodo: string; salva: boolean };
};
const cfg: Config = JSON.parse(document.getElementById("cfg-vagas")!.textContent!);
const etapas = ["inicio", "contato", "local", "disponibilidade", "resultado", "visita", "resumo"];
const titulos = ["Escolha sua vaga", "Seu contato", "Localização", "Disponibilidade", "Próximo passo", "Sua visita", "Resumo"];
const KEY = "qq.candidatura.v2";
const $ = <T extends HTMLElement = HTMLElement>(seletor: string) => document.querySelector<T>(seletor)!;
const todos = <T extends HTMLElement = HTMLElement>(seletor: string) => Array.from(document.querySelectorAll<T>(seletor));
const vazio = (): Estado => ({ versao: 2, id: crypto.randomUUID(), etapa: "inicio", dados: { vaga: "", nome: "", whatsapp: "", cidade: "" }, respostas: {}, visita: { modo: "", data: "", periodo: "", salva: false } });
const texto = (v: unknown) => typeof v === "string" ? v : "";
function ler(): Estado {
  const novo = vazio();
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem("qq.candidatura");
    if (!raw) return novo;
    const antigo = JSON.parse(raw);
    if (!antigo || typeof antigo !== "object") return novo;
    for (const k of Object.keys(novo.dados) as (keyof Estado["dados"])[]) novo.dados[k] = texto(antigo.dados?.[k]).slice(0, 150);
    const respostas = antigo.versao === 2 ? antigo.respostas : antigo.triagem;
    for (const k of ["mora", ...cfg.disponibilidade.map(q => q.id)]) novo.respostas[k] = texto(respostas?.[k]);
    if (!["sim", "nao"].includes(novo.respostas.mora) && novo.dados.cidade.trim()) {
      novo.respostas.mora = novo.dados.cidade.trim().toLocaleLowerCase("pt-BR") === "itaperuna" ? "sim" : "nao";
    }
    novo.dados.whatsapp = mascaraTelefone(novo.dados.whatsapp);
    if (antigo.versao === 2 && antigo.visita) {
      novo.visita = { modo: texto(antigo.visita.modo), data: texto(antigo.visita.data), periodo: texto(antigo.visita.periodo), salva: antigo.visita.salva === true };
      novo.etapa = etapas.includes(antigo.etapa) ? antigo.etapa : "inicio";
    } else {
      // Reutiliza contato e respostas antigas, mas pede uma nova data explícita.
      novo.etapa = novo.dados.vaga ? "contato" : "inicio";
    }
    return novo;
  } catch { return novo; }
}
let s = ler();
let atual = "inicio";
let armazenamento = true;
let loadingTimers: ReturnType<typeof setTimeout>[] = [];
function cancelarLoading() {
  loadingTimers.forEach(clearTimeout); loadingTimers = [];
}
function analisar() {
  cancelarLoading();
  // Transição visual provisória. Substituir por uma análise real quando houver backend.
  todos("[data-step]").forEach(el => el.hidden = el.dataset.step !== "analise");
  atual = "analise";
  $("[data-loading-text]").textContent = "Conferindo informações da vaga…";
  const h = $<HTMLHeadingElement>('[data-step="analise"] h2');
  h.tabIndex = -1; h.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
  loadingTimers.push(setTimeout(() => { $("[data-loading-text]").textContent = "Preparando seu próximo passo…"; }, 1000));
  loadingTimers.push(setTimeout(() => mostrar("resultado"), 2000));
}
function atualizarCidade() {
  const outra = s.respostas.mora === "nao";
  $("[data-outra-cidade]").hidden = !outra;
  $<HTMLInputElement>("#cidade").required = outra;
  $<HTMLInputElement>("#cidade").disabled = !outra;
}
function salvar() {
  try { localStorage.setItem(KEY, JSON.stringify(s)); armazenamento = true; }
  catch { armazenamento = false; }
  todos("[data-storage]").forEach(el => el.hidden = armazenamento);
}
const nomeValido = () => s.dados.nome.trim().split(/\s+/).filter(Boolean).length >= 2;
const telefoneValido = () => /^\d{10,11}$/.test(s.dados.whatsapp.replace(/\D/g, ""));
const localValido = () => (s.respostas.mora === "sim" || (s.respostas.mora === "nao" && s.dados.cidade.trim().length >= 2));
const disponibilidadeValida = () => cfg.disponibilidade.every(q => q.opcoes.some(o => o.v === s.respostas[q.id]));
const periodo = () => cfg.recebimento.periodos.find(p => p.id === s.visita.periodo);
const visitaValida = () => s.visita.modo === "depois" || Boolean(periodosDisponiveis(s.visita.data, cfg.recebimento).find(p => p.id === s.visita.periodo));
function permitida(destino: string) {
  const i = etapas.indexOf(destino);
  if (i <= 0) return "inicio";
  if (!cfg.vagas.some(v => v.id === s.dados.vaga)) return "inicio";
  if (i > 1 && (!nomeValido() || !telefoneValido())) return "contato";
  if (i > 2 && !localValido()) return "local";
  if (i > 3 && !disponibilidadeValida()) return "disponibilidade";
  if (i > 5 && (!s.visita.salva || !visitaValida())) return "visita";
  return destino;
}
function erro(id: string, mensagem = "") {
  const el = $(`#erro-${id}`); el.textContent = mensagem; el.hidden = !mensagem;
  const campo = document.getElementById(id);
  campo?.setAttribute("aria-invalid", String(Boolean(mensagem)));
  todos<HTMLInputElement>(`input[name="${id}"]`).forEach(input => input.setAttribute("aria-invalid", String(Boolean(mensagem))));
  return !mensagem;
}
function restaurar() {
  atualizarCidade();
  for (const k of ["nome", "whatsapp", "cidade"] as const) $<HTMLInputElement>(`#${k}`).value = s.dados[k];
  todos<HTMLInputElement>('input[type="radio"]').forEach(input => {
    if (input.name in s.respostas) input.checked = input.value === s.respostas[input.name];
  });
}
function preencher() {
  const vaga = cfg.vagas.find(v => v.id === s.dados.vaga)?.nome ?? "";
  const semData = s.visita.modo === "depois";
  const valores: Record<string, string> = {
    vaga, nome: s.dados.nome.trim().split(/\s+/)[0],
    data: semData ? "Ainda não escolhido" : dataValida(s.visita.data) ? formatarData(s.visita.data) : "Ainda não escolhido",
    periodo: periodo() ? periodo()!.horas : "",
    "titulo-resumo": semData ? "Escolha seu dia quando puder." : "Seu próximo passo: levar o currículo.",
    "texto-resumo": semData ? "Você ainda não definiu uma data. Volte aqui para planejar sua visita quando souber qual dia funciona melhor." : "Anote os detalhes abaixo e leve seu currículo no dia escolhido.",
  };
  todos("[data-fill]").forEach(el => { el.textContent = valores[el.dataset.fill!] ?? ""; });
  $("[data-horario]").hidden = semData;
}
function mostrar(destino: string, push = true) {
  cancelarLoading();
  const solicitado = destino;
  destino = permitida(destino);
  if (destino === "visita") prepararVisita();

  if (destino === "resumo") prepararResumo();
  preencher();
  todos("[data-step]").forEach(el => el.hidden = el.dataset.step !== destino);
  atual = destino;
  if (destino !== "inicio") s.etapa = destino;
  $("[data-resume]").hidden = !s.dados.vaga;
  $("[data-retomar]").textContent = s.visita.salva ? "Ver meu próximo passo" : "Continuar de onde parei";
  $("[data-progress]").hidden = destino === "inicio";
  const i = etapas.indexOf(destino);
  $("[data-progress-text]").textContent = `Etapa ${i + 1} de ${etapas.length} · ${titulos[i]}`;
  $<HTMLProgressElement>("progress").value = i + 1;
  salvar();
  if (push) history.pushState({ etapa: destino }, "", `#${destino}`);
  else history.replaceState({ etapa: destino }, "", `#${destino}`);
  const h = todos<HTMLElement>(`[data-step="${destino}"] h1, [data-step="${destino}"] h2`).find(el => !el.closest("[hidden]"));
  if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  window.scrollTo({ top: 0, behavior: "instant" });
  if (solicitado === "resumo" && destino === "visita") erro("visita", "Revise a data e o período da visita: o horário escolhido pode já ter passado.");
}

function validarFormulario(id: string) {
  let ok = true;
  if (id === "contato") {
    const nome = erro("nome", nomeValido() ? "" : "Escreva seu nome e sobrenome.");
    const tel = erro("whatsapp", telefoneValido() ? "" : "Informe um telefone com DDD, com 10 ou 11 números.");
    ok = nome && tel;
  } else if (id === "local") {
    const mora = erro("mora", ["sim", "nao"].includes(s.respostas.mora) ? "" : "Escolha uma das opções.");
    const cidade = erro("cidade", s.respostas.mora !== "nao" || s.dados.cidade.trim().length >= 2 ? "" : "Informe a cidade onde você mora.");
    ok = cidade && mora;
  } else if (id === "disponibilidade") {
    cfg.disponibilidade.forEach(q => { if (!erro(q.id, q.opcoes.some(o => o.v === s.respostas[q.id]) ? "" : "Escolha uma das opções.")) ok = false; });
  } else if (id === "visita") {
    ok = visitaValida();
    if (!ok) {
      atualizarPeriodos();
      erro("visita", "Escolha uma data disponível e um período, ou selecione ‘Ainda não sei quando posso ir’.");
    } else { s.visita.salva = true; erro("visita"); }
  }
  if (!ok) $(`[data-form="${id}"]`).querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  return ok;
}

// Radios nativos: navegação por teclado e seleção sem avançar inesperadamente.
function opcao(nome: string, valor: string, titulo: string, detalhe = "") {
  const label = document.createElement("label"); label.className = "choice";
  const input = document.createElement("input"); input.type = "radio"; input.name = nome; input.value = valor;
  const span = document.createElement("span"); span.textContent = titulo;
  if (detalhe) { const small = document.createElement("small"); small.textContent = detalhe; span.append(small); }
  label.append(input, span); return label;
}
function prepararVisita() {
  const datas = proximasDatas(cfg.recebimento);
  const box = $("[data-datas]"); box.replaceChildren();
  const hoje = agoraLocal(cfg.recebimento.timezone).data;
  datas.forEach(data => box.append(opcao("dia", data, formatarData(data), data === hoje ? "Hoje" : "")));
  box.append(opcao("dia", "outro", "Escolher outro dia"), opcao("dia", "depois", "Ainda não sei quando posso ir"));
  if (s.visita.data && s.visita.modo !== "depois" && !datas.includes(s.visita.data)) s.visita.modo = "outro";
  todos<HTMLInputElement>('input[name="dia"]').forEach(input => input.checked = input.value === (s.visita.modo === "outro" || s.visita.modo === "depois" ? s.visita.modo : s.visita.data));
  $<HTMLInputElement>("#data").min = hoje;
  $<HTMLInputElement>("#data").value = s.visita.data;
  atualizarPeriodos();
}
function atualizarPeriodos() {
  const depois = s.visita.modo === "depois";
  $("[data-custom]").hidden = s.visita.modo !== "outro";
  $("[data-sem-data]").hidden = !depois;
  $("[data-visita-cta]").textContent = depois ? "Ver orientações para a entrega" : "Salvar meu plano de visita";
  const ps = depois ? [] : periodosDisponiveis(s.visita.data, cfg.recebimento);
  const box = $("[data-periodos]"); box.replaceChildren();
  if (!ps.some(p => p.id === s.visita.periodo)) s.visita.periodo = "";
  if (ps.length === 1) s.visita.periodo = ps[0].id;
  ps.forEach(p => box.append(opcao("periodo", p.id, p.label, p.horas)));
  todos<HTMLInputElement>('input[name="periodo"]').forEach(input => input.checked = input.value === s.visita.periodo);
  $("[data-periodos-box]").hidden = ps.length <= 1;
  erro("visita", !depois && s.visita.data && !ps.length ? "Não há período disponível nessa data. Escolha outro dia; não recebemos às segundas-feiras." : "");
}

const endereco = `${cfg.local.nome}, ${cfg.local.rua}, ${cfg.local.bairro}, ${cfg.local.cidade}-${cfg.local.uf}`;
function agenda() {
  const p = periodo();
  if (!p || s.visita.modo === "depois" || !visitaValida()) return null;
  const vaga = cfg.vagas.find(v => v.id === s.dados.vaga)!.nome;
  return eventoAgenda(s.visita.data, p, `Levar currículo ao Qüem Qüem — ${vaga}`,
    "Leve seu currículo impresso com seu contato. Recebimento das 8h às 15h. A entrevista será feita na hora. Este aviso não é uma aprovação para a vaga.", endereco, cfg.recebimento.timezone, s.id);
}
function prepararResumo() {
  const e = agenda();
  $("[data-lembrete]").hidden = !e;
  $("[data-google]").hidden = !e;
  if (e) $<HTMLAnchorElement>("[data-google]").href = e.google;

}

todos<HTMLButtonElement>("[data-vaga]").forEach(btn => btn.addEventListener("click", () => {
  if (s.dados.vaga !== btn.dataset.vaga) { s.visita = vazio().visita; s.etapa = "contato"; }
  s.dados.vaga = btn.dataset.vaga!; mostrar("contato");
}));
for (const k of ["nome", "whatsapp", "cidade"] as const) {
  $<HTMLInputElement>(`#${k}`).addEventListener("input", e => {
    const input = e.target as HTMLInputElement;
    if (k === "whatsapp") {
      const pos = input.selectionStart ?? input.value.length;
      const digitosAntes = input.value.slice(0, pos).replace(/\D/g, "").length;
      input.value = mascaraTelefone(input.value);
      let cursor = 0, n = 0;
      while (cursor < input.value.length && n < digitosAntes) { if (/\d/.test(input.value[cursor])) n++; cursor++; }
      input.setSelectionRange(cursor, cursor);
    }
    s.dados[k] = input.value; s.visita.salva = false; erro(k); salvar();
  });
}
document.addEventListener("change", e => {
  const input = e.target;
  if (!(input instanceof HTMLInputElement)) return;
  if (input.type === "radio") {
    if (input.name === "dia") {
      s.visita = { modo: input.value === "outro" || input.value === "depois" ? input.value : "data", data: input.value === "outro" || input.value === "depois" ? "" : input.value, periodo: "", salva: false };
      $<HTMLInputElement>("#data").value = s.visita.data;
      atualizarPeriodos();
      if (input.value === "outro") $("#data").focus();
    } else if (input.name === "mora") {
      s.respostas.mora = input.value;
      s.dados.cidade = input.value === "sim" ? "Itaperuna" : "";
      $<HTMLInputElement>("#cidade").value = s.dados.cidade;
      s.visita.salva = false; erro("mora"); erro("cidade"); atualizarCidade();
      if (input.value === "nao") $("#cidade").focus();
    } else if (input.name === "periodo") { s.visita.periodo = input.value; s.visita.salva = false; erro("visita"); }
    else { s.respostas[input.name] = input.value; s.visita.salva = false; erro(input.name); }
  } else if (input.id === "data") { s.visita.data = input.value; s.visita.salva = false; atualizarPeriodos(); }
  salvar();
});
todos<HTMLFormElement>("[data-form]").forEach(form => form.addEventListener("submit", e => {
  e.preventDefault(); const etapa = form.dataset.form!;
  if (atual === "analise") return;
  if (validarFormulario(etapa)) {
    if (etapa === "disponibilidade") analisar();
    else mostrar(etapas[etapas.indexOf(etapa) + 1]);
  }
}));
todos("[data-back]").forEach(btn => btn.addEventListener("click", () => mostrar(etapas[Math.max(0, etapas.indexOf(atual) - 1)])));
$("[data-planejar]").addEventListener("click", () => mostrar("visita"));
$("[data-mudar-dia]").addEventListener("click", () => mostrar("visita"));
$("[data-retomar]").addEventListener("click", () => mostrar(s.visita.salva ? "resumo" : s.etapa));
$("[data-reiniciar]").addEventListener("click", () => {
  s = vazio(); todos<HTMLFormElement>("form").forEach(f => f.reset()); todos(".error").forEach(el => el.hidden = true);
  todos("[aria-invalid]").forEach(el => el.removeAttribute("aria-invalid")); restaurar(); mostrar("inicio");
});
$("[data-lembrete]").addEventListener("click", () => {
  const e = agenda(); if (!e) { mostrar("visita"); return; }
  const url = URL.createObjectURL(new Blob([e.ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = "visita-quemquem.ics"; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
$("[data-google]").addEventListener("click", e => {
  if (!agenda()) { e.preventDefault(); mostrar("visita"); }
});
window.addEventListener("popstate", () => mostrar(location.hash.slice(1), false));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && ["visita", "resumo"].includes(atual)) mostrar(atual, false);
});
restaurar();
mostrar(location.hash.slice(1) || "inicio", false);
