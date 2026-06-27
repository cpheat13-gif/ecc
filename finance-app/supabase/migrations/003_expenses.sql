CREATE TABLE expenses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  paid_by     uuid NOT NULL REFERENCES auth.users(id),
  vault_id    uuid REFERENCES vaults(id),
  amount      numeric(12,2) NOT NULL CHECK (amount > 0),
  description text NOT NULL,
  merchant    text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_couple_date ON expenses(couple_id, occurred_at DESC);
CREATE INDEX idx_expenses_vault ON expenses(vault_id);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_all" ON expenses FOR ALL
  USING (couple_id = get_my_couple_id())
  WITH CHECK (couple_id = get_my_couple_id());

CREATE TABLE subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  name        text NOT NULL,
  amount      numeric(12,2) NOT NULL DEFAULT 0,
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscriptions_all" ON subscriptions FOR ALL
  USING (couple_id = get_my_couple_id())
  WITH CHECK (couple_id = get_my_couple_id());
