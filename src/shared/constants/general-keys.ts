export const GENERAL_KEYS = {
  authAdminEmail: "auth.admin_email",
  geminiModel: "gemini.model",
} as const;

export type GeneralKey = (typeof GENERAL_KEYS)[keyof typeof GENERAL_KEYS];
