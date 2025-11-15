-- Seed messaging data for Rainy Day's Inn
-- Run this with: psql -U tailtown_user -d tailtown_db -f seed-messaging-sql.sql

\set tenant_id '06d09e08-fe1f-4feb-89f8-c3b619026ba9'

-- Get staff IDs (we'll use the first 3)
\set staff1 (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 0)
\set staff2 (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 1)
\set staff3 (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 2)

-- Create General channel
INSERT INTO communication_channels (id, tenant_id, name, display_name, description, type, icon, color, is_default, is_archived, allow_threads, allow_reactions, allow_file_uploads, created_by_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  :'tenant_id',
  'general',
  'General',
  'General team discussions',
  'PUBLIC',
  '💬',
  '#4A90E2',
  true,
  false,
  true,
  true,
  true,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  NOW(),
  NOW()
) ON CONFLICT (tenant_id, name) DO NOTHING;

-- Create Announcements channel
INSERT INTO communication_channels (id, tenant_id, name, display_name, description, type, icon, color, is_default, is_archived, allow_threads, allow_reactions, allow_file_uploads, created_by_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  :'tenant_id',
  'announcements',
  'Announcements',
  'Important facility announcements',
  'PUBLIC',
  '📢',
  '#F5A623',
  true,
  false,
  true,
  true,
  true,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  NOW(),
  NOW()
) ON CONFLICT (tenant_id, name) DO NOTHING;

-- Create Shift Handoff channel
INSERT INTO communication_channels (id, tenant_id, name, display_name, description, type, icon, color, is_default, is_archived, allow_threads, allow_reactions, allow_file_uploads, created_by_id, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  :'tenant_id',
  'shift-handoff',
  'Shift Handoff',
  'Share important info between shifts',
  'PUBLIC',
  '🔄',
  '#7ED321',
  false,
  false,
  true,
  true,
  true,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  NOW(),
  NOW()
) ON CONFLICT (tenant_id, name) DO NOTHING;

-- Add channel members (all staff to all channels)
INSERT INTO channel_members (id, channel_id, staff_id, role, is_muted, notification_level, joined_at)
SELECT 
  gen_random_uuid(),
  c.id,
  s.id,
  CASE WHEN s.id = (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1) THEN 'ADMIN' ELSE 'MEMBER' END,
  false,
  'ALL',
  NOW()
FROM communication_channels c
CROSS JOIN staff s
WHERE c.tenant_id = :'tenant_id' 
  AND s.tenant_id = :'tenant_id'
  AND c.name IN ('general', 'announcements', 'shift-handoff')
ON CONFLICT (channel_id, staff_id) DO NOTHING;

-- Add messages to General channel
INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  'Good morning team! Hope everyone has a great day today! 🌞',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '2 hours'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'general';

INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 1),
  'Morning! Ready for another busy day!',
  NOW() - INTERVAL '1 hour 45 minutes',
  NOW() - INTERVAL '1 hour 45 minutes'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'general';

INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  'Don''t forget we have a team meeting at 2pm today',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '30 minutes'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'general';

-- Add messages to Announcements channel
INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  '📢 Reminder: New cleaning protocols start Monday. Please review the updated checklist.',
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 hours'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'announcements';

INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  '🎉 Great news! We received excellent reviews this week. Keep up the amazing work!',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'announcements';

-- Add messages to Shift Handoff channel
INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  'Morning shift update: All pets fed and walked. Max in Suite 3 needs extra attention today - seems a bit anxious.',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '4 hours'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'shift-handoff';

INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1 OFFSET 1),
  'Thanks for the heads up! I''ll keep an eye on Max. Also, we''re running low on treats - added to shopping list.',
  NOW() - INTERVAL '3 hours 30 minutes',
  NOW() - INTERVAL '3 hours 30 minutes'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'shift-handoff';

INSERT INTO channel_messages (id, channel_id, sender_id, content, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM staff WHERE tenant_id = :'tenant_id' LIMIT 1),
  'Perfect! Also, Luna''s owner will pick her up around 4pm today.',
  NOW() - INTERVAL '15 minutes',
  NOW() - INTERVAL '15 minutes'
FROM communication_channels c
WHERE c.tenant_id = :'tenant_id' AND c.name = 'shift-handoff';

-- Show summary
SELECT 
  'Channels created' as status,
  COUNT(*) as count
FROM communication_channels
WHERE tenant_id = :'tenant_id';

SELECT 
  'Channel members added' as status,
  COUNT(*) as count
FROM channel_members cm
JOIN communication_channels c ON cm.channel_id = c.id
WHERE c.tenant_id = :'tenant_id';

SELECT 
  'Messages created' as status,
  COUNT(*) as count
FROM channel_messages cm
JOIN communication_channels c ON cm.channel_id = c.id
WHERE c.tenant_id = :'tenant_id';

\echo '✅ Messaging data seeded successfully!'
