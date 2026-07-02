import { describe, expect, it } from 'vitest';
import { buildCsv, csvField } from './csv';

describe('csvField', () => {
  it('leaves plain values untouched', () => {
    expect(csvField('Swiggy')).toBe('Swiggy');
    expect(csvField(649)).toBe('649');
  });

  it('quotes and escapes a field containing a comma', () => {
    expect(csvField('Big Bazaar, Kozhikode')).toBe('"Big Bazaar, Kozhikode"');
  });

  it('quotes and doubles internal quotes', () => {
    expect(csvField('Note: "urgent"')).toBe('"Note: ""urgent"""');
  });

  it('quotes a field containing a newline', () => {
    expect(csvField('line one\nline two')).toBe('"line one\nline two"');
  });

  it('does not add quotes when there is nothing to escape', () => {
    expect(csvField('HDFC ····2841')).toBe('HDFC ····2841');
  });
});

describe('buildCsv', () => {
  it('joins headers and rows with commas and CRLF', () => {
    const csv = buildCsv(
      ['Date', 'Description', 'Amount'],
      [
        ['2026-06-09', 'HP Petrol Pump', 1500],
        ['2026-06-08', 'Netflix', 649],
      ],
    );
    expect(csv).toBe(
      'Date,Description,Amount\r\n2026-06-09,HP Petrol Pump,1500\r\n2026-06-08,Netflix,649',
    );
  });

  it('escapes fields that need it within a full row', () => {
    const csv = buildCsv(['Description'], [['Lulu Hypermarket, "Big Bazaar"']]);
    expect(csv).toBe('Description\r\n"Lulu Hypermarket, ""Big Bazaar"""');
  });

  it('produces just the header row when there are no data rows', () => {
    expect(buildCsv(['A', 'B'], [])).toBe('A,B');
  });
});
