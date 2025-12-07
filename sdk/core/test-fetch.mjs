// Test if fetch is available
console.log('fetch available:', typeof fetch);

// Try direct fetch to Nominatim
const url = 'https://nominatim.openstreetmap.org/search?q=Tokyo&format=json&limit=1';
console.log('Fetching:', url);

try {
  const response = await fetch(url, {
    headers: {
      'User-Agent': '@vey/core geocoding client',
    },
  });
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  
  if (response.ok) {
    const data = await response.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } else {
    console.log('Response not ok');
  }
} catch (error) {
  console.error('Fetch error:', error.message);
  console.error('Error stack:', error.stack);
}
