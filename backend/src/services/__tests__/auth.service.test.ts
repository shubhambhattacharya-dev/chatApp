import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../auth.service.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcryptjs';

vi.mock('../../models/user.model.js');
vi.mock('bcryptjs');

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should throw an error if fullName is too short', async () => {
      await expect(authService.createUser({ fullName: 'ab', email: 'test@test.com', password: 'password' }))
        .rejects.toThrow('Full name must contain at least 3 alphanumeric characters');
    });

    it('should throw an error if user already exists', async () => {
      // 1st call for username check: return null
      // 2nd call for email check: return existing user
      (User.findOne as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ email: 'test@test.com' });
      
      await expect(authService.createUser({ fullName: 'John Doe', email: 'test@test.com', password: 'password' }))
        .rejects.toThrow('User with this email already exists');
    });
  });
});
