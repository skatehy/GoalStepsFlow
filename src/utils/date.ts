export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function plusDays(dateString: string, diff: number): string {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + diff);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function readableDate(dateString: string): string {
  const [y, m, d] = dateString.split("-");
  return `${y} / ${m} / ${d}`;
}
