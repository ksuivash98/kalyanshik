import { readFileSync, writeFileSync } from "fs"

const sevas = JSON.parse(readFileSync(new URL("./ru-sevas.json", import.meta.url), "utf8"))
for (const id of ["burn", "jam", "kraken", "dogma", "serbetli", "bliss", "fake", "joy", "sebero", "chabacco", "morpheus", "take"]) {
  const b = sevas.brands[id]
  console.log("\n===", id, b?.flavors?.length)
  console.log((b?.flavors || []).slice(0, 15).join("\n"))
}
