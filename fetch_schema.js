require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function fetchSchema() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    const res = await fetch(url);
    const data = await res.json();
    fs.writeFileSync('schema_dump.json', JSON.stringify(data, null, 2));
    console.log('Schema saved to schema_dump.json');
  } catch (error) {
    console.error('Failed to fetch schema:', error);
  }
}

fetchSchema();
