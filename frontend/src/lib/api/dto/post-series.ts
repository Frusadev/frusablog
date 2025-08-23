export interface PostSeries {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null; // UUID
  created_at: string; // ISO 8601 timestamp
  last_updated: string; // ISO 8601 timestamp
}

export interface PostSeriesCreationDTO {
  title: string;
  description?: string | null;
  cover?: string | null; // UUID
}

export interface PostSeriesUpdateDTO {
  id: string;
  title: string;
  description?: string | null;
  cover?: string | null; // UUID
}
