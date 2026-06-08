import { createClient } from '@supabase/supabase-js';
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

const envFile = fs.readFileSync('.env', 'utf-8');
let supabaseUrl = '';
let supabaseKey = ''; // We will need the Service Role Key to bypass RLS, OR we can use the anon key but login as admin.
// Actually, our RLS says "Master Admin can modify" checking JWT email.
// A Node script using anon key can't bypass that without logging in.
// Alternatively, we can use the Service Role Key if they have it, but they only have VITE_SUPABASE_ANON_KEY in .env.
// Let's just login as the Master Admin!

envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function migrateData() {
  console.log('Logging in as Master Admin...');
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: 'navajith1122@gmail.com',
    password: 'admin123' // Replace if changed
  });

  if (loginError) {
    console.error('Failed to login:', loginError.message);
    return;
  }
  
  console.log('Logged in successfully. Migrating data...');

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

  for (const table of tables) {
    if (table.data.length === 0) {
      console.log(`Skipping ${table.name} (no data)`);
      continue;
    }
    
    console.log(`Migrating ${table.data.length} items to ${table.name}...`);
    
    // Clear existing data (optional, but good for idempotency)
    // await supabase.from(table.name).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert new data
    const rows = table.data.map(item => ({ data: item }));
    const { error } = await supabase.from(table.name).insert(rows);
    
    if (error) {
      console.error(`Error migrating ${table.name}:`, error.message);
    } else {
      console.log(`Successfully migrated ${table.name}.`);
    }
  }

  console.log('Migration complete!');
}

migrateData();
