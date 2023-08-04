/**
 * Takes Date object,
 * returns various strings like:
 * - 1 minute ago
 * - 1 hour ago
 * - 1 day ago
 * - 1 week ago
 * - 1 month ago
 * - 1 year ago
 */
export function FormatDate({ date }: { date: Date }) {
  const now = new Date();

  //  get offset and add to now
  const offset = now.getTimezoneOffset() * 60 * 1000;
  now.setTime(now.getTime() + offset);

  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return `Just now`;
  } else if (minutes < 60) {
    if (minutes == 1) return `1min`;
    return `${minutes}mins`;
  } else if (hours < 24) {
    if (hours == 1) return `1h`;
    return `${hours}hrs`;
  } else if (days < 7) {
    if (days == 1) return `1d`;
    return `${days}d`;
  } else if (weeks < 4) {
    if (weeks == 1) return `1w`;
    return `${weeks}w`;
  } else if (months < 12) {
    if (months == 1) return `1m`;
    return `${months}m`;
  } else {
    if (years == 1) return `1y`;
    return `${years}y`;
  }
}
