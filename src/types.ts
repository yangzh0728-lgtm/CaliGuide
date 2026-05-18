export type Page = 'home' | 'guide' | 'forum' | 'chatbot' | 'profile';

export interface Post {
  id: string;
  author: string;
  avatar: string;
  time: string;
  category: string;
  title: string;
  excerpt: string;
  comments: number;
  views: string;
}

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}
