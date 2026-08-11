export { importCatalog } from "./importer"
export { dedupeByBrandName, findDuplicates } from "./deduplicator"
export { normalizeKey, normalizeName, slugify } from "./normalizer"
export { estimateProfileFromTags } from "./estimate-profile"
export {
  formatValidationReport,
  validateCatalog,
  type ValidationReport,
} from "./validator"
