import { useEffect, useState } from 'react';
import { EmojiHero } from './ui';
import { imageGenerating, onImageStateChange } from '../utils/images';

// Recipe visual: generated studio photo with a blur-up reveal,
// emoji while the photo is developing (or when generation is unavailable).
export default function FoodImage({
  recipe,
  mealType,
  size = 'w-16 h-16',
  rounded = 'rounded-2xl',
  emojiSize = 'text-[52px]',
  className = '',
}) {
  const [loaded, setLoaded] = useState(false);
  const [, force] = useState(0);

  useEffect(() => onImageStateChange(() => force(n => n + 1)), []);
  useEffect(() => { setLoaded(false); }, [recipe?.imageUrl]);

  const url = recipe?.imageUrl;

  if (!url) {
    const developing = imageGenerating(recipe?.name);
    return (
      <span className={`relative inline-flex items-center justify-center ${className}`}>
        <EmojiHero recipe={recipe} mealType={mealType} size={emojiSize} className={developing ? 'animate-pulse' : ''} />
        {developing && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1 h-1 rounded-full bg-grad animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`block overflow-hidden ${size} ${rounded} bg-stone-900/[0.04] shadow-[0_10px_24px_rgba(76,40,16,0.18)] ${className}`}>
      <img
        src={url}
        alt={recipe?.name || ''}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover img-reveal ${loaded ? 'on' : ''}`}
      />
    </span>
  );
}
