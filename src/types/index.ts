export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  dreamCount: number;
}

export interface Dream {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  title: string;
  content: string;
  mood: 'peaceful' | 'exciting' | 'scary' | 'strange' | 'romantic' | 'sad';
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  likes: number;
  comments: number;
  aiAnalysis?: string;
  analysisStyle?: 'jungian' | 'freudian' | 'emotional' | 'general';
  analysisCreatedAt?: string;
  generatedImage?: string;
  imagePrompt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface AIImageGeneration {
  prompt: string;
  imageUrl: string;
  createdAt: string;
}

export interface DreamAnalysisResult {
  dreamId: string;
  analysis: string;
  style: 'jungian' | 'freudian' | 'emotional' | 'general';
  createdAt: string;
  model: string;
}