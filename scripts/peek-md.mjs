import { readFileSync } from "fs"

const md = JSON.parse(readFileSync(new URL("./ru-moredyma-jf.json", import.meta.url), "utf8"))

function show(key, n = 12) {
  const b = md.brands[key]
  if (!b) return console.log(key, "missing")
  console.log("\n===", key, "raw", (b.flavorsRaw || []).length, "url", (b.sources || [])[0])
  console.log((b.flavorsRaw || []).slice(0, n).join("\n"))
}

for (const k of [
  "md:black-burn",
  "md:dogma",
  "md:kraken",
  "md:helix",
  "md:bliss",
  "md:aircraft",
  "md:wto",
  "md:smoke-angels",
  "md:tangiers",
  "md:jam",
  "md:cobra",
  "md:serbetli",
  "md:kapsuly-nur",
  "jf:burn",
  "jf:dogma",
  "jf:helix",
  "jf:wto",
  "sm:blackburn",
  "sm:smoke-angels",
  "hh:jam",
]) {
  show(k)
}
