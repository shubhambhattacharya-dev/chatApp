import User, { IUser } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../lib/util/error.js';

export const createUser = async (userData: any): Promise<IUser> => {
  const { fullName, email, password } = userData;

  let baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  if (baseUsername.length < 3) {
    throw new AppError('Full name must contain at least 3 alphanumeric characters', 400);
  }

  let username = baseUsername;
  let userExists = await User.findOne({ username });
  let suffix = 1;
  while (userExists) {
    username = `${baseUsername}${suffix}`;
    userExists = await User.findOne({ username });
    suffix++;
    if (suffix > 1000) {
      throw new AppError('Could not generate a unique username. Please try a different name.', 500);
    }
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
  });

  return await newUser.save();
};

export const validateUser = async (email: string, password: string): Promise<IUser> => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  return user;
};
