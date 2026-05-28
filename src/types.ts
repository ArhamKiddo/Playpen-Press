export interface Article {
  id: string;
  headline: string;
  subheading?: string;
  byline: string;
  date: string;
  category: string;
  paragraphs: string[];
  imageUrl?: string;
  readTime: string;
  isFeatured?: boolean;
  tags?: string[];
  front_page_tag?: "hero" | "secondary" | "sub_feature" | null;
  additionalImages?: string[];
}

export interface EditorialSuggestion {
  original: string;
  revised: string;
  reason: string;
}

export interface EditorialReview {
  overallScore: number;
  critique: string;
  suggestions: EditorialSuggestion[];
  polishedText: string;
}

export interface PitchIdea {
  title: string;
  angle: string;
  sources: string;
  methods: string;
}

export interface HeadlineOption {
  title: string;
  style: string;
  subtitle: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption?: string;
  takenAt: string; // Date & time taken metadata e.g. "May 28, 2026, 3:30 PM"
  articleId?: string; // Optional connection to parent story
  articleHeadline?: string; // Parent story title
}
