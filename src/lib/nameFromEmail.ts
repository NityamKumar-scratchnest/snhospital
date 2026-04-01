export function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() ?? ""
  if (!local) return "Patient"
  return local
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function localPatientId(email: string): string {
  let h = 0
  for (let i = 0; i < email.length; i++) h = (Math.imul(31, h) + email.charCodeAt(i)) | 0
  return `p-${Math.abs(h)}`
}
