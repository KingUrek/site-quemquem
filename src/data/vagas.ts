// src/data/vagas.ts
// -----------------------------------------------------------------------------
// Tudo que muda no fluxo de contratação (/vagas) sai daqui: vagas abertas,
// perguntas da triagem, horários pra entrega de currículo, endereço e contato.
// Por enquanto não há envio real — as candidaturas ficam no localStorage do
// navegador do candidato (ver src/pages/vagas.astro).
// -----------------------------------------------------------------------------

export interface Vaga {
  id: string;
  nome: string;
  resumo: string;
}

export const vagas: Vaga[] = [
  { id: "garcom", nome: "Garçom / Garçonete", resumo: "Atendimento no salão, do chopp à conta." },
  { id: "aux-cozinha", nome: "Auxiliar de cozinha", resumo: "Apoio à produção e organização da cozinha." },
  { id: "churrasqueiro", nome: "Churrasqueiro", resumo: "Grelha e chapa — picanha, linguiça, o forte da casa." },
];

export const local = {
  nome: "Qüem Qüem",
  rua: "R. Dr. Edgar Pinheiro Dias, 194",
  bairro: "Pres. Costa e Silva",
  cidade: "Itaperuna",
  uf: "RJ",
  referencia: "a 5 min da rodoviária",
  maps: "https://maps.app.goo.gl/4sjMzafxckpVJZN18",
  horario: "Ter–sáb 11h à 1h · Dom 11h às 16h · fechado às segundas",
};

// Perguntas da triagem — uma por tela. `opcoes[].v` é o valor guardado.
export interface Pergunta {
  id: string;
  pergunta: string;
  ajuda?: string;
  opcoes: { v: string; l: string }[];
}

export const triagem: Pergunta[] = [
  {
    id: "experiencia",
    pergunta: "Você já trabalhou nessa função?",
    opcoes: [
      { v: "sim", l: "Sim, já tenho experiência" },
      { v: "nao", l: "Não, seria a primeira vez" },
    ],
  },
  {
    id: "noite",
    pergunta: "Tem disponibilidade para trabalhar à noite?",
    ajuda: "A casa funciona até 1h da manhã de terça a sábado.",
    opcoes: [
      { v: "sim", l: "Sim" },
      { v: "nao", l: "Não" },
    ],
  },
  {
    id: "fds",
    pergunta: "E em fins de semana e feriados?",
    ajuda: "São os dias mais movimentados.",
    opcoes: [
      { v: "sim", l: "Sim" },
      { v: "nao", l: "Não" },
    ],
  },
  {
    id: "deslocamento",
    pergunta: "Você mora em Itaperuna ou consegue vir todos os dias?",
    opcoes: [
      { v: "moro", l: "Moro em Itaperuna" },
      { v: "desloco", l: "Moro perto e consigo vir todo dia" },
      { v: "nao", l: "Não consigo vir todos os dias" },
    ],
  },
  {
    id: "trabalhando",
    pergunta: "Está trabalhando atualmente?",
    opcoes: [
      { v: "sim", l: "Sim" },
      { v: "nao", l: "Não" },
    ],
  },
  {
    id: "inicio",
    pergunta: "Quando poderia começar?",
    opcoes: [
      { v: "imediato", l: "Imediatamente" },
      { v: "1sem", l: "Em até uma semana" },
      { v: "15d", l: "Em até 15 dias" },
      { v: "mais", l: "Mais de 15 dias" },
    ],
  },
];

// Único critério objetivo que impede a próxima etapa (entrega presencial e
// trabalho diário em Itaperuna). Quem responde isto vê uma tela de
// agradecimento em vez do convite pra levar o currículo.
export const bloqueia = { pergunta: "deslocamento", valor: "nao" };

// Períodos pra entrega do currículo. AJUSTAR com a casa: são os horários em
// que tem alguém pra receber o candidato.
export interface Periodo {
  id: string;
  label: string;
  horas: string;   // texto mostrado
  ini: string;     // HH:MM, usado no lembrete de agenda
  fim: string;
}

export const periodos: Periodo[] = [
  { id: "manha", label: "Manhã", horas: "9h–11h", ini: "09:00", fim: "11:00" },
  { id: "tarde", label: "Tarde", horas: "14h–17h", ini: "14:00", fim: "17:00" },
  { id: "noite", label: "Noite", horas: "19h–21h", ini: "19:00", fim: "21:00" },
];

// 0 = domingo … 6 = sábado
export const diasFechado = [1];        // segunda: não recebe currículo
export const diasSemNoite = [0];       // domingo fecha às 16h

// Contato pra dúvidas sobre a vaga. Desligue com `ativo: false` — o botão
// some da tela de confirmação. (Pedidos de comida não são por WhatsApp; isto
// é só pro processo seletivo.)
export const whatsappVagas = { ativo: true, numero: "5522999387843" };
