import adbs from 'ad-bs-converter';

/**
 * Formats today's date in either Nepali Bikram Sambat (BS) or English (AD)
 */
export const getFormattedDate = (isNepali: boolean): string => {
  const d = new Date();
  if (isNepali) {
    try {
      const formattedAd = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      const conversion = adbs.ad2bs(formattedAd);
      const bs = conversion.ne;
      return `${bs.strMonth} ${bs.day} गते, ${bs.strDayOfWeek}`;
    } catch (err) {
      console.error('Failed to convert date to BS:', err);
      return 'आजको मिति';
    }
  } else {
    try {
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      return d.toLocaleDateString('en-US', options);
    } catch {
      return d.toDateString();
    }
  }
};
