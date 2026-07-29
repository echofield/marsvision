import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const template = await readFile(resolve(root, "project-template.html"), "utf8");
const projects = JSON.parse(await readFile(resolve(root, "content/projects.json"), "utf8"));

const escapeHtml = value => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const graph = [
  '<svg class="graph" viewBox="0 0 900 600" aria-hidden="true">',
  '<path d="M48 516L218 392L362 441L527 258L716 322L850 76"/>',
  '<path d="M218 392L164 164L342 88M362 441L454 536M527 258L482 74M716 322L836 458"/>',
  '<path d="M48 516L164 164L482 74L850 76"/>',
  '<circle cx="48" cy="516" r="7"/><circle cx="218" cy="392" r="9"/>',
  '<circle cx="362" cy="441" r="7"/><circle cx="527" cy="258" r="11"/>',
  '<circle cx="716" cy="322" r="8"/><circle cx="850" cy="76" r="9"/>',
  '<circle cx="164" cy="164" r="6"/><circle cx="342" cy="88" r="5"/>',
  '<circle cx="454" cy="536" r="5"/><circle cx="482" cy="74" r="6"/>',
  '<circle cx="836" cy="458" r="5"/></svg>',
].join("");

function render(project) {
  const visualMarkup = project.image
    ? '<img src="' + escapeHtml(project.image) + '" alt="' + escapeHtml(project.imageAlt) + '">'
    : project.visual === "ramification" ? graph : "";
  const modes = project.modes.map(([index, title, copy]) =>
    '<article class="field-mode"><span>' + escapeHtml(index) + '</span><strong>' +
    escapeHtml(title) + '</strong><p>' + escapeHtml(copy) + '</p></article>'
  ).join("");
  const enables = project.enables.map(item => "<li>" + escapeHtml(item) + "</li>").join("");
  const external = project.externalUrl
    ? '<a href="' + escapeHtml(project.externalUrl) + '"' +
      (project.externalUrl.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "") +
      ">" + escapeHtml(project.externalLabel) + "</a>"
    : "";
  const values = {
    ...project,
    visualMarkup,
    modes,
    enables,
    externalLink: external,
  };
  return Object.entries(values).reduce(
    (html, [key, value]) => html.replaceAll("{{" + key + "}}", String(value)),
    template,
  );
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, "index.html"), resolve(output, "index.html"));
await cp(resolve(root, "assets"), resolve(output, "assets"), { recursive: true });

for (const project of projects) {
  const folder = resolve(output, ...project.route.split("/"));
  await mkdir(folder, { recursive: true });
  await writeFile(resolve(folder, "index.html"), render(project));
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '<url><loc>https://marsvision.pages.dev/</loc></url>',
  ...projects.map(project => '<url><loc>https://marsvision.pages.dev/' + project.route + '</loc></url>'),
  "</urlset>",
].join("");
await writeFile(resolve(output, "sitemap.xml"), sitemap);

console.log("Built MARS journey with " + projects.length + " internal project pages in dist/");
process.exit(0);
