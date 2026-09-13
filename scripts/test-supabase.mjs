import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpwxnuhqqitjgdkcbxkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd3hudWhxcWl0amdka2NieGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NzI5MDcsImV4cCI6MjEwMzQ0ODkwN30.Pgnp6M-b-mB9MJz8Lt7u-CZgBALNr1EU3ELVqIKdnEs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('properties').select('id, title, status');
    if (error) {
      console.log('Error querying properties table:', error.message, error.code);
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('STATUS: The SQL schema has NOT been executed yet in the Supabase SQL Editor.');
      }
    } else {
      console.log('STATUS: Successfully connected to Supabase! Found properties:', data?.length ?? 0);
      if (data && data.length > 0) {
        console.log('Sample property:', data[0]);
      }
    }
  } catch (err) {
    console.error('Connection exception:', err);
  }
}

test();
