import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpwxnuhqqitjgdkcbxkq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwd3hudWhxcWl0amdka2NieGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NzI5MDcsImV4cCI6MjEwMzQ0ODkwN30.Pgnp6M-b-mB9MJz8Lt7u-CZgBALNr1EU3ELVqIKdnEs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateToUSProperties() {
  console.log('Updating Supabase database with US properties...');

  // 1. Workspace
  await supabase.from('workspaces').upsert({
    id: '00000000-0000-0000-0000-000000000001',
    name: 'OpenHouse Premier Workspace',
    owner_name: 'David Sterling',
    owner_email: 'david@openhouse.app',
    work_type: 'agency',
    portfolio_size: '25–100 active properties',
    primary_market: 'New York & Los Angeles',
    team_size: '5–10 people',
    listing_source: 'webhook',
    require_approval: true,
    default_visibility: 'unlisted',
  });

  // 2. Properties
  const properties = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      workspace_id: '00000000-0000-0000-0000-000000000001',
      title: '740 Park Avenue, Apt 12B',
      address: '740 Park Avenue, Upper East Side, New York, NY 10021',
      type: '3-Bed Luxury Penthouse',
      bedrooms: 3,
      bathrooms: 3,
      price: '$18,500 / month',
      description: 'Iconic pre-war architectural masterpiece with private elevator landing, grand entertaining gallery, wood-burning fireplace, and private terrace.',
      status: 'needs_recapture',
      cover_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      workspace_id: '00000000-0000-0000-0000-000000000001',
      title: '1048 Ocean Drive',
      address: '1048 Ocean Drive, South Beach, Miami, FL 33139',
      type: '5-Bed Waterfront Villa',
      bedrooms: 5,
      bathrooms: 6,
      price: '$35,000 / month',
      description: 'Modern waterfront sanctuary with infinity-edge pool, private dock, chef kitchen, and panoramic rooftop sunset deck.',
      status: 'preparing',
      cover_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      workspace_id: '00000000-0000-0000-0000-000000000001',
      title: '452 Beverly Glen Blvd',
      address: '452 Beverly Glen Blvd, Bel Air, Los Angeles, CA 90077',
      type: '4-Bed Architectural Estate',
      bedrooms: 4,
      bathrooms: 5,
      price: '$24,000 / month',
      description: 'Contemporary estate featuring floor-to-ceiling glass walls, terrazzo floors, smart home automation, and tranquil canyon views.',
      status: 'quality_check',
      cover_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      workspace_id: '00000000-0000-0000-0000-000000000001',
      title: '880 Lake Washington Blvd',
      address: '880 Lake Washington Blvd, Seattle, WA 98122',
      type: '3-Bed Modern Craftsman',
      bedrooms: 3,
      bathrooms: 4,
      price: '$12,500 / month',
      description: 'Lakeside residence with panoramic Mount Rainier views, private moorage, open-concept living, and custom walnut finishes.',
      status: 'ready_for_review',
      cover_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      workspace_id: '00000000-0000-0000-0000-000000000001',
      title: '2100 Ocean Way, Penthouse 4',
      address: '2100 Ocean Way, Laguna Beach, CA 92651',
      type: '4-Bed Coastal Penthouse',
      bedrooms: 4,
      bathrooms: 5,
      price: '$45,000 / month',
      description: 'Unrivaled bluff-top oceanfront penthouse with panoramic Pacific views, private elevator access, and wraparound ocean terrace.',
      status: 'live',
      experience_url: '/view/55555555-5555-5555-5555-555555555555',
      cover_image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  for (const prop of properties) {
    await supabase.from('properties').upsert(prop);
  }

  // 3. Update Capture Request
  await supabase.from('capture_requests').upsert({
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    property_id: '11111111-1111-1111-1111-111111111111',
    property_title: '740 Park Avenue, Apt 12B',
    room: 'Private Terrace',
    reason: 'The terrace is listed, but doorway transition coverage from the living room is incomplete.',
    instructions: 'Record one steady 15-second walkthrough stepping from the living room through the terrace French doors.',
    estimated_time: '15 seconds',
    status: 'awaiting_capture',
    recipient_name: 'David Sterling',
    recipient_phone: '+1 (555) 234-5678',
    recipient_email: 'david@openhouse.app',
    capture_url: '/capture/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  });

  console.log('✓ Successfully synchronized live Supabase database with US properties!');
}

updateToUSProperties();
