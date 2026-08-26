import { UTM_SOURCE_MAP, UTM_MEDIUM_MAP, UTM_CAMPAIGN_MAP } from './utm-codes';
export interface ParsedReferral {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
/**
 * Парсит строку referralValue из ВК в UTM-метки.
 *
 * Формат на входе: "usr=strt_umd=1_ucm=8"
 * Каждая пара разделена символом "_", ключ и значение — символом "=".
 *
 * Поддерживаются ключи:
 *   usr (или s) → utmSource
 *   umd (или m) → utmMedium
 *   ucm (или c) → utmCampaign
 */
export function parseReferralValue(value: string): ParsedReferral {
  const raw: Record<string, string> = {};
  value.split('_').forEach((pair) => {
    const eqIndex = pair.indexOf('=');
    if (eqIndex === -1) return; // нет знака "=" — пропускаем
    const key = pair.slice(0, eqIndex);
    const val = pair.slice(eqIndex + 1);
    if (key && val) {
      raw[key] = val;
    }
  });
  // Извлекаем значения по коротким ключам
  const shortSource = raw['usr'] || raw['s'];
  const shortMedium = raw['umd'] || raw['m'];
  const shortCampaign = raw['ucm'] || raw['c'];
  return {
    // Если код есть в справочнике — берём полное название,
    // иначе оставляем как есть (вдруг новый код ещё не внесён)
    utmSource: shortSource
      ? (UTM_SOURCE_MAP[shortSource] ?? shortSource)
      : undefined,
    utmMedium: shortMedium
      ? (UTM_MEDIUM_MAP[shortMedium] ?? shortMedium)
      : undefined,
    utmCampaign: shortCampaign
      ? (UTM_CAMPAIGN_MAP[shortCampaign] ?? shortCampaign)
      : undefined,
  };
}
