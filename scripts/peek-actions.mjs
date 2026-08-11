import fs from "fs"
const p =
  "C:/Users/Ксюша/.cursor/projects/d-1-kalyanshik/agent-tools/4f131f77-eeec-4413-a286-e5347db88f86.txt"
const j = JSON.parse(fs.readFileSync(p, "utf8"))
console.log("total", j.total_count)
for (const r of (j.workflow_runs || []).slice(0, 10)) {
  console.log(
    [r.id, r.name, r.status, r.conclusion, r.created_at, (r.head_sha || "").slice(0, 7)].join(" | ")
  )
  console.log(" ", r.html_url)
}
