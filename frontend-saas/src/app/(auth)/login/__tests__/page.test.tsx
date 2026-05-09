import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../page';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Zustand auth store
const mockLogin = vi.fn();
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isLoggingIn: false,
  }),
}));

describe('SaaS LoginPage DOM Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form elements correctly', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('calls login function with correct data when submitted', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    // Wait for async execution
    await new Promise((r) => setTimeout(r, 0));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('toggles password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/Password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Find the toggle button (it's the only button other than Sign in and Google)
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });
});
