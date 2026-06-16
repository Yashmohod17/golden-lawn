import prisma from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput, ResetPasswordInput, ChangePasswordInput } from '../validations/auth.validation';

const JWT_SECRET = process.env.JWT_SECRET || 'golden_celebrations_secret_key_123_abc_xyz';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'golden_celebrations_refresh_secret_key_987_def_uvw';

export interface TokenUser {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  private generateAccessToken(user: TokenUser): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  private generateRefreshToken(user: TokenUser): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  async register(data: RegisterInput) {
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      throw new Error('A customer with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const joinedDateStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const initials = data.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        address: data.address,
        avatar: initials || 'GC',
        joinedDate: joinedDateStr,
        role: 'CUSTOMER',
      },
    });

    const tokenUser: TokenUser = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = this.generateAccessToken(tokenUser);
    const refreshToken = this.generateRefreshToken(tokenUser);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { refreshToken },
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        customerId: customer.id,
        date: new Date().toISOString().split('T')[0],
        title: 'Account Created',
        message: `Welcome to Golden Celebrations Lawn, ${customer.name}! Explore your customer dashboard.`,
        type: 'success',
        read: false,
      },
    });

    const { password: _, ...profile } = customer;
    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  async login(data: LoginInput) {
    const customer = await prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (!customer) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, customer.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const tokenUser: TokenUser = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = this.generateAccessToken(tokenUser);
    const refreshToken = this.generateRefreshToken(tokenUser);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { refreshToken },
    });

    const { password: _, ...profile } = customer;
    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  async refresh(token: string) {
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    const customer = await prisma.customer.findUnique({
      where: { id: payload.id },
    });

    if (!customer || customer.refreshToken !== token) {
      throw new Error('Invalid or expired refresh token');
    }

    const tokenUser: TokenUser = {
      id: customer.id,
      email: customer.email,
      role: customer.role,
    };

    const accessToken = this.generateAccessToken(tokenUser);
    const refreshToken = this.generateRefreshToken(tokenUser);

    await prisma.customer.update({
      where: { id: customer.id },
      data: { refreshToken },
    });

    const { password: _, ...profile } = customer;
    return {
      accessToken,
      refreshToken,
      user: profile,
    };
  }

  async logout(token: string) {
    const customer = await prisma.customer.findFirst({
      where: { refreshToken: token },
    });

    if (customer) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { refreshToken: null },
      });
    }
  }

  async forgotPassword(email: string) {
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new Error('Customer with this email does not exist');
    }

    // Generate a 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetToken: resetCode,
        resetTokenExpiry: expiry,
      },
    });

    // Create notification for password reset request
    await prisma.notification.create({
      data: {
        customerId: customer.id,
        date: new Date().toISOString().split('T')[0],
        title: 'Password Reset Request',
        message: `A password reset request was made. Use code ${resetCode} to complete reset.`,
        type: 'warning',
        read: false,
      },
    });

    // In a real application, email is dispatched. In this frontend-only/demo environment, we also return the token.
    return {
      message: 'Password reset code has been sent to your email and notification inbox.',
      resetCode, // return resetCode to simplify testing/integration in demo portal
    };
  }

  async resetPassword(data: ResetPasswordInput) {
    const customer = await prisma.customer.findFirst({
      where: {
        resetToken: data.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!customer) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        // Invalidate current refresh tokens so they have to login again
        refreshToken: null,
      },
    });

    // Create success notification
    await prisma.notification.create({
      data: {
        customerId: customer.id,
        date: new Date().toISOString().split('T')[0],
        title: 'Password Reset Successful',
        message: 'Your portal account password has been successfully updated.',
        type: 'success',
        read: false,
      },
    });

    return {
      message: 'Password has been reset successfully. Please login with your new password.',
    };
  }

  async changePassword(customerId: string, data: ChangePasswordInput) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    const isPasswordValid = await bcrypt.compare(data.currentPassword, customer.password);
    if (!isPasswordValid) {
      throw new Error('Incorrect current password');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        password: hashedPassword,
        refreshToken: null, // invalidate current refresh sessions
      },
    });

    // Create success notification
    await prisma.notification.create({
      data: {
        customerId,
        date: new Date().toISOString().split('T')[0],
        title: 'Password Changed',
        message: 'Your account password has been updated successfully.',
        type: 'success',
        read: false,
      },
    });

    return {
      message: 'Password updated successfully',
    };
  }
}

export const authService = new AuthService();
