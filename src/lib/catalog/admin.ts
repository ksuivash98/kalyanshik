/**
 * Future admin catalog operations (no auth in MVP).
 * Keep UI/API thin — mutate through importer + validator.
 */
import { CatalogDatabase, TobaccoSeed, TobaccoStatus } from "@/types/catalog"
import { importCatalog } from "@/lib/catalog/importer"
import { validateCatalog } from "@/lib/catalog/validator"

export type AdminTobaccoPatch = Partial<
  Pick<
    TobaccoSeed,
    | "tags"
    | "flavorNotes"
    | "aliases"
    | "sourceUrl"
    | "line"
    | "estimatedProfile"
    | "status"
    | "discontinued"
    | "limitedEdition"
    | "active"
    | "official"
  >
>

export function adminUpsertTobacco(
  db: CatalogDatabase,
  tobacco: TobaccoSeed
): CatalogDatabase {
  return importCatalog(db, { tobaccos: [tobacco] }).database
}

export function adminMarkStatus(
  db: CatalogDatabase,
  tobaccoId: string,
  status: TobaccoStatus
): CatalogDatabase {
  const existing = db.tobaccos.find((t) => t.id === tobaccoId)
  if (!existing) return db
  const updated: TobaccoSeed = {
    ...existing,
    status,
    discontinued: status === "DISCONTINUED",
    limitedEdition: status === "LIMITED",
    active: status === "ACTIVE" || status === "LIMITED",
    lastVerifiedAt: new Date().toISOString(),
  }
  return importCatalog(db, { tobaccos: [updated] }).database
}

export function adminValidate(db: CatalogDatabase) {
  return validateCatalog(db)
}
