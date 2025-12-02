// Translation data
const translations = {
    en: {
        pageTitle: '🌍 World Address Form Demo',
        userModeBtn: 'User',
        devModeBtn: 'Developer',
        userPanelTitle: 'Address Form',
        devPanelTitle: 'Developer Tools',
        infoText: 'Select a country to see how the address form adapts to different international formats.',
        devInfoText: 'This panel shows the raw country data and form configuration for developers.',
        countryLabel: 'Country',
        firstNameLabel: 'First Name',
        lastNameLabel: 'Last Name',
        phoneLabel: 'Phone Number',
        submitBtn: 'Submit',
        previewTitle: 'Preview:',
        countryDataTitle: 'Country Data:',
        selectCountry: '-- Select Country --',
        required: '*',
        streetAddress: 'Street Address',
        city: 'City',
        state: 'State',
        province: 'Province',
        postalCode: 'Postal Code',
        zipCode: 'ZIP Code',
        building: 'Building',
        floor: 'Floor',
        room: 'Room',
        prefecture: 'Prefecture',
        ward: 'Ward',
        recipient: 'Recipient Name',
        locality: 'Locality',
        houseNumber: 'House Number',
        street: 'Street'
    },
    ja: {
        pageTitle: '🌍 世界の住所フォームデモ',
        userModeBtn: 'ユーザー',
        devModeBtn: '開発者',
        userPanelTitle: '住所フォーム',
        devPanelTitle: '開発者ツール',
        infoText: '国を選択すると、さまざまな国際形式に適応したフォームが表示されます。',
        devInfoText: 'このパネルには、開発者向けの生の国データとフォーム設定が表示されます。',
        countryLabel: '国',
        firstNameLabel: '名',
        lastNameLabel: '姓',
        phoneLabel: '電話番号',
        submitBtn: '送信',
        previewTitle: 'プレビュー:',
        countryDataTitle: '国データ:',
        selectCountry: '-- 国を選択 --',
        required: '必須',
        streetAddress: '住所',
        city: '市区町村',
        state: '州',
        province: '都道府県',
        postalCode: '郵便番号',
        zipCode: '郵便番号',
        building: '建物名',
        floor: '階',
        room: '部屋番号',
        prefecture: '都道府県',
        ward: '区',
        recipient: '宛名',
        locality: '地域',
        houseNumber: '番地',
        street: '通り'
    },
    zh: {
        pageTitle: '🌍 世界地址表单演示',
        userModeBtn: '用户',
        devModeBtn: '开发者',
        userPanelTitle: '地址表单',
        devPanelTitle: '开发者工具',
        infoText: '选择一个国家以查看表单如何适应不同的国际格式。',
        devInfoText: '此面板显示开发者的原始国家数据和表单配置。',
        countryLabel: '国家',
        firstNameLabel: '名',
        lastNameLabel: '姓',
        phoneLabel: '电话号码',
        submitBtn: '提交',
        previewTitle: '预览:',
        countryDataTitle: '国家数据:',
        selectCountry: '-- 选择国家 --',
        required: '必填',
        streetAddress: '街道地址',
        city: '城市',
        state: '州',
        province: '省',
        postalCode: '邮政编码',
        zipCode: '邮编',
        building: '建筑物',
        floor: '楼层',
        room: '房间',
        prefecture: '都道府县',
        ward: '区',
        recipient: '收件人姓名',
        locality: '地区',
        houseNumber: '门牌号',
        street: '街道'
    }
};

