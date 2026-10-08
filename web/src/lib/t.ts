import en from "../../messages/en.json";

/**
 * Minimal, typed message access. Every user-visible string lives in
 * messages/<locale>.json so a `ja` locale is a second file, not a rewrite.
 * Swap this for next-intl's useTranslations when locale routing lands.
 */
export type Messages = typeof en;
export const messages: Messages = en;

export function t<S extends keyof Messages>(section: S): Messages[S] {
  return messages[section];
}
