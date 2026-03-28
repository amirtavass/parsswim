/**
 * Format price with currency
 * @param {number} price - The price to format
 * @param {string} currency - Currency code (default: 'GBP')
 * @param {string} locale - Locale for formatting (default: 'en-GB')
 * @param {number} fractionDigits - Minimum fraction digits (default: 0 for GBP)
 * @returns {string} Formatted currency string
 */
export const formatPrice = (
  price,
  currency = "GBP",
  locale = "en-GB",
  fractionDigits = 0,
) => {
  if (price === null || price === undefined) {
    return currency === "GBP" ? "£0" : "0";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
  }).format(price);
};

/**
 * Format price for display (removes currency symbol, just returns number)
 * @param {number} price - The price to format
 * @param {string} locale - Locale for formatting (default: 'en-GB')
 * @returns {string} Formatted number string
 */
export const formatPriceNumber = (price, locale = "en-GB") => {
  if (price === null || price === undefined) {
    return "0";
  }

  return new Intl.NumberFormat(locale).format(price);
};
