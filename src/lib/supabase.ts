// src/lib/supabase.ts
// Envio das candidaturas do /vagas para o Supabase (schema "quemquem").
//
// Chamada direta ao PostgREST, sem o supabase-js: é um RPC só, e a
// dependência não compensa o peso num site estático. O header
// `Content-Profile` é o que seleciona o schema do cliente.
//
// Precisa de PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_PUBLISHABLE_KEY
// (ver .env.example). Sem essas variáveis o envio vira no-op e o formulário
// segue funcionando só com localStorage — nenhuma tela quebra.
//
// A publishable key (sb_publishable_…) não é um JWT, então vai só no header
// `apikey`: mandá-la em `Authorization: Bearer` faz a verificação de JWT
// falhar. `Authorization` fica reservado ao token de sessão do usuário, que
// este formulário não usa — aqui a chave resolve para o papel `anon`.

const URL_BASE = (import.meta.env.PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
const CHAVE = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const SCHEMA = "quemquem";

export const supabaseAtivo = Boolean(URL_BASE && CHAVE);

export type CandidaturaPayload = {
  p_id: string;
  p_vaga: string;
  p_nome: string;
  p_whatsapp: string;
  p_cidade: string;
  p_mora_itaperuna: boolean;
  p_pode_noite: boolean;
  p_pode_fds: boolean;
  p_inicio: string;
  p_status: "triagem" | "agendada";
  p_visita_modo: string | null;
  p_visita_data: string | null;
  p_visita_periodo: string | null;
  p_respostas: Record<string, string>;
};

/**
 * Grava a candidatura. Nunca lança: o fluxo do candidato não pode depender
 * da rede. Devolve true só quando o Supabase confirmou a gravação.
 */
export async function registrarCandidatura(dados: CandidaturaPayload): Promise<boolean> {
  if (!supabaseAtivo) return false;
  try {
    const resposta = await fetch(`${URL_BASE}/rest/v1/rpc/registrar_candidatura`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Profile": SCHEMA,
        apikey: CHAVE,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(dados),
      // sobrevive ao fechamento da aba logo depois do envio
      keepalive: true,
    });
    if (!resposta.ok) {
      console.warn("[vagas] Supabase recusou a candidatura:", resposta.status, await resposta.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (erro) {
    console.warn("[vagas] Não foi possível enviar a candidatura:", erro);
    return false;
  }
}
