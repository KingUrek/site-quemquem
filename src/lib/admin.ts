// src/lib/admin.ts
// Autenticação e leitura das candidaturas para a página /admin.
//
// Usa o Supabase Auth direto por fetch, sem o supabase-js — são três
// chamadas (login, refresh, select) e a dependência não se paga.
//
// A publishable key sozinha NÃO lê a tabela: a policy exige uma sessão de
// alguém que esteja em quemquem.admins. O token da sessão fica em
// localStorage, igual ao que o supabase-js faria.

const URL_BASE = (import.meta.env.PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const CHAVE = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SCHEMA = "quemquem";
const KEY_SESSAO = "qq.admin.sessao";

export const configurado = Boolean(URL_BASE && CHAVE);

export type Candidatura = {
  id: string;
  vaga: string;
  nome: string;
  whatsapp: string;
  whatsapp_digitos: string;
  cidade: string;
  mora_itaperuna: boolean;
  pode_noite: boolean;
  pode_fds: boolean;
  inicio: string;
  status: "triagem" | "agendada";
  visita_modo: string | null;
  visita_data: string | null;
  visita_periodo: string | null;
  respostas: Record<string, string>;
  criado_em: string;
  atualizado_em: string;
};

type Sessao = { access_token: string; refresh_token: string; expira_em: number };

const lerSessao = (): Sessao | null => {
  try {
    const raw = localStorage.getItem(KEY_SESSAO);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
};
const gravarSessao = (s: Sessao | null) => {
  try {
    if (s) localStorage.setItem(KEY_SESSAO, JSON.stringify(s));
    else localStorage.removeItem(KEY_SESSAO);
  } catch {}
};

export const temSessao = () => Boolean(lerSessao());
export const sair = () => gravarSessao(null);

const guardar = (d: any): Sessao => {
  const s: Sessao = {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    // margem de 60s para não usar um token que expira no meio da chamada
    expira_em: Date.now() + (Number(d.expires_in ?? 3600) - 60) * 1000,
  };
  gravarSessao(s);
  return s;
};

/** Faz login. Devolve mensagem de erro em português, ou null se deu certo. */
export async function entrar(email: string, senha: string): Promise<string | null> {
  if (!configurado) return "Supabase não configurado neste build.";
  try {
    const r = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CHAVE },
      body: JSON.stringify({ email: email.trim(), password: senha }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      if (r.status === 400) return "E-mail ou senha incorretos.";
      return d.error_description || d.msg || `Falha no login (${r.status}).`;
    }
    guardar(d);
    return null;
  } catch {
    return "Sem conexão. Verifique a internet e tente de novo.";
  }
}

async function renovar(s: Sessao): Promise<Sessao | null> {
  try {
    const r = await fetch(`${URL_BASE}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: CHAVE },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (!r.ok) return null;
    return guardar(await r.json());
  } catch {
    return null;
  }
}

/** Token válido, renovando se já expirou. Null quando a sessão acabou. */
async function token(): Promise<string | null> {
  let s = lerSessao();
  if (!s) return null;
  if (Date.now() >= s.expira_em) {
    s = await renovar(s);
    if (!s) {
      gravarSessao(null);
      return null;
    }
  }
  return s.access_token;
}

export class SessaoExpirada extends Error {
  constructor() {
    super("Sessão expirada");
  }
}

/** Lê as candidaturas, mais recentes primeiro. */
export async function listar(): Promise<Candidatura[]> {
  const t = await token();
  if (!t) throw new SessaoExpirada();

  const r = await fetch(
    `${URL_BASE}/rest/v1/candidaturas?select=*&order=criado_em.desc`,
    {
      headers: {
        apikey: CHAVE,
        Authorization: `Bearer ${t}`,
        "Accept-Profile": SCHEMA,
      },
    },
  );

  if (r.status === 401) {
    gravarSessao(null);
    throw new SessaoExpirada();
  }
  if (!r.ok) {
    throw new Error(`Não foi possível carregar (${r.status}). ${await r.text().catch(() => "")}`);
  }
  return (await r.json()) as Candidatura[];
}
