import { formatDate, formatTime } from '../../../src/utils/date';

describe('formatDate', () => {
  it('formats an ISO date string correctly', () => {
    const result = formatDate('2025-03-15T00:00:00.000Z');

    expect(result).toMatch(/15/);
    expect(result).toMatch(/Mar/);
    expect(result).toMatch(/2025/);
  });

  it('handles another date', () => {
    const result = formatDate('2024-12-01T10:30:00.000Z');
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/2024/);
  });
});

describe('formatTime', () => {
  it('converts morning time to 12-hour format', () => {
    expect(formatTime('09:30')).toBe('9:30 AM');
  });

  it('converts afternoon time to 12-hour format', () => {
    expect(formatTime('14:00')).toBe('2:00 PM');
  });

  it('converts midnight (00:00) to 12:00 AM', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
  });

  it('converts noon (12:00) to 12:00 PM', () => {
    expect(formatTime('12:00')).toBe('12:00 PM');
  });

  it('converts 23:59 to 11:59 PM', () => {
    expect(formatTime('23:59')).toBe('11:59 PM');
  });
});
