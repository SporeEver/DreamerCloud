import React, { useState } from 'react';
import { Share2, Download, Link as LinkIcon, Copy, Check, Loader2, FileText, Image, Brain, Calendar, X } from 'lucide-react';
import { Dream } from '../../types';

interface DreamShareExportProps {
  dream: Dream;
  userId: string;
  onClose?: () => void;
}

const DreamShareExport: React.FC<DreamShareExportProps> = ({ dream, userId, onClose }) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string>('');
  const [exportOptions, setExportOptions] = useState({
    includeImage: true,
    includeAnalysis: true
  });

  const createShare = async () => {
    setIsSharing(true);
    setShareError('');

    try {
      const response = await fetch('/.netlify/functions/create-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamId: dream.id,
          userId: userId,
          expiresInDays: 30 // Optional: set expiration
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share');
      }

      if (data.success) {
        setShareUrl(data.shareUrl);
      } else {
        throw new Error('Invalid response from share service');
      }
    } catch (error) {
      console.error('Share creation error:', error);
      setShareError(error instanceof Error ? error.message : 'Failed to create share');
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      const response = await fetch('/.netlify/functions/export-dream-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dream: dream,
          includeImage: exportOptions.includeImage,
          includeAnalysis: exportOptions.includeAnalysis
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate PDF');
      }

      if (data.success) {
        // Create a new window with the HTML content for PDF generation
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.htmlContent);
          printWindow.document.close();
          
          // Wait for content to load, then trigger print
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 500);
          };
        }
      } else {
        throw new Error('Invalid response from PDF service');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      setShareError(error instanceof Error ? error.message : 'Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Share & Export</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dream Info */}
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-white font-medium mb-1">{dream.title}</h4>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(dream.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="capitalize">{dream.mood}</div>
          </div>
        </div>

        {/* Share Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Share Dream</span>
          </h4>
          
          {!shareUrl ? (
            <div>
              <p className="text-gray-400 text-sm mb-4">
                Create a shareable link that others can view without signing up.
              </p>
              <button
                onClick={createShare}
                disabled={isSharing}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Share Link...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    <span>Create Share Link</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 text-sm mb-3">Share this link with others:</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Link expires in 30 days • Read-only access
              </p>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export as PDF</span>
          </h4>
          
          {/* Export Options */}
          <div className="space-y-3 mb-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={exportOptions.includeImage}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeImage: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <div className="flex items-center space-x-2">
                <Image className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Include AI-generated image</span>
              </div>
            </label>
            
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={exportOptions.includeAnalysis}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeAnalysis: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Include dream analysis</span>
              </div>
            </label>
          </div>

          <button
            onClick={exportToPDF}
            disabled={isExporting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {shareError && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
            <strong>Error:</strong> {shareError}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-700">
          <p className="text-gray-500 text-xs text-center">
            Shared dreams are publicly viewable but anonymous. 
            Only you can see the dreamer's identity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DreamShareExport;