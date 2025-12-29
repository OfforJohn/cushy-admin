export enum DoctorSpecialty {
    GENERAL_PRACTITIONER = 'GENERAL_PRACTITIONER',
    THERAPIST = 'THERAPIST',
    NUTRITIONIST = 'NUTRITIONIST',
    DERMATOLOGIST = 'DERMATOLOGIST',
}

export enum ConsultationStatus {
    BOOKED = 'BOOKED',
    AWAITING = 'AWAITING',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DISPUTED = 'DISPUTED',
    REFUNDED = 'REFUNDED',
}

export enum ConsultationMode {
    CHAT = 'CHAT',
    VOICE = 'VOICE',
    VIDEO = 'VIDEO',
}

export interface ProfessionDetails {
    id: string;
    userId: string;
    medicalLicenseNumber: string;
    highestQualification: string;
    yearOfExperience: number;
    medicalInstitution: string;
    languageSpoken: string;
    consultationFee: number;
    professionalBio?: string;
    medicalLicense: string; // S3 URL
    governmentId: string; // S3 URL
    professionalCertificate?: string; // S3 URL
    createdAt: string;
    updatedAt: string;
}

export interface HealthProfessional {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    isVerified: boolean;
    specialty?: DoctorSpecialty;
    professionDetails?: ProfessionDetails;
    rating?: number;
    consultationsCount?: number;
    availableSlots?: string[];
    createdAt: string;
}

export interface Consultation {
    id: string;
    userId: string;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
        mobile: string;
    };
    professionalId: string;
    professional?: HealthProfessional;
    mode: ConsultationMode;
    status: ConsultationStatus;
    scheduledTime: string;
    startTime?: string;
    endTime?: string;
    fee: number;
    notes?: string;
    prescriptionIssued: boolean;
    prescriptionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Prescription {
    id: string;
    consultationId: string;
    professionalId: string;
    userId: string;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        notes?: string;
    }[];
    notes?: string;
    issuedAt: string;
    linkedOrderId?: string; // If purchased through pharmacy
}

export interface HealthStats {
    totalProfessionals: number;
    verifiedProfessionals: number;
    pendingVerification: number;
    totalConsultations: number;
    completedConsultations: number;
    disputedConsultations: number;
    avgConsultationFee: number;
}
