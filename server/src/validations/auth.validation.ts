export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export function validateRegister(input: any): { error?: string; value?: RegisterInput } {
  const { name, email, phone, password, address } = input;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'Name is required' };
  }
  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
    return { error: 'A valid email address is required' };
  }
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return { error: 'Phone number is required' };
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }
  if (!address || typeof address !== 'string' || !address.trim()) {
    return { error: 'Address is required' };
  }

  return {
    value: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      address: address.trim(),
    },
  };
}

export function validateLogin(input: any): { error?: string; value?: LoginInput } {
  const { email, password } = input;

  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
    return { error: 'A valid email address is required' };
  }
  if (!password || typeof password !== 'string' || !password) {
    return { error: 'Password is required' };
  }

  return {
    value: {
      email: email.trim().toLowerCase(),
      password,
    },
  };
}

export function validateForgotPassword(input: any): { error?: string; value?: ForgotPasswordInput } {
  const { email } = input;

  if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
    return { error: 'A valid email address is required' };
  }

  return {
    value: {
      email: email.trim().toLowerCase(),
    },
  };
}

export function validateResetPassword(input: any): { error?: string; value?: ResetPasswordInput } {
  const { token, password } = input;

  if (!token || typeof token !== 'string' || !token.trim()) {
    return { error: 'Reset token is required' };
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return { error: 'Password must be at least 6 characters long' };
  }

  return {
    value: {
      token: token.trim(),
      password,
    },
  };
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function validateChangePassword(input: any): { error?: string; value?: ChangePasswordInput } {
  const { currentPassword, newPassword } = input;

  if (!currentPassword || typeof currentPassword !== 'string' || !currentPassword.trim()) {
    return { error: 'Current password is required' };
  }
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters long' };
  }

  return {
    value: {
      currentPassword,
      newPassword,
    },
  };
}
