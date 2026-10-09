export function localizedValue(lang: 'en' | 'fa', english?: string | null, persian?: string | null, fallback = '') {
  const primary = lang === 'fa' ? persian : english;
  const secondary = lang === 'fa' ? english : persian;
  return primary?.trim() || secondary?.trim() || fallback;
}

export function isVideoAsset(item: { file_url?: string | null; media_url?: string | null; file_type?: string | null; media_type?: string | null; mime_type?: string | null }) {
  return /video/i.test(`${item.file_type || ''} ${item.media_type || ''} ${item.mime_type || ''}`) ||
    /\.(mp4|webm|mov|m4v)(?:[?#]|$)/i.test(item.file_url || item.media_url || '');
}
