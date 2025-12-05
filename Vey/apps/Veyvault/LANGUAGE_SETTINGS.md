# Veyvault Language Settings Enhancement

## Overview

This document describes the enhanced language settings feature for Veyvault and Veyform, which allows users to configure language preferences separately from address registration.

## Key Features

### 1. Separate Language Settings

Language settings are now independent from address input language:
- **App Language**: Language for UI and menus
- **Label Language**: Language for form labels and placeholders
- **Address Input Languages**: Multiple languages available for entering addresses
- **Auto-Translation**: Automatic translation between languages

### 2. Multi-Language Address Support

Addresses can be stored and displayed in multiple languages:
- **Native Language**: Original language of the address (e.g., Japanese for Japan)
- **English**: English translation for international delivery
- **Delivery Languages**: Country-specific supported languages for delivery labels

### 3. Free Translation API Integration

Uses free translation APIs for automatic translation:
- **MyMemory API**: Default free translation service (no API key required)
- **LibreTranslate**: Open-source translation service
- **Apertium**: Free/open-source machine translation
- **Caching**: Translations are cached to reduce API calls

## Architecture

### Type Definitions

#### LanguageSettings
```typescript
interface LanguageSettings {
  // App UI language
  appLanguage: string;
  
  // Preferred languages for address input (in order of preference)
  addressInputLanguages: string[];
  
  // Preferred language for labels and placeholders
  labelLanguage: string;
  
  // Enable auto-translation for address fields
  enableAutoTranslation: boolean;
  
  // Languages to auto-translate addresses to
  translationTargets: string[];
  
  // Country-specific language overrides
  countryLanguageOverrides?: Record<string, string>;
}
```

#### MultiLanguageAddress
```typescript
interface MultiLanguageAddress {
  // Address in original/native language
  native: {
    language: string;
    addressLine1: string;
    addressLine2?: string;
    locality?: string;
    admin1?: string;
    admin2?: string;
  };
  
  // English translation
  english?: {
    addressLine1: string;
    addressLine2?: string;
    locality?: string;
    admin1?: string;
    admin2?: string;
  };
  
  // Additional translations
  translations?: Array<{
    language: string;
    addressLine1: string;
    addressLine2?: string;
    locality?: string;
    admin1?: string;
    admin2?: string;
  }>;
  
  // Delivery-supported languages for this address
  deliveryLanguages?: string[];
}
```

### Services

#### TranslationService
Location: `Vey/apps/Veyvault/src/services/translation.service.ts`

Main translation service providing:
- Single text translation
- Batch translation
- Address field translation
- Language detection
- Translation caching

```typescript
import { getTranslationService } from '@/services/translation.service';

const translator = getTranslationService();

// Translate single field
const result = await translator.translate({
  text: '東京都渋谷区神宮前1-2-3',
  sourceLang: 'ja',
  targetLang: 'en'
});

// Translate address fields
const translated = await translator.translateAddressFields(
  {
    addressLine1: '神宮前1-2-3',
    admin1: '東京都',
    admin2: '渋谷区',
  },
  'ja',
  'en'
);
```

### Components

#### Enhanced Settings Page
Location: `Vey/apps/Veyvault/app/settings/page.tsx`

Features:
- App language selection
- Label language configuration
- Address input languages (multi-select)
- Auto-translation toggle
- Translation target languages
- Advanced settings (collapsible)

#### Enhanced AddressForm
Location: `Vey/apps/Veyvault/app/components/AddressForm.tsx`

Features:
- Three language tabs: Native, English, Delivery Languages
- Auto-translation toggle
- Real-time translation on tab switch
- Display of translated versions
- Multi-language data storage

### Data Updates

#### Countries Data
Location: `Vey/apps/Veyvault/app/lib/countries.ts`

Each country now includes:
- `nativeLang`: ISO language code (e.g., 'ja', 'en', 'zh')
- `deliveryLanguages`: Array of supported languages for delivery (e.g., ['ja', 'en'])

Example:
```typescript
{
  code: 'JP',
  name: 'Japan',
  flag: '🇯🇵',
  nativeLang: 'ja',
  deliveryLanguages: ['ja', 'en'],
  // ... other fields
}
```

## User Flow

### 1. Configure Language Settings

1. Navigate to Settings page
2. Scroll to "Language Settings" section
3. Set **App Display Language** (UI language)
4. Set **Label & Placeholder Language** (form labels)
5. Enable **Auto-Translation for Addresses**
6. Click "Show Advanced" for more options
7. Select **Enabled Address Input Languages** (multi-select)
8. Select **Auto-Translation Target Languages**
9. Save settings

### 2. Enter Address with Multi-Language Support

