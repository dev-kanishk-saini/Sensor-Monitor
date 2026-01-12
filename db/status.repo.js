import { supabase } from './supabase.js';

/**
 * Insert presence/absence state
 */
export async function insertStatus(state) {
  const { error } = await supabase
    .from('Status')
    .insert([
      {
        state,
        //created_at: new Date()
      }
    ]);

  if (error) {
    console.error('❌ Failed to insert status:', error);
    return false;
  }

  return true;
}

/**
 * (Optional) Get latest status
 */
export async function getLatestStatus() {
  const { data, error } = await supabase
    .from('Status')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('❌ Failed to fetch status:', error);
    return null;
  }

  return data;
}
