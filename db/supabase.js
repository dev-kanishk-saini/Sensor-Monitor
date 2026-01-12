import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
// OR SUPABASE_ANON_KEY (service role preferred for backend)

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Supabase env variables missing');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false
    }
  }
);
