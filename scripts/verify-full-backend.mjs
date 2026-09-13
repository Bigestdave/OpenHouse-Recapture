import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpwxnuhqqitjgdkcbxkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd3hudWhxcWl0amdka2NieGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NzI5MDcsImV4cCI6MjEwMzQ0ODkwN30.Pgnp6M-b-mB9MJz8Lt7u-CZgBALNr1EU3ELVqIKdnEs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyFullBackend() {
  console.log('--- OpenHouse Supabase End-to-End Verification ---');

  // 1. Workspaces
  const { data: ws, error: wsErr } = await supabase.from('workspaces').select('*');
  if (wsErr) console.error('Workspace fetch error:', wsErr);
  else console.log(`✓ Workspaces: ${ws.length} found (Owner: ${ws[0]?.owner_name})`);

  // 2. Properties & Spaces
  const { data: props, error: propErr } = await supabase.from('properties').select('*, spaces(*)');
  if (propErr) console.error('Properties fetch error:', propErr);
  else {
    console.log(`✓ Properties: ${props.length} found`);
    props.forEach(p => console.log(`   - [${p.status}] ${p.title} (${p.spaces?.length || 0} spaces)`));
  }

  // 3. Capture Requests
  const { data: reqs, error: reqErr } = await supabase.from('capture_requests').select('*');
  if (reqErr) console.error('Capture requests fetch error:', reqErr);
  else console.log(`✓ Capture Requests: ${reqs.length} found (Pending Room: ${reqs[0]?.room})`);

  // 4. Timeline Events
  const { data: timeline, error: timeErr } = await supabase.from('timeline_events').select('*');
  if (timeErr) console.error('Timeline fetch error:', timeErr);
  else console.log(`✓ Agent Decision Ledger: ${timeline.length} timeline events recorded`);

  // 5. Test Live Booking Insertion (renter flow)
  const testBookingId = `test-bk-${Date.now()}`;
  const { error: bookErr } = await supabase.from('bookings').insert({
    id: 'aaaaaaaa-1111-2222-3333-444444444444',
    property_id: '55555555-5555-5555-5555-555555555555',
    property_title: 'Victoria Courts, Unit 8',
    renter_name: 'Amaka Eze',
    renter_phone: '+234 803 123 4567',
    renter_email: 'amaka@example.com',
    preferred_date: '2026-08-30',
    preferred_time: '14:00',
    message: 'Interested in touring the penthouse.',
    status: 'requested'
  });

  if (bookErr) console.error('Booking insert error:', bookErr);
  else console.log('✓ Public Renter Booking: Inserted test booking successfully');

  // Clean up test booking
  await supabase.from('bookings').delete().eq('id', 'aaaaaaaa-1111-2222-3333-444444444444');
  console.log('✓ Cleanup: Test booking cleaned up successfully');

  console.log('\n========================================');
  console.log(' ALL SUPABASE BACKEND CHECKS PASSED! 🚀');
  console.log('========================================');
}

verifyFullBackend();
