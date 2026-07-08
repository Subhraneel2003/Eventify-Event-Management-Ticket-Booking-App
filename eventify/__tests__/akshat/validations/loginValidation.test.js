import { loginValidationSchema } from '../../../src/validations/loginValidation';

describe('loginValidationSchema', () => {
  it('validates a correct login', async () => {
    const valid = { email: 'user@example.com', password: 'secret123' };
    await expect(loginValidationSchema.validate(valid)).resolves.toEqual(valid);
  });

  it('rejects missing email', async () => {
    await expect(
      loginValidationSchema.validate({ password: 'secret123' }),
    ).rejects.toThrow('Email is required');
  });

  it('rejects invalid email', async () => {
    await expect(
      loginValidationSchema.validate({ email: 'bad', password: 'secret123' }),
    ).rejects.toThrow('Please enter a valid email');
  });

  it('rejects missing password', async () => {
    await expect(
      loginValidationSchema.validate({ email: 'user@example.com' }),
    ).rejects.toThrow('Password is required');
  });

  it('rejects short password', async () => {
    await expect(
      loginValidationSchema.validate({ email: 'user@example.com', password: '123' }),
    ).rejects.toThrow('Password must be at least 6 characters');
  });
});
