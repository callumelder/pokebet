/**
 * Supabase Configuration
 * Initialize Supabase client for authentication and database access
 */

const SUPABASE_URL = 'https://lesoinshzfnxvxrhscmx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlc29pbnNoemZueHZ4cmhzY214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTExODMsImV4cCI6MjA3NDg4NzE4M30.VgjvuObavIDraKgBL9ThaCJg2F4THit9x3Zp_Z6i7tA';

// Create Supabase client
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
