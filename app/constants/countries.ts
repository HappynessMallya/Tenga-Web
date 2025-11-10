/**
 * African Countries Data
 * Contains African countries with their phone codes for the country picker
 */

export interface Country {
  name: string;
  code: string;
  flag?: string;
}

export const africanCountries: Country[] = [
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Uganda", code: "+256", flag: "🇺🇬" },
  { name: "Rwanda", code: "+250", flag: "🇷🇼" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "South Africa", code: "+27", flag: "🇿🇦" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { name: "Morocco", code: "+212", flag: "🇲🇦" },
  { name: "Egypt", code: "+20", flag: "🇪🇬" },
  { name: "Algeria", code: "+213", flag: "🇩🇿" },
  { name: "Sudan", code: "+249", flag: "🇸🇩" },
  { name: "Angola", code: "+244", flag: "🇦🇴" },
  { name: "Mozambique", code: "+258", flag: "🇲🇿" },
  { name: "Madagascar", code: "+261", flag: "🇲🇬" },
  { name: "Cameroon", code: "+237", flag: "🇨🇲" },
  { name: "Côte d'Ivoire", code: "+225", flag: "🇨🇮" },
  { name: "Senegal", code: "+221", flag: "🇸🇳" },
  { name: "Mali", code: "+223", flag: "🇲🇱" },
  { name: "Burkina Faso", code: "+226", flag: "🇧🇫" },
  { name: "Niger", code: "+227", flag: "🇳🇪" },
  { name: "Chad", code: "+235", flag: "🇹🇩" },
  { name: "Somalia", code: "+252", flag: "🇸🇴" },
  { name: "Central African Republic", code: "+236", flag: "🇨🇫" },
  { name: "South Sudan", code: "+211", flag: "🇸🇸" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" },
  { name: "Zambia", code: "+260", flag: "🇿🇲" },
  { name: "Malawi", code: "+265", flag: "🇲🇼" },
  { name: "Botswana", code: "+267", flag: "🇧🇼" },
  { name: "Namibia", code: "+264", flag: "🇳🇦" },
  { name: "Lesotho", code: "+266", flag: "🇱🇸" },
  { name: "Swaziland", code: "+268", flag: "🇸🇿" },
  { name: "Mauritius", code: "+230", flag: "🇲🇺" },
  { name: "Seychelles", code: "+248", flag: "🇸🇨" },
  { name: "Djibouti", code: "+253", flag: "🇩🇯" },
  { name: "Comoros", code: "+269", flag: "🇰🇲" },
  { name: "Cape Verde", code: "+238", flag: "🇨🇻" },
  { name: "São Tomé and Príncipe", code: "+239", flag: "🇸🇹" },
  { name: "Equatorial Guinea", code: "+240", flag: "🇬🇶" },
  { name: "Gabon", code: "+241", flag: "🇬🇦" },
  { name: "Republic of the Congo", code: "+242", flag: "🇨🇬" },
  { name: "Democratic Republic of the Congo", code: "+243", flag: "🇨🇩" },
  { name: "Burundi", code: "+257", flag: "🇧🇮" },
  { name: "Tunisia", code: "+216", flag: "🇹🇳" },
  { name: "Libya", code: "+218", flag: "🇱🇾" },
  { name: "Gambia", code: "+220", flag: "🇬🇲" },
  { name: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
  { name: "Guinea", code: "+224", flag: "🇬🇳" },
  { name: "Sierra Leone", code: "+232", flag: "🇸🇱" },
  { name: "Liberia", code: "+231", flag: "🇱🇷" },
  { name: "Togo", code: "+228", flag: "🇹🇬" },
  { name: "Benin", code: "+229", flag: "🇧🇯" },
];

// Helper function to find country by code
export const findCountryByCode = (code: string): Country | undefined => {
  return africanCountries.find(country => country.code === code);
};

// Helper function to find country by name
export const findCountryByName = (name: string): Country | undefined => {
  return africanCountries.find(country => country.name === name);
};

// Default country (Tanzania)
export const defaultCountry: Country = africanCountries[0] || { name: "Tanzania", code: "+255", flag: "🇹🇿" };
