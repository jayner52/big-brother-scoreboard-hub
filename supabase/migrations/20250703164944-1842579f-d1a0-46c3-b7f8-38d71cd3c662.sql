-- Extend contestants table for AI-generated profile data
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS relationship_status TEXT;
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS family_info TEXT;
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS physical_description JSONB DEFAULT '{}';
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS personality_traits JSONB DEFAULT '{}';
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS gameplay_strategy JSONB DEFAULT '{}';
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS backstory JSONB DEFAULT '{}';
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}';