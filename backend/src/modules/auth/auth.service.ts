import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../users/user.model';
import { StudentProfile } from '../profiles/profile.model';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'admin';
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt?: Date;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'dev_fallback_secret_careerpulse_2026';
  }

  private generateToken(payload: { userId: string; role: string }): string {
    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    });
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async register(dto: RegisterDTO): Promise<AuthResult> {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await User.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name.trim(),
      role: dto.role || 'student',
      isEmailVerified: false,
    });

    // Automatically initialize an empty StudentProfile for the student
    await StudentProfile.create({
      userId: user._id,
      degree: 'B.Tech',
      branch: 'Computer Science',
      year: 1,
      weeklyLearningHours: 10,
      skills: [],
    });

    const token = this.generateToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const refreshToken = this.generateRefreshToken();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    };
  }

  async login(dto: LoginDTO): Promise<AuthResult> {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const refreshToken = this.generateRefreshToken();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}

export const authService = new AuthService();
export default authService;