// Country data with form configurations
const countryData = {
    JP: {
        name: { en: 'Japan', ja: '日本', zh: '日本' },
        fields: ['prefecture', 'city', 'ward', 'streetAddress', 'building', 'floor', 'room', 'postalCode'],
        required: ['prefecture', 'city', 'streetAddress', 'postalCode'],
        postalCodeFormat: '###-####',
        postalCodeExample: '100-0001',
        phoneFormat: '0##-####-####',
        phoneExample: '03-1234-5678',
        placeholders: {
            en: {
                prefecture: 'Tokyo',
                city: 'Chiyoda',
                ward: 'Chiyoda',
                streetAddress: '1-1 Chiyoda',
                building: 'Imperial Palace',
                floor: '1F',
                room: '101',
                postalCode: '100-0001'
            },
            ja: {
                prefecture: '東京都',
                city: '千代田区',
                ward: '千代田',
                streetAddress: '千代田1-1',
                building: '皇居',
                floor: '1階',
                room: '101号室',
                postalCode: '100-0001'
            },
            zh: {
                prefecture: '东京都',
                city: '千代田区',
                ward: '千代田',
                streetAddress: '千代田1-1',
                building: '皇居',
                floor: '1层',
                room: '101室',
                postalCode: '100-0001'
            }
        }
    },
    US: {
        name: { en: 'United States', ja: 'アメリカ合衆国', zh: '美国' },
        fields: ['streetAddress', 'building', 'floor', 'room', 'city', 'state', 'zipCode'],
        required: ['streetAddress', 'city', 'state', 'zipCode'],
        postalCodeFormat: '#####',
        postalCodeExample: '10001',
        phoneFormat: '(###) ###-####',
        phoneExample: '(212) 555-1234',
        placeholders: {
            en: {
                streetAddress: '285 Fulton Street',
                building: 'One World Trade Center',
                floor: '58th Floor',
                room: 'Suite 5804',
                city: 'New York',
                state: 'NY',
                zipCode: '10007'
            },
            ja: {
                streetAddress: 'フルトン通り285番地',
                building: 'ワンワールドトレードセンター',
                floor: '58階',
                room: 'スイート5804',
                city: 'ニューヨーク',
                state: 'NY',
                zipCode: '10007'
            },
            zh: {
                streetAddress: '富尔顿街285号',
                building: '世贸中心一号楼',
                floor: '58层',
                room: '5804套房',
                city: '纽约',
                state: 'NY',
                zipCode: '10007'
            }
        }
    },
    GB: {
        name: { en: 'United Kingdom', ja: 'イギリス', zh: '英国' },
        fields: ['houseNumber', 'street', 'locality', 'city', 'postalCode'],
        required: ['street', 'city', 'postalCode'],
        postalCodeFormat: 'AA# #AA',
        postalCodeExample: 'SW1A 2AA',
        phoneFormat: '##### ######',
        phoneExample: '020 7946 0958',
        placeholders: {
            en: {
                houseNumber: '10',
                street: 'Downing Street',
                locality: 'Westminster',
                city: 'London',
                postalCode: 'SW1A 2AA'
            },
            ja: {
                houseNumber: '10',
                street: 'ダウニング街',
                locality: 'ウェストミンスター',
                city: 'ロンドン',
                postalCode: 'SW1A 2AA'
            },
            zh: {
                houseNumber: '10',
                street: '唐宁街',
                locality: '威斯敏斯特',
                city: '伦敦',
                postalCode: 'SW1A 2AA'
            }
        }
    },
    CN: {
        name: { en: 'China', ja: '中国', zh: '中国' },
        fields: ['province', 'city', 'streetAddress', 'building', 'room', 'postalCode'],
        required: ['province', 'city', 'streetAddress', 'postalCode'],
        postalCodeFormat: '######',
        postalCodeExample: '100000',
        phoneFormat: '### #### ####',
        phoneExample: '010 8888 8888',
        placeholders: {
            en: {
                province: 'Beijing',
                city: 'Dongcheng District',
                streetAddress: 'Chang\'an Avenue',
                building: 'Forbidden City',
                room: '101',
                postalCode: '100006'
            },
            ja: {
                province: '北京市',
                city: '東城区',
                streetAddress: '長安街',
                building: '紫禁城',
                room: '101',
                postalCode: '100006'
            },
            zh: {
                province: '北京市',
                city: '东城区',
                streetAddress: '长安街',
                building: '紫禁城',
                room: '101',
                postalCode: '100006'
            }
        }
    },
    FR: {
        name: { en: 'France', ja: 'フランス', zh: '法国' },
        fields: ['streetAddress', 'building', 'city', 'postalCode'],
        required: ['streetAddress', 'city', 'postalCode'],
        postalCodeFormat: '#####',
        postalCodeExample: '75001',
        phoneFormat: '## ## ## ## ##',
        phoneExample: '01 42 60 39 26',
        placeholders: {
            en: {
                streetAddress: 'Avenue des Champs-Élysées',
                building: 'Arc de Triomphe',
                city: 'Paris',
                postalCode: '75008'
            },
            ja: {
                streetAddress: 'シャンゼリゼ大通り',
                building: '凱旋門',
                city: 'パリ',
                postalCode: '75008'
            },
            zh: {
                streetAddress: '香榭丽舍大道',
                building: '凯旋门',
                city: '巴黎',
                postalCode: '75008'
            }
        }
    },
    DE: {
        name: { en: 'Germany', ja: 'ドイツ', zh: '德国' },
        fields: ['streetAddress', 'houseNumber', 'city', 'postalCode'],
        required: ['streetAddress', 'city', 'postalCode'],
        postalCodeFormat: '#####',
        postalCodeExample: '10115',
        phoneFormat: '### #########',
        phoneExample: '030 227550',
        placeholders: {
            en: {
                streetAddress: 'Unter den Linden',
                houseNumber: '77',
                city: 'Berlin',
                postalCode: '10117'
            },
            ja: {
                streetAddress: 'ウンター・デン・リンデン',
                houseNumber: '77',
                city: 'ベルリン',
                postalCode: '10117'
            },
            zh: {
                streetAddress: '菩提树下大街',
                houseNumber: '77',
                city: '柏林',
                postalCode: '10117'
            }
        }
    },
    KR: {
        name: { en: 'South Korea', ja: '韓国', zh: '韩国' },
        fields: ['city', 'streetAddress', 'building', 'floor', 'room', 'postalCode'],
        required: ['city', 'streetAddress', 'postalCode'],
        postalCodeFormat: '#####',
        postalCodeExample: '03171',
        phoneFormat: '0##-####-####',
        phoneExample: '02-1234-5678',
        placeholders: {
            en: {
                city: 'Seoul',
                streetAddress: 'Sejong-daero 1',
                building: 'Gyeongbokgung Palace',
                floor: '1F',
                room: '101',
                postalCode: '03171'
            },
            ja: {
                city: 'ソウル',
                streetAddress: '世宗大路1',
                building: '景福宮',
                floor: '1階',
                room: '101',
                postalCode: '03171'
            },
            zh: {
                city: '首尔',
                streetAddress: '世宗大路1',
                building: '景福宫',
                floor: '1层',
                room: '101',
                postalCode: '03171'
            }
        }
    },
    AU: {
        name: { en: 'Australia', ja: 'オーストラリア', zh: '澳大利亚' },
        fields: ['streetAddress', 'city', 'state', 'postalCode'],
        required: ['streetAddress', 'city', 'state', 'postalCode'],
        postalCodeFormat: '####',
        postalCodeExample: '2000',
        phoneFormat: '## #### ####',
        phoneExample: '02 9250 7111',
        placeholders: {
            en: {
                streetAddress: 'Bennelong Point',
                city: 'Sydney',
                state: 'NSW',
                postalCode: '2000'
            },
            ja: {
                streetAddress: 'ベネロング・ポイント',
                city: 'シドニー',
                state: 'NSW',
                postalCode: '2000'
            },
            zh: {
                streetAddress: '贝内隆角',
                city: '悉尼',
                state: 'NSW',
                postalCode: '2000'
            }
        }
    }
};

