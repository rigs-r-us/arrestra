export type LeadDTO = {
  id: string;
  fullName?: string | null;
  county: string;
  charge: string;
  bailAmount?: number | null;
  arrestTime: string;
  score: number;
  source: string;
  status: "NEW" | "CLAIMED" | "CONTACTED" | "DISMISSED" | "WON" | "LOST";
  createdAt: string;
};
