import api from './api';

export interface Staff {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  department: string;
  position: string;
  isActive?: boolean; // This maps to 'status' in the UI
  hireDate?: string; // This is not in the Prisma model but used in the UI
  status?: string; // UI field that maps to isActive
  specialties?: string[];
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  availability?: StaffAvailability[];
  timeOff?: StaffTimeOff[];
}

export interface StaffAvailability {
  id?: string;
  staffId: string;
  dayOfWeek: number; // 0-6 for Sunday-Saturday
  startTime: string; // Format: HH:MM in 24-hour format
  endTime: string; // Format: HH:MM in 24-hour format
  isRecurring: boolean;
  effectiveFrom?: string; // ISO date string
  effectiveUntil?: string; // ISO date string
  isAvailable: boolean; // If false, this is a recurring unavailability
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffTimeOff {
  id?: string;
  staffId: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  type: TimeOffType;
  status: TimeOffStatus;
  reason?: string;
  notes?: string;
  approvedById?: string;
  approvedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export enum TimeOffType {
  VACATION = 'VACATION',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  BEREAVEMENT = 'BEREAVEMENT',
  JURY_DUTY = 'JURY_DUTY',
  OTHER = 'OTHER'
}

export enum TimeOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  CANCELLED = 'CANCELLED'
}

export interface StaffResponse {
  status: string;
  data: Staff | Staff[];
  results?: number;
  totalPages?: number;
  currentPage?: number;
}

const staffService = {
  getAllStaff: async (): Promise<Staff[]> => {
    try {
      const response = await api.get('/api/staff');
      if (response.data && response.data.status === 'success') {
        // Transform the backend data to match the frontend interface
        const staffList = Array.isArray(response.data.data) ? response.data.data : [];
        return staffList.map((staff: any) => ({
          ...staff,
          status: staff.isActive ? 'Active' : 'Inactive', // Convert isActive to status string
          hireDate: staff.createdAt ? new Date(staff.createdAt).toISOString().split('T')[0] : ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  getStaffById: async (id: string): Promise<Staff | null> => {
    try {
      const response = await api.get(`/api/staff/${id}`);
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching staff with ID ${id}:`, error);
      throw error;
    }
  },

  createStaff: async (staffData: Staff): Promise<Staff | null> => {
    try {
      // Format the data to match the backend model
      const formattedData = {
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        password: staffData.password || 'defaultPassword123', // Provide a default if not set
        role: staffData.role,
        department: staffData.department,
        position: staffData.position,
        isActive: staffData.status === 'Active', // Convert status to isActive boolean
        phone: staffData.phone || '',
        address: staffData.address || '',
        city: staffData.city || '',
        state: staffData.state || '',
        zipCode: staffData.zipCode || '',
        specialties: staffData.specialties || []
      };

      console.log('Sending staff data to backend:', formattedData);
      const response = await api.post('/api/staff', formattedData);
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  },

  updateStaff: async (id: string, staffData: Partial<Staff>): Promise<Staff | null> => {
    try {
      // Format the data to match the backend model
      const formattedData: any = {};
      
      if (staffData.firstName) formattedData.firstName = staffData.firstName;
      if (staffData.lastName) formattedData.lastName = staffData.lastName;
      if (staffData.email) formattedData.email = staffData.email;
      if (staffData.password) formattedData.password = staffData.password;
      if (staffData.role) formattedData.role = staffData.role;
      if (staffData.department) formattedData.department = staffData.department;
      if (staffData.position) formattedData.position = staffData.position;
      if (staffData.phone) formattedData.phone = staffData.phone;
      if (staffData.address) formattedData.address = staffData.address;
      if (staffData.city) formattedData.city = staffData.city;
      if (staffData.state) formattedData.state = staffData.state;
      if (staffData.zipCode) formattedData.zipCode = staffData.zipCode;
      if (staffData.specialties) formattedData.specialties = staffData.specialties;
      
      // Convert status to isActive if present
      if (staffData.status) {
        formattedData.isActive = staffData.status === 'Active';
      }

      console.log('Updating staff data:', formattedData);
      const response = await api.put(`/api/staff/${id}`, formattedData);
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error updating staff with ID ${id}:`, error);
      throw error;
    }
  },

  deleteStaff: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/api/staff/${id}`);
      return response.data && response.data.status === 'success';
    } catch (error) {
      console.error(`Error deleting staff with ID ${id}:`, error);
      throw error;
    }
  },

  // Staff Availability Management
  getStaffAvailability: async (staffId: string): Promise<StaffAvailability[]> => {
    try {
      const response = await api.get(`/api/staff/${staffId}/availability`);
      if (response.data && response.data.status === 'success') {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching availability for staff ID ${staffId}:`, error);
      throw error;
    }
  },

  createStaffAvailability: async (availability: StaffAvailability): Promise<StaffAvailability | null> => {
    try {
      const response = await api.post(`/api/staff/${availability.staffId}/availability`, availability);
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating staff availability:', error);
      throw error;
    }
  },

  updateStaffAvailability: async (id: string, availability: Partial<StaffAvailability>): Promise<StaffAvailability | null> => {
    try {
      const response = await api.put(`/api/staff/availability/${id}`, availability);
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error updating staff availability with ID ${id}:`, error);
      throw error;
    }
  },

  deleteStaffAvailability: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/api/staff/availability/${id}`);
      return response.data && response.data.status === 'success';
    } catch (error) {
      console.error(`Error deleting staff availability with ID ${id}:`, error);
      throw error;
    }
  },

  // Staff Time Off Management
  getStaffTimeOff: async (staffId: string, params?: { status?: TimeOffStatus }): Promise<StaffTimeOff[]> => {
    try {
      const response = await api.get(`/api/staff/${staffId}/time-off`, { params });
      if (response.data && response.data.status === 'success') {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching time off for staff ID ${staffId}:`, error);
      throw error;
    }
  },

  createStaffTimeOff: async (timeOff: StaffTimeOff): Promise<StaffTimeOff | null> => {
    try {
      const response = await api.post(`/api/staff/${timeOff.staffId}/time-off`, timeOff);
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error creating staff time off:', error);
      throw error;
    }
  },

  updateStaffTimeOff: async (id: string, timeOff: Partial<StaffTimeOff>): Promise<StaffTimeOff | null> => {
    try {
      const response = await api.put(`/api/staff/time-off/${id}`, timeOff);
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error(`Error updating staff time off with ID ${id}:`, error);
      throw error;
    }
  },

  deleteStaffTimeOff: async (id: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/api/staff/time-off/${id}`);
      return response.data && response.data.status === 'success';
    } catch (error) {
      console.error(`Error deleting staff time off with ID ${id}:`, error);
      throw error;
    }
  },

  // Staff Scheduling
  getAvailableStaff: async (params: { date: string, startTime: string, endTime: string, specialties?: string[] }): Promise<Staff[]> => {
    try {
      const response = await api.get('/api/staff/available', { params });
      if (response.data && response.data.status === 'success') {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching available staff:', error);
      throw error;
    }
  }
};

export default staffService;
