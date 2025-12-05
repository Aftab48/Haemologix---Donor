// Type definitions for the donor app

export type BloodTypeFormat =
  | "O+"
  | "O-"
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-";

export type Urgency = "Critical" | "High" | "Medium" | "Low" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DonorData {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  neverDonated?: boolean;
  lastDonation?: string | null;
  donationCount?: string;
  recentVaccinations?: boolean;
  vaccinationDetails?: string;
  medicalConditions?: string;
  medications?: string;
  hivTest?: string;
  hepatitisBTest?: string;
  hepatitisCTest?: string;
  syphilisTest?: string;
  malariaTest?: string;
  hemoglobin?: string;
  bloodGroup?: BloodTypeFormat;
  plateletCount?: string;
  wbcCount?: string;
  bloodTestReport?: string | null;
  idProof?: string | null;
  medicalCertificate?: string | null;
  dataProcessingConsent?: boolean;
  medicalScreeningConsent?: boolean;
  termsAccepted?: boolean;
  status?: ApprovalStatus;
  latitude?: string | null;
  longitude?: string | null;
  isAvailable?: boolean;
}

export interface Alert {
  id: string;
  hospitalName: string;
  hospitalId?: string;
  bloodType: BloodTypeFormat;
  urgency: Urgency;
  unitsNeeded: number;
  description?: string;
  location?: string;
  contactPhone?: string;
  timePosted: string;
  distance: string;
  responded?: boolean;
  response?: "accept" | "decline";
  latitude?: string;
  longitude?: string;
  status?: string;
}

export interface DonationHistory {
  id: string;
  date: string;
  hospital: string;
  bloodType: BloodTypeFormat;
  units: number;
  status: "Completed" | "Pending" | "Cancelled";
}

export interface UserProfile {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  bloodType?: BloodTypeFormat;
  age?: number;
  location?: string;
  address?: string;
  eligibilityStatus?: string;
  isAvailable?: boolean;
  lastDonation?: string | null;
  donationCount?: number;
  status?: ApprovalStatus;
  latitude?: string | null;
  longitude?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: DonorData;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AlertResponse {
  success: boolean;
  message?: string;
  error?: string;
  status?: "accepted" | "declined";
}

export interface Notification {
  id: string;
  type: "alert" | "donation" | "status" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  alertId?: string;
  donationId?: string;
}

