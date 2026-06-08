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

async function checkComplaints() {
  console.log('Fetching complaints...');
  const { data, error } = await supabase.from('complaints').select('*').limit(1);
  console.log(data, error);
  
  if (data && data.length > 0) {
    const item = data[0];
    console.log('Attempting to update complaint:', item.id);
    const { error: updateError } = await supabase
      .from('complaints')
      .update({ status: 'Resolved' })
      .eq('id', item.id);
    console.log('Update Error:', updateError);
  }
}

checkComplaints();
