import { signupValidationSchema } from '../../../src/validations/signupValidation';

const validData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  phoneNumber: '1234567890',
  isOrganizer: false,
};

describe('signupValidationSchema', () => {
  it('validates correct signup data', async () => {
    await expect(signupValidationSchema.validate(validData)).resolves.toEqual(validData);
  });

  // name
  it('rejects missing name', async () => {
    const { name, ...rest } = validData;
    await expect(signupValidationSchema.validate(rest)).rejects.toThrow('Name is required');
  });

  it('rejects short name', async () => {
    await expect(
      signupValidationSchema.validate({ ...validData, name: 'A' }),
    ).rejects.toThrow('Name must be at least 2 characters');
  });

  // email
  it('rejects missing email', async () => {
    const { email, ...rest } = validData;
    await expect(signupValidationSchema.validate(rest)).rejects.toThrow('Email is required');
  });

  it('rejects invalid email', async () => {
    await expect(
      signupValidationSchema.validate({ ...validData, email: 'notanemail' }),
    ).rejects.toThrow('Please enter a valid email');
  });

  // password
  it('rejects missing password', async () => {
    const { password, ...rest } = validData;
    await expect(signupValidationSchema.validate(rest)).rejects.toThrow('Password is required');
  });

  it('rejects short password', async () => {
    await expect(
      signupValidationSchema.validate({ ...validData, password: '123' }),
    ).rejects.toThrow('Password must be at least 6 characters');
  });

  // phoneNumber
  it('rejects missing phone number', async () => {
    const { phoneNumber, ...rest } = validData;
    await expect(signupValidationSchema.validate(rest)).rejects.toThrow('Phone number is required');
  });

  it('rejects non-10-digit phone number', async () => {
    await expect(
      signupValidationSchema.validate({ ...validData, phoneNumber: '12345' }),
    ).rejects.toThrow('Phone number must be 10 digits');
  });

  it('rejects phone number with letters', async () => {
    await expect(
      signupValidationSchema.validate({ ...validData, phoneNumber: 'abcdefghij' }),
    ).rejects.toThrow('Phone number must be 10 digits');
  });

  // isOrganizer (optional boolean)
  it('accepts without isOrganizer', async () => {
    const { isOrganizer, ...rest } = validData;
    await expect(signupValidationSchema.validate(rest)).resolves.toBeDefined();
  });
});
