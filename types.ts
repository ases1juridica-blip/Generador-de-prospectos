
export interface Lead {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  ownerName?: string;
  managerName?: string;
  rating: number | null;
  userRatingCount: number | null;
  websiteUri?: string;
  googleMapsUri?: string;
  sentimentAnalysis: {
    score: number; // 0 to 100
    summary: string;
    painPoints: string[];
    estimatedMonthlyLoss: number; // USD estimated loss due to bad service
  };
  contactStatus: 'new' | 'drafted' | 'contacted';
  personalizedDraft?: {
    subject: string;
    body: string;
    whatsappMessage: string;
    smsMessage: string;
  };
}

export interface SearchParams {
  industry: string;
  location: string;
  painPoints: string[];
}

export interface GeneratedOutreach {
  subject: string;
  body: string;
  whatsappMessage: string;
  smsMessage: string;
}
