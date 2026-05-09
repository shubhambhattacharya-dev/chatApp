import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../Sidebar';
import { useChatStore } from '../../store/useChatStore';

// Mock the store
vi.mock('../../store/useChatStore', () => ({
  useChatStore: vi.fn(),
}));

// Mock framer-motion to render children immediately without animations
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Sidebar UI', () => {
  const mockUsers = [
    { _id: '1', fullName: 'Alice', profilePic: '', isOnline: true },
    { _id: '2', fullName: 'Bob', profilePic: '', isOnline: false },
  ];

  beforeEach(() => {
    (useChatStore as any).mockReturnValue({
      getUsers: vi.fn(),
      selectedUser: null,
      setSelectedUser: vi.fn(),
      isUsersLoading: false,
      users: mockUsers,
      onlineUsers: ['1'],
    });
  });

  it('filters users by search query', () => {
    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText(/Search contacts/i);
    fireEvent.change(searchInput, { target: { value: 'Alice' } });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('shows "No results found" when search matches nothing', () => {
    render(<Sidebar />);
    
    const searchInput = screen.getByPlaceholderText(/Search contacts/i);
    fireEvent.change(searchInput, { target: { value: 'Zebra' } });

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it('shows online badge with correct count', () => {
    render(<Sidebar />);
    const onlineBadge = screen.getByText(/0\s+online/i);
    expect(onlineBadge).toBeInTheDocument();
  });
});
