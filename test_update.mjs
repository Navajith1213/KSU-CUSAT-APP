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

async function testUpdate() {
  const { data, error } = await supabase
    .from('complaints')
    .update({ status: 'Submitted' })
    .eq('id', '78906515-1ea8-4744-bae5-7b6946b31c88')
    .select();
  console.log(data, error);
}

testUpdate();
