/**
 * Phone Number Utilities for Tanzania
 * Handles phone number normalization and network detection
 */

/**
 * Detects the Tanzania mobile network from a phone number
 * Supports formats: 07, 06, +2557, 2557, etc.
 * 
 * @param phone - Phone number in any format (07, 06, +2557, 2557, etc.)
 * @returns Network name or "Invalid number" or "Unknown"
 */
export function detectTanzaniaNetwork(phone: string): string {
  // Remove all non-digits
  let number = phone.replace(/\D/g, '');

  // Normalize to 10-digit format e.g. 0654123456
  if (number.startsWith('255')) {
    number = '0' + number.slice(3);
  }

  // Basic validation
  if (number.length !== 10 || !number.startsWith('0')) {
    return 'Invalid number';
  }

  const prefix = number.substring(0, 4); // first 4 digits (e.g. 0654)

  // Tanzania operator prefixes (based on TCRA National Numbering Plan)
  const networks: { [key: string]: string[] } = {
    // Vodacom: 074, 075, 076
    Vodacom: [
      '0740', '0741', '0742', '0743', '0744', '0745', '0746', '0747', '0748', '0749',
      '0750', '0751', '0752', '0753', '0754', '0755', '0756', '0757', '0758', '0759',
      '0760', '0761', '0762', '0763', '0764', '0765', '0766', '0767', '0768', '0769'
    ],
    // Airtel: 068, 069, 078
    Airtel: [
      '0680', '0681', '0682', '0683', '0684', '0685', '0686', '0687', '0688', '0689',
      '0690', '0691', '0692', '0693', '0694', '0695', '0696', '0697', '0698', '0699',
      '0780', '0781', '0782', '0783', '0784', '0785', '0786', '0787', '0788', '0789'
    ],
    // Tigo (MIC Tanzania): 065, 067, 071, 077 (includes Zantel)
    Tigo: [
      '0650', '0651', '0652', '0653', '0654', '0655', '0656', '0657', '0658', '0659',
      '0670', '0671', '0672', '0673', '0674', '0675', '0676', '0677', '0678', '0679',
      '0710', '0711', '0712', '0713', '0714', '0715', '0716', '0717', '0718', '0719',
      '0770', '0771', '0772', '0773', '0774', '0775', '0776', '0777', '0778', '0779'
    ],
    // Halotel (Viettel): 061, 062
    Halotel: [
      '0610', '0611', '0612', '0613', '0614', '0615', '0616', '0617', '0618', '0619',
      '0620', '0621', '0622', '0623', '0624', '0625', '0626', '0627', '0628', '0629'
    ],
    // TTCL: 073
    TTCL: [
      '0730', '0731', '0732', '0733', '0734', '0735', '0736', '0737', '0738', '0739'
    ],
    // Smile Communications: 066
    Smile: [
      '0660', '0661', '0662', '0663', '0664', '0665', '0666', '0667', '0668', '0669'
    ],
  };

  // Find matching operator
  for (const [network, prefixes] of Object.entries(networks)) {
    if (prefixes.includes(prefix)) {
      return network;
    }
  }

  return 'Unknown';
}

/**
 * Normalizes a Tanzania phone number to international format (+255...)
 * Supports formats: 07, 06, +2557, 2557, etc.
 * 
 * @param phone - Phone number in any format
 * @returns Normalized phone number in +255 format or null if invalid
 */
export function normalizeTanzaniaPhone(phone: string): string | null {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Remove + if present for processing
  const hasPlus = cleaned.startsWith('+');
  let number = cleaned.replace(/\+/g, '');

  // Normalize to international format
  if (number.startsWith('255') && number.length === 12) {
    // Already in 255 format
    return hasPlus ? `+${number}` : `+${number}`;
  } else if (number.startsWith('0') && number.length === 10) {
    // Local format (07...)
    return `+255${number.substring(1)}`;
  } else if (number.length === 9 && number.startsWith('7')) {
    // Format without leading 0 (7...)
    return `+255${number}`;
  } else if (number.length === 9 && number.startsWith('6')) {
    // Format without leading 0 (6...)
    return `+255${number}`;
  }

  return null;
}

/**
 * Validates if a phone number is a valid Tanzania mobile number
 * 
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidTanzaniaPhone(phone: string): boolean {
  const normalized = normalizeTanzaniaPhone(phone);
  if (!normalized) return false;

  const network = detectTanzaniaNetwork(phone);
  return network !== 'Invalid number' && network !== 'Unknown';
}

