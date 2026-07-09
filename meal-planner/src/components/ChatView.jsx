import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ChatThread from './ChatThread';
import { onHandIngredients } from '../utils/chat';

const DAY_FULL = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};
const MEAL_LABEL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

function AssignSheet({ recipe, weekConfig, onClose, onConfirm }) {
  const days = Object.keys(weekConfig).filter(d => (weekConfig[d]?.meals || []).length > 0);
  const [day, setDay] = useState(days[0] || null);
  const meals = day ? weekConfig[day].meals : [];
  const [mealType, setMealType] = useState(meals[0] || null);

  const pickDay = (d) => {
    setDay(d);
    setMealType(weekConfig[d].meals[0] || null);
  };

  return (
    <div className="fixed inset-0 z-[65] flex flex-col justify-end">
      <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#f8faf1] rounded-t-[32px] p-6 pb-10 shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-stone-900/10 rounded-full" />
        </div>
        <h3 className="font-display text-xl font-bold text-stone-900 mb-5 leading-snug">
          Add "{recipe.name}" to your plan
        </h3>

        {days.length === 0 ? (
          <p className="text-sm text-stone-500 mb-6">No days are set up with meals yet — head to Settings to configure your week first.</p>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-2.5">Day</p>
            <div className="flex gap-2 flex-wrap mb-5">
              {days.map(d => (
                <button
                  key={d}
                  onClick={() => pickDay(d)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    day === d ? 'bg-stone-900 text-[#f7faf1]' : 'border border-stone-900/10 text-stone-600'
                  }`}
                >
                  {DAY_FULL[d].slice(0, 3)}
                </button>
              ))}
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-2.5">Meal</p>
            <div className="flex gap-2 flex-wrap mb-7">
              {meals.map(m => (
                <button
                  key={m}
                  onClick={() => setMealType(m)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    mealType === m ? 'bg-stone-900 text-[#f7faf1]' : 'border border-stone-900/10 text-stone-600'
                  }`}
                >
                  {MEAL_LABEL[m]}
                </button>
              ))}
            </div>

            <button
              disabled={!day || !mealType}
              onClick={() => onConfirm(day, mealType)}
              className="w-full py-4 bg-stone-900 text-[#f7faf1] rounded-full font-semibold disabled:opacity-40 active:scale-95 transition-all"
            >
              Add to {day ? DAY_FULL[day] : ''} {mealType ? MEAL_LABEL[mealType] : ''}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatView() {
  const { state, dispatch } = useApp();
  const [assigning, setAssigning] = useState(null);
  const [savedTick, setSavedTick] = useState(0);

  const messages = state.chatMessages || [];
  const setMessages = (msgs) => dispatch({ type: 'SET_CHAT_MESSAGES', messages: msgs });
  const onHand = onHandIngredients(state.mealPlan, state.shoppingChecked);

  const handleSave = (recipe) => {
    dispatch({ type: 'ADD_CUSTOM_RECIPE', recipe });
    setSavedTick(t => t + 1);
  };

  const confirmAssign = (day, mealType) => {
    dispatch({ type: 'SET_MEAL', day, mealType, recipe: { ...assigning, mealType } });
    dispatch({ type: 'ADD_CUSTOM_RECIPE', recipe: assigning });
    setAssigning(null);
  };

  return (
    <div className="h-screen flex flex-col pb-28">
      <div className="px-5 pt-14 pb-2 flex items-end justify-between shrink-0">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400">Ask for anything</p>
          <h1 className="font-display text-[44px] font-bold text-stone-900 leading-[1.05] tracking-tight mt-1">
            Chat
          </h1>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-stone-400 active:text-red-500 font-medium pb-3 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <ChatThread
        messages={messages}
        onMessagesChange={setMessages}
        context={{ onHand }}
        primaryLabel="Save to Recipes"
        onPrimary={handleSave}
        secondaryLabel="Add to plan"
        onSecondary={setAssigning}
        placeholder="Use what I have, but steak burritos…"
        emptyState={
          <div className="flex flex-col items-center justify-center pt-16 text-center px-6">
            <div className="emoji-hero text-5xl mb-4">💬</div>
            <p className="text-stone-700 font-display font-semibold text-lg mb-1">What sounds good?</p>
            <p className="text-stone-400 text-sm max-w-[260px] leading-relaxed">
              Tell me what you're craving, what's already in the fridge, or what you want to swap — I'll help you land on a recipe.
            </p>
            {onHand.length > 0 && (
              <p className="text-stone-300 text-xs mt-4 max-w-[280px] leading-relaxed">
                I can already see {onHand.slice(0, 3).join(', ')}{onHand.length > 3 ? `, +${onHand.length - 3} more` : ''} checked off your shopping list.
              </p>
            )}
          </div>
        }
      />

      {assigning && (
        <AssignSheet
          recipe={assigning}
          weekConfig={state.weekConfig}
          onClose={() => setAssigning(null)}
          onConfirm={confirmAssign}
        />
      )}
    </div>
  );
}
