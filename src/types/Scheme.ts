export interface Scheme {
  id: string;
  name: string;
  shortDescription: string;
  detailedOverview: string;
  benefits: string;
  eligibility: string;
  documents: string;
  applicationProcess: string;
  classification: 'Central' | 'State';
  state?: string; // if State
  category: string;
  officialUrl: string;
  applicationUrl?: string;
  source: string;
  lastVerified: string; // ISO date
  verificationStatus: 'verified' | 'unverified' | 'sample';
}
