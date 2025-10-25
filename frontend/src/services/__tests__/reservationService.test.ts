/**
 * Reservation Service Tests
 * Tests for reservation API service layer
 */

import { reservationService } from '../reservationService';
import { reservationApi } from '../api';

jest.mock('../api', () => ({
  reservationApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

const mockReservationApi = reservationApi as jest.Mocked<typeof reservationApi>;

describe('reservationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllReservations', () => {
    it('should fetch all reservations with pagination', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', customerId: 'c1', startDate: '2025-10-24', status: 'CONFIRMED' },
            { id: '2', customerId: 'c2', startDate: '2025-10-25', status: 'PENDING' }
          ],
          totalPages: 3,
          currentPage: 1
        }
      };

      mockReservationApi.get.mockResolvedValue(mockResponse);

      const result = await reservationService.getAllReservations(1, 10);

      expect(mockReservationApi.get).toHaveBeenCalledWith('/api/reservations', {
        params: { page: 1, limit: 10 }
      });
      expect(result.data).toHaveLength(2);
    });

    it('should use default pagination', async () => {
      const mockResponse = { data: { data: [], totalPages: 0, currentPage: 1 } };
      mockReservationApi.get.mockResolvedValue(mockResponse);

      await reservationService.getAllReservations();

      expect(mockReservationApi.get).toHaveBeenCalledWith('/api/reservations', {
        params: { page: 1, limit: 10 }
      });
    });
  });

  describe('getReservationById', () => {
    it('should fetch a reservation by ID', async () => {
      const mockReservation = {
        id: '123',
        customerId: 'c1',
        startDate: '2025-10-24',
        endDate: '2025-10-26',
        status: 'CONFIRMED'
      };

      mockReservationApi.get.mockResolvedValue({ data: mockReservation });

      const result = await reservationService.getReservationById('123');

      expect(mockReservationApi.get).toHaveBeenCalledWith('/api/reservations/123');
      expect(result.id).toBe('123');
    });
  });

  describe('createReservation', () => {
    it('should create a new reservation', async () => {
      const newReservation = {
        customerId: 'c1',
        petId: 'p1',
        serviceId: 's1',
        startDate: '2025-10-24',
        endDate: '2025-10-26'
      };

      const mockResponse = {
        data: { id: '123', ...newReservation, status: 'PENDING' }
      };

      mockReservationApi.post.mockResolvedValue(mockResponse);

      const result = await reservationService.createReservation(newReservation);

      expect(mockReservationApi.post).toHaveBeenCalledWith('/api/reservations', newReservation);
      expect(result.id).toBe('123');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('updateReservation', () => {
    it('should update an existing reservation', async () => {
      const updates = {
        startDate: '2025-10-25',
        status: 'CONFIRMED'
      };

      const mockResponse = {
        data: { id: '123', ...updates }
      };

      mockReservationApi.put.mockResolvedValue(mockResponse);

      const result = await reservationService.updateReservation('123', updates);

      expect(mockReservationApi.put).toHaveBeenCalledWith('/api/reservations/123', updates);
      expect(result.status).toBe('CONFIRMED');
    });
  });

  describe('deleteReservation', () => {
    it('should delete a reservation', async () => {
      mockReservationApi.delete.mockResolvedValue({ data: { success: true } });

      await reservationService.deleteReservation('123');

      expect(mockReservationApi.delete).toHaveBeenCalledWith('/api/reservations/123');
    });
  });

  describe('getReservationsByDateRange', () => {
    it('should fetch reservations by date range', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', startDate: '2025-10-24' },
            { id: '2', startDate: '2025-10-25' }
          ]
        }
      };

      mockReservationApi.get.mockResolvedValue(mockResponse);

      const result = await reservationService.getReservationsByDateRange(
        '2025-10-24',
        '2025-10-26'
      );

      expect(mockReservationApi.get).toHaveBeenCalledWith('/api/reservations/date-range', {
        params: { startDate: '2025-10-24', endDate: '2025-10-26' }
      });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getReservationsByCustomer', () => {
    it('should fetch reservations for a customer', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: '1', customerId: 'c1' },
            { id: '2', customerId: 'c1' }
          ]
        }
      };

      mockReservationApi.get.mockResolvedValue(mockResponse);

      const result = await reservationService.getReservationsByCustomer('c1');

      expect(mockReservationApi.get).toHaveBeenCalledWith('/api/reservations/customer/c1');
      expect(result.data).toHaveLength(2);
    });
  });

  describe('checkInReservation', () => {
    it('should check in a reservation', async () => {
      const mockResponse = {
        data: { id: '123', status: 'CHECKED_IN', checkInTime: '2025-10-24T10:00:00Z' }
      };

      mockReservationApi.post.mockResolvedValue(mockResponse);

      const result = await reservationService.checkInReservation('123');

      expect(mockReservationApi.post).toHaveBeenCalledWith('/api/reservations/123/check-in');
      expect(result.status).toBe('CHECKED_IN');
    });
  });

  describe('checkOutReservation', () => {
    it('should check out a reservation', async () => {
      const mockResponse = {
        data: { id: '123', status: 'CHECKED_OUT', checkOutTime: '2025-10-26T11:00:00Z' }
      };

      mockReservationApi.post.mockResolvedValue(mockResponse);

      const result = await reservationService.checkOutReservation('123');

      expect(mockReservationApi.post).toHaveBeenCalledWith('/api/reservations/123/check-out');
      expect(result.status).toBe('CHECKED_OUT');
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation', async () => {
      const mockResponse = {
        data: { id: '123', status: 'CANCELLED' }
      };

      mockReservationApi.post.mockResolvedValue(mockResponse);

      const result = await reservationService.cancelReservation('123');

      expect(mockReservationApi.post).toHaveBeenCalledWith('/api/reservations/123/cancel');
      expect(result.status).toBe('CANCELLED');
    });
  });
});
