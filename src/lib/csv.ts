// src/lib/csv.ts
// Minimal CSV building with proper escaping — no dependency needed for
// something this small, but the escaping rules (quotes, commas, embedded
// newlines) are exactly the kind of thing worth pinning down with tests.

export function csvField(value: string | number): string {
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n');
}
