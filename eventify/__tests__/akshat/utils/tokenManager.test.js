import { generateToken, isTokenValid } from '../../../src/utils/tokenManager';
import jwtEncode from 'jwt-encode';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-encode', () => jest.fn(() => 'mock-token'));
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

describe('generateToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_JWT_SECRET = 'test-secret';
  });

  it('calls jwtEncode with correct payload and secret', () => {
    const token = generateToken('user-123');

    expect(jwtEncode).toHaveBeenCalledTimes(1);
    const [payload, secret] = jwtEncode.mock.calls[0];
    expect(payload.id).toBe('user-123');
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');
    expect(secret).toBe('test-secret');
    expect(token).toBe('mock-token');
  });

  it('sets exp to 1 hour after iat', () => {
    generateToken('user-123');

    const [payload] = jwtEncode.mock.calls[0];
    expect(payload.exp - payload.iat).toBe(3600);
  });
});

describe('isTokenValid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns false for falsy token', () => {
    expect(isTokenValid(null)).toBe(false);
    expect(isTokenValid(undefined)).toBe(false);
    expect(isTokenValid('')).toBe(false);
  });

  it('returns true for a token with a future exp', () => {
    jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 9999 });
    expect(isTokenValid('valid-token')).toBe(true);
  });

  it('returns false for an expired token', () => {
    jwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 100 });
    expect(isTokenValid('expired-token')).toBe(false);
  });

  it('returns false when exp is missing', () => {
    jwtDecode.mockReturnValue({});
    expect(isTokenValid('no-exp-token')).toBe(false);
  });

  it('returns false when jwtDecode throws', () => {
    jwtDecode.mockImplementation(() => { throw new Error('invalid'); });
    expect(isTokenValid('bad-token')).toBe(false);
  });
});
