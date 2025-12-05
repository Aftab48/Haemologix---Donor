export interface HospitalAlert {
  id: string;
  hospitalName: string;
  urgency: 'Critical' | 'Urgent' | 'Normal';
  bloodType: string;
  distance: string;
  time: string;
  units: number;
  description: string;
}

export interface UserProfile {
  name: string;
  email: string;
  bloodType: string;
  age: number;
  location: string;
  eligibilityStatus: string;
  isAvailable: boolean;
}

export const mockAlerts: HospitalAlert[] = [
  {
    id: '1',
    hospitalName: 'City General Hospital',
    urgency: 'Critical',
    bloodType: 'O+',
    distance: '2.3 km away',
    time: '15 minutes ago',
    units: 3,
    description: 'Emergency surgery patient needs immediate blood transfusion.',
  },
  {
    id: '2',
    hospitalName: 'Metro Medical Center',
    urgency: 'Urgent',
    bloodType: 'A+',
    distance: '5.1 km away',
    time: '1 hour ago',
    units: 2,
    description: 'Accident victim requires blood transfusion for ongoing treatment.',
  },
  {
    id: '3',
    hospitalName: 'Regional Hospital',
    urgency: 'Normal',
    bloodType: 'B+',
    distance: '8.7 km away',
    time: '3 hours ago',
    units: 1,
    description: 'Scheduled surgery requires blood units for patient safety.',
  },
];

export const mockUserProfile: UserProfile = {
  name: 'Shalini Sharma',
  email: 'shalinisharma@gmail.com',
  bloodType: 'O+',
  age: 25,
  location: '678, Mumbai',
  eligibilityStatus: 'Eligible',
  isAvailable: true,
};

