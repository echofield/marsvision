import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projects = JSON.parse(await readFile(new URL("../content/projects.json", import.meta.url), "utf8"));
const index = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("all internal project routes are unique", () => {
  const routes = projects.map(project => project.route);
  assert.equal(new Set(routes).size, routes.length);
  assert.deepEqual(routes, [
    "soma",
    "arche",
    "lobster",
    "ramification",
    "archive/sweet-dreams",
    "archive/true-lovers",
  ]);
});

test("homepage enters internal projects before external destinations", () => {
  assert.match(index, /href="\/soma"/);
  assert.match(index, /href="\/arche"/);
  assert.match(index, /href="\/lobster"/);
  assert.match(index, /href="\/ramification"/);
  assert.doesNotMatch(index, /<strong>RAMIFICATION<\/strong>/);
  assert.doesNotMatch(index, /vercel\.app/);
});

test("external destinations only belong to project records", () => {
  const soma = projects.find(project => project.route === "soma");
  const arche = projects.find(project => project.route === "arche");
  const lobster = projects.find(project => project.route === "lobster");
  assert.equal(soma.externalUrl, "https://ifah-inst.pages.dev/");
  assert.equal(arche.externalUrl, "https://www.xn--arch-paris-e7a.com/");
  assert.equal(lobster.externalUrl, "https://www.instagram.com/lobster_creative_sound/");
});

test("authored archive leads and commissions stay biographical", () => {
  const archive = index.match(/<section class="archive[\s\S]*?<\/section>/)?.[0] || "";
  const about = index.match(/<section class="about[\s\S]*?<\/section>/)?.[0] || "";
  assert.match(archive, /SWEET DREAMS/);
  assert.match(archive, /TRUE LOVERS/);
  assert.match(archive, /LOBSTER/);
  assert.match(archive, /SALLE PLEYEL/);
  assert.match(archive, /SOMA/);
  assert.match(archive, /F\.O\.C ÉDITIONS/);
  assert.doesNotMatch(archive, /BURBERRY \/ BEATS \/ NIKE/);
  assert.match(about, /Burberry, Beats by Dre and Nike/);
});

test("every project has a contextual return target", () => {
  for (const project of projects) assert.ok(project.backHash);
});
