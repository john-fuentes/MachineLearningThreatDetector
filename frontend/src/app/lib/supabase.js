// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase URL and Key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use your Supabase service role key

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
