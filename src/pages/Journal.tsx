import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Filter, Search } from 'lucide-react';
import { useDreams } from '../hooks/useDreams';
import { useAuth } from '../hooks/useAuth';
import DreamCard from '../components/Dreams/DreamCard';

const Journal: React.FC = () => {
  const { user } = useAuth();
  const { getUserDreams, loading } = useDreams();
  const [searchTerm, setSearchTerm] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');

  const userDreams = user ? getUserDreams(user.id) : [];

  const filteredDreams = userDreams.filter(dream => {
    const matchesSearch = dream.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dream.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dream.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesMood = moodFilter === 'all' || dream.mood === moodFilter;
    
    return matchesSearch && matchesMood;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
          <p className="text-gray-300">Loading your dreams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-4xl font-bold text-white">Your Dream Journal</h1>
              <p className="text-gray-300">
                {userDreams.length} {userDreams.length === 1 ? 'dream' : 'dreams'} recorded
              </p>
            </div>
          </div>
          <Link
            to="/record-dream"
            className="mt-4 md:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            <BookOpen className="h-4 w-4" />
            <span>New Entry</span>
          </Link>
        </div>

        {userDreams.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 max-w-2xl mx-auto">
              <BookOpen className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Start Your Dream Journey</h2>
              <p className="text-gray-300 mb-8 leading-relaxed">
                Your dream journal is empty. Begin capturing your nocturnal adventures and discover
                patterns, meanings, and insights hidden in your dreams.
              </p>
              <Link
                to="/record-dream"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                <BookOpen className="h-5 w-5" />
                <span>Record Your First Dream</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search your dreams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={moodFilter}
                    onChange={(e) => setMoodFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Moods</option>
                    <option value="peaceful">Peaceful</option>
                    <option value="exciting">Exciting</option>
                    <option value="scary">Scary</option>
                    <option value="strange">Strange</option>
                    <option value="romantic">Romantic</option>
                    <option value="sad">Sad</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dreams List */}
            <div className="space-y-6">
              {filteredDreams.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    No dreams match your search criteria.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredDreams.map((dream) => (
                    <DreamCard key={dream.id} dream={dream} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Journal;