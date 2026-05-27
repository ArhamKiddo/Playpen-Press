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
