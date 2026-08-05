import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  getAdminByUsernameOrEmail,
  getAdminById,
  createAdminRecord,
  updateAdminPassword,
  createPasswordResetToken,
  getResetTokenRecord,
  markResetTokenUsed,
  logAudit,
} from '../db';
import {
  authenticateAdminJWT,
  requireSuperAdminRole,
  generateAdminJWTToken,
  AuthenticatedAdminRequest,
} from '../middleware/authMiddleware';
import { adminLoginLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * 1. ADMIN LOGIN API
 * POST /api/admin/auth/login
 */
router.post('/login', adminLoginLimiter, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Username or Email is required.',
      });
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Password is required.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const admin = await getAdminByUsernameOrEmail(cleanUsername);

    if (!admin) {
      await logAudit('ADMIN_ACTION', cleanUsername, 'LOGIN_FAILED', 'REJECTED', 'User not found in system.');
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Invalid Administrator Username or Password.',
      });
    }

    // Verify bcrypt password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      await logAudit('ADMIN_ACTION', cleanUsername, 'LOGIN_FAILED', 'REJECTED', 'Invalid password supplied.');
      return res.status(401).json({
        success: false,
        error: 'Invalid Credentials',
        message: 'Invalid Administrator Username or Password.',
      });
    }

    // Generate JWT Token
    const adminPayload = {
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role as 'Admin' | 'Staff',
    };

    const token = generateAdminJWTToken(adminPayload);

    await logAudit('ADMIN_ACTION', admin.email, 'LOGIN_SUCCESS', 'GRANTED', `Admin logged in from IP ${req.ip}`);

    return res.json({
      success: true,
      message: 'Authentication successful. Welcome to Zaara Travels Admin Console.',
      token,
      admin: adminPayload,
    });
  } catch (error: any) {
    console.error('Error during admin login:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred during authentication.',
    });
  }
});

/**
 * 2. GET CURRENT ADMIN PROFILE (VERIFY TOKEN)
 * GET /api/admin/auth/me
 */
router.get('/me', authenticateAdminJWT, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const admin = await getAdminById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account no longer exists.' });
    }

    return res.json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
});

/**
 * 3. ADMIN REGISTRATION API (Admin Only)
 * POST /api/admin/auth/register
 */
router.post(
  '/register',
  authenticateAdminJWT,
  requireSuperAdminRole,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { username, password, full_name, email, role } = req.body;

      if (!username || !password || !full_name || !email) {
        return res.status(400).json({
          success: false,
          message: 'All fields (username, password, full_name, email) are required.',
        });
      }

      const existing = await getAdminByUsernameOrEmail(username);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An administrator with this username or email already exists.',
        });
      }

      // Hash password using bcrypt
      const password_hash = await bcrypt.hash(password, 10);

      const newAdmin = await createAdminRecord({
        username: username.trim().toLowerCase(),
        password_hash,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        role: role === 'Staff' ? 'Staff' : 'Admin',
      });

      await logAudit(
        'ADMIN_ACTION',
        email,
        'ADMIN_REGISTERED',
        'SUCCESS',
        `New ${role} created by ${req.admin?.username}`
      );

      return res.status(201).json({
        success: true,
        message: 'New administrator registered successfully.',
        admin: {
          id: newAdmin.id,
          username: newAdmin.username,
          full_name: newAdmin.full_name,
          email: newAdmin.email,
          role: newAdmin.role,
        },
      });
    } catch (error: any) {
      console.error('Error registering new admin:', error);
      return res.status(500).json({ success: false, message: 'Registration failed.' });
    }
  }
);

/**
 * 4. CHANGE PASSWORD API
 * POST /api/admin/auth/change-password
 */
router.post(
  '/change-password',
  authenticateAdminJWT,
  async (req: AuthenticatedAdminRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both currentPassword and newPassword are required.',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }

      const admin = await getAdminById(req.admin!.id);
      if (!admin) {
        return res.status(404).json({ success: false, message: 'Admin record not found.' });
      }

      // Verify current password with bcrypt
      const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password provided is incorrect.',
        });
      }

      // Hash new password
      const newHash = await bcrypt.hash(newPassword, 10);
      await updateAdminPassword(admin.id, newHash);

      await logAudit(
        'ADMIN_ACTION',
        admin.email,
        'PASSWORD_CHANGED',
        'SUCCESS',
        'Password modified by user.'
      );

      return res.json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      return res.status(500).json({ success: false, message: 'Password change failed.' });
    }
  }
);

/**
 * 5. FORGOT PASSWORD API
 * POST /api/admin/auth/forgot-password
 */
router.post('/forgot-password', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid administrator email address.',
      });
    }

    const admin = await getAdminByUsernameOrEmail(email.trim());

    if (admin) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await createPasswordResetToken(admin.id, resetToken, expiresAt);

      await logAudit(
        'EMAIL',
        admin.email,
        'PASSWORD_RESET_DISPATCHED',
        'SENT',
        `Reset Token: ${resetToken}`
      );

      console.log(`🔑 Password reset link for ${admin.email}: /admin/reset-password?token=${resetToken}`);
    }

    // Always return neutral response to prevent email enumeration attacks
    return res.json({
      success: true,
      message:
        'If an account associated with this email exists, password reset instructions have been dispatched.',
    });
  } catch (error: any) {
    console.error('Error in forgot-password:', error);
    return res.status(500).json({ success: false, message: 'Password reset request failed.' });
  }
});

/**
 * 6. RESET PASSWORD API
 * POST /api/admin/auth/reset-password
 */
router.post('/reset-password', passwordResetLimiter, async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and newPassword are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const tokenRecord = await getResetTokenRecord(token);
    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updateAdminPassword(tokenRecord.admin_id, newHash);
    await markResetTokenUsed(tokenRecord.id);

    return res.json({
      success: true,
      message: 'Your password has been reset successfully. You may now log in.',
    });
  } catch (error: any) {
    console.error('Error in reset-password:', error);
    return res.status(500).json({ success: false, message: 'Password reset failed.' });
  }
});

export default router;
