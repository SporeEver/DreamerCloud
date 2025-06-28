import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useDreams } from '../hooks/useDreams';
import { useAuth } from '../hooks/useAuth';
import DreamForm from '../components/Forms/DreamForm';

const RecordDream: React.FC = () => {
  const { user } = useAuth();
  const { addDream } = useDreams();
  const navigate = useNavigate();

  const handleDreamSubmit = (dreamData: Parameters<typeof addDream>[0]) => {
    addDream(dreamData);
    // Navigate back to journal after successful submission
    navigate('/journal');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/50 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Record New Dream</h1>
              <p className="text-gray-300">
                Capture your dream with voice recording and AI-powered features
              </p>
            </div>
          </div>
        </div>

        {/* Dream Form */}
        <DreamForm onSubmit={handleDreamSubmit} />
      </div>
    </div>
  );
};

export default RecordDream;