export function formatScore(value: number, locale?: string): string {
  const safeValue = Number.isFinite(value) ? Math.trunc(value) : 0;

  try {
    return new Intl.NumberFormat(locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(safeValue);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('Falling back to manual score formatting:', error);
    }
  }

  const absolute = Math.abs(safeValue).toString();
  const grouped = absolute.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return safeValue < 0 ? `-${grouped}` : grouped;
}

export default formatScore;