// Global state
let currentLang = 'en';
let currentMode = 'user';
let currentCountry = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initLanguageSwitcher();
    initModeSwitcher();
    initCountrySelector();
    initForm();
    updateUI();
});

// Language switcher
function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLang = btn.dataset.lang;
            updateUI();
            if (currentCountry) {
                updateFormFields(currentCountry);
            }
        });
    });
}

// Mode switcher
function initModeSwitcher() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateModeDisplay();
        });
    });
}

// Update mode display
function updateModeDisplay() {
    const content = document.getElementById('content');
    const devPanel = document.getElementById('devPanel');
    
    if (currentMode === 'dev') {
        content.classList.add('dev-mode');
        devPanel.classList.remove('hidden');
    } else {
        content.classList.remove('dev-mode');
        devPanel.classList.add('hidden');
    }
}

// Country selector
function initCountrySelector() {
    const countrySelect = document.getElementById('country');
    
    // Populate country options
    const countries = Object.keys(countryData).sort((a, b) => {
        return countryData[a].name.en.localeCompare(countryData[b].name.en);
    });
    
    countries.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${countryData[code].name[currentLang]} (${code})`;
        countrySelect.appendChild(option);
    });
    
    // Handle country change
    countrySelect.addEventListener('change', (e) => {
        const countryCode = e.target.value;
        if (countryCode) {
            currentCountry = countryCode;
            updateFormFields(countryCode);
            updateCountryInfo(countryCode);
            updateDevPanel(countryCode);
        } else {
            currentCountry = null;
            clearDynamicFields();
            hideCountryInfo();
        }
    });
}

// Update UI with translations
function updateUI() {
    const t = translations[currentLang];
    
    document.getElementById('pageTitle').textContent = t.pageTitle;
    document.getElementById('userModeBtn').textContent = t.userModeBtn;
    document.getElementById('devModeBtn').textContent = t.devModeBtn;
    document.getElementById('userPanelTitle').textContent = t.userPanelTitle;
    document.getElementById('devPanelTitle').textContent = t.devPanelTitle;
    document.getElementById('infoText').textContent = t.infoText;
    document.getElementById('devInfoText').textContent = t.devInfoText;
    document.getElementById('countryLabel').innerHTML = `${t.countryLabel} <span class="required">${t.required}</span>`;
    document.getElementById('firstNameLabel').innerHTML = `${t.firstNameLabel} <span class="required">${t.required}</span>`;
    document.getElementById('lastNameLabel').innerHTML = `${t.lastNameLabel} <span class="required">${t.required}</span>`;
    document.getElementById('phoneLabel').innerHTML = `${t.phoneLabel} <span class="required">${t.required}</span>`;
    document.getElementById('submitBtn').textContent = t.submitBtn;
    document.getElementById('previewTitle').textContent = t.previewTitle;
    document.getElementById('countryDataTitle').textContent = t.countryDataTitle;
    
    // Update country select options
    const countrySelect = document.getElementById('country');
    const selectedValue = countrySelect.value;
    countrySelect.innerHTML = `<option value="">${t.selectCountry}</option>`;
    
    const countries = Object.keys(countryData).sort((a, b) => {
        return countryData[a].name.en.localeCompare(countryData[b].name.en);
    });
    
    countries.forEach(code => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${countryData[code].name[currentLang]} (${code})`;
        if (code === selectedValue) {
            option.selected = true;
        }
        countrySelect.appendChild(option);
    });
    
    // Update placeholders
    updatePlaceholders();
}

