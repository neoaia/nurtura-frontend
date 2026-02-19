import { userService } from '../services/userService';
import { UserDetailsResponseDTO } from '@/types/user.dto';
import { UserDetails } from '@/types/interface';

describe('userService', () => {
  let mockRefetch: jest.Mock;
  
  beforeEach(() => {
    mockRefetch = jest.fn();
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should successfully fetch user details', async () => {
      const mockBody = { userId: '123' } as UserDetails;
      const mockResponse: UserDetailsResponseDTO = {
        message: 'User details retrieved successfully',
        userInfo: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          middleName: 'Smith',
          suffix: 'Jr.',
          block: 'Block A',
          street: 'Main Street',
          barangay: 'Barangay 1',
          city: 'Manila',
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await userService.getUser(mockRefetch, mockBody);

      expect(result).toEqual(mockResponse);
      expect(result.userInfo.email).toBe('test@example.com');
      expect(mockRefetch).toHaveBeenCalledWith({ body: mockBody });
    });

    it('should throw error when user not found', async () => {
      const mockBody = { userId: '999' } as UserDetails;

      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
        status: 404,
      });

      await expect(userService.getUser(mockRefetch, mockBody)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error when no data received', async () => {
      const mockBody = { userId: '123' } as UserDetails;

      mockRefetch.mockResolvedValue({
        data: null,
        error: null,
        status: 200,
      });

      await expect(userService.getUser(mockRefetch, mockBody)).rejects.toThrow(
        'No data received'
      );
    });

    it('should throw error on network failure', async () => {
      const mockBody = { userId: '123' } as UserDetails;

      mockRefetch.mockRejectedValue(new Error('Network error'));

      await expect(userService.getUser(mockRefetch, mockBody)).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw error on unauthorized access', async () => {
      const mockBody = { userId: '123' } as UserDetails;

      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: 'Unauthorized: Invalid token' },
        status: 401,
      });

      await expect(userService.getUser(mockRefetch, mockBody)).rejects.toThrow(
        'Unauthorized'
      );
    });

    it('should handle user with minimal information', async () => {
      const mockBody = { userId: '456' } as UserDetails;
      const mockResponse: UserDetailsResponseDTO = {
        message: 'User details retrieved successfully',
        userInfo: {
          id: '456',
          email: 'minimal@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
        },
      };

      mockRefetch.mockResolvedValue({
        data: mockResponse,
        error: null,
        status: 200,
      });

      const result = await userService.getUser(mockRefetch, mockBody);
      expect(result.userInfo.email).toBe('minimal@example.com');

      expect(result.userInfo.firstName).toBe('Jane');
    });

    it('should throw error on server error', async () => {
      const mockBody = { userId: '123' } as UserDetails;

      mockRefetch.mockResolvedValue({
        data: null,
        error: { message: 'Internal server error' },
        status: 500,
      });

      await expect(userService.getUser(mockRefetch, mockBody)).rejects.toThrow(
        'Internal server error'
      );
    });
  });
});