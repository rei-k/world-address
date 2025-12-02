/**
 * Address Mapping Utility
 * Maps between cloud address book format and carrier-specific formats
 */

import { Address } from '../types';

export interface NormalizedAddress {
  country: string;
  admin1: { code: string; name: string };
  admin2: { code: string; name: string };
  admin3?: { code: string; name: string };
  street: string;
  building?: string;
  unit?: string;
  room?: string;
  postalCode?: string;
}

export interface SFAddress {
  province: string;
  city: string;
  county: string;
  address: string;
  postalCode?: string;
}

export interface JDAddress {
  provinceId: string;
  cityId: string;
  countyId: string;
  detailAddress: string;
  zipCode?: string;
}

export class AddressMapper {
  /**
   * Convert normalized address to SF Express format
   */
  static toSFFormat(address: NormalizedAddress): SFAddress {
    return {
      province: address.admin1.name,
      city: address.admin2.name,
      county: address.admin3?.name || '',
      address: this.formatDetailAddress(address),
      postalCode: address.postalCode
    };
  }

  /**
   * Convert normalized address to JD Logistics format
   */
  static toJDFormat(address: NormalizedAddress): JDAddress {
    return {
      provinceId: address.admin1.code,
      cityId: address.admin2.code,
      countyId: address.admin3?.code || '',
      detailAddress: this.formatDetailAddress(address),
      zipCode: address.postalCode
    };
  }

  /**
   * Convert generic Address to normalized format
   */
  static normalize(address: Address): NormalizedAddress {
    return {
      country: address.country,
      admin1: {
        code: this.getProvinceCode(address.province),
        name: address.province
      },
      admin2: {
        code: this.getCityCode(address.city),
        name: address.city
      },
      admin3: address.district ? {
        code: this.getDistrictCode(address.district),
        name: address.district
      } : undefined,
      street: address.street,
      building: address.building,
      unit: address.unit,
      room: address.room,
      postalCode: address.postalCode
    };
  }

  /**
   * Format detail address from components
   */
  private static formatDetailAddress(address: NormalizedAddress): string {
    const parts = [
      address.street,
      address.building,
      address.unit,
      address.room
    ].filter(Boolean);
    
    return parts.join('');
  }

  /**
   * Get province code (simplified - should use lookup table)
   */
  private static getProvinceCode(province: string): string {
    const provinceMap: Record<string, string> = {
      '北京市': '11',
      '天津市': '12',
      '河北省': '13',
      '山西省': '14',
      '内蒙古自治区': '15',
      '辽宁省': '21',
      '吉林省': '22',
      '黑龙江省': '23',
      '上海市': '31',
      '江苏省': '32',
      '浙江省': '33',
      '安徽省': '34',
      '福建省': '35',
      '江西省': '36',
      '山东省': '37',
      '河南省': '41',
      '湖北省': '42',
      '湖南省': '43',
      '广东省': '44',
      '广西壮族自治区': '45',
      '海南省': '46',
      '重庆市': '50',
      '四川省': '51',
      '贵州省': '52',
      '云南省': '53',
      '西藏自治区': '54',
      '陕西省': '61',
      '甘肃省': '62',
      '青海省': '63',
      '宁夏回族自治区': '64',
      '新疆维吾尔自治区': '65'
    };

    return provinceMap[province] || '00';
  }

  /**
   * Get city code (simplified - should use lookup table)
   */
  private static getCityCode(city: string): string {
    // This should be a comprehensive lookup table
    // For now, returning a placeholder
    return '01';
  }

  /**
   * Get district code (simplified - should use lookup table)
   */
  private static getDistrictCode(district: string): string {
    // This should be a comprehensive lookup table
    // For now, returning a placeholder
    return '01';
  }

  /**
   * Validate Chinese address format
   */
  static validateChinaAddress(address: Address): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!address.province) {
      errors.push('省/直辖市/自治区不能为空');
    }

    if (!address.city) {
      errors.push('市/区不能为空');
    }

    if (!address.street) {
      errors.push('详细地址不能为空');
    }

    if (address.postalCode && !/^\d{6}$/.test(address.postalCode)) {
      errors.push('邮政编码格式错误（应为6位数字）');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse Chinese address string into structured format
   */
  static parseChinaAddress(addressString: string): Partial<Address> | null {
    // Simple regex-based parsing
    // Real implementation should use NLP or more sophisticated parsing
    
    const provinceRegex = /^(.*?(省|市|自治区))/;
    const cityRegex = /(.*?(市|区|县|自治州))/;
    const postalCodeRegex = /\b\d{6}\b/;

    const provinceMatch = addressString.match(provinceRegex);
    const postalCodeMatch = addressString.match(postalCodeRegex);

    if (!provinceMatch) {
      return null;
    }

    const province = provinceMatch[0];
    const remaining = addressString.substring(province.length);
    
    const cityMatch = remaining.match(cityRegex);
    const city = cityMatch ? cityMatch[0] : '';
    
    const street = remaining.substring(city.length).trim();

    return {
      country: 'CN',
      province,
      city,
      street,
      postalCode: postalCodeMatch ? postalCodeMatch[0] : undefined
    };
  }
}
