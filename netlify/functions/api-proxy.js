const fetch = require('node-fetch');

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

  // Ambil endpoint dari query parameter
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
  
  // Ambil query parameters lainnya (untuk barang_id, dll)
  const queryParams = new URLSearchParams(event.queryStringParameters);
  queryParams.delete('endpoint'); // Hapus endpoint dari query params
  const queryString = queryParams.toString();
  const fullUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;
  
  console.log('Fetching:', fullUrl); // Debug log
  
  try {
    const response = await fetch(fullUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' ? event.body : undefined
    });
    
    const data = await response.text();
    
    console.log('Response status:', response.status); // Debug log
    console.log('Response data:', data.substring(0, 200)); // Debug log
    
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
    console.error('Error:', error); // Debug log
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false,
        message: error.message,
        stack: error.stack
      })
    };
  }
};