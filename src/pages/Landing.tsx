import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Sparkles, Users, BookOpen, Zap, Star, Mic, Palette, Brain, Settings, Sliders } from 'lucide-react';
import StarField from '../components/Layout/StarField';

const Landing: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Dream Journal',
      description: 'Record and organize your dreams with our intuitive journal interface',
    },
    {
      icon: Mic,
      title: 'Voice Recording',
      description: 'Speak your dreams naturally with ElevenLabs speech-to-text technology',
    },
    {
      icon: Palette,
      title: 'Custom FLUX.1 Art',
      description: 'Create personalized dream art with customizable styles, formats, and quality via Pica OneTool',
    },
    {
      icon: Settings,
      title: 'Advanced Parameters',
      description: 'Fine-tune your art generation with aspect ratios, output formats, and quality settings',
    },
    {
      icon: Brain,
      title: 'Dream Analysis',
      description: 'Get deep psychological insights into your dreams with AI-powered analysis',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Share your dreams and discover others\' experiences in our supportive community',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      <StarField />
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Cloud className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            DreamerCloud
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your Dreams,
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Customized
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Capture, analyze, and visualize your dreams with an AI-powered platform featuring voice recording,
            customizable FLUX.1 art generation with advanced parameters, and deep psychological analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Start Dreaming
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-purple-500 text-purple-300 hover:bg-purple-500/10 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Floating Elements Animation */}
        <div className="absolute top-20 left-10 animate-float">
          <Star className="h-6 w-6 text-purple-400 opacity-60" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Sparkles className="h-8 w-8 text-blue-400 opacity-50" />
        </div>
        <div className="absolute bottom-40 left-20 animate-float-slow">
          <Cloud className="h-10 w-10 text-purple-300 opacity-40" />
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-gray-900/50 backdrop-blur-sm py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Unlock the Power of Your Dreams
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to capture, understand, visualize, and connect through your dreams with full customization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Art Generation Showcase */}
      <div className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Palette className="h-16 w-16 text-purple-400" />
              <Sliders className="h-12 w-12 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Customizable FLUX.1 Dream Art
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Create personalized dream artwork with advanced customization options. Choose from 6 art styles,
              multiple aspect ratios (16:9, 1:1, 9:16), output formats (PNG, WebP, JPEG), and quality settings.
              Our Pica OneTool integration intelligently routes to the best models for optimal results.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-purple-500/20 px-3 py-2 rounded-full">
                <div className="text-purple-300 font-medium">6 Art Styles</div>
                <div className="text-purple-200 text-xs">Realistic to Surreal</div>
              </div>
              <div className="bg-blue-500/20 px-3 py-2 rounded-full">
                <div className="text-blue-300 font-medium">Custom Ratios</div>
                <div className="text-blue-200 text-xs">16:9, 1:1, 9:16, 4:3</div>
              </div>
              <div className="bg-pink-500/20 px-3 py-2 rounded-full">
                <div className="text-pink-300 font-medium">Multiple Formats</div>
                <div className="text-pink-200 text-xs">PNG, WebP, JPEG</div>
              </div>
              <div className="bg-green-500/20 px-3 py-2 rounded-full">
                <div className="text-green-300 font-medium">Quality Control</div>
                <div className="text-green-200 text-xs">Standard to Ultra HD</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dream Analysis Showcase */}
      <div className="relative z-10 py-24 bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 mb-8">
            <Brain className="h-16 w-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              AI-Powered Dream Analysis
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Discover the hidden meanings in your dreams with advanced AI analysis. Our system provides
              deep psychological insights, symbolic interpretations, and personal growth guidance based
              on your unique dream experiences and custom art preferences.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-300">
              <span className="bg-blue-500/20 px-3 py-1 rounded-full">Psychological Insights</span>
              <span className="bg-blue-500/20 px-3 py-1 rounded-full">Symbolic Analysis</span>
              <span className="bg-blue-500/20 px-3 py-1 rounded-full">Personal Growth</span>
              <span className="bg-blue-500/20 px-3 py-1 rounded-full">Visual Correlation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Technology Highlight */}
      <div className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 mb-8">
            <Mic className="h-16 w-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Powered by ElevenLabs Voice Technology
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Experience the future of dream journaling with cutting-edge speech-to-text technology.
              Simply speak your dreams naturally, and watch them transform into beautifully formatted text
              ready for custom art generation.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-green-300">
              <span className="bg-green-500/20 px-3 py-1 rounded-full">Natural Speech Recognition</span>
              <span className="bg-green-500/20 px-3 py-1 rounded-full">Real-time Transcription</span>
              <span className="bg-green-500/20 px-3 py-1 rounded-full">High Accuracy</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Customize Your Dream World?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of dreamers creating personalized art and discovering hidden meanings in their sleep
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Start Your Custom Journey
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/80 backdrop-blur-sm py-8 border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Cloud className="h-6 w-6 text-purple-400" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                DreamerCloud
              </span>
            </div>
            <div className="text-gray-400 text-sm text-center md:text-right">
              <p className="mb-1">
                Voice technology powered by{' '}
                <a
                  href="https://elevenlabs.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  ElevenLabs
                </a>
                {' • '}
                Custom AI art via{' '}
                <a
                  href="https://pica.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Pica OneTool
                </a>
                {' & '}
                <a
                  href="https://replicate.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Replicate FLUX.1
                </a>
              </p>
              <p>
                Built with{' '}
                <a
                  href="https://bolt.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Bolt.new
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;