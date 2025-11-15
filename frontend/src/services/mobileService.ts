import api from './api';

export interface DashboardStats {
  petsInFacility: number;
  staffOnDuty: number;
  tasksCompleted: number;
  totalTasks: number;
}

export interface TodaySchedule {
  id: string;
  time: string;
  title: string;
  location?: string;
  startTime: string;
  endTime: string;
  role?: string;
  status: string;
}

export interface PendingTask {
  id: string;
  title: string;
  completed: number;
  total: number;
  type: string;
  dueDate?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  todaySchedule: TodaySchedule[];
  pendingTasks: PendingTask[];
  unreadMessages: number;
}

/**
 * Mobile API Service
 * Provides mobile-optimized endpoints for staff mobile app
 */
class MobileService {
  /**
   * Get dashboard data for mobile app
   * Aggregates stats, schedule, and tasks in one call
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get<DashboardData>('/api/staff/mobile/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching mobile dashboard data:', error);
      // Return mock data as fallback for now
      return this.getMockDashboardData();
    }
  }

  /**
   * Get today's schedule for current staff member
   */
  async getTodaySchedule(): Promise<TodaySchedule[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get<TodaySchedule[]>(`/api/staff/schedules/my-schedule`, {
        params: { date: today }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching today schedule:', error);
      return this.getMockSchedule();
    }
  }

  /**
   * Get pending tasks/checklists for current staff member
   */
  async getPendingTasks(): Promise<PendingTask[]> {
    try {
      const response = await api.get<PendingTask[]>('/api/staff/mobile/tasks/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      return this.getMockTasks();
    }
  }

  /**
   * Get quick stats for dashboard
   */
  async getQuickStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<DashboardStats>('/api/staff/mobile/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching quick stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadMessageCount(): Promise<number> {
    try {
      const response = await api.get<{ count: number }>('/api/staff/mobile/messages/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      return 0;
    }
  }

  // Mock data methods for development/fallback
  private getMockDashboardData(): DashboardData {
    return {
      stats: this.getMockStats(),
      todaySchedule: this.getMockSchedule(),
      pendingTasks: this.getMockTasks(),
      unreadMessages: 3,
    };
  }

  private getMockStats(): DashboardStats {
    return {
      petsInFacility: 24,
      staffOnDuty: 6,
      tasksCompleted: 8,
      totalTasks: 12,
    };
  }

  private getMockSchedule(): TodaySchedule[] {
    return [
      {
        id: '1',
        time: '08:00 AM',
        title: 'Morning Shift',
        location: 'Main Building',
        startTime: '08:00',
        endTime: '12:00',
        role: 'Kennel Attendant',
        status: 'SCHEDULED',
      },
      {
        id: '2',
        time: '12:00 PM',
        title: 'Lunch Break',
        location: '',
        startTime: '12:00',
        endTime: '01:00',
        status: 'SCHEDULED',
      },
      {
        id: '3',
        time: '01:00 PM',
        title: 'Afternoon Shift',
        location: 'Main Building',
        startTime: '13:00',
        endTime: '17:00',
        role: 'Kennel Attendant',
        status: 'SCHEDULED',
      },
    ];
  }

  private getMockTasks(): PendingTask[] {
    return [
      {
        id: '1',
        title: 'Opening Checklist',
        completed: 8,
        total: 10,
        type: 'checklist',
        dueDate: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Medication Round',
        completed: 0,
        total: 5,
        type: 'medication',
        dueDate: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Feeding Schedule',
        completed: 12,
        total: 24,
        type: 'feeding',
        dueDate: new Date().toISOString(),
      },
    ];
  }
}

const mobileService = new MobileService();
export default mobileService;
