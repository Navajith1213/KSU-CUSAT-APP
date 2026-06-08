import fs from 'fs';
import {
  defaultEvents,
  defaultBoysPGs,
  defaultGirlsPGs,
  defaultHostels,
  defaultFoodSpots,
  defaultRestaurants,
  defaultAmenities,
  defaultClubs,
  defaultContacts
} from './src/data/defaultData.js';

const tables = [
  { name: 'events', data: defaultEvents },
  { name: 'boys_pgs', data: defaultBoysPGs },
  { name: 'girls_pgs', data: defaultGirlsPGs },
  { name: 'hostels', data: defaultHostels },
  { name: 'food_spots', data: defaultFoodSpots },
  { name: 'restaurants', data: defaultRestaurants },
  { name: 'amenities', data: defaultAmenities },
  { name: 'clubs', data: defaultClubs },
  { name: 'contacts', data: defaultContacts }
];

let sql = '-- Data Migration Script\n\n';

for (const table of tables) {
  if (table.data.length === 0) continue;
  
  sql += `-- Inserting into ${table.name}\n`;
  for (const item of table.data) {
    // Escape single quotes by doubling them in SQL
    const jsonStr = JSON.stringify(item).replace(/'/g, "''");
    sql += `INSERT INTO ${table.name} (data) VALUES ('${jsonStr}'::jsonb);\n`;
  }
  sql += '\n';
}

fs.writeFileSync('c:\\Users\\lenovo\\.gemini\\antigravity\\brain\\e3cc5d2d-ebcf-46f2-b0d6-a801892860db\\migrate_data.sql', sql);
console.log('SQL generated successfully.');
