import api from './index';
import { StandardResponse } from '../types/api.types';

// Enums matching backend
export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum ConsultationStatus {
    BOOKED = 'BOOKED',
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

export enum ConsultationType {
    VIDEO = 'VIDEO',
    CHAT = 'CHAT',
    AUDIO = 'AUDIO',
}

// Types
export interface UserLocation {
    id: string;
    country: string;
    state: string;
    address: string;
    landMark?: string;
    latitude?: string;
    longitude?: string;
    isSupported: boolean;
}

export interface ProfessionalDetails {
    id: string;
    userId: string;
    medicalLicenseNumber?: string;
    specialty?: string;
    highestQualification?: string;
    yearOfExperience?: number;
    medicalInstitution?: string;
    languageSpoken?: string;
    consultationFee?: number;
    professionalBio?: string;
    medicalLicense?: string; // URL to license document
    governmentId?: string; // URL to government ID
    professionalCertificate?: string; // URL to certificate
    approvalStatus?: ApprovalStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface Doctor {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
    profilePic?: string;
    userRole?: string;
    isVerified?: boolean;
    location?: UserLocation;
    locationId?: string;
    professionDetails?: ProfessionalDetails;
    createdAt?: string;
    updatedAt?: string;
}

export interface Appointment {
    id: string;
    patientId?: string;
    doctorId?: string;
    consultationType?: ConsultationType;
    consultationAmount?: number;
    day?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    status?: ConsultationStatus;
    meetingLink?: string;
    createdAt?: string;
    patient?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        mobile?: string;
        location?: UserLocation;
    };
    doctor?: Doctor;
}

export interface AppointmentStats {
    total: number;
    pending: number;
    scheduled: number;
    ongoing: number;
    completed: number;
    cancelled: number;
}

export const healthApi = {
    // ==================== DOCTORS / PROFESSIONALS ====================

    // Get all doctors (health professionals)
    getAllDoctors: async (): Promise<StandardResponse<Doctor[]>> => {
        const response = await api.get('/api/v1/doctor/get-all-doctors');
        return response.data;
    },

    // Get doctors with pending verification
    getDoctorsWithPendingVerification: async (): Promise<StandardResponse<Doctor[]>> => {
        const response = await api.get('/api/v1/doctor/get-doctors-with-pending-verification');
        return response.data;
    },

    // Verify/Approve/Reject doctor
    verifyDoctor: async (doctorId: string, approvalStatus: ApprovalStatus): Promise<StandardResponse<any>> => {
        const response = await api.post('/api/v1/doctor/verify-doctor', {
            doctorId,
            approvalStatus,
        });
        return response.data;
    },

    // ==================== CONSULTATIONS / APPOINTMENTS ====================

    // Get all appointments (with optional status filter)
    getAllAppointments: async (status?: ConsultationStatus): Promise<StandardResponse<Appointment[]>> => {
        const response = await api.get('/api/v1/doctor/get-all-appointments', {
            params: status ? { status } : undefined,
        });
        return response.data;
    },

    // Get appointment statistics
    getAllAppointmentsStats: async (): Promise<StandardResponse<AppointmentStats>> => {
        const response = await api.get('/api/v1/doctor/get-all-appointments-stats');
        return response.data;
    },
};

export default healthApi;
