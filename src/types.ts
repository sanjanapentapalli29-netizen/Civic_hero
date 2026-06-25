export interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface StatusHistory {
  status: 'reported' | 'validated' | 'in-progress' | 'resolved';
  changedAt: string;
  notes: string;
  updatedBy: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'reported' | 'validated' | 'in-progress' | 'resolved';
  votes: number;
  votedUserIds: string[]; // tracking which citizens have upvoted/validated
  reportedBy: string;
  createdAt: string;
  location: LocationData;
  imageUrl?: string;
  resolvedImageUrl?: string;
  audioUrl?: string;
  voiceTranscript?: string;
  department: string;
  history: StatusHistory[];
  comments: Comment[];
  isSimulated?: boolean;
}

export interface CitizenProfile {
  name: string;
  xp: number;
  level: number;
  completedReports: number;
  validationsPerformed: number;
  unlockedBadges: string[]; // Badge IDs
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // Tailwind color class
}

export interface InspectionLog {
  date: string;
  roadStatus: 'clear' | 'issue-logged' | 'verified';
  notes: string;
}

export interface CommunityHeroProfile {
  name: string;
  age: number;
  assignedRoad: string;
  monthlyStipend: number;
  status: 'none' | 'applied' | 'active';
  reportedCount: number;
  resolvedCount: number;
  inspectionHistory: InspectionLog[];
}

