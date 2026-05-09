import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../LoginPage';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// Mock the Zustand store
vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock AuthImagePattern to avoid unrelated rendering issues
vi.mock('../../components/AuthImagePattern', () => ({
  default: () => <div data-testid="auth-image-pattern" />
}));

describe('LoginPage', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoggingIn: false,
    });
  });

  it('renders login form elements correctly', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors when fields are empty on submit', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /sign in/i });
    
    // Simulate user clicking submit without typing anything
    await user.click(submitBtn);

    // Expect validation errors to appear on screen
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    
    // Ensure that our login API function was NOT called
    expect(mockLogin).not.toHaveBeenCalled();
  });



  it('calls login function with correct data when submitted properly', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    // Simulate user typing credentials
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitBtn);

    // Validation errors should NOT be present
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    
    // Login function should be called exactly once with the typed data
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
