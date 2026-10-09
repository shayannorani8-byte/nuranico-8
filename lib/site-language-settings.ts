// Stored alongside CMS configuration without requiring a database schema change.
export const LANGUAGE_SETTINGS_PAGE = 'site-config';
export const LANGUAGE_SETTINGS_KEY = 'bilingual_enabled';
export function isBilingualEnabled(rows: { page: string; text_key: string; value_en?: string | null }[]) {
  return rows.find(row => row.page === LANGUAGE_SETTINGS_PAGE && row.text_key === LANGUAGE_SETTINGS_KEY)?.value_en !== 'false';
}
