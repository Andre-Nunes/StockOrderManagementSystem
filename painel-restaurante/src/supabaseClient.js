import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxjdmhyfvlokqqxynfgf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4amRtaHlmdmxva3FxeHluZmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NjU1NzAsImV4cCI6MjA2NTA0MTU3MH0.YL6KQ_zIH3VVZYJtt3u40LO0x9zsMadkZkccBIZYZyI'

export const supabase = createClient(supabaseUrl, supabaseKey)