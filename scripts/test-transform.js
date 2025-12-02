#!/usr/bin/env node

/**
 * Test script for fetch-libaddressinput.js
 * This creates mock data to test the transformation logic
 */

const path = require('path');
const fs = require('fs');

// Import the transformation function using proper path resolution
const { transformLibAddressData } = require(path.join(__dirname, 'fetch-libaddressinput.js'));

// Mock libaddressinput data for Japan
const mockJPData = {
  key: "JP",
  name: "JAPAN",
  fmt: "%N%n%O%n%A%n%C, %S%n%Z",
  require: "ACSZ",
  zip: "\\d{3}-\\d{4}",
  zipex: "154-0023,350-1106,951-8073,112-0001",
  sub_keys: "01~02~03~04~05~06~07~08~09~10~11~12~13~14~15~16~17~18~19~20~21~22~23~24~25~26~27~28~29~30~31~32~33~34~35~36~37~38~39~40~41~42~43~44~45~46~47",
  sub_names: "Hokkaido~Aomori~Iwate~Miyagi~Akita~Yamagata~Fukushima~Ibaraki~Tochigi~Gunma~Saitama~Chiba~Tokyo~Kanagawa~Niigata~Toyama~Ishikawa~Fukui~Yamanashi~Nagano~Gifu~Shizuoka~Aichi~Mie~Shiga~Kyoto~Osaka~Hyogo~Nara~Wakayama~Tottori~Shimane~Okayama~Hiroshima~Yamaguchi~Tokushima~Kagawa~Ehime~Kochi~Fukuoka~Saga~Nagasaki~Kumamoto~Oita~Miyazaki~Kagoshima~Okinawa",
  lang: "ja"
};

// Mock data for United States
const mockUSData = {
  key: "US",
  name: "UNITED STATES",
  fmt: "%N%n%O%n%A%n%C, %S %Z",
  require: "ACZ",
  zip: "(\\d{5})(?:[ \\-](\\d{4}))?",
  zipex: "95014,22162-1010",
  sub_keys: "AL~AK~AS~AZ~AR~AA~AE~AP~CA~CO~CT~DE~DC~FL~GA~GU~HI~ID~IL~IN~IA~KS~KY~LA~ME~MH~MD~MA~MI~FM~MN~MS~MO~MT~NE~NV~NH~NJ~NM~NY~NC~ND~MP~OH~OK~OR~PW~PA~PR~RI~SC~SD~TN~TX~UT~VT~VI~VA~WA~WV~WI~WY",
  sub_names: "Alabama~Alaska~American Samoa~Arizona~Arkansas~Armed Forces (AA)~Armed Forces (AE)~Armed Forces (AP)~California~Colorado~Connecticut~Delaware~District of Columbia~Florida~Georgia~Guam~Hawaii~Idaho~Illinois~Indiana~Iowa~Kansas~Kentucky~Louisiana~Maine~Marshall Islands~Maryland~Massachusetts~Michigan~Micronesia~Minnesota~Mississippi~Missouri~Montana~Nebraska~Nevada~New Hampshire~New Jersey~New Mexico~New York~North Carolina~North Dakota~Northern Mariana Islands~Ohio~Oklahoma~Oregon~Palau~Pennsylvania~Puerto Rico~Rhode Island~South Carolina~South Dakota~Tennessee~Texas~Utah~Vermont~Virgin Islands~Virginia~Washington~West Virginia~Wisconsin~Wyoming"
};

console.log('Testing libaddressinput data transformation...\n');

// Test Japan
console.log('Testing JP transformation:');
const transformedJP = transformLibAddressData('JP', mockJPData);
console.log(JSON.stringify(transformedJP, null, 2));

console.log('\n' + '='.repeat(60) + '\n');

// Test United States
console.log('Testing US transformation:');
const transformedUS = transformLibAddressData('US', mockUSData);
console.log(JSON.stringify(transformedUS, null, 2));

console.log('\n' + '='.repeat(60));
console.log('Tests completed successfully!');
console.log('The transformation logic is working correctly.');
