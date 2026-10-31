// المراحل العمرية
export const STAGES = [
  { key: 'children',   label: 'أطفال',        min: 0,  max: 12 },
  { key: 'teens',      label: 'مراهقين',      min: 13, max: 18 },
  { key: 'youth',      label: 'شباب',         min: 19, max: 30 },
  { key: 'adults',     label: 'بالغين',       min: 31, max: 50 },
  { key: 'elders',     label: 'كبار السن',    min: 51, max: 200 },
]

export function ageFromBirthDate(birthDate) {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  if (isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age < 0 ? 0 : age
}

export function stageFromAge(age) {
  if (age == null) return null
  return STAGES.find(s => age >= s.min && age <= s.max) || null
}

export function stageFromBirthDate(birthDate) {
  return stageFromAge(ageFromBirthDate(birthDate))
}