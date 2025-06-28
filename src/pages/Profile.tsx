import React from 'react';
import { User, Calendar, BookOpen, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDreams } from '../hooks/useDreams';
import DreamCard from '../components/Dreams/DreamCard';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getUserDreams, loading } = useDreams();

  if (!user) return null;

  const userDreams = getUserDreams(user.id);
  const publicDreams = userDreams.filter(dream => dream.isPublic);
  const privateDreams = userDreams.filter(dream => !dream.isPublic);
  
  const totalLikes = userDreams.reduce((sum, dream) => sum + dream.likes, 0);
  const totalComments = userDreams.reduce((sum, dream) => sum + dream.comments, 0);

  const moodStats = userDreams.reduce((acc, dream) => {
    acc[dream.mood] = (acc[dream.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostCommonMood = Object.entries(moodStats).sort(([,a], [,b]) => b - a)[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">{user.username}</h1>
              <p className="text-gray-300 mb-4">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{userDreams.length} dreams</span>
                </div>
                {mostCommonMood && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Most {mostCommonMood[0]} dreams</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Dreams</p>
                <p className="text-2xl font-bold text-white">{userDreams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Public Dreams</p>
                <p className="text-2xl font-bold text-white">{publicDreams.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-red-500/20 p-3 rounded-lg">
                <Heart className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Total Likes</p>
                <p className="text-2xl font-bold text-white">{totalLikes}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">Comments</p>
                <p className="text-2xl font-bold text-white">{totalComments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Distribution */}
        {Object.keys(moodStats).length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Dream Mood Distribution</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(moodStats).map(([mood, count]) => (
                <div key={mood} className="text-center">
                  <div className="bg-gray-700/50 rounded-lg p-4 mb-2">
                    <p className="text-2xl font-bold text-white">{count}</p>
                  </div>
                  <p className="text-sm text-gray-300 capitalize">{mood}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Dreams */}
        {userDreams.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Recent Dreams</h2>
            <div className="grid gap-6">
              {userDreams.slice(0, 5).map((dream) => (
                <DreamCard key={dream.id} dream={dream} />
              ))}
            </div>
            {userDreams.length > 5 && (
              <div className="text-center">
                <p className="text-gray-400">
                  View all dreams in your{' '}
                  <a href="/journal" className="text-purple-400 hover:text-purple-300">
                    Dream Journal
                  </a>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 max-w-2xl mx-auto">
              <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">No Dreams Yet</h2>
              <p className="text-gray-300 mb-8">
                Start recording your dreams to see your profile come to life with insights and statistics.
              </p>
              <a
                href="/journal"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                <BookOpen className="h-5 w-5" />
                <span>Start Your Journal</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;