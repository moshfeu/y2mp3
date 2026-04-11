export function formatViews(views: number | undefined) {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1 // Optional: sets decimal precision
  });
  return views != null ? formatter.format(views) : ''
}

export function formatDuration(totalSeconds: number | undefined) {
  if (totalSeconds == null || isNaN(totalSeconds) || totalSeconds < 0) return ''

  const total = Math.max(0, Math.floor(totalSeconds));

  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  // .padStart(2, '0') ensures 01:05:09 instead of 1:5:9
  return [h, m, s]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':');
}