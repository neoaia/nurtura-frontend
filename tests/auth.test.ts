import { authService } from '../services/authService';

jest.mock('../utils/validation');

describe('authService', () => {
  let mockRefetch: jest.Mock;

  beforeEach(() => {
    mockRefetch = jest.fn();
    jest.clearAllMocks();
  });

  describe('emailAvailable', () => {
    it('returns success when email is available', async () => {
      mockRefetch.mockResolvedValue({ data: { available: true } });
      const result = await authService.emailAvailable(mockRefetch, 'test@example.com');
      expect(result).toEqual({ available: true, message: 'Email is available', success: true });
      expect(mockRefetch).toHaveBeenCalledWith({ params: { email: 'test@example.com' } });
    });

    it('returns in-use when email is already in use', async () => {
      mockRefetch.mockResolvedValue({ data: { available: false } });
      const result = await authService.emailAvailable(mockRefetch, 'taken@example.com');
      expect(result).toEqual({ available: false, message: 'Email is already registered', success: true });
    });

    it('handles non-200 status', async () => {
      mockRefetch.mockResolvedValue({ error: { message: 'Server error' } });
      const result = await authService.emailAvailable(mockRefetch, 'test@example.com');
      expect(result).toEqual({ available: false, message: 'Server error', success: false });
    });

    it('handles network errors', async () => {
      mockRefetch.mockRejectedValue(new Error('Network error'));
      const result = await authService.emailAvailable(mockRefetch, 'test@example.com');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error checking email existence');
    });

    it('handles undefined response data', async () => {
      mockRefetch.mockResolvedValue({ data: undefined });
      const result = await authService.emailAvailable(mockRefetch, 'test@example.com');
      expect(result).toEqual({ available: false, message: 'No data received', success: false });
    });

    it('handles null response', async () => {
      mockRefetch.mockResolvedValue(null);
      const result = await authService.emailAvailable(mockRefetch, 'test@example.com');
      expect(result.success).toBe(false);
      expect(result.message).toContain('TypeError');
    });

    it('handles empty email', async () => {
      mockRefetch.mockResolvedValue({ data: { available: true } });
      await authService.emailAvailable(mockRefetch, '');
      expect(mockRefetch).toHaveBeenCalledWith({ params: { email: '' } });
    });

    it('handles special characters', async () => {
      mockRefetch.mockResolvedValue({ data: { available: true } });
      const result = await authService.emailAvailable(mockRefetch, 'test+tag@example.com');
      expect(result.success).toBe(true);
    });

    it('handles very long email', async () => {
      mockRefetch.mockResolvedValue({ data: { available: true } });
      const result = await authService.emailAvailable(mockRefetch, 'a'.repeat(100) + '@example.com');
      expect(result.success).toBe(true);
    });

    it('handles whitespace email', async () => {
      mockRefetch.mockResolvedValue({ data: { available: true } });
      const result = await authService.emailAvailable(mockRefetch, '  test@example.com  ');
      expect(result.success).toBe(true);
    });

    it('handles multiple sequential calls', async () => {
      mockRefetch
        .mockResolvedValueOnce({ data: { available: true } })
        .mockResolvedValueOnce({ data: { available: false } });
      const r1 = await authService.emailAvailable(mockRefetch, 'test1@example.com');
      const r2 = await authService.emailAvailable(mockRefetch, 'test2@example.com');
      expect(r1.available).toBe(true);
      expect(r2.available).toBe(false);
    });

    it('handles concurrent calls', async () => {
      mockRefetch.mockResolvedValue({ data: { available: true } });
      const [r1, r2] = await Promise.all([
        authService.emailAvailable(mockRefetch, 'test1@example.com'),
        authService.emailAvailable(mockRefetch, 'test2@example.com')
      ]);
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(true);
    });
  });

  describe('onboardingStatus', () => {
    it('returns true when user needs onboarding', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: true } });
      const result = await authService.onboardingStatus(mockRefetch, 'test@example.com');
      expect(result).toEqual({ needsOnboarding: true, message: 'User needs onboarding', success: true });
    });

    it('returns false when user does not need onboarding', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: false } });
      const result = await authService.onboardingStatus(mockRefetch, 'existing@example.com');
      expect(result.needsOnboarding).toBe(false);
    });

    it('handles non-200 status', async () => {
      mockRefetch.mockResolvedValue({ error: { message: 'Server error' } });
      const result = await authService.onboardingStatus(mockRefetch, 'test@example.com');
      expect(result).toEqual({ needsOnboarding: false, message: 'Server error', success: false });
    });

    it('handles network errors', async () => {
      mockRefetch.mockRejectedValue(new Error('Network error'));
      const result = await authService.onboardingStatus(mockRefetch, 'test@example.com');
      expect(result.success).toBe(false);
    });

    it('handles undefined response data', async () => {
      mockRefetch.mockResolvedValue({ data: undefined });
      const result = await authService.onboardingStatus(mockRefetch, 'test@example.com');
      expect(result.message).toBe('No data received');
    });

    it('handles null response', async () => {
      mockRefetch.mockResolvedValue(null);
      const result = await authService.onboardingStatus(mockRefetch, 'test@example.com');
      expect(result.message).toContain('TypeError');
    });

    it('handles response without data property', async () => {
      mockRefetch.mockResolvedValue({});
      const result = await authService.onboardingStatus(mockRefetch, 'test@example.com');
      expect(result.success).toBe(false);
    });

    it('handles response with null data', async () => {
      mockRefetch.mockResolvedValue({ data: null });
      const result = await authService.onboardingStatus(mockRefetch, 'test@example.com');
      expect(result.message).toBe('No data received');
    });

    it('handles empty email', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: true } });
      const result = await authService.onboardingStatus(mockRefetch, '');
      expect(result.success).toBe(true);
    });

    it('handles special characters', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: true } });
      const result = await authService.onboardingStatus(mockRefetch, 'test+tag@example.com');
      expect(result.success).toBe(true);
    });

    it('handles very long email', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: false } });
      const result = await authService.onboardingStatus(mockRefetch, 'a'.repeat(100) + '@example.com');
      expect(result.success).toBe(true);
    });

    it('handles whitespace email', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: true } });
      const result = await authService.onboardingStatus(mockRefetch, '  test@example.com  ');
      expect(result.success).toBe(true);
    });

    it('handles multiple sequential calls', async () => {
      mockRefetch
        .mockResolvedValueOnce({ data: { needsOnboarding: true } })
        .mockResolvedValueOnce({ data: { needsOnboarding: false } });
      const r1 = await authService.onboardingStatus(mockRefetch, 'new@example.com');
      const r2 = await authService.onboardingStatus(mockRefetch, 'existing@example.com');
      expect(r1.needsOnboarding).toBe(true);
      expect(r2.needsOnboarding).toBe(false);
    });

    it('handles concurrent calls', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: true } });
      const results = await Promise.all([
        authService.onboardingStatus(mockRefetch, 'u1@ex.com'),
        authService.onboardingStatus(mockRefetch, 'u2@ex.com')
      ]);
      expect(results[0].success).toBe(true);
    });

    it('distinguishes onboarding status', async () => {
      mockRefetch.mockResolvedValue({ data: { needsOnboarding: true } });
      const r1 = await authService.onboardingStatus(mockRefetch, 'new@ex.com');
      expect(r1.message).toBe('User needs onboarding');
    });
  });

  describe('getProvider', () => {
    it('returns provider when found', async () => {
      mockRefetch.mockResolvedValue({ data: { provider: 'google' } });
      const result = await authService.getProvider(mockRefetch, 'test@example.com');
      expect(result).toEqual({ provider: 'google', message: 'Provider found', success: true });
    });

    it('returns null when no provider found', async () => {
      mockRefetch.mockResolvedValue({ data: { provider: null } });
      const result = await authService.getProvider(mockRefetch, 'test@example.com');
      expect(result).toEqual({ provider: null, message: 'No provider found', success: true });
    });

    it('returns provider from single provider field (password)', async () => {
      mockRefetch.mockResolvedValue({ data: { provider: 'password' } });
      const result = await authService.getProvider(mockRefetch, 'user@ex.com');
      expect(result.provider).toBe('password');
    });

    it('returns provider from providers array (google.com)', async () => {
      mockRefetch.mockResolvedValue({ data: { providers: ['google.com'] } });
      const result = await authService.getProvider(mockRefetch, 'test@gmail.com');
      expect(result.provider).toEqual(['google.com']);
    });

    it('returns provider string when found', async () => {
      mockRefetch.mockResolvedValue({ data: { provider: 'facebook' } });
      const result = await authService.getProvider(mockRefetch, 'user@ex.com');
      expect(result.message).toBe('Provider found');
    });

    it('handles non-200 status', async () => {
      mockRefetch.mockResolvedValue({ error: { message: 'User not found' } });
      const result = await authService.getProvider(mockRefetch, 'test@example.com');
      expect(result).toEqual({ provider: null, message: 'User not found', success: false });
    });

    it('handles network errors', async () => {
      mockRefetch.mockRejectedValue(new Error('Network error'));
      const result = await authService.getProvider(mockRefetch, 'test@example.com');
      expect(result.success).toBe(false);
    });

    it('handles undefined response data', async () => {
      mockRefetch.mockResolvedValue({ data: undefined });
      const result = await authService.getProvider(mockRefetch, 'test@example.com');
      expect(result.message).toBe('No data received');
    });

    it('handles null response', async () => {
      mockRefetch.mockResolvedValue(null);
      const result = await authService.getProvider(mockRefetch, 'test@example.com');
      expect(result.message).toContain('TypeError');
    });

    it('handles empty email', async () => {
      mockRefetch.mockResolvedValue({ data: { provider: 'google' } });
      const result = await authService.getProvider(mockRefetch, '');
      expect(result.success).toBe(true);
    });

    it('handles multiple sequential calls', async () => {
      mockRefetch.mockResolvedValue({ data: { provider: 'google' } });
      await authService.getProvider(mockRefetch, 'g@ex.com');
      await authService.getProvider(mockRefetch, 'r@ex.com');
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });

    it('handles concurrent calls', async () => {
      mockRefetch.mockResolvedValue({ data: { provider: 'google' } });
      const res = await Promise.all([
        authService.getProvider(mockRefetch, 'u1@ex.com'),
        authService.getProvider(mockRefetch, 'u2@ex.com')
      ]);
      expect(res.length).toBe(2);
    });
  });

  describe('resetPassword', () => {
    it('succeeds on 200 response', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'Reset initiated' } });
      const result = await authService.resetPassword(mockRefetch, 'test@example.com', 'newPass123!');
      expect(result).toEqual({ success: true, message: 'Reset initiated' });
      expect(mockRefetch).toHaveBeenCalledWith({ body: { email: 'test@example.com', newPassword: 'newPass123!' } });
    });

    it('handles non-200 status', async () => {
      mockRefetch.mockResolvedValue({ error: { message: 'Invalid email' } });
      const result = await authService.resetPassword(mockRefetch, 'invalid@ex.com', 'newPass');
      expect(result.success).toBe(false);
    });

    it('handles missing data', async () => {
      mockRefetch.mockResolvedValue({ data: undefined });
      const result = await authService.resetPassword(mockRefetch, 'test@ex.com', 'newPass');
      expect(result.message).toBe('No data received');
    });

    it('handles null response', async () => {
      mockRefetch.mockResolvedValue(null);
      const result = await authService.resetPassword(mockRefetch, 'test@ex.com', 'newPass');
      expect(result.message).toContain('TypeError');
    });

    it('handles network errors', async () => {
      mockRefetch.mockRejectedValue(new Error('Net error'));
      const result = await authService.resetPassword(mockRefetch, 'test@ex.com', 'newPass');
      expect(result.success).toBe(false);
    });

    it('handles empty email', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'Reset initiated' } });
      const result = await authService.resetPassword(mockRefetch, '', '');
      expect(mockRefetch).toHaveBeenCalledWith({ body: { email: '', newPassword: '' } });
      expect(result.success).toBe(true);
    });

    it('handles multiple sequential calls', async () => {
      mockRefetch
        .mockResolvedValueOnce({ data: { message: 'Reset initiated' } })
        .mockResolvedValueOnce({ error: { message: 'Invalid email' } });
      const r1 = await authService.resetPassword(mockRefetch, 'v@ex.com', 'p1');
      const r2 = await authService.resetPassword(mockRefetch, 'i@ex.com', 'p2');
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(false);
    });
  });

  describe('createAccount', () => {
    const userDetails = { firstName: 'John', email: 'john@ex.com' };

    it('succeeds on 200 response', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'Account created' } });
      const result = await authService.createAccount(mockRefetch, userDetails);
      expect(result).toEqual({ success: true, message: 'Account created' });
      expect(mockRefetch).toHaveBeenCalledWith({ body: userDetails });
    });

    it('handles non-200 status', async () => {
      mockRefetch.mockResolvedValue({ error: { message: 'Email already exists' } });
      const result = await authService.createAccount(mockRefetch, userDetails);
      expect(result.success).toBe(false);
    });

    it('handles missing data', async () => {
      mockRefetch.mockResolvedValue({ data: undefined });
      const result = await authService.createAccount(mockRefetch, userDetails);
      expect(result.message).toBe('No data received');
    });

    it('handles null response', async () => {
      mockRefetch.mockResolvedValue(null);
      const result = await authService.createAccount(mockRefetch, userDetails);
      expect(result.message).toContain('TypeError');
    });

    it('handles network errors', async () => {
      mockRefetch.mockRejectedValue(new Error('Net error'));
      const result = await authService.createAccount(mockRefetch, userDetails);
      expect(result.success).toBe(false);
    });

    it('handles empty userDetails', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'Account created' } });
      const result = await authService.createAccount(mockRefetch, {});
      expect(mockRefetch).toHaveBeenCalledWith({ body: {} });
      expect(result.success).toBe(true);
    });

    it('handles multiple sequential calls', async () => {
      mockRefetch
        .mockResolvedValueOnce({ data: { message: 'Account created' } })
        .mockResolvedValueOnce({ error: { message: 'Email exists' } });
      const r1 = await authService.createAccount(mockRefetch, { email: 'u1@ex.com' });
      const r2 = await authService.createAccount(mockRefetch, { email: 'u2@ex.com' });
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(false);
    });
  });

  describe('verifyOtp', () => {
    it('succeeds on 200 response', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'Verified' } });
      const result = await authService.verifyOtp(mockRefetch, 'test@ex.com', '123', 'signup');
      expect(result).toEqual({ message: 'Verified', success: true });
    });

    it('handles non-200 status', async () => {
      mockRefetch.mockResolvedValue({ error: { message: 'Invalid OTP' } });
      const result = await authService.verifyOtp(mockRefetch, 'test@ex.com', '000', 'signup');
      expect(result.success).toBe(false);
    });

    it('handles missing data', async () => {
      mockRefetch.mockResolvedValue({ data: undefined });
      const result = await authService.verifyOtp(mockRefetch, 'test@ex.com', '123', 'signup');
      expect(result.message).toBe('No data received');
    });

    it('handles null response', async () => {
      mockRefetch.mockResolvedValue(null);
      const result = await authService.verifyOtp(mockRefetch, 'test@ex.com', '123', 'signup');
      expect(result.message).toContain('TypeError');
    });

    it('handles network errors', async () => {
      mockRefetch.mockRejectedValue(new Error('Net error'));
      const result = await authService.verifyOtp(mockRefetch, 'test@ex.com', '123', 'signup');
      expect(result.success).toBe(false);
    });

    it('handles empty OTP', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'Verified' } });
      const result = await authService.verifyOtp(mockRefetch, 't@ex.com', '', 'signup');
      expect(result.success).toBe(true);
    });

    it('handles different purposes', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'Verified' } });
      const result = await authService.verifyOtp(mockRefetch, 't@ex.com', '123', 'login');
      expect(result.success).toBe(true);
    });

    it('handles multiple sequential calls', async () => {
      mockRefetch
        .mockResolvedValueOnce({ data: { message: 'Verified' } })
        .mockResolvedValueOnce({ error: { message: 'Invalid OTP' } });
      const r1 = await authService.verifyOtp(mockRefetch, 'u1@ex.com', '123', 'signup');
      const r2 = await authService.verifyOtp(mockRefetch, 'u2@ex.com', '000', 'signup');
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(false);
    });
  });

  describe('sendOtp', () => {
    it('succeeds on 200 response', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'OTP sent' } });
      const result = await authService.sendOtp(mockRefetch, 'test@ex.com');
      expect(result).toEqual({ message: 'OTP sent', success: true });
    });

    it('handles non-200 status', async () => {
      mockRefetch.mockResolvedValue({ error: { message: 'Rate limit exceeded' } });
      const result = await authService.sendOtp(mockRefetch, 'test@ex.com');
      expect(result.success).toBe(false);
    });

    it('handles missing data', async () => {
      mockRefetch.mockResolvedValue({ data: undefined });
      const result = await authService.sendOtp(mockRefetch, 'test@ex.com');
      expect(result.message).toBe('No data received');
    });

    it('handles null response', async () => {
      mockRefetch.mockResolvedValue(null);
      const result = await authService.sendOtp(mockRefetch, 'test@ex.com');
      expect(result.message).toContain('TypeError');
    });

    it('handles network errors', async () => {
      mockRefetch.mockRejectedValue(new Error('Net error'));
      const result = await authService.sendOtp(mockRefetch, 'test@ex.com');
      expect(result.success).toBe(false);
    });

    it('handles empty email', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'OTP sent' } });
      const result = await authService.sendOtp(mockRefetch, '');
      expect(result.success).toBe(true);
    });

    it('handles multiple sequential calls', async () => {
      mockRefetch
        .mockResolvedValueOnce({ data: { message: 'OTP sent' } })
        .mockResolvedValueOnce({ error: { message: 'Rate limit' } });
      const r1 = await authService.sendOtp(mockRefetch, 'u1@ex.com');
      const r2 = await authService.sendOtp(mockRefetch, 'u2@ex.com');
      expect(r1.success).toBe(true);
      expect(r2.success).toBe(false);
    });

    it('handles concurrent calls', async () => {
      mockRefetch.mockResolvedValue({ data: { message: 'OTP sent' } });
      const res = await Promise.all([
        authService.sendOtp(mockRefetch, 'u1@ex.com'),
        authService.sendOtp(mockRefetch, 'u2@ex.com')
      ]);
      expect(res[0].success).toBe(true);
    });
  });

  describe('Checkbox Validation Logic', () => {
    const validateCheckboxes = (ts: boolean, pp: boolean) => ts && pp;
    it('returns false when both unchecked', () => expect(validateCheckboxes(false, false)).toBe(false));
    it('returns false when only Terms is checked', () => expect(validateCheckboxes(true, false)).toBe(false));
    it('returns false when only Privacy Policy is checked', () => expect(validateCheckboxes(false, true)).toBe(false));
    it('returns true when both are checked', () => expect(validateCheckboxes(true, true)).toBe(true));
  });

  describe('Next Button Enable Logic', () => {
    const isNextButtonEnabled = (e: string, v: boolean) => e.length > 0 && v;
    it('is disabled when email is empty', () => expect(isNextButtonEnabled('', true)).toBe(false));
    it('is disabled when email is invalid', () => expect(isNextButtonEnabled('a@a.com', false)).toBe(false));
    it('is disabled when both conditions fail', () => expect(isNextButtonEnabled('', false)).toBe(false));
    it('is enabled when email is valid and not empty', () => expect(isNextButtonEnabled('a@a.com', true)).toBe(true));
  });

  describe('Google Button Enable Logic', () => {
    const isGoogleButtonEnabled = (ts: boolean, pp: boolean) => ts && pp;
    it('is disabled when both unchecked', () => expect(isGoogleButtonEnabled(false, false)).toBe(false));
    it('is disabled when only one is checked', () => {
      expect(isGoogleButtonEnabled(true, false)).toBe(false);
      expect(isGoogleButtonEnabled(false, true)).toBe(false);
    });
    it('is enabled when both are checked', () => expect(isGoogleButtonEnabled(true, true)).toBe(true));
  });

  describe('Email Change Detection Logic', () => {
    const hasEmailChanged = (s: string | null, c: string) => s !== null && s !== c;
    it('returns false when no stored email', () => expect(hasEmailChanged(null, 'a@a.com')).toBe(false));
    it('returns false when emails match', () => expect(hasEmailChanged('a@a.com', 'a@a.com')).toBe(false));
    it('returns true when emails differ', () => expect(hasEmailChanged('o@o.com', 'n@n.com')).toBe(true));
    it('is case-sensitive', () => expect(hasEmailChanged('A@a.com', 'a@a.com')).toBe(true));
  });

  describe('Onboarding Decision Logic', () => {
    const determineNextRoute = (n: boolean, g: boolean) => {
      if (n) return g ? 'createUserInfo' : 'emailOTP';
      return 'home';
    };
    it('routes to createUserInfo for Google users needing onboarding', () => expect(determineNextRoute(true, true)).toBe('createUserInfo'));
    it('routes to emailOTP for regular users needing onboarding', () => expect(determineNextRoute(true, false)).toBe('emailOTP'));
    it('routes to home when no onboarding needed', () => {
      expect(determineNextRoute(false, true)).toBe('home');
      expect(determineNextRoute(false, false)).toBe('home');
    });
  });

  describe('Error Message Formatting', () => {
    const formatErrorMessage = (error: any): string => {
      if (error instanceof Error) return `Error checking email existence: ${error.message}`;
      return `Error checking email existence: ${error}`;
    };
    it('formats Error objects', () => {
      expect(formatErrorMessage(new Error('fail'))).toBe('Error checking email existence: fail');
    });
    it('formats string errors', () => expect(formatErrorMessage('oops')).toContain('oops'));
    it('handles unknown error types', () => expect(formatErrorMessage({ code: 500 })).toContain('Error checking email existence'));
  });
});