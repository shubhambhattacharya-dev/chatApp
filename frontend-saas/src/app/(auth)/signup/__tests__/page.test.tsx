import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignUpPage from '../page';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Zustand auth store
const mockSignup = vi.fn();
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    signup: mockSignup,
    isSigningUp: false,
  }),
}));

describe('SaaS SignUpPage DOM Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders signup form elements correctly', () => {
    render(<SignUpPage />);

    expect(screen.getByText('Create an account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });

  it('calls signup function with correct data when submitted', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/^Password$/i);
    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    const submitButton = screen.getByRole('button', { name: /Create account/i });

    await user.type(nameInput, 'John Doe');
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    expect(mockSignup).toHaveBeenCalledWith({
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });
    // Wait for async execution
    await new Promise((r) => setTimeout(r, 0));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
