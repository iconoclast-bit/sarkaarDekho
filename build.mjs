// Build: patch -> check -> bundle -> minify -> fingerprint -> write dist/.
// Run with `node build.mjs`. The same command runs on Vercel for every deployment.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { transform } from "esbuild";
import { applyPatches } from "./tools/patch.mjs";

const require = createRequire(import.meta.url);
const SRC = "src", OUT = "dist";
const SITE = "https://sarkardekho.vercel.app";
// The sha256 (base64) of the structured-data <script> block's exact text in index.html, matching
// the script-src hash in vercel.json. Recomputed and checked in step 6 below.
const JSONLD_SHA256 = "iCJSOTHS43m61IHAPbd8vnljHst2CdcMGBDooRZ0tY8=";

// Order matters: data first, then the app, then each layer that extends it, then the starter.
const JS = ["data.js", "delhi.js", "app.js", "voter.js", "state.js",
  "v2/sd0.js", "v2/sd1.js", "v2/sd2.js", "v2/sd3.js", "v2/sd4.js", "v2/sd5.js", "v2/sd6.js",
  "v2/states-deep.js", "v2/states.js", "v3/verify.js", "v4/ux.js", "v4/start.js"];
const GUARD = "v4/guard.js";
const CSS = ["styles.css", "media.css", "voter.css", "v2/states.css", "v3/verify.css", "v4/ux.css"];
const FONTS = [["mukta", [500, 600, 700, 800]], ["hind", [400, 500, 600, 700]]];
// Images shown on the site: the original files from Wikimedia Commons, copied at build time and accepted only
// if the bytes match the SHA-1 that Commons publishes for that version of the file, pinned here. To change an
// image, review the new file, then update its fingerprint here and its file name in the app (the name carries
// the first 12 characters).
const WM = "https://upload.wikimedia.org/wikipedia/commons/";
const IMAGES = [
  ["inc-symbol", "svg", "d/d7/Hand_INC.svg", "4da8471427d8bd1e82f35175081f9f5936f607b5"],
  ["bjp-symbol", "svg", "2/23/BJP_Election_Symbol.svg", "fa3564ba054ac98b69f8f2f8bfe583ca6dd2237a"],
  ["manmohan-singh", "jpg", "a/af/Prime_Minister_Manmohan_Singh_official_portrait.jpg", "4436c50bf4918dfffbde1820ffd247a09f236a0b"],
  ["narendra-modi", "png", "1/1a/Official_Photograph_of_Prime_Minister_Narendra_Modi_Portrait_%28crop%29.png", "7d86d5c9278f8874d381d15528daadba2f901b0f"]
];
// This site's own images (the share-preview card and the install icons): no outside source to verify
// against, just fingerprinted and cached like any other asset.
const OWN_IMAGES = [["og-card", "png"], ["icon-192", "png"], ["icon-512", "png"]];

const read = f => readFileSync(join(SRC, f), "utf8");
const sha = (buf, alg, enc) => createHash(alg).update(buf).digest(enc);
const fingerprint = buf => sha(buf, "sha256", "hex").slice(0, 12);
const sri = buf => "sha384-" + sha(buf, "sha384", "base64");
const fail = msg => { console.error("BUILD FAILED: " + msg); process.exit(1); };

// 1. Sources, with patches applied if a patches/ folder is present.
const sources = new Map([...JS, GUARD].map(f => [f, read(f)]));
let patched = 0;
if (existsSync("patches")) {
  const files = readdirSync("patches").filter(f => f.endsWith(".patch")).sort().map(f => join("patches", f));
  try { patched = applyPatches(sources, files); } catch (e) { fail(e.message); }
}

