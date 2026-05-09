import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../Navbar';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

// Mock the store
vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Navbar', () => {
  it('renders JustChat logo', () => {
    (useAuthStore as any).mockReturnValue({
      authUser: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('JustChat')).toBeInTheDocument();
  });

  it('shows profile and logout buttons when authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      authUser: { fullName: 'John Doe' },
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
});
