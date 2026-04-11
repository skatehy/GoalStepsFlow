export function formatDateTime(date?: Date | number): string {
  const d = date instanceof Date ? date : typeof date === "number" ? new Date(date) : new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12, no leading zero
  const day = d.getDate(); // no leading zero
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}