CREATE TABLE IF NOT EXISTS family_groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_member TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS family_members (id TEXT PRIMARY KEY, family_id TEXT NOT NULL, nickname TEXT NOT NULL, role TEXT NOT NULL, token_hash TEXT NOT NULL, joined_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_fm_family ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_fm_token ON family_members(token_hash);
CREATE TABLE IF NOT EXISTS family_invites (id TEXT PRIMARY KEY, family_id TEXT NOT NULL, invite_code TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, max_uses INTEGER NOT NULL, used_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS family_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, family_id TEXT NOT NULL, sender_id TEXT NOT NULL, sender_name TEXT NOT NULL, message_type TEXT NOT NULL, message_content TEXT NOT NULL DEFAULT '', image_data TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_msg_family ON family_messages(family_id, id);
