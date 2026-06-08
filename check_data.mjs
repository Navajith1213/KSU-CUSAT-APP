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

async function checkData() {
  console.log('Checking data in academic_resources...');
  
  const { data, error } = await supabase
    .from('academic_resources')
    .select('*');
    
  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log('Data found:', data.length, 'rows');
    console.log(data);
  }
}

checkData();
