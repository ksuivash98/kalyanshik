import fs from "fs"
import { CATALOG_DB } from "../src/data/catalog"

fs.writeFileSync(
  "scripts/catalog-dump.json",
  JSON.stringify(
    {
      tobaccos: CATALOG_DB.tobaccos.map((t) => ({
        brandId: t.brandId,
        name: t.name,
        line: t.line,
        status: t.status,
        sources: t.sources,
        estimatedProfile: { strength: t.estimatedProfile.strength },
      })),
    },
    null,
    2
  )
)
console.log("Dumped", CATALOG_DB.tobaccos.length, "tobaccos")
