import { useState, useEffect } from 'react';
import { Dream } from '../types';

export const useDreams = () => {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with sample dreams if none exist
    const storedDreams = localStorage.getItem('dreamercloud_dreams');
    if (!storedDreams) {
      initializeSampleDreams();
    } else {
      setDreams(JSON.parse(storedDreams));
    }
    setLoading(false);
  }, []);

  const initializeSampleDreams = () => {
    const sampleDreams: Dream[] = [
      {
        id: '1',
        userId: 'sample1',
        username: 'DreamWeaver',
        title: 'Flying Over the Ocean',
        content: 'I found myself soaring above crystal-clear waters, the wind carrying me effortlessly. Below, I could see dolphins dancing in the waves, their silver bodies catching the golden sunlight. The freedom was incredible.',
        mood: 'peaceful',
        tags: ['flying', 'ocean', 'dolphins', 'freedom'],
        isPublic: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        likes: 23,
        comments: 5,
        aiAnalysis: 'This dream suggests a desire for freedom and emotional clarity. Flying often represents liberation from constraints.',
      },
      {
        id: '2',
        userId: 'sample2',
        username: 'StarGazer',
        title: 'The Cosmic Library',
        content: 'I wandered through an infinite library where each book contained the dreams of different people. The shelves stretched to the stars, glowing with soft ethereal light. I opened one book and experienced someone else\'s childhood memory.',
        mood: 'strange',
        tags: ['library', 'books', 'stars', 'memories'],
        isPublic: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        likes: 34,
        comments: 8,
      },
      {
        id: '3',
        userId: 'sample3',
        username: 'MoonChild',
        title: 'Dancing in the Rain Forest',
        content: 'I was dancing with fireflies in a mystical rainforest. Each step I took made flowers bloom beneath my feet. The trees were singing in harmony, creating the most beautiful melody I\'ve ever heard.',
        mood: 'exciting',
        tags: ['dancing', 'rainforest', 'fireflies', 'music'],
        isPublic: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        likes: 19,
        comments: 3,
      },
      {
        id: '4',
        userId: 'sample4',
        username: 'DreamCatcher',
        title: 'The Floating City',
        content: 'I discovered a city suspended in the clouds, connected by rainbow bridges. The architecture was impossible - buildings that bent like liquid while remaining solid. The residents were kind beings of light.',
        mood: 'strange',
        tags: ['city', 'clouds', 'rainbows', 'architecture'],
        isPublic: true,
        createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        likes: 42,
        comments: 12,
      },
      {
        id: '5',
        userId: 'sample5',
        username: 'NightOwl',
        title: 'Speaking with My Grandmother',
        content: 'I had a beautiful conversation with my grandmother who passed away years ago. We sat in her old garden, surrounded by roses that never stopped blooming. She told me she was proud of who I had become.',
        mood: 'peaceful',
        tags: ['family', 'grandmother', 'garden', 'roses'],
        isPublic: true,
        createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        likes: 67,
        comments: 15,
      },
    ];

    localStorage.setItem('dreamercloud_dreams', JSON.stringify(sampleDreams));
    setDreams(sampleDreams);
  };

  const addDream = (dream: Omit<Dream, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    const newDream: Dream = {
      ...dream,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    const updatedDreams = [newDream, ...dreams];
    setDreams(updatedDreams);
    localStorage.setItem('dreamercloud_dreams', JSON.stringify(updatedDreams));

    // Update user's dream count
    const user = JSON.parse(localStorage.getItem('dreamercloud_user') || '{}');
    if (user.id) {
      user.dreamCount = (user.dreamCount || 0) + 1;
      localStorage.setItem('dreamercloud_user', JSON.stringify(user));
    }
  };

  const updateDream = (dreamId: string, updates: Partial<Dream>) => {
    const updatedDreams = dreams.map(dream => 
      dream.id === dreamId ? { ...dream, ...updates } : dream
    );
    setDreams(updatedDreams);
    localStorage.setItem('dreamercloud_dreams', JSON.stringify(updatedDreams));
  };

  const getUserDreams = (userId: string) => {
    return dreams.filter(dream => dream.userId === userId);
  };

  const getPublicDreams = () => {
    return dreams.filter(dream => dream.isPublic).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getDreamById = (dreamId: string) => {
    return dreams.find(dream => dream.id === dreamId);
  };

  return {
    dreams,
    loading,
    addDream,
    updateDream,
    getUserDreams,
    getPublicDreams,
    getDreamById,
  };
};