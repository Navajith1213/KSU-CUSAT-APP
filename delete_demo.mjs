import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteDemoData() {
  console.log('Deleting demo data from academic_resources...');
  
  // Try to delete all rows
  const { data, error } = await supabase
    .from('academic_resources')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition that matches all UUIDs
    
  if (error) {
    console.error('Error deleting data:', error);
  } else {
    console.log('Successfully deleted all demo data!');
  }
}

deleteDemoData();
