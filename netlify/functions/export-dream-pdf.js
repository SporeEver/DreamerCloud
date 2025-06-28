// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { dream, includeImage = true, includeAnalysis = true } = JSON.parse(event.body);

    if (!dream) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Dream data is required' }),
      };
    }

    // Generate HTML content for PDF
    const htmlContent = generateDreamHTML(dream, includeImage, includeAnalysis);

    // Since we can't use external PDF libraries in Netlify functions,
    // we'll return the HTML content that can be converted to PDF on the client side
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        htmlContent: htmlContent,
        filename: `dream-${dream.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      }),
    };

  } catch (error) {
    console.error('PDF export error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Failed to generate PDF content',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
    };
  }
};

function generateDreamHTML(dream, includeImage, includeAnalysis) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAnalysisStyleLabel = (style) => {
    const styles = {
      jungian: 'Jungian',
      freudian: 'Freudian',
      emotional: 'Emotional',
      general: 'General'
    };
    return styles[style] || 'General';
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dream Journal - ${dream.title}</title>
    <style>
        @page {
            margin: 1in;
            size: A4;
        }
        
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #6366f1;
            font-size: 2.5em;
            margin: 0;
            font-weight: bold;
        }
        
        .header .subtitle {
            color: #666;
            font-style: italic;
            margin-top: 10px;
        }
        
        .dream-meta {
            background: #f8fafc;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #6366f1;
        }
        
        .dream-meta h2 {
            color: #1e293b;
            margin-top: 0;
            font-size: 1.8em;
        }
        
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
        }
        
        .meta-label {
            font-weight: bold;
            color: #475569;
            margin-right: 10px;
        }
        
        .meta-value {
            color: #1e293b;
        }
        
        .mood-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            text-transform: capitalize;
        }
        
        .mood-peaceful { background: #dcfce7; color: #166534; }
        .mood-exciting { background: #fed7aa; color: #9a3412; }
        .mood-scary { background: #fecaca; color: #991b1b; }
        .mood-strange { background: #e9d5ff; color: #7c3aed; }
        .mood-romantic { background: #fce7f3; color: #be185d; }
        .mood-sad { background: #dbeafe; color: #1e40af; }
        
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .tag {
            background: #e2e8f0;
            color: #475569;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.85em;
        }
        
        .content-section {
            margin-bottom: 30px;
        }
        
        .content-section h3 {
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.4em;
        }
        
        .dream-content {
            background: #fefefe;
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            font-size: 1.1em;
            line-height: 1.8;
        }
        
        .dream-image {
            text-align: center;
            margin: 30px 0;
        }
        
        .dream-image img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .image-caption {
            font-style: italic;
            color: #666;
            margin-top: 10px;
            font-size: 0.9em;
        }
        
        .analysis-section {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #8b5cf6;
        }
        
        .analysis-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .analysis-icon {
            width: 24px;
            height: 24px;
            margin-right: 10px;
            color: #8b5cf6;
        }
        
        .analysis-style {
            background: #8b5cf6;
            color: white;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.85em;
            font-weight: bold;
            margin-left: 10px;
        }
        
        .analysis-content {
            white-space: pre-line;
            line-height: 1.7;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        
        .footer .logo {
            color: #6366f1;
            font-weight: bold;
            font-size: 1.1em;
        }
        
        @media print {
            body {
                background: white !important;
            }
            
            .header {
                page-break-after: avoid;
            }
            
            .content-section {
                page-break-inside: avoid;
            }
            
            .analysis-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>DreamerCloud</h1>
        <div class="subtitle">AI-Powered Dream Journal</div>
    </div>
    
    <div class="dream-meta">
        <h2>${dream.title}</h2>
        <div class="meta-grid">
            <div class="meta-item">
                <span class="meta-label">Date:</span>
                <span class="meta-value">${formatDate(dream.created_at)}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Dreamer:</span>
                <span class="meta-value">${dream.username}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">Mood:</span>
                <span class="mood-badge mood-${dream.mood}">${dream.mood}</span>
            </div>
            ${dream.tags && dream.tags.length > 0 ? `
            <div class="meta-item">
                <span class="meta-label">Tags:</span>
                <div class="tags">
                    ${dream.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    </div>
    
    <div class="content-section">
        <h3>Dream Description</h3>
        <div class="dream-content">
            ${dream.content.replace(/\n/g, '<br>')}
        </div>
    </div>
    
    ${includeImage && (dream.image_url || dream.generated_image) ? `
    <div class="content-section">
        <h3>Dream Visualization</h3>
        <div class="dream-image">
            <img src="${dream.image_url || dream.generated_image}" alt="AI generated dream art" />
            ${dream.image_prompt ? `
            <div class="image-caption">
                AI Generated Art: ${dream.image_prompt}
            </div>
            ` : ''}
        </div>
    </div>
    ` : ''}
    
    ${includeAnalysis && dream.analysis ? `
    <div class="content-section">
        <h3>Dream Analysis</h3>
        <div class="analysis-section">
            <div class="analysis-header">
                <svg class="analysis-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path>
                </svg>
                <span>AI-Powered Analysis</span>
                <span class="analysis-style">${getAnalysisStyleLabel(dream.analysis_style)}</span>
            </div>
            <div class="analysis-content">${dream.analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
        </div>
    </div>
    ` : ''}
    
    <div class="footer">
        <div class="logo">DreamerCloud</div>
        <div>AI-Powered Dream Journal • Generated on ${formatDate(new Date().toISOString())}</div>
        <div style="margin-top: 10px;">
            <span>Powered by Pica OneTool • Built with Bolt.new</span>
        </div>
    </div>
</body>
</html>`;
}