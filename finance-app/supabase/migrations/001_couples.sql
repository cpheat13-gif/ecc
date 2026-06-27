CREATE TABLE couples (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE couple_members (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id               uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name            text NOT NULL,
  color                   text NOT NULL DEFAULT 'blue',
  annual_income           numeric(12,2) NOT NULL DEFAULT 0,
  avg_paycheck            numeric(12,2) NOT NULL DEFAULT 0,
  paychecks_per_month     integer NOT NULL DEFAULT 2,
  settings_json           jsonb NOT NULL DEFAULT '{}',
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (couple_id, user_id)
);

CREATE INDEX idx_couple_members_user ON couple_members(user_id);

-- Helper to find a user's couple
CREATE OR REPLACE FUNCTION get_my_couple_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT couple_id FROM couple_members WHERE user_id = auth.uid() LIMIT 1;
$$;

ALTER TABLE couples        ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "couples_select"  ON couples FOR SELECT  USING (id = get_my_couple_id());
CREATE POLICY "couples_insert"  ON couples FOR INSERT  WITH CHECK (true);
CREATE POLICY "members_select"  ON couple_members FOR SELECT  USING (couple_id = get_my_couple_id() OR user_id = auth.uid());
CREATE POLICY "members_insert"  ON couple_members FOR INSERT  WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_update"  ON couple_members FOR UPDATE  USING (user_id = auth.uid());
