# Architecture notes: Catalog (2026)

## Data layers

1. **Official** — name, description, flavor notes, line, manufacturer strength if published
2. **Estimated** — app scales for recommendation (`estimated: true`)
3. **User** — grams/rating/notes in collection only

## Import pipeline

`src/lib/catalog/{normalizer,deduplicator,validator,importer,admin}.ts`

Add a brand file under `src/data/catalog/tobaccos/`, export it from `src/data/catalog/index.ts`, run:

```bash
npm run catalog:validate
```

## Update rule

Never invent SKUs. Every TobaccoSeed must have a real `sourceUrl`.