// 2. Checks. The site runs under a policy that refuses inline scripts, so none may creep in,
//    and every outside link must be https.
const problems = [];
for (const [file, text] of sources) {
  const rules = [
    [/http:\/\/(?!www\.w3\.org\/)/g, "plain http link"],
    [/javascript:/gi, "javascript: link"],
    [/\beval\s*\(|new Function\s*\(|document\.write\s*\(/g, "dynamic code"],
    [/\son[a-z]+\s*=\s*["'`]/g, "inline event handler"],
    [/<script/gi, "script tag in a template"],
    [/["'`]\s*\+\s*location\.(?:hash|search|href)|innerHTML\s*=\s*location\./g, "page address written into the page"]
  ];
  for (const [re, what] of rules) {
    const m = text.match(re);
    if (m) problems.push(`${file}: ${what} (${m.length}x, e.g. "${m[0].trim()}")`);
  }
}
for (const m of [...sources].flatMap(([f, t]) => [...t.matchAll(/https:\/\/[^"'`\s<>)]+/g)].map(x => [f, x[0]]))) {
  try { const u = new URL(m[1].replace(/\$\{.*$/, "")); if (u.protocol !== "https:" || u.username || u.password) problems.push(`${m[0]}: bad link ${m[1]}`); }
  catch { problems.push(`${m[0]}: unreadable link ${m[1]}`); }
}
if (problems.length) fail("source checks\n  " + problems.join("\n  "));

// 3. Bundle and minify.
const min = async (code, loader) => (await transform(code, { loader, minify: true, target: loader === "js" ? "es2019" : undefined, charset: "utf8", legalComments: "none" })).code;
const appJs = await min(JS.map(f => `/* ${f} */\n${sources.get(f)}`).join("\n;\n"), "js");
const guardJs = await min(sources.get(GUARD), "js");

// 4. Fonts: served from this site, so no reader's address goes to a font service.
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "assets", "fonts"), { recursive: true });
let fontCss = "";
for (const [family, weights] of FONTS) {
  const dir = dirname(require.resolve(`@fontsource/${family}/package.json`));
  for (const w of weights) {
    const css = readFileSync(join(dir, `${w}.css`), "utf8");
    for (const block of css.match(/@font-face\s*{[^}]*}/g) || []) {
      const file = (block.match(/url\(\.\/files\/([^)]+\.woff2)\)/) || [])[1];
      if (!file) fail(`no woff2 in ${family} ${w}`);
      copyFileSync(join(dir, "files", file), join(OUT, "assets", "fonts", file));
      fontCss += block.replace(/src:[^;]*;/, `src:url(/assets/fonts/${file}) format("woff2");`) + "\n";
    }
  }
}
const appCss = await min(fontCss + CSS.map(read).join("\n"), "css");

// 4b. Images. One that cannot be fetched, or does not match its fingerprint, is left out: the site then shows
//     initials in its place. It is never replaced by an unverified file.
mkdirSync(join(OUT, "assets", "img"), { recursive: true });
const images = {};
for (const [name, ext, path, pin] of IMAGES) {
  const file = `${name}.${pin.slice(0, 12)}.${ext}`;
  if (!appJs.includes(`/assets/img/${file}`)) fail(`the app does not reference /assets/img/${file}`);
  try {
    const res = await fetch(WM + path, { headers: { "User-Agent": "SarkarDekhoBuild/2.0 (https://sarkardekho.vercel.app)" }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha(buf, "sha1", "hex") !== pin) throw new Error("fingerprint mismatch");
    writeFileSync(join(OUT, "assets", "img", file), buf);
    images[file] = "ok";
  } catch (e) {
    images[file] = "left out: " + e.message;
    console.warn(`WARNING image ${file} left out: ${e.message}`);
  }
}
// On Vercel a missing image stops the deployment, so the live site keeps its last good version.
if (process.env.VERCEL && Object.values(images).some(v => v !== "ok")) fail("images could not be verified: " + JSON.stringify(images));

// 4c. This site's own images: fingerprinted the same way as everything else in 5 below, but the
//     source bytes come straight from the repo, not a verified fetch.
const own = {};
for (const [name, ext] of OWN_IMAGES) {
  const buf = readFileSync(join(SRC, "assets", "own", `${name}.${ext}`));
  const file = `${name}.${fingerprint(buf)}.${ext}`;
  writeFileSync(join(OUT, "assets", "img", file), buf);
  own[name] = { path: `/assets/img/${file}`, url: `${SITE}/assets/img/${file}` };
}

// 5. Fingerprinted files: a changed file gets a new name, so browsers can keep each one for a year.
const names = {};
const emit = (base, ext, content) => {
  const buf = Buffer.from(content, "utf8"), name = `/assets/${base}.${fingerprint(buf)}.${ext}`;
  writeFileSync(join(OUT, name), buf);
  names[base + "." + ext] = { path: name, bytes: buf.length, integrity: sri(buf) };
  return names[base + "." + ext];
};
const a = emit("app", "js", appJs), g = emit("guard", "js", guardJs), c = emit("app", "css", appCss);

// 6. Pages.
const page = f => read(f)
  .replaceAll("%CSS%", c.path).replaceAll("%CSS_SRI%", c.integrity)
  .replaceAll("%GUARD%", g.path).replaceAll("%GUARD_SRI%", g.integrity)
  .replaceAll("%APP%", a.path).replaceAll("%APP_SRI%", a.integrity)
  .replaceAll("%OG_IMG%", own["og-card"].url)
  .replaceAll("%ICON192%", own["icon-192"].path).replaceAll("%ICON192_ABS%", own["icon-192"].url)
  .replaceAll("%ICON512%", own["icon-512"].path).replaceAll("%ICON512_ABS%", own["icon-512"].url);
for (const f of ["index.html", "404.html"]) {
  const html = page(f);
  if (/%[A-Z_]+%/.test(html)) fail(`unfilled placeholder in ${f}`);
  if (/<script(?![^>]*\ssrc=)(?![^>]*type="application\/ld\+json")/i.test(html) || /\son[a-z]+\s*=/i.test(html)) fail(`inline script in ${f}`);
  if (f === "index.html") {
    // The structured-data block is the one inline script this site allows, and only because its
    // exact text is pinned by a CSP hash (see vercel.json). If this text changes, that hash must
    // change with it, or browsers will silently drop the structured data.
    const m = html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/);
    if (!m) fail("no structured-data block in index.html");
    const got = sha(Buffer.from(m[1], "utf8"), "sha256", "base64");
    if (got !== JSONLD_SHA256) fail(`structured-data text changed (sha256-${got}) — update the script-src hash in vercel.json to match, then update JSONLD_SHA256 in build.mjs`);
  }
  writeFileSync(join(OUT, f), html);
}
writeFileSync(join(OUT, "robots.txt"), read("robots.txt"));
writeFileSync(join(OUT, "sitemap.xml"), read("sitemap.xml"));
writeFileSync(join(OUT, "manifest.json"), page("manifest.json"));
// build.json lists a fingerprint of every input, so a deployment can be checked against a local build.
const inputs = {};
const track = f => { inputs[f] = sha(readFileSync(f), "sha1", "hex"); };
["build.mjs", "package.json", "vercel.json", "tools/patch.mjs"].forEach(track);
if (existsSync("patches")) readdirSync("patches").sort().forEach(f => track(join("patches", f)));
[...JS, GUARD, ...CSS, "index.html", "404.html", "robots.txt", "sitemap.xml", "manifest.json"].forEach(f => track(join(SRC, f)));
OWN_IMAGES.forEach(([n, ext]) => track(join(SRC, "assets", "own", `${n}.${ext}`)));
writeFileSync(join(OUT, "build.json"), JSON.stringify({ patched, files: names, images, own, inputs }, null, 1));

const kb = n => (n / 1024).toFixed(1) + " KB";
console.log(`patches applied: ${patched}`);
console.log(`app.js ${kb(a.bytes)}  guard.js ${kb(g.bytes)}  app.css ${kb(c.bytes)}  fonts ${readdirSync(join(OUT, "assets", "fonts")).length} files`);
console.log("build ok");
