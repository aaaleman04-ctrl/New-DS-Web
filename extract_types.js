const fs = require('fs');
const jsonStr = fs.readFileSync('src/lib/database.types.ts', 'utf8');
const data = JSON.parse(jsonStr);
fs.writeFileSync('src/lib/database.types.ts', data.types);
console.log('Types extracted successfully');
