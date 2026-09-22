// Condições e horários de recebimento confirmados pelo responsável em 22/09/2026.
// As faixas de recebimento podem ser diferentes do funcionamento do restaurante.
export const vagas = [
  { id: "garcom", nome: "Garçom / Garçonete" },
  { id: "aux-cozinha", nome: "Auxiliar de cozinha" },
  { id: "churrasqueiro", nome: "Churrasqueiro" },
];

export const local = {
  nome: "Qüem Qüem",
  rua: "R. Dr. Edgar Pinheiro Dias, 194",
  bairro: "Pres. Costa e Silva",
  cidade: "Itaperuna",
  uf: "RJ",
  maps: "https://maps.app.goo.gl/4sjMzafxckpVJZN18",
};

export const disponibilidade = [
  { id: "noite", pergunta: "Pode trabalhar à noite?", opcoes: [
    { v: "sim", l: "Sim" }, { v: "nao", l: "Não" },
  ] },
  { id: "fds", pergunta: "Pode trabalhar em fins de semana e feriados?", opcoes: [
    { v: "sim", l: "Sim" }, { v: "nao", l: "Não" },
  ] },
  { id: "inicio", pergunta: "Quando poderia começar?", opcoes: [
    { v: "imediato", l: "Imediatamente" }, { v: "1sem", l: "Em até 1 semana" },
    { v: "15d", l: "Em até 15 dias" }, { v: "mais", l: "Depois de 15 dias" },
  ] },
];

export const recebimento = {
  timezone: "America/Sao_Paulo",
  // 0 = domingo; recebimento e entrevista das 8h às 15h, exceto segunda.
  diasFechado: [1],
  periodos: [
    { id: "recebimento", label: "Recebimento", horas: "8h–15h", ini: "08:00", fim: "15:00", dias: [0, 2, 3, 4, 5, 6] },
  ],
};
