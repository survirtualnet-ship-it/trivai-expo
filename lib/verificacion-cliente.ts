/** Verificación de negocio por dominio de email — solo cliente (sin secrets). */

export function verificarPorDominio(
  userEmail: string,
  businessWebsite: string | null | undefined,
): boolean {
  if (!userEmail || !businessWebsite) return false

  const emailDomain = userEmail.split('@')[1]?.toLowerCase().trim()
  if (!emailDomain) return false

  const publicos = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com', 'live.com']
  if (publicos.includes(emailDomain)) return false

  try {
    const url = businessWebsite.startsWith('http')
      ? businessWebsite
      : `https://${businessWebsite}`
    const websiteDomain = new URL(url).hostname.replace(/^www\./, '').toLowerCase().trim()
    return emailDomain === websiteDomain
  } catch {
    return false
  }
}
