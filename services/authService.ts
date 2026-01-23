import { createLogger } from '@/utils/logger';

const logger = createLogger('AuthService');

export const authService = {
  async emailAvailable(refetch: any, email: string): Promise<{available: boolean, message: string, success: boolean}> {
    logger.log(`Checking email availability for: ${email}`);
    try {
      const response = await refetch({ params: { email } });
      logger.debug('Response received', response);

      if (response.error) {
        logger.warn(`Error response: ${response.error?.message}`);
        return { available: false, message: response.error?.message || 'Server error occurred', success: false };
      }

      if (!response.data) {
        logger.warn('No data received');
        return { available: false, message: 'No data received', success: false };
      }

      if (response.data.available === true) {
        logger.log('Email is available');
        return { available: true, message: response.data.message || 'Email is available', success: true };
      }
      
      logger.log('Email is already registered');
      return { available: false, message: response.data.message || 'Email is already registered', success: true };
    } catch (error) {
      logger.error('Exception occurred', error);
      return { available: false, message: `Error checking email existence: ${error}`, success: false };
    } 
  },

  async onboardingStatus(refetch: any, email: string): Promise<{needsOnboarding: boolean, message: string, success: boolean}> {
    logger.log(`Checking onboarding status for: ${email}`);
    try {
      const response = await refetch({ params: { email } });
      logger.debug('Response received', response);

      if (response.error) {
        logger.warn(`Error response: ${response.error?.message}`);
        return { needsOnboarding: false, message: response.error?.message || 'Server error occurred', success: false };
      }

      if (!response.data) {
        logger.warn('No data received');
        return { needsOnboarding: false, message: 'No data received', success: false };
      }

      if (response.data.needsOnboarding) {
        logger.log('User needs onboarding');
        return { needsOnboarding: true, message: 'User needs onboarding', success: true };
      }
      
      logger.log('User does not need onboarding');
      return { needsOnboarding: false, message: 'User does not need onboarding', success: true };
    } catch (error) {
      logger.error('Exception occurred', error);
      return { needsOnboarding: false, message: `Error checking onboarding status: ${error}`, success: false };
    }
  },

  async getProvider(refetch: any, email: string): Promise<{provider: string | null, message: string, success: boolean}> {
    logger.log(`Getting provider for: ${email}`);
    try {
      const response = await refetch({ params: { email } });
      logger.debug('Response received', response);

      if (response.error) {
        logger.warn(`Error response: ${response.error?.message}`);
        return { provider: null, message: response.error?.message || 'Server error occurred', success: false };
      }

      if (!response.data) {
        logger.warn('No data received');
        return { provider: null, message: 'No data received', success: false };
      }

      const provider = response.data.providers ?? response.data.provider ?? null;
      logger.log(`Provider found: ${provider}`);
      return { provider, message: provider ? 'Provider found' : 'No provider found', success: true };
    } catch (error) {
      logger.error('Exception occurred', error);
      return { provider: null, message: `Error retrieving provider: ${error}`, success: false };
    }
  },

  async resetPassword(refetch: any, email: string, newPassword: string): Promise<{success: boolean, message: string}> {
    logger.log(`Resetting password for: ${email}`);
    try {
      const response = await refetch({ body: { email, newPassword } });
      logger.debug('Response received', response);

      if (response.error) {
        logger.warn(`Error response: ${response.error?.message}`);
        return { success: false, message: response.error?.message || 'Server error occurred' };
      }

      if (!response.data) {
        logger.warn('No data received');
        return { success: false, message: 'No data received' };
      }

      logger.log('Password reset successfully');
      return { success: true, message: response.data?.message || 'Password reset successfully' };
    } catch (error) {
      logger.error('Exception occurred', error);
      return { success: false, message: `Error sending password reset email: ${error}` };
    }
  },

  async createAccount(refetch: any, userDetails: any): Promise<{success: boolean, message: string}> {
    logger.log('Creating account');
    logger.debug('User details', userDetails);
    try {
      const response = await refetch({ body: userDetails });
      logger.debug('Response received', response);

      if (response.error) {
        logger.warn(`Error response: ${response.error?.message}`);
        return { success: false, message: response.error?.message || 'Server error occurred' };
      }

      if (!response.data) {
        logger.warn('No data received');
        return { success: false, message: 'No data received' };
      }

      logger.log('Account created successfully');
      return { success: true, message: response.data?.message || 'Account created successfully' };
    } catch (error) {
      logger.error('Exception occurred', error);
      return { success: false, message: `Error creating account: ${error}` };
    }
  },

  async verifyOtp(refetch: any, email: string, code: string, purpose: string): Promise<{message: string, success: boolean}> {
    logger.log(`Verifying OTP for: ${email}, purpose: ${purpose}`);
    try {
      const response = await refetch({ body: { email, code, purpose } });
      logger.debug('Response received', response);

      if (response.error) {
        logger.warn(`Error response: ${response.error?.message}`);
        return { message: response.error?.message || 'Server error occurred', success: false };
      }

      if (!response.data) {
        logger.warn('No data received');
        return { message: 'No data received', success: false };
      }

      logger.log('OTP verified successfully');
      return { message: response.data?.message || 'OTP verification successful', success: true };
    } catch (error) {
      logger.error('Exception occurred', error);
      return { message: `Error verifying OTP: ${error}`, success: false };
    }
  },

  async sendOtp(refetch: any, email: string): Promise<{message: string, success: boolean}> {
    logger.log(`Sending OTP to: ${email}`);
    try {
      const response = await refetch({ body: { email } });
      logger.debug('Response received', response);

      if (response.error) {
        logger.warn(`Error response: ${response.error?.message}`);
        return { message: response.error?.message || 'Server error occurred', success: false };
      }

      if (!response.data) {
        logger.warn('No data received');
        return { message: 'No data received', success: false };
      }

      logger.log('OTP sent successfully');
      return { message: response.data?.message || 'OTP sent successfully', success: true };
    } catch (error) {
      logger.error('Exception occurred', error);
      return { message: `Error sending OTP: ${error}`, success: false };
    }
  },
};