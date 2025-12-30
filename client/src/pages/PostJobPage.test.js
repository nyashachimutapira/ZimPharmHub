import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostJobPage from './PostJobPage';
import { AuthProvider } from '../context/AuthContext';

// Provide a pharmacy user via localStorage to mimic auth
beforeEach(() => {
  localStorage.setItem('userId', 'test-id');
  localStorage.setItem('userType', 'pharmacy');
});

afterEach(() => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
});

test('renders chips input and adds requirement', () => {
  render(
    <AuthProvider>
      <PostJobPage />
    </AuthProvider>
  );

  const input = screen.getByPlaceholderText('Type requirement and press Enter');
  fireEvent.change(input, { target: { value: 'Registration' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  expect(screen.getByText('Registration')).toBeInTheDocument();
});
