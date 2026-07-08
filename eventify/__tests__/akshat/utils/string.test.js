import { formatStatus } from '../../../src/utils/string';

describe('formatStatus', () => {
  it('returns "N/A" for falsy values', () => {
    expect(formatStatus(null)).toBe('N/A');
    expect(formatStatus(undefined)).toBe('N/A');
    expect(formatStatus('')).toBe('N/A');
  });

  it('capitalizes a single word', () => {
    expect(formatStatus('active')).toBe('Active');
  });

  it('converts underscore-separated words to title case', () => {
    expect(formatStatus('in_progress')).toBe('In Progress');
  });

  it('handles multiple underscores', () => {
    expect(formatStatus('waiting_for_approval')).toBe('Waiting For Approval');
  });

  it('handles already capitalized input', () => {
    expect(formatStatus('CONFIRMED')).toBe('CONFIRMED');
  });
});
