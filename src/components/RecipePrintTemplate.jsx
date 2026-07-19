// Pure presentational recipe layout used only for PDF export.
// Plain inline styles (no Tailwind classes) so html2canvas rasterizes it
// identically regardless of stylesheet load timing.

const PAGE_WIDTH = 800;

const CATEGORY_ICONS = {
  'Proteins':        '🥩',
  'Produce':         '🥦',
  'Dairy':           '🥚',
  'Pantry':          '🫙',
  'Canned & Jarred': '🥫',
  'Spices':          '🧂',
  'Other':           '📦',
};

function groupIngredients(ingredients) {
  const map = {};
  (ingredients || []).forEach(ing => {
    const cat = ing.category || 'Other';
    if (!map[cat]) map[cat] = [];
    map[cat].push(ing);
  });
  return map;
}

function MacroBlock({ label, dot, data }) {
  if (!data) return null;
  return (
    <div style={{ flex: 1, background: '#faf8f3', borderRadius: 18, padding: '16px 20px', border: '1px solid rgba(28,25,23,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: dot, display: 'inline-block' }} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#78716c' }}>{label}</span>
      </div>
      <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 30, fontWeight: 800, color: '#15803d', lineHeight: 1 }}>
        {data.calories}<span style={{ fontSize: 13, fontWeight: 500, color: '#a8a29e', marginLeft: 4 }}>cal</span>
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 13, fontWeight: 600, color: '#57534e' }}>
        <span><span style={{ color: '#ef4444', fontWeight: 800 }}>P</span> {data.protein}g</span>
        <span><span style={{ color: '#f59e0b', fontWeight: 800 }}>C</span> {data.carbs}g</span>
        <span><span style={{ color: '#38bdf8', fontWeight: 800 }}>F</span> {data.fat}g</span>
      </div>
    </div>
  );
}

export default function RecipePrintTemplate({ recipe }) {
  const grouped = groupIngredients(recipe.ingredients);
  const hasSteps = recipe.steps?.length > 0;
  const generatedOn = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div
      style={{
        width: PAGE_WIDTH,
        background: '#fbf7f2',
        color: '#1c1917',
        fontFamily: 'Figtree, -apple-system, sans-serif',
        padding: '56px 60px 48px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: '#a8a29e', marginBottom: 8 }}>
          Recipe
        </div>
        <div style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 44, fontWeight: 800, lineHeight: 1.08, color: '#1c1917' }}>
          {recipe.name}
        </div>
        <div style={{ fontSize: 15, color: '#78716c', marginTop: 10, fontWeight: 500 }}>
          {recipe.cookTime}
          {recipe.highSodiumFlag && <span style={{ color: '#d97706', marginLeft: 10 }}>· High sodium</span>}
        </div>
      </div>

      {/* Photo or emoji banner */}
      {recipe.imageUrl ? (
        <img
          src={recipe.imageUrl}
          crossOrigin="anonymous"
          alt=""
          style={{ width: '100%', height: 380, objectFit: 'cover', borderRadius: 28, marginBottom: 28, display: 'block' }}
        />
      ) : (
        <div style={{
          width: '100%', height: 260, borderRadius: 28, marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #fdf6ef 0%, #f6e7dc 100%)',
        }}>
          <span style={{ fontSize: 96 }}>{recipe.emoji || '🍽️'}</span>
        </div>
      )}

      {/* Macros */}
      {(recipe.macros?.connor || recipe.macros?.isa) && (
        <div style={{ display: 'flex', gap: 14, marginBottom: 34 }}>
          <MacroBlock label="Connor" dot="#0ea5e9" data={recipe.macros?.connor} />
          <MacroBlock label="Isa" dot="#8b5cf6" data={recipe.macros?.isa} />
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients?.length > 0 && (
        <div style={{ marginBottom: 34 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a8a29e', marginBottom: 16 }}>
            Ingredients
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 40 }}>
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 20, breakInside: 'avoid' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{CATEGORY_ICONS[cat] || '📦'}</span>
                  <span style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 15, fontWeight: 700, color: '#44403c' }}>{cat}</span>
                </div>
                {items.map((ing, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      padding: '7px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(28,25,23,0.06)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14.5, fontWeight: 500, color: '#292524' }}>{ing.item}</span>
                    <span style={{ fontSize: 13, color: '#a8a29e', marginLeft: 12, whiteSpace: 'nowrap' }}>{ing.quantity} {ing.unit}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Method */}
      {hasSteps && (
        <div style={{ marginBottom: 34 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a8a29e', marginBottom: 18 }}>
            Method
          </div>
          {recipe.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, breakInside: 'avoid' }}>
              <div style={{
                fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 18, fontWeight: 800, color: '#15803d',
                width: 26, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.6, color: '#292524', paddingTop: 1 }}>{step}</div>
            </div>
          ))}
        </div>
      )}

      {/* Whole Foods tips */}
      {recipe.wholeFoodsTips?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a8a29e', marginBottom: 12 }}>
            Shopping Tips
          </div>
          {recipe.wholeFoodsTips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 14, color: '#57534e', lineHeight: 1.5 }}>
              <span style={{ color: '#15803d', flexShrink: 0 }}>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(28,25,23,0.08)', fontSize: 12, color: '#a8a29e', display: 'flex', justifyContent: 'space-between' }}>
        <span>From the family meal planner</span>
        <span>{generatedOn}</span>
      </div>
    </div>
  );
}

export { PAGE_WIDTH };
