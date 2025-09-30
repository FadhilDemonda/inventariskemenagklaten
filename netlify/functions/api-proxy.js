exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  const endpoint = event.queryStringParameters?.endpoint || '';
  
  if (!endpoint) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false,
        message: 'Endpoint parameter is required' 
      })
    };
  }

  const backendUrl = `https://backendinventarispakeko.infinityfree.me/api/${endpoint}`;
  
  // Ambil query parameters lainnya
  const queryParams = new URLSearchParams(event.queryStringParameters);
  queryParams.delete('endpoint');
  const queryString = queryParams.toString();
  const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;
  
  console.log('=== DEBUG INFO ===');
  console.log('Endpoint:', endpoint);
  console.log('Full URL:', fullUrl);
  console.log('Method:', event.httpMethod);
  
  try {
    const response = await fetch(fullUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Netlify-Function'
      },
      body: event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' ? event.body : undefined
    });
    
    const contentType = response.headers.get('content-type');
    const data = await response.text();
    
    console.log('Response Status:', response.status);
    console.log('Content-Type:', contentType);
    console.log('Response preview:', data.substring(0, 500));
    
    // Cek apakah response adalah HTML (error page)
    if (data.trim().startsWith('<') && data.includes('<!DOCTYPE') || data.includes('<html')) {
      return {
        statusCode: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          success: false,
          message: 'Backend returned HTML error page instead of JSON',
          debug: {
            url: fullUrl,
            status: response.status,
            preview: data.substring(0, 200)
          }
        })
      };
    }
    
    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: data
    };
  } catch (error) {
    console.error('Fetch error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false,
        message: error.message,
        url: fullUrl
      })
    };
  }
};