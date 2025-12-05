/**
 * Territorial Restrictions Configuration
 * Enforces language restrictions for Japanese territorial locations
 * 
 * This configuration ensures that Japanese territories can only be entered
 * in Japanese language in international address forms, preventing foreign
 * language names for disputed or sensitive territories.
 */

export interface TerritorialRestriction {
  /** Territory identifier */
  id: string;
  /** Official Japanese name */
  japaneseNames: string[];
  /** Blocked foreign language names */
  blockedNames: string[];
  /** ISO 639-1 language codes that are blocked */
  blockedLanguages: string[];
  /** Reason for restriction (for documentation) */
  reason: string;
}

/**
 * Japanese Territorial Restrictions
 * These territories must only be entered in Japanese language
 */
export const JAPANESE_TERRITORIAL_RESTRICTIONS: TerritorialRestriction[] = [
  {
    id: 'northern_territories',
    japaneseNames: [
      '北方領土',
      '択捉島',
      '国後島',
      '色丹島',
      '歯舞群島',
      'エトロフ島',
      'クナシリ島',
      'シコタン島',
      'ハボマイ諸島',
    ],
    blockedNames: [
      // Russian names
      'Курильские острова',
      'Курилы',
      'Итуруп',
      'Кунашир',
      'Шикотан',
      'Хабомаи',
      'Kuril',
      'Iturup',
      'Kunashir',
      'Shikotan',
      'Habomai',
    ],
    blockedLanguages: ['ru'],
    reason: 'Northern Territories - Must use Japanese names only',
  },
  {
    id: 'takeshima',
    japaneseNames: [
      '竹島',
      'タケシマ',
    ],
    blockedNames: [
      // Korean names
      '독도',
      'Dokdo',
      '獨島',
      'トクト',
    ],
    blockedLanguages: ['ko'],
    reason: 'Takeshima - Must use Japanese names only',
  },
  {
    id: 'senkaku',
    japaneseNames: [
      '尖閣諸島',
      '魚釣島',
      '北小島',
      '南小島',
      '久場島',
      '大正島',
      'センカク諸島',
    ],
    blockedNames: [
      // Chinese names
      '钓鱼岛',
      '釣魚島',
      'Diaoyu',
      'Diaoyutai',
      '钓鱼台',
      '釣魚台',
    ],
    blockedLanguages: ['zh', 'zh-CN', 'zh-TW'],
    reason: 'Senkaku Islands - Must use Japanese names only',
  },
  {
    id: 'karafuto',
    japaneseNames: [
      '樺太',
      'カラフト',
      '南樺太',
    ],
    blockedNames: [
      // Russian names
      'Сахалин',
      'Sakhalin',
      'Южный Сахалин',
    ],
    blockedLanguages: ['ru'],
    reason: 'Karafuto (Southern Sakhalin) - Must use Japanese names only',
  },
];

// Pre-compute lowercase blocked names for performance
const BLOCKED_NAMES_LOWERCASE = new Set(
  JAPANESE_TERRITORIAL_RESTRICTIONS.flatMap(r => 
    r.blockedNames.map(name => name.toLowerCase())
  )
);

// Create a map for quick restriction lookup
const BLOCKED_NAME_TO_RESTRICTION = new Map<string, TerritorialRestriction>();
for (const restriction of JAPANESE_TERRITORIAL_RESTRICTIONS) {
  for (const blockedName of restriction.blockedNames) {
    BLOCKED_NAME_TO_RESTRICTION.set(blockedName.toLowerCase(), restriction);
  }
}

/**
 * Check if a location name is a blocked foreign name for Japanese territories
 */
export function isBlockedTerritorialName(locationName: string): boolean {
  const normalizedInput = locationName.trim().toLowerCase();
  
  // Quick exact match check
  if (BLOCKED_NAMES_LOWERCASE.has(normalizedInput)) {
    return true;
  }
  
  // Substring match check
  for (const blockedName of BLOCKED_NAMES_LOWERCASE) {
    if (normalizedInput.includes(blockedName)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a language is blocked for Japanese territories
 */
export function isBlockedLanguageForJapan(languageCode: string): boolean {
  const normalizedLang = languageCode.toLowerCase();
  
  for (const restriction of JAPANESE_TERRITORIAL_RESTRICTIONS) {
    if (restriction.blockedLanguages.some(lang => 
      normalizedLang.startsWith(lang.toLowerCase())
    )) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get restriction details for a blocked name
 */
export function getTerritorialRestrictionInfo(locationName: string): TerritorialRestriction | null {
  const normalizedInput = locationName.trim().toLowerCase();
  
  // Quick exact match lookup
  const exactMatch = BLOCKED_NAME_TO_RESTRICTION.get(normalizedInput);
  if (exactMatch) {
    return exactMatch;
  }
  
  // Substring match lookup
  for (const [blockedName, restriction] of BLOCKED_NAME_TO_RESTRICTION) {
    if (normalizedInput.includes(blockedName)) {
      return restriction;
    }
  }
  
  return null;
}

/**
 * Validate that Japanese territories are only entered in Japanese
 */
export function validateJapaneseTerritorialInput(
  locationName: string,
  languageCode?: string
): {
  valid: boolean;
  reason?: string;
  suggestion?: string;
} {
  // Check for blocked foreign names
  if (isBlockedTerritorialName(locationName)) {
    const restriction = getTerritorialRestrictionInfo(locationName);
    return {
      valid: false,
      reason: restriction?.reason || 'This location must be entered in Japanese only',
      suggestion: restriction?.japaneseNames[0],
    };
  }
  
  // Check for blocked language codes
  if (languageCode && isBlockedLanguageForJapan(languageCode)) {
    return {
      valid: false,
      reason: 'Japanese territories must be entered in Japanese language only',
    };
  }
  
  return { valid: true };
}
