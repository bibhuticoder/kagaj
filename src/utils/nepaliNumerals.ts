const NP_DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

/**
 * Converts standard numbers to Nepali Devanagari numerals
 */
export const toNpNum = (num: number | string): string => {
  return String(num)
    .split('')
    .map((char) => NP_DIGITS[char] ?? char)
    .join('');
};

/**
 * Counts words and formats label in Nepali or English
 */
export const countWords = (
  text: string,
  isNepali: boolean
): { count: number; label: string } => {
  if (!text || !text.trim()) {
    return {
      count: 0,
      label: isNepali ? '० शब्द' : '0 words',
    };
  }

  const punctuation = '!()-[]{};:\'",<>./?@#$%^&*_~।॥‘’।';
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0 && ![...word].every((ch) => punctuation.includes(ch)));

  const count = words.length;

  if (isNepali) {
    const countNp = toNpNum(count);
    const label = count === 1 ? `${countNp} शब्द` : `${countNp} शब्दहरू`;
    return { count, label };
  } else {
    const label = count === 1 ? `${count} word` : `${count} words`;
    return { count, label };
  }
};
