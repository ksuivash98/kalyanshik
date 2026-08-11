import fs from "fs"
import path from "path"

const dir = "src/data/catalog/tobaccos"
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts")) continue
  const p = path.join(dir, f)
  let t = fs.readFileSync(p, "utf8")
  let next = t
  if (!next.includes("TobaccoStatus")) {
    next = next.replace(
      'import { TobaccoSeed } from "@/types/catalog"',
      'import { TobaccoSeed, TobaccoStatus } from "@/types/catalog"'
    )
  }
  next = next.replace(
    'status: "status" in item ? item.status : "ACTIVE",',
    'status: ("status" in item ? (item as { status?: TobaccoStatus }).status : "ACTIVE") as TobaccoStatus | undefined,'
  )
  if (next !== t) {
    fs.writeFileSync(p, next)
    console.log("fixed", f)
  }
}