// Update placeholders
function updatePlaceholders() {
    const t = translations[currentLang];
    document.getElementById('firstName').placeholder = currentLang === 'ja' ? '太郎' : currentLang === 'zh' ? '明' : 'John';
    document.getElementById('lastName').placeholder = currentLang === 'ja' ? '山田' : currentLang === 'zh' ? '李' : 'Smith';
    
    if (currentCountry) {
        const data = countryData[currentCountry];
        document.getElementById('phone').placeholder = data.phoneExample;
    } else {
        document.getElementById('phone').placeholder = '+1 (555) 123-4567';
    }
}

// Update form fields based on country
function updateFormFields(countryCode) {
    const data = countryData[countryCode];
    const t = translations[currentLang];
    const dynamicFields = document.getElementById('dynamicFields');
    dynamicFields.innerHTML = '';
    
    data.fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.htmlFor = field;
        const isRequired = data.required.includes(field);
        label.innerHTML = `${t[field] || field} ${isRequired ? '<span class="required">' + t.required + '</span>' : ''}`;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = field;
        input.name = field;
        if (isRequired) {
            input.required = true;
        }
        
        // Set placeholder from country data
        const placeholder = data.placeholders[currentLang][field];
        if (placeholder) {
            input.placeholder = placeholder;
        }
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        dynamicFields.appendChild(formGroup);
    });
    
    updatePlaceholders();
}

// Clear dynamic fields
function clearDynamicFields() {
    document.getElementById('dynamicFields').innerHTML = '';
}

// Update country info
function updateCountryInfo(countryCode) {
    const data = countryData[countryCode];
    const countryInfo = document.getElementById('countryInfo');
    const t = translations[currentLang];
    
    let infoText = '';
    if (currentLang === 'en') {
        infoText = `📮 Postal Code Format: ${data.postalCodeFormat} (e.g., ${data.postalCodeExample})`;
    } else if (currentLang === 'ja') {
        infoText = `📮 郵便番号形式: ${data.postalCodeFormat} (例: ${data.postalCodeExample})`;
    } else {
        infoText = `📮 邮政编码格式: ${data.postalCodeFormat} (例: ${data.postalCodeExample})`;
    }
    
    countryInfo.textContent = infoText;
    countryInfo.classList.remove('hidden');
}

// Hide country info
function hideCountryInfo() {
    document.getElementById('countryInfo').classList.add('hidden');
}

// Update dev panel
function updateDevPanel(countryCode) {
    const data = countryData[countryCode];
    const countryDataDiv = document.getElementById('countryData');
    countryDataDiv.textContent = JSON.stringify(data, null, 2);
}

// Initialize form
function initForm() {
    const form = document.getElementById('addressForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showPreview();
    });
}

// Show preview
function showPreview() {
    const form = document.getElementById('addressForm');
    const formData = new FormData(form);
    const preview = document.getElementById('preview');
    const previewContent = document.getElementById('previewContent');
    
    let output = '';
    for (let [key, value] of formData.entries()) {
        if (value) {
            if (key === 'country') {
                const countryName = countryData[value].name[currentLang];
                output += `${key}: ${countryName} (${value})\n`;
            } else {
                output += `${key}: ${value}\n`;
            }
        }
    }
    
    previewContent.textContent = output;
    preview.classList.remove('hidden');
    
    // Scroll to preview
    preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
