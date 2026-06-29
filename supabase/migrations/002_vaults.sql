CREATE TABLE vaults (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id       uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  name            text NOT NULL,
  goal_amount     numeric(12,2) NOT NULL DEFAULT 0,
  color           text,
  icon            text,
  sort_order      integer NOT NULL DEFAULT 0,
  is_savings      boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vault_line_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id        uuid NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  name            text NOT NULL,
  planned_amount  numeric(12,2) NOT NULL DEFAULT 0,
  sort_order      integer NOT NULL DEFAULT 0
);

CREATE INDEX idx_vaults_couple ON vaults(couple_id);
CREATE INDEX idx_line_items_vault ON vault_line_items(vault_id);

ALTER TABLE vaults           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vaults_all" ON vaults FOR ALL
  USING (couple_id = get_my_couple_id())
  WITH CHECK (couple_id = get_my_couple_id());

CREATE POLICY "line_items_all" ON vault_line_items FOR ALL
  USING (EXISTS (SELECT 1 FROM vaults v WHERE v.id = vault_id AND v.couple_id = get_my_couple_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM vaults v WHERE v.id = vault_id AND v.couple_id = get_my_couple_id()));
