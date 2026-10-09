export function cleanUiLabel(value: string) {
  return value.replace(/[↗↖➚⬆]\uFE0F?/gu, '').trim();
}