1. Go to "Add New Address" page
2. Select country (e.g., Japan)
3. Three language tabs appear:
   - 🌐 JA (Native)
   - 🇬🇧 English
   - 🚚 Delivery Languages
4. Enter address in native language tab
5. Enable "Auto-translate" toggle
6. Switch to "English" tab → auto-translated version appears
7. Switch to "Delivery Languages" tab → delivery language versions appear
8. Edit any translated version if needed
9. Save address (all language versions stored)

### 3. View Multi-Language Address

When viewing an address:
- Primary display uses app language
- Can switch between language versions
- Shows which languages are available
- Delivery labels use appropriate language

## Configuration

### Default Settings

```typescript
const defaultLanguageSettings = {
  appLanguage: 'en',
  addressInputLanguages: ['en', 'ja'],
  labelLanguage: 'en',
  enableAutoTranslation: true,
  translationTargets: ['en', 'ja'],
  countryLanguageOverrides: {},
};
```

### Supported Languages

Currently supported languages for translation:
- English (en)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Italian (it)
- Russian (ru)
- Arabic (ar)
- Thai (th)
- Vietnamese (vi)
- Hindi (hi)
- Indonesian (id)
- Malay (ms)
- Dutch (nl)
- Swedish (sv)
- Norwegian (no)
- Danish (da)

## Implementation Details

### Translation Caching

Translations are cached to reduce API calls:
- Cache key: `sourceLang:targetLang:text`
- LRU eviction when cache is full
- Default max size: 1000 entries
- Can be cleared via `clearCache()`

### Language Detection

Simple character-set based detection:
- Japanese: Hiragana, Katakana, Kanji
- Korean: Hangul
- Chinese: Han characters
- Arabic: Arabic script
- Thai: Thai script
- Russian: Cyrillic
- Default: English

### Error Handling

Translation failures:
- Fall back to original text
- Log warning to console
- Set confidence to 0
- Don't block form submission

## API Integration

### MyMemory Translation API

Free translation API (default):
- Endpoint: `https://api.mymemory.translated.net/get`
- No API key required
- Rate limit: ~100 requests/day per IP
- Supports 50+ languages

Example request:
```
GET https://api.mymemory.translated.net/get?q=Hello&langpair=en|ja
```

### LibreTranslate (Alternative)

Open-source translation:
- Self-hosted or public instance
- API key optional
- Better privacy
- Configure via `initTranslationService()`

```typescript
import { initTranslationService } from '@/services/translation.service';

initTranslationService({
  apiEndpoint: 'https://libretranslate.com',
  apiKey: 'your-api-key'
});
```

## Benefits

1. **User Control**: Users can set UI language independently from address language
2. **Delivery Accuracy**: Addresses stored in multiple languages for better delivery
3. **International Support**: English + native + delivery languages for global shipping
4. **Flexibility**: Don't need to match address input language with app language
5. **Free Service**: Uses free translation APIs (MyMemory by default)
6. **Offline Support**: Cached translations work offline
7. **Enhanced UX**: Labels and placeholders in user's preferred language

## Future Enhancements

- [ ] Add more translation services (Google, DeepL)
- [ ] Improve language detection (use API instead of regex)
- [ ] Add manual correction interface for translations
- [ ] Support right-to-left (RTL) languages better
- [ ] Add pronunciation/romanization for Asian languages
- [ ] Integrate with AI OCR for address extraction
- [ ] Add voice input with language detection

## Testing

To test the language settings:

1. Go to Settings page
2. Change app language to Japanese
3. Change label language to English
4. Enable auto-translation
5. Select multiple input languages (Japanese, English, Korean)
6. Select translation targets (English, Japanese)
7. Go to Add Address
8. Select Japan as country
9. Enter address in Japanese
10. Enable auto-translate toggle
11. Switch to English tab → should see English translation
12. Switch to Delivery Languages tab → should see available translations
13. Save and verify all languages are stored

## Troubleshooting

### Translation not working

- Check internet connection (API requires network)
- Check browser console for errors
- Verify translation service is not rate-limited
- Try clearing translation cache

### Language tabs not showing

- Ensure country is selected
- Check country data has `deliveryLanguages` defined
- Verify `nativeLang` is set for country

### Translations inaccurate

- Machine translation has limitations
- Edit translations manually
- Consider adding correction interface
- Use alternative translation service

## Related Documentation

- [Vey Ecosystem Overview](../../../README.md)
- [Veyvault README](./README.md)
- [Address Data Schema](../../../docs/schema/README.md)
- [SDK Documentation](../../../sdk/README.md)
- [Multi-Language Support RFC](./docs/RFC-multilang.md) _(future)_

---

**Last Updated**: 2025-12-05
**Version**: 1.0.0
**Status**: Implemented
