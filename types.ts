export interface Lead {
  id: string;
  name: string;
  category: string; // e.g., Odontología, Restaurante
  city: string;
  address: string;
  phone?: string;
  email?: string; // Try to find via AI
  ownerName?: string; // Try to find via AI
  managerName?: string; // Try to find via AI
  rating: number | null;
  userRatingCount: number | null;
  websiteUri?: string;
  googleMapsUri?: string;
  sentimentAnalysis: {
    score: number; // 0 to 100
    summary: string;
    painPoints: string[];
  };
  contactStatus: 'new' | 'drafted' | 'contacted';
}

export interface SearchParams {
  industry: string;
  location: string;
  painPoints: string[];
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}
