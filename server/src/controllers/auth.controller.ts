import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../validations/auth.validation';

export class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateRegister(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const result = await authService.register(value);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateLogin(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const result = await authService.login(value);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const result = await authService.refresh(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken && typeof refreshToken === 'string') {
        await authService.logout(refreshToken);
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateForgotPassword(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const result = await authService.forgotPassword(value.email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = validateResetPassword(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const result = await authService.resetPassword(value);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { error, value } = validateChangePassword(req.body);
      if (error || !value) {
        return res.status(400).json({ error });
      }

      const result = await authService.changePassword(user.id, value);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
