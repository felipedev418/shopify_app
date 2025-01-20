// Regular expressions for VAT number formats by country
const VAT_FORMATS = {
  AT: /^ATU\d{8}$/, // Austria
  BE: /^BE0\d{9}$/, // Belgium
  BG: /^BG\d{9,10}$/, // Bulgaria
  CY: /^CY\d{8}[A-Z]$/, // Cyprus
  CZ: /^CZ\d{8,10}$/, // Czech Republic
  DE: /^DE\d{9}$/, // Germany
  DK: /^DK\d{8}$/, // Denmark
  EE: /^EE\d{9}$/, // Estonia
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/, // Spain
  FI: /^FI\d{8}$/, // Finland
  FR: /^FR[A-Z0-9]{2}\d{9}$/, // France
  GB: /^GB(\d{9}|\d{12})$/, // United Kingdom
  HR: /^HR\d{11}$/, // Croatia
  HU: /^HU\d{8}$/, // Hungary
  IE: /^IE\d{7}[A-Z]{1,2}$/, // Ireland
  IT: /^IT\d{11}$/, // Italy
  LT: /^LT(\d{9}|\d{12})$/, // Lithuania
  LU: /^LU\d{8}$/, // Luxembourg
  LV: /^LV\d{11}$/, // Latvia
  MT: /^MT\d{8}$/, // Malta
  NL: /^NL\d{9}B\d{2}$/, // Netherlands
  PL: /^PL\d{10}$/, // Poland
  PT: /^PT\d{9}$/, // Portugal
  RO: /^RO\d{2,10}$/, // Romania
  SE: /^SE\d{12}$/, // Sweden
  SI: /^SI\d{8}$/, // Slovenia
  SK: /^SK\d{10}$/, // Slovakia
};

export function validateVatNumber(vatNumber) {
  if (!vatNumber || typeof vatNumber !== "string") {
    return false;
  }

  // Clean the VAT number (remove spaces and make uppercase)
  const cleanVat = vatNumber.replace(/\s/g, "").toUpperCase();

  // Extract country code (first 2 characters)
  const countryCode = cleanVat.substring(0, 2);

  // Check if country is supported and validate format
  const regex = VAT_FORMATS[countryCode];
  if (!regex) {
    return false;
  }

  return regex.test(cleanVat);
}
