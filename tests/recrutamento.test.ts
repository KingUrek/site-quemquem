import test from "node:test";
import assert from "node:assert/strict";
import { recebimento } from "../src/data/vagas.ts";
import { agoraLocal, dataValida, proximasDatas, periodosDisponiveis, eventoAgenda, mascaraTelefone } from "../src/lib/recrutamento.ts";

test("datas usam o fuso do restaurante e não oferecem segunda-feira", () => {
  const agora = new Date("2026-09-22T01:00:00Z"); // Ainda segunda-feira no restaurante.
  assert.equal(agoraLocal(recebimento.timezone, agora).data, "2026-09-21");
  assert.deepEqual(proximasDatas(recebimento, agora), ["2026-09-22", "2026-09-23", "2026-09-24"]);
  assert.deepEqual(periodosDisponiveis("2026-09-21", recebimento, agora), []);
});
test("períodos passados, datas inválidas e dias anteriores não são oferecidos", () => {
  const agora = new Date("2026-09-22T18:00:00Z"); // Terça, 15h.
  assert.deepEqual(periodosDisponiveis("2026-09-22", recebimento, agora).map(p => p.id), []);
  assert.deepEqual(periodosDisponiveis("2026-09-20", recebimento, agora), []);
  assert.deepEqual(periodosDisponiveis("2026-02-30", recebimento, agora), []);
  assert.equal(dataValida("invalida"), false);
  assert.deepEqual(proximasDatas(recebimento, new Date("2026-09-23T00:00:00Z")), ["2026-09-23", "2026-09-24", "2026-09-25"]);
});
test("domingo recebe das 8h às 15h", () => {
  const agora = new Date("2026-09-26T12:00:00Z");
  assert.deepEqual(periodosDisponiveis("2026-09-27", recebimento, agora).map(p => p.horas), ["8h–15h"]);
});
test("agenda preserva a data escolhida, o período e o fuso, com escape e linhas válidas", () => {
  const e = eventoAgenda("2026-10-02", recebimento.periodos[0], "Currículo — Qüem Qüem", "Uma descrição, com; pontuação\ne outra linha".repeat(5), "Itaperuna", recebimento.timezone, "teste", new Date("2026-09-22T12:30:00Z"));
  assert.match(e.ics, /DTSTART;TZID=America\/Sao_Paulo:20261002T080000/);
  assert.match(e.ics, /DTEND;TZID=America\/Sao_Paulo:20261002T150000/);
  assert.match(e.ics, /DTSTAMP:20260922T123000Z/);
  assert.ok(e.ics.split("\r\n").every(l => Buffer.byteLength(l) <= 75));
  const google = new URL(e.google);
  assert.equal(google.searchParams.get("dates"), "20261002T080000/20261002T150000");
  assert.equal(google.searchParams.get("ctz"), "America/Sao_Paulo");
});

test("máscara aceita celular, fixo, colagem e DDI brasileiro", () => {
  assert.equal(mascaraTelefone("22999999999"), "(22) 99999-9999");
  assert.equal(mascaraTelefone("2233334444"), "(22) 3333-4444");
  assert.equal(mascaraTelefone("+55 (22) 99999-9999"), "(22) 99999-9999");
  assert.equal(mascaraTelefone(""), "");
  assert.equal(mascaraTelefone("22"), "(22");
});
