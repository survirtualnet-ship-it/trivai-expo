function includesAny(message: string, candidates: string[]): boolean {
  return candidates.some(candidate => message.includes(candidate))
}

export function mapAuthError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback

  const message = error.message ?? ''

  if (includesAny(message, ['Email not confirmed'])) {
    return 'Confirma tu email antes de iniciar sesión.'
  }

  if (includesAny(message, ['Invalid login credentials', 'invalid_credentials'])) {
    return 'Email o contraseña incorrectos.'
  }

  if (includesAny(message, ['popup_closed_by_user', 'cancel'])) {
    return 'Inicio de sesión cancelado.'
  }

  if (includesAny(message, ['network', 'Network request failed'])) {
    return 'No hay conexión a internet. Intenta nuevamente.'
  }

  if (includesAny(message, ['provider is not enabled', 'Unsupported provider'])) {
    return 'Google login no está habilitado en el proyecto.'
  }

  if (includesAny(message, ['code verifier', 'flow state', 'invalid request'])) {
    return 'La sesión de Google expiró. Intenta iniciar sesión de nuevo.'
  }

  if (includesAny(message, ['redirect_uri_mismatch', 'redirect url'])) {
    return 'URL de retorno no configurada. Contacta al administrador.'
  }

  return message || fallback
}
