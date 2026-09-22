export type Periodo = { id: string; label: string; horas: string; ini: string; fim: string; dias: number[] };
export type Recebimento = { timezone: string; diasFechado: number[]; periodos: Periodo[] };

// Data e hora sempre no fuso do restaurante, inclusive em celulares em outro fuso.
export function agoraLocal(timezone: string, agora = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(agora).map(({ type, value }) => [type, value]));
  return { data: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

export function dataValida(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const d = new Date(`${data}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
}

export function adicionarDias(data: string, dias: number) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function formatarData(data: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC", weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(`${data}T12:00:00Z`));
}

export function periodosDisponiveis(data: string, cfg: Recebimento, agora = new Date()) {
  const atual = agoraLocal(cfg.timezone, agora);
  if (!dataValida(data) || data < atual.data) return [];
  const dia = new Date(`${data}T12:00:00Z`).getUTCDay();
  if (cfg.diasFechado.includes(dia)) return [];
  return cfg.periodos.filter(p => p.dias.includes(dia) && (data !== atual.data || p.fim > atual.hora));
}

export function proximasDatas(cfg: Recebimento, agora = new Date()) {
  const datas: string[] = [];
  const hoje = agoraLocal(cfg.timezone, agora).data;
  for (let i = 0; i < 14 && datas.length < 3; i++) {
    const data = adicionarDias(hoje, i);
    if (periodosDisponiveis(data, cfg, agora).length) datas.push(data);
  }
  return datas;
}

export function eventoAgenda(data: string, periodo: Periodo, titulo: string, descricao: string, local: string, timezone: string, id: string, agora = new Date()) {
  const compacto = (hora: string) => `${data.replaceAll("-", "")}T${hora.replace(":", "")}00`;
  const esc = (texto: string) => texto.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  // Dobrar linhas por bytes, sem cortar caracteres UTF-8 (RFC 5545).
  const dobrar = (linha: string) => {
    const partes: string[] = []; let parte = ""; let bytes = 0;
    for (const char of linha) {
      const n = new TextEncoder().encode(char).length;
      if (bytes + n > 75) { partes.push(parte); parte = " "; bytes = 1; }
      parte += char; bytes += n;
    }
    partes.push(parte); return partes.join("\r\n");
  };
  const inicio = compacto(periodo.ini), fim = compacto(periodo.fim);
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Quem Quem//Vagas//PT", "BEGIN:VEVENT",
    `UID:${id}@quemquem`, `DTSTAMP:${agora.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    `DTSTART;TZID=${timezone}:${inicio}`, `DTEND;TZID=${timezone}:${fim}`,
    `SUMMARY:${esc(titulo)}`, `DESCRIPTION:${esc(descricao)}`, `LOCATION:${esc(local)}`,
    "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", `DESCRIPTION:${esc(titulo)}`, "END:VALARM",
    "END:VEVENT", "END:VCALENDAR", ""].map(dobrar).join("\r\n");
  const google = new URL("https://calendar.google.com/calendar/render");
  Object.entries({ action: "TEMPLATE", text: titulo, dates: `${inicio}/${fim}`, details: descricao, location: local, ctz: timezone })
    .forEach(([k, v]) => google.searchParams.set(k, v));
  return { ics, google: google.toString() };
}

export function mascaraTelefone(valor: string) {
  let d = valor.replace(/\D/g, "");
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const numero = d.slice(2);
  const corte = numero.length > 8 ? 5 : 4;
  return `(${d.slice(0, 2)}) ${numero.slice(0, corte)}${numero.length > corte ? "-" + numero.slice(corte) : ""}`;
}
