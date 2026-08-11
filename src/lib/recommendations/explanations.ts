import { MixComponent, MixRole } from "@/types"

const ROLE_RU: Record<MixRole, string> = {
  base: "основа",
  support: "поддержка",
  accent: "акцент",
}

function describeRole(component: MixComponent): string {
  const p = component.profile
  const traits: string[] = []

  if (p.fruity >= 3) traits.push("фруктовый")
  if (p.sweetness >= 3) traits.push("сладкий")
  if (p.sourness >= 3) traits.push("кислый")
  if (p.dessert >= 3) traits.push("десертный")
  if (p.cold >= 3) traits.push("холодный")
  if (p.spicy >= 2) traits.push("пряный")
  if (p.herbal >= 2) traits.push("травянистый")
  if (p.intensity >= 4) traits.push("насыщенный")

  const traitText =
    traits.length > 0 ? traits.slice(0, 2).join(" и ") : "сбалансированный"

  if (component.role === "base") {
    return `${component.name} используется как основа и даёт ${traitText} профиль.`
  }
  if (component.role === "support") {
    return `${component.name} добавляет ${traitText} ноты и делает вкус ярче.`
  }
  return `${component.name} сглаживает комбинацию и добавляет ${traitText} акцент.`
}

export function explainMix(components: MixComponent[]): string {
  const ordered = [...components].sort((a, b) => {
    const order: MixRole[] = ["base", "support", "accent"]
    return order.indexOf(a.role) - order.indexOf(b.role)
  })

  return ordered.map(describeRole).join(" ")
}

export function roleLabel(role: MixRole): string {
  return ROLE_RU[role]
}
