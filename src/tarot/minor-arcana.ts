import { MinorArcanaCard, TAROT_SUITS, TarotElement, TarotSuit, toCardId } from './tarot-card';

type MinorArcanaEntry = [keywords: string[], upright: string, reversed: string];

const RANK_NAMES = [
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Page',
  'Knight',
  'Queen',
  'King',
] as const;

const SUIT_ELEMENTS: Record<TarotSuit, TarotElement> = {
  wands: 'fire',
  cups: 'water',
  swords: 'air',
  pentacles: 'earth',
};

/** Each suit lists its cards from Ace to King, in the same order as RANK_NAMES. */
const ENTRIES: Record<TarotSuit, readonly MinorArcanaEntry[]> = {
  wands: [
    [
      ['inspiration', 'potential', 'spark'],
      'A spark of inspiration ready to be acted on.',
      'Delays, or enthusiasm without direction.',
    ],
    [
      ['planning', 'choice', 'horizons'],
      'Weighing bold plans from a place of safety.',
      'Fear of the unknown keeps plans on paper.',
    ],
    [
      ['expansion', 'foresight', 'progress'],
      'Early efforts start to return with news of progress.',
      'Setbacks in plans that reached too far.',
    ],
    [
      ['celebration', 'home', 'milestone'],
      'A joyful milestone shared with others.',
      'Tension at home, or a celebration postponed.',
    ],
    [
      ['competition', 'friction', 'rivalry'],
      'Energetic friction that tests your ideas.',
      'Avoiding conflict, or finally finding common ground.',
    ],
    [
      ['recognition', 'victory', 'confidence'],
      'Public recognition for a hard-won success.',
      'Craving approval, or a victory that feels hollow.',
    ],
    [
      ['defence', 'perseverance', 'conviction'],
      'Holding your ground against pressure.',
      'Exhaustion, or giving up a position worth keeping.',
    ],
    [
      ['speed', 'movement', 'momentum'],
      'Things move fast; news and progress arrive at once.',
      'Delays and frustration, or rushing too much.',
    ],
    [
      ['resilience', 'persistence', 'boundaries'],
      'Weary but still standing, close to the finish.',
      'Defensiveness, or stubbornness past its use.',
    ],
    [
      ['burden', 'responsibility', 'overload'],
      'Carrying more than your share on the final stretch.',
      'Setting down burdens that were never yours.',
    ],
    [
      ['curiosity', 'enthusiasm', 'discovery'],
      'An eager messenger of new ideas and adventures.',
      'Restless ideas that never take off.',
    ],
    [
      ['passion', 'adventure', 'impulsiveness'],
      'Charging ahead with fire and charm.',
      'Haste, scattered energy, or burnout.',
    ],
    [
      ['confidence', 'warmth', 'determination'],
      'Radiant confidence that draws others in.',
      'Jealousy, or self-doubt behind a bold front.',
    ],
    [
      ['vision', 'leadership', 'boldness'],
      'A visionary leader who turns ideas into movements.',
      'Impulsiveness, or leadership that overpowers.',
    ],
  ],
  cups: [
    [
      ['love', 'new feelings', 'openness'],
      'An overflowing heart and a new emotional beginning.',
      'Blocked feelings, or love turned inward.',
    ],
    [
      ['partnership', 'attraction', 'connection'],
      'A meeting of equals and a mutual bond.',
      'Imbalance, or a connection cooling.',
    ],
    [
      ['friendship', 'community', 'celebration'],
      'Shared joy among friends.',
      'Overindulgence, or feeling left out.',
    ],
    [
      ['apathy', 'contemplation', 'reevaluation'],
      'Looking past an offer while lost in thought.',
      'Waking up to new possibilities.',
    ],
    [
      ['loss', 'regret', 'grief'],
      'Mourning what spilled while forgetting what still stands.',
      'Acceptance, and turning toward what remains.',
    ],
    [
      ['nostalgia', 'innocence', 'memories'],
      'Sweet memories and simple kindness from the past.',
      'Living in the past, or finally moving beyond it.',
    ],
    [
      ['fantasy', 'options', 'illusion'],
      'Many dreams to choose from, not all of them real.',
      'Clarity arrives and the choices narrow.',
    ],
    [
      ['walking away', 'seeking meaning', 'departure'],
      'Leaving behind what no longer fulfils you.',
      'Fear of leaving, or drifting without purpose.',
    ],
    [
      ['contentment', 'wishes', 'satisfaction'],
      'A wish fulfilled and a moment of contentment.',
      'Smugness, or satisfaction that stays out of reach.',
    ],
    [
      ['harmony', 'family', 'fulfilment'],
      'Lasting emotional harmony at home.',
      'Broken expectations, or disconnection at home.',
    ],
    [
      ['sensitivity', 'creativity', 'intuition'],
      'A gentle, imaginative message from the heart.',
      'Emotional immaturity, or a creative block.',
    ],
    [
      ['romance', 'charm', 'idealism'],
      'A romantic offer carried in with grace.',
      'Moodiness, or promises that do not hold.',
    ],
    [
      ['compassion', 'empathy', 'calm'],
      'Deep empathy grounded in emotional wisdom.',
      "Losing yourself in other people's feelings.",
    ],
    [
      ['emotional balance', 'diplomacy', 'generosity'],
      'Steady feelings and wise counsel under pressure.',
      'Suppressed emotions, or quiet manipulation.',
    ],
  ],
  swords: [
    [
      ['clarity', 'truth', 'breakthrough'],
      'A breakthrough idea that cuts through the fog.',
      'Confusion, or truth used as a weapon.',
    ],
    [
      ['indecision', 'stalemate', 'avoidance'],
      'A blindfolded choice between two hard options.',
      'Information overload, or a decision finally made.',
    ],
    [
      ['heartbreak', 'sorrow', 'painful truth'],
      'A painful truth that hurts before it heals.',
      'Recovery, and releasing old grief.',
    ],
    [
      ['rest', 'recovery', 'retreat'],
      'A needed pause to recover your strength.',
      'Restlessness, or burnout from refusing to rest.',
    ],
    [
      ['conflict', 'costly victory', 'tension'],
      'A win that costs more than it gains.',
      'Reconciliation, or walking away from a fight.',
    ],
    [
      ['transition', 'moving on', 'calmer waters'],
      'Leaving rough waters for calmer ones.',
      'Unfinished business that follows you.',
    ],
    [
      ['strategy', 'secrecy', 'evasion'],
      'A clever plan, or a shortcut with hidden costs.',
      'Coming clean, or a scheme unravelling.',
    ],
    [
      ['restriction', 'self-limiting beliefs', 'feeling trapped'],
      'Feeling trapped by bonds that are mostly in the mind.',
      'Release, and a new perspective on old limits.',
    ],
    [
      ['anxiety', 'worry', 'sleeplessness'],
      'Late-night worries larger than the problem.',
      'Hope returning, or fears finally spoken aloud.',
    ],
    [
      ['ending', 'rock bottom', 'release'],
      'A painful ending that marks the bottom of the fall.',
      'Recovery, and refusing to be defined by a loss.',
    ],
    [
      ['curiosity', 'vigilance', 'new ideas'],
      'A sharp mind eager to learn and question.',
      'Gossip, or all talk and no action.',
    ],
    [
      ['ambition', 'directness', 'haste'],
      'Racing toward a goal with sharp determination.',
      'Recklessness, or words that cut too deep.',
    ],
    [
      ['independence', 'perception', 'honesty'],
      'Clear judgement shaped by lived experience.',
      'Coldness, or bitterness disguised as honesty.',
    ],
    [
      ['intellect', 'authority', 'truth'],
      'Fair, rational authority guided by principle.',
      'Manipulation, or cold and detached judgement.',
    ],
  ],
  pentacles: [
    [
      ['opportunity', 'prosperity', 'foundation'],
      'A tangible opportunity to build something lasting.',
      'A missed chance, or poor planning.',
    ],
    [
      ['balance', 'adaptability', 'juggling'],
      'Juggling priorities with flexibility.',
      'Overcommitment, or dropping one of the balls.',
    ],
    [
      ['teamwork', 'craft', 'collaboration'],
      'Skilled work that shines through collaboration.',
      'Misalignment, or working alone to a fault.',
    ],
    [
      ['security', 'control', 'saving'],
      'Holding tightly to what you have built.',
      'Loosening your grip, or greed taking over.',
    ],
    [
      ['hardship', 'insecurity', 'exclusion'],
      'Hard times, and help that is closer than it seems.',
      'Recovery from loss, or accepting help at last.',
    ],
    [
      ['generosity', 'giving', 'fair exchange'],
      'Giving and receiving in fair measure.',
      'Strings attached, or one-sided generosity.',
    ],
    [
      ['patience', 'investment', 'long-term view'],
      'Pausing to assess slow, steady growth.',
      'Impatience with results, or effort poorly spent.',
    ],
    [
      ['diligence', 'mastery', 'skill'],
      'Dedicated practice that refines your craft.',
      'Perfectionism, or work without purpose.',
    ],
    [
      ['independence', 'abundance', 'self-sufficiency'],
      'Enjoying the rewards of your own discipline.',
      "Overwork, or depending on others' approval.",
    ],
    [
      ['legacy', 'wealth', 'family'],
      'Lasting security and a legacy worth passing on.',
      'Family tension, or fragile foundations.',
    ],
    [
      ['ambition', 'study', 'new venture'],
      'A diligent student of a promising opportunity.',
      'Procrastination, or learning without applying.',
    ],
    [
      ['reliability', 'routine', 'hard work'],
      'Slow, dependable progress that gets there.',
      'Stagnation, or boredom in routine.',
    ],
    [
      ['nurturing', 'practicality', 'comfort'],
      'Warm, practical care for home and resources.',
      'Neglecting yourself while caring for others.',
    ],
    [
      ['abundance', 'security', 'leadership'],
      'Grounded success and generous stability.',
      'Materialism, or clinging to control.',
    ],
  ],
};

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

export const MINOR_ARCANA: readonly MinorArcanaCard[] = TAROT_SUITS.flatMap((suit) =>
  ENTRIES[suit].map(([keywords, upright, reversed], index) => {
    const name = `${RANK_NAMES[index]} of ${capitalize(suit)}`;

    return {
      id: toCardId(name),
      name,
      number: index + 1,
      arcana: 'minor',
      suit,
      element: SUIT_ELEMENTS[suit],
      keywords,
      upright,
      reversed,
    } satisfies MinorArcanaCard;
  }),
);
