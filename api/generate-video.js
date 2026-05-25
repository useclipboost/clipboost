const isTestKey = apiKey.startsWith('sk_test_');
const baseUrl = isTestKey ? 'https://api.shotstack.io/stage' : 'https://api.shotstack.io/v1';
