// Applies exact-text patches to source files. A patch file holds blocks of the form:
//   @@ path/to/file            (optional: "@@ path x3" when the text must occur exactly 3 times)
//   <<<<
//   text to find (must occur exactly once unless a count is given)
//   ====
//   replacement text
//   >>>>
// A block can also replace a whole span, from one anchor through another (both included):
//   <<<<
//   first text of the span
//   ---- to
//   last text of the span
//   ====
//   replacement text
//   >>>>
// Nothing is escaped. The build stops if a block does not match exactly.
import { readFileSync } from "node:fs";

export function parsePatches(text) {
  const out = [];
  const lines = text.split("\n");
  let file = null, count = 1, mode = null, find = [], repl = [], end = null;
  for (const line of lines) {
    if (mode === null && line.startsWith("@@ ")) {
      const m = line.slice(3).trim().match(/^(\S+)(?:\s+x(\d+))?$/);
      if (!m) throw new Error("Bad patch header: " + line);
      file = m[1]; count = m[2] ? +m[2] : 1;
    } else if (mode === null && line === "<<<<") { mode = "find"; find = []; repl = []; end = null; }
    else if (mode === "find" && line === "---- to") { mode = "end"; end = []; }
    else if ((mode === "find" || mode === "end") && line === "====") { mode = "repl"; }
    else if (mode === "repl" && line === ">>>>") {
      if (!file) throw new Error("Patch block without a file header");
      out.push({ file, count, find: find.join("\n"), end: end ? end.join("\n") : null, repl: repl.join("\n") });
      mode = null; count = 1;
    } else if (mode === "find") find.push(line);
    else if (mode === "end") end.push(line);
    else if (mode === "repl") repl.push(line);
    else if (line.trim() !== "" && !line.startsWith("#")) throw new Error("Unexpected line outside a patch block: " + line.slice(0, 80));
  }
  if (mode !== null) throw new Error("Unclosed patch block for " + file);
  return out;
}

export function applyPatches(sources, patchFiles) {
  let applied = 0;
  for (const pf of patchFiles) {
    for (const p of parsePatches(readFileSync(pf, "utf8"))) {
      const src = sources.get(p.file);
      if (src == null) throw new Error(`${pf}: no such source file ${p.file}`);
      if (p.end != null) {
        const a = src.indexOf(p.find), b = a < 0 ? -1 : src.indexOf(p.end, a + p.find.length);
        if (a < 0 || b < 0 || src.indexOf(p.find, a + 1) >= 0) throw new Error(`${pf}: span not found exactly once in ${p.file}, for:\n${p.find.slice(0, 160)}`);
        sources.set(p.file, src.slice(0, a) + p.repl + src.slice(b + p.end.length));
        applied++;
        continue;
      }
      const n = src.split(p.find).length - 1;
      if (n !== p.count) throw new Error(`${pf}: expected ${p.count} match(es) in ${p.file}, found ${n}, for:\n${p.find.slice(0, 160)}`);
      sources.set(p.file, src.split(p.find).join(p.repl));
      applied++;
    }
  }
  return applied;
}
