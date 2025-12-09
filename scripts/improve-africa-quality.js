#!/usr/bin/env node

/**
 * Script to improve quality of African country data
 * - Add language codes
 * - Add field_labels for all languages
 * - Update tax rates with actual values
 * - Enhance payment methods
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Common field labels in various languages
const FIELD_LABELS = {
  en: {
    recipient: 'Recipient',
    building: 'Building',
    floor: 'Floor',
    room: 'Room',
    street_address: 'Street Address',
    district: 'District',
    ward: 'Ward',
    city: 'City',
    province: 'Province',
    postal_code: 'Postal Code',
    country: 'Country',
  },
  fr: {
    recipient: 'Destinataire',
    building: 'Bâtiment',
    floor: 'Étage',
    room: 'Chambre',
    street_address: 'Adresse',
    district: 'District',
    ward: 'Quartier',
    city: 'Ville',
    province: 'Province',
    postal_code: 'Code Postal',
    country: 'Pays',
  },
  ar: {
    recipient: 'المستلم',
    building: 'المبنى',
    floor: 'الطابق',
    room: 'الغرفة',
    street_address: 'عنوان الشارع',
    district: 'المقاطعة',
    ward: 'الحي',
    city: 'المدينة',
    province: 'المحافظة',
    postal_code: 'الرمز البريدي',
    country: 'الدولة',
  },
  pt: {
    recipient: 'Destinatário',
    building: 'Edifício',
    floor: 'Andar',
    room: 'Sala',
    street_address: 'Endereço',
    district: 'Distrito',
    ward: 'Bairro',
    city: 'Cidade',
    province: 'Província',
    postal_code: 'Código Postal',
    country: 'País',
  },
  sw: {
    recipient: 'Mpokeaji',
    building: 'Jengo',
    floor: 'Sakafu',
    room: 'Chumba',
    street_address: 'Anwani ya Barabara',
    district: 'Wilaya',
    ward: 'Kata',
    city: 'Jiji',
    province: 'Mkoa',
    postal_code: 'Nambari ya Posta',
    country: 'Nchi',
  },
  af: {
    recipient: 'Ontvanger',
    building: 'Gebou',
    floor: 'Verdieping',
    room: 'Kamer',
    street_address: 'Straatadres',
    district: 'Distrik',
    ward: 'Wyk',
    city: 'Stad',
    province: 'Provinsie',
    postal_code: 'Poskode',
    country: 'Land',
  },
};

// Language code mappings
const LANGUAGE_CODES = {
  'English': 'en',
  'French': 'fr',
  'Arabic': 'ar',
  'Portuguese': 'pt',
  'Swahili': 'sw',
  'Afrikaans': 'af',
  'Spanish': 'es',
  'Berber': 'ber',
  'Hausa': 'ha',
  'Yoruba': 'yo',
  'Igbo': 'ig',
  'Zulu': 'zu',
  'Xhosa': 'xh',
  'Sotho': 'st',
  'Tswana': 'tn',
  'Tsonga': 'ts',
  'Venda': 've',
  'Swati': 'ss',
  'Ndebele': 'nr',
  'Chewa': 'ny',
  'Kirundi': 'rn',
  'Kinyarwanda': 'rw',
  'Amharic': 'am',
  'Tigrinya': 'ti',
  'Somali': 'so',
  'Oromo': 'om',
};

// VAT rates by country (approximate standard rates as of 2024)
const VAT_RATES = {
  'DZ': 0.19, // Algeria
  'AO': 0.14, // Angola
  'BJ': 0.18, // Benin
  'BW': 0.14, // Botswana (VAT was 0.12, increased to 0.14 in 2021)
  'BF': 0.18, // Burkina Faso
  'BI': 0.18, // Burundi
  'CM': 0.1925, // Cameroon
  'CV': 0.15, // Cape Verde
  'CF': 0.19, // Central African Republic
  'TD': 0.18, // Chad
  'KM': 0.10, // Comoros
  'CG': 0.18, // Republic of the Congo
  'CD': 0.16, // Democratic Republic of the Congo
  'CI': 0.18, // Côte d'Ivoire
  'DJ': 0.10, // Djibouti
  'EG': 0.14, // Egypt
  'GQ': 0.15, // Equatorial Guinea
  'ER': 0.05, // Eritrea
  'SZ': 0.15, // Eswatini
  'ET': 0.15, // Ethiopia
  'GA': 0.18, // Gabon
  'GM': 0.15, // The Gambia
  'GH': 0.125, // Ghana (12.5% standard + 2.5% NHIL + 2.5% GETFL = 17.5% effective)
  'GN': 0.18, // Guinea
  'GW': 0.15, // Guinea-Bissau
  'KE': 0.16, // Kenya
  'LS': 0.15, // Lesotho
  'LR': 0.10, // Liberia (GST)
  'LY': 0.00, // Libya (no VAT)
  'MG': 0.20, // Madagascar
  'MW': 0.165, // Malawi
  'ML': 0.18, // Mali
  'MR': 0.16, // Mauritania
  'MU': 0.15, // Mauritius
  'MA': 0.20, // Morocco
  'MZ': 0.16, // Mozambique
  'NA': 0.15, // Namibia
  'NE': 0.19, // Niger
  'NG': 0.075, // Nigeria (7.5%)
  'RW': 0.18, // Rwanda
  'ST': 0.15, // São Tomé and Príncipe
  'SN': 0.18, // Senegal
  'SC': 0.15, // Seychelles
  'SL': 0.15, // Sierra Leone (GST)
  'SO': 0.05, // Somalia
  'ZA': 0.15, // South Africa
  'SS': 0.00, // South Sudan (no VAT yet)
  'SD': 0.17, // Sudan
  'TZ': 0.18, // Tanzania
  'TG': 0.18, // Togo
  'TN': 0.19, // Tunisia
  'UG': 0.18, // Uganda
  'ZM': 0.16, // Zambia
  'ZW': 0.145, // Zimbabwe
  'EH': 0.20,  // Western Sahara (uses Moroccan system)
};

function improveCountryData(yamlPath) {
  try {
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const data = yaml.load(yamlContent);
    
    let modified = false;
    
    // Add language codes and field_labels
    if (data.languages && Array.isArray(data.languages)) {
      data.languages.forEach(lang => {
        // Add language code if missing
        if (!lang.code && lang.name && LANGUAGE_CODES[lang.name]) {
          lang.code = LANGUAGE_CODES[lang.name];
          modified = true;
        }
        
        // Add field_labels if missing and we have translations
        if (!lang.field_labels && lang.code && FIELD_LABELS[lang.code]) {
          lang.field_labels = FIELD_LABELS[lang.code];
          modified = true;
        }
      });
    }
    
    // Update VAT rate if null
    if (data.pos && data.pos.tax && data.pos.tax.rate && 
        data.pos.tax.rate.standard === null &&
        data.iso_codes && data.iso_codes.alpha2) {
      const countryCode = data.iso_codes.alpha2;
      if (VAT_RATES[countryCode] !== undefined) {
        data.pos.tax.rate.standard = VAT_RATES[countryCode];
        modified = true;
      }
    }
    
    // Enhance payment methods for African countries
    if (data.pos && data.pos.payment_methods) {
      const currentMethods = data.pos.payment_methods.map(m => m.type);
      // Add mobile money if not present (very common in Africa)
      if (!currentMethods.includes('mobile')) {
        data.pos.payment_methods.push({
          type: 'mobile',
          name: 'Mobile Money',
          prevalence: 'high',
        });
        modified = true;
      }
    }
    
    if (modified) {
      // Write back to YAML
      const updatedYaml = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        quotingType: "'",
      });
      fs.writeFileSync(yamlPath, updatedYaml, 'utf8');
      
      // Also update JSON
      const jsonPath = yamlPath.replace('.yaml', '.json');
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${yamlPath}:`, error.message);
    return false;
  }
}

function main() {
  const africaRegions = [
    'data/africa/central_africa',
    'data/africa/eastern_africa',
    'data/africa/northern_africa',
    'data/africa/southern_africa',
    'data/africa/west_africa',
  ];
  
  console.log('🌍 Improving African country data quality...\n');
  
  let totalProcessed = 0;
  let totalModified = 0;
  
  africaRegions.forEach(regionPath => {
    const fullPath = path.join(__dirname, '..', regionPath);
    
    if (!fs.existsSync(fullPath)) {
      return;
    }
    
    const countries = fs.readdirSync(fullPath);
    
    countries.forEach(countryCode => {
      const yamlFile = path.join(fullPath, countryCode, `${countryCode}.yaml`);
      
      if (fs.existsSync(yamlFile)) {
        totalProcessed++;
        if (improveCountryData(yamlFile)) {
          totalModified++;
          console.log(`✓ ${countryCode}: Updated`);
        } else {
          console.log(`  ${countryCode}: No changes needed`);
        }
      }
    });
  });
  
  console.log('\n✅ Processing complete!');
  console.log(`   Processed: ${totalProcessed} countries`);
  console.log(`   Modified:  ${totalModified} countries`);
}

main();
