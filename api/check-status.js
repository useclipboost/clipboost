// api/check-status.js

export default async function handler(req, res) {
  // Allow the frontend to check status across domains if needed
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing tracker id parameter.' });
  }

  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key configuration missing.' });
  }

  try {
    const response = await fetch(`https://api.shotstack.io/v1/render/${id}`, {
      method: 'GET',
      headers: { 'x-api-key': apiKey }
    });

    const data = await response.json();
    
    return res.status(200).json({
      status: data.response?.status, // Will return 'queued', 'rendering', or 'done'
      url: data.response?.url || null
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
