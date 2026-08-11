import fs from "fs"
import path from "path"

const dir = path.join("src", "data", "catalog", "tobaccos")
for (const f of fs.readdirSync(dir)) {
  const t = fs.readFileSync(path.join(dir, f), "utf8")
  const names = [...t.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1])
  console.log(f, names.length)
}
