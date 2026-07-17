export interface TestUser {
  username: string;
  password: string;
  description: string;
  expectedError?: string;
}

export const PASSWORD = 'secret_sauce';

export const users: Record<string, TestUser> = {
  standard: {
    username: 'standard_user',
    password: PASSWORD,
    description: 'Normal user with full access',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: PASSWORD,
    description: 'User blocked from logging in',
    expectedError: 'Epic sadface: Sorry, this user has been locked out.',
  },
  problem: {
    username: 'problem_user',
    password: PASSWORD,
    description: 'Logs in but has broken images/UI behavior',
  },
  performanceGlitch: {
    username: 'performance_glitch_user',
    password: PASSWORD,
    description: 'Logs in but with a significant delay',
  },
  error: {
    username: 'error_user',
    password: PASSWORD,
    description: 'Triggers errors during certain interactions (e.g. checkout)',
  },
  visual: {
    username: 'visual_user',
    password: PASSWORD,
    description: 'Logs in but has minor visual differences (for visual regression tests)',
  },
};

export const allUsers = Object.values(users);
export const usersExpectingError = allUsers.filter((u) => u.expectedError);
export const usersExpectingSuccess = allUsers.filter((u) => !u.expectedError);

export const checkoutInfo = {
  firstName: 'Jane',
  lastName: 'Doe',
  postalCode: '12345',
};
