const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('schema_dump.json', 'utf8'));

const tables = Object.keys(schema.definitions || {});
console.log('--- TABLES / VIEWS ---');
tables.forEach(t => {
  const props = schema.definitions[t].properties || {};
  console.log(`- ${t}:`);
  Object.keys(props).forEach(p => {
    console.log(`    ${p}: ${props[p].type} ${props[p].format ? '('+props[p].format+')' : ''} ${props[p].description ? '- ' + props[p].description : ''}`);
  });
});
