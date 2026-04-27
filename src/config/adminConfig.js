export const adminConfig = {
  maxPinnedReviewsPerTool: 3,
  sessionStorageKey: 'akshara-session',
  reviewsStorageKey: 'akshara-reviews',
}

export function getSuperAdminFromEnv(env = import.meta.env) {
  const email = (env.VITE_ADMIN_EMAIL ?? '').trim()
  const pin = (env.VITE_ADMIN_PIN ?? '').trim()

  return {
    email,
    pin,
    isConfigured: Boolean(email && pin),
  }
}
