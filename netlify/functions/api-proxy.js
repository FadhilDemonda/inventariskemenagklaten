exports.handler = async (event, context) => {
  // Ambil endpoint dari query parameter
  const endpoint = event.queryStringParameters.endpoint || '';
  const backendUrl = `https://backendinventarispakeko.infinityfree.me/api/${endpoint}`;
  
  try {
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
      },
      body: event.httpMethod !== 'GET' ? event.body : undefined
    });
    
    const data = await response.text();
    
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
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false,
        message: error.message 
      })
    };
  }
};