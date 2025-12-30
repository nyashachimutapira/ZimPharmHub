import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../context/AuthContext';

jest.mock('axios');

const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  test('renders form fields', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('shows validation errors for invalid inputs', async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
  });

  test('submits form and navigates on successful login (remember me sets localStorage)', async () => {
    axios.post.mockResolvedValue({ data: { token: 'abc123', user: { id: 'u1', userType: 'user' } } });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('uses sessionStorage when remember me is unchecked', async () => {
    axios.post.mockResolvedValue({ data: { token: 'seshToken', user: { id: 'u2', userType: 'user' } } });

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    // uncheck remember me
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 't2@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(sessionStorage.getItem('token')).toBe('seshToken');
  });
});