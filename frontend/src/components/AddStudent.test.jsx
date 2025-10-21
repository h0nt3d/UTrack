// src/components/AddStudent.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddStudent from './AddStudent';
import '@testing-library/jest-dom';

// helper to make fake fetch responses
const jsonResponse = (body, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  });

// defines mock inside the jest.mock factory scope only
jest.mock('react-router-dom', () => {
  return {
    useParams: () => ({ courseId: 'ECE2711' }),
    useLocation: () => ({ state: { token: 'TOKEN_123' } }),
    useNavigate: () => {
      const mockNavigate = () => {};
      return mockNavigate;
    },
  };
});

describe('AddStudent', () => {
  const initialStudents = [
    { _id: '1', firstName: 'Alex', lastName: 'Taylor', email: 'alex.taylor@unb.ca' },
    { _id: '2', firstName: 'Jordan', lastName: 'Lee', email: 'jordan.lee@unb.ca' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        jsonResponse({
          courseName: 'Computer Organization',
          students: initialStudents,
        })
      )
      .mockImplementationOnce(() => jsonResponse({ message: 'created' }))
      .mockImplementationOnce(() =>
        jsonResponse({
          students: [
            ...initialStudents,
            { _id: '3', firstName: 'Taylor', lastName: 'Morgan', email: 'taylor.morgan@unb.ca' },
          ],
        })
      );
  });

  test('renders and adds a student successfully', async () => {
    render(<AddStudent />);

    // wait for existing students
    expect(await screen.findByText(/Alex Taylor/i)).toBeInTheDocument();
    expect(screen.getByText(/Jordan Lee/i)).toBeInTheDocument();

    // fill form
    await userEvent.type(screen.getByPlaceholderText(/First Name/i), 'Taylor');
    await userEvent.type(screen.getByPlaceholderText(/Last Name/i), 'Morgan');
    await userEvent.type(screen.getByPlaceholderText(/Email/i), 'taylor.morgan@unb.ca');

    // submit
    await userEvent.click(screen.getByRole('button', { name: /Add Student/i }));

    // new student appears
    await waitFor(() =>
      expect(screen.getByText(/Taylor Morgan \(taylor\.morgan@unb\.ca\)/i)).toBeInTheDocument()
    );

    // inputs cleared
    expect(screen.getByPlaceholderText(/First Name/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Last Name/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/Email/i)).toHaveValue('');

    // 3 fetch calls
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test('handles failing GET gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(
      jsonResponse({ message: 'Failed to fetch course' }, false, 500)
    );

    render(<AddStudent />);

    expect(
      screen.getByRole('heading', { name: /Add Students to ECE2711/i })
    ).toBeInTheDocument();

    expect(await screen.findByText(/No students in this course yet/i)).toBeInTheDocument();
  });
});
