#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

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
  so: {
    recipient: 'Soo hel',
    building: 'Dhismaha',
    floor: 'Dabaq',
    room: 'Qol',
    street_address: 'Cinwaanka Waddada',
    district: 'Degmada',
    ward: 'Xaafadda',
    city: 'Magaalada',
    province: 'Gobolka',
    postal_code: 'Lambarka Boostada',
    country: 'Dalka',
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
};

const LANGUAGE_CODES = {
  'English': 'en',
  'French': 'fr',
  'Arabic': 'ar',
  'Portuguese': 'pt',
  'Swahili': 'sw',
  'Somali': 'so',
};

function improveRegionData(yamlPath) {
  try {
    const yamlContent = fs.readFileSync(yamlPath, 'utf8');
    const data = yaml.load(yamlContent);
    
    let modified = false;
    
    if (data.languages && Array.isArray(data.languages)) {
      data.languages.forEach(lang => {
        if (!lang.code && lang.name && LANGUAGE_CODES[lang.name]) {
          lang.code = LANGUAGE_CODES[lang.name];
          modified = true;
        }
        
        if (!lang.field_labels && lang.code && FIELD_LABELS[lang.code]) {
          lang.field_labels = FIELD_LABELS[lang.code];
          modified = true;
        }
      });
    }
    
    // Add mobile money if not present
    if (data.pos && data.pos.payment_methods) {
      const currentMethods = data.pos.payment_methods.map(m => m.type);
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
      const updatedYaml = yaml.dump(data, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        quotingType: "'",
      });
      fs.writeFileSync(yamlPath, updatedYaml, 'utf8');
      
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
  console.log('🌍 Improving African region data quality...\n');
  
  const regionFiles = [
    'data/africa/eastern_africa/SO/regions/SO-PL.yaml',
    'data/africa/eastern_africa/SO/regions/SO-SL.yaml',
    'data/africa/eastern_africa/SO/regions/SO-JL.yaml',
    'data/africa/eastern_africa/TZ/regions/TZ-ZAN.yaml',
    'data/africa/central_africa/AO/regions/AO-CB.yaml',
    'data/africa/northern_africa/DZ/regions/DZ-SAH.yaml',
  ];
  
  let totalProcessed = 0;
  let totalModified = 0;
  
  regionFiles.forEach(relPath => {
    const fullPath = path.join(__dirname, '..', relPath);
    
    if (fs.existsSync(fullPath)) {
      totalProcessed++;
      if (improveRegionData(fullPath)) {
        totalModified++;
        console.log(`✓ ${path.basename(fullPath, '.yaml')}: Updated`);
      } else {
        console.log(`  ${path.basename(fullPath, '.yaml')}: No changes needed`);
      }
    }
  });
  
  console.log('\n✅ Processing complete!');
  console.log(`   Processed: ${totalProcessed} regions`);
  console.log(`   Modified:  ${totalModified} regions`);
}

main();
