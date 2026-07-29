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
    "ramification",
    "archive/sweet-dreams",
    "archive/true-lovers",
  ]);
});

test("homepage enters internal projects before external destinations", () => {
  assert.match(index, /href="\/soma"/);
  assert.match(index, /href="\/arche"/);
  assert.match(index, /href="\/ramification"/);
  assert.doesNotMatch(index, /vercel\.app/);
});

test("external destinations only belong to project records", () => {
  const soma = projects.find(project => project.route === "soma");
  const arche = projects.find(project => project.route === "arche");
  assert.equal(soma.externalUrl, "https://ifah-inst.pages.dev/");
  assert.equal(arche.externalUrl, "https://www.xn--arch-paris-e7a.com/");
});

test("every project has a contextual return target", () => {
  for (const project of projects) assert.ok(project.backHash);
});
