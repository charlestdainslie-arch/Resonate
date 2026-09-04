const cards = [
  {
    id: 0,
    roman: '0',
    name: 'The Fool',
    subtitle: 'The Cosmic Pilgrim & Beginner',
    element: 'Air',
    astrology: 'Uranus',
    uprightKeywords: ['New Beginnings', 'Innocence', 'Trust'],
    reversedKeywords: ['Recklessness', 'Hesitation', 'Naivety'],
    upright: 'The Fool is the moment before experience hardens into certainty: openness, curiosity and the courage to move without needing every answer first. Upright, it favours a fresh beginning approached with alertness rather than fear.',
    reversed: 'Reversed, the same openness can become either careless risk or fear disguised as caution. The question is not simply whether to leap, but whether you are seeing the ground clearly enough to choose freely.',
    numerology: 'Zero is pure potential: the circle before the first mark, the unformed field from which every number emerges. In a reading it can amplify openness, uncertainty and the possibility of beginning again.',
    psychological: 'Jungian lens: the Puer Aeternus and Innocent. The Fool represents the part of the psyche that has not yet been over-defined by convention. At its best this is imagination and trust; in shadow it can avoid responsibility or experience.',
    spiritual: 'Spiritually, The Fool invites direct encounter with life. It asks for faith without demanding blindness: travel light, stay awake, and allow the path to teach you as you walk it.',
    symbolism: 'A traveller stands at the edge of the known world, carrying little and looking outward. The image holds the tension between freedom and consequence: possibility is real, and so is the edge beneath the feet.',
    journalPrompt: 'Where in my life am I being invited to begin before I feel completely ready?',
    connections: [
      { card: 'The Magician', title: 'Idea into Manifestation', meaning: 'The Fool brings raw possibility; The Magician gives it focus, language and tools. Together they turn impulse into deliberate creation.' },
      { card: 'The Emperor', title: 'Freedom Meets Structure', meaning: 'The Fool loosens fixed rules while The Emperor builds dependable boundaries. The pair asks how to keep freedom without losing form.' }
    ]
  },
  {
    id: 1,
    roman: 'I',
    name: 'The Magician',
    subtitle: 'The Alchemist & Conduit of Will',
    element: 'Air',
    astrology: 'Mercury',
    uprightKeywords: ['Manifestation', 'Resourcefulness', 'Focus'],
    reversedKeywords: ['Manipulation', 'Scattered Will', 'Untapped Skill'],
    upright: 'The Magician is focused agency. Knowledge, language, skill and timing are brought together so that intention can become action. Upright, it is less about wishing and more about using what is already available with precision.',
    reversed: 'Reversed, skill may be scattered, misdirected or used to control rather than create. It can also show ability that is present but not yet trusted. The task is to bring intention, ethics and action back into alignment.',
    numerology: 'One is the first point of definition: identity, initiative and directed force. It is the movement from possibility into a chosen line of action.',
    psychological: 'Jungian lens: the Conscious Ego and Alchemist. The Magician symbolises the developing capacity to direct attention, combine inner resources and act intentionally. In shadow, cleverness can become self-deception or manipulation.',
    spiritual: 'Spiritually, The Magician is the meeting place of above and below: insight translated into embodied practice. Power becomes meaningful when it is used consciously and responsibly.',
    symbolism: 'The figure stands between sky and earth, with the elemental tools before him. The gesture suggests correspondence: what is imagined inwardly can be shaped outwardly through disciplined attention.',
    journalPrompt: 'What ability or resource do I already have that I am underusing?',
    connections: [
      { card: 'The Fool', title: 'Inspiration Grounded', meaning: 'The Fool supplies freshness and possibility; The Magician gives that energy a method and a first deliberate act.' },
      { card: 'The High Priestess', title: 'Will Meets Intuition', meaning: 'The Magician acts and articulates; The High Priestess receives and listens. Together they balance conscious intention with deeper knowing.' }
    ]
  },
  {
    id: 2,
    roman: 'II',
    name: 'The High Priestess',
    subtitle: 'Guardian of Sanctuary & Inner Knowing',
    element: 'Water',
    astrology: 'The Moon',
    uprightKeywords: ['Intuition', 'Sacred Mystery', 'Stillness'],
    reversedKeywords: ['Disconnection', 'Hidden Motives', 'Inner Noise'],
    upright: 'The High Priestess asks for receptivity rather than force. Upright, she points to intuition, silence, pattern recognition and information that becomes visible only when the mind stops trying to dominate the answer.',
    reversed: 'Reversed, the inner signal may be obscured by anxiety, projection or secrecy. It can also suggest that something known inwardly is being ignored because it is inconvenient to the conscious story.',
    numerology: 'Two introduces polarity and relationship: self and other, conscious and unconscious, seen and unseen. Wisdom emerges through holding tension rather than collapsing it too quickly.',
    psychological: 'Jungian lens: the Anima and threshold to the unconscious. The High Priestess reflects symbolic intelligence, dream material and the psyche\'s capacity to know before it can fully explain.',
    spiritual: 'Spiritually, this card values silence as an active practice. Not every mystery needs to be solved immediately; some understanding ripens through attention, patience and reverence.',
    symbolism: 'Seated between opposing pillars, the Priestess occupies a threshold. Veil, moon and water imagery suggest knowledge that is not hidden to exclude, but protected until the observer is ready to perceive it.',
    journalPrompt: 'What do I already know beneath the noise, and what makes me reluctant to trust it?',
    connections: [
      { card: 'The Magician', title: 'Unconscious Depth Meets Conscious Will', meaning: 'Intuition informs action while action tests intuition. The pair asks for neither passivity nor force, but dialogue between inner and outer knowing.' },
      { card: 'The Empress', title: 'Inner Knowing Becomes Embodied', meaning: 'The Priestess senses what is forming; The Empress gives it body, care and material expression.' }
    ]
  },
  {
    id: 3,
    roman: 'III',
    name: 'The Empress',
    subtitle: 'The Great Mother & Matrix of Creation',
    element: 'Earth',
    astrology: 'Venus',
    uprightKeywords: ['Abundance', 'Sensual Pleasure', 'Nurture'],
    reversedKeywords: ['Depletion', 'Overgiving', 'Creative Block'],
    upright: 'The Empress represents life that grows when it is nourished. Upright, she speaks to creativity, embodiment, pleasure, care and the practical conditions that allow something living to flourish.',
    reversed: 'Reversed, nurturing can become depletion, control or neglect of the self. Creative energy may feel blocked because the environment around it is underfed. Restoration begins with attention to what actually sustains life.',
    numerology: 'Three is emergence: a third point created from the relationship between two. It is expression, growth, creativity and the first sense of form becoming fertile.',
    psychological: 'Jungian lens: the Great Mother and generative Anima. The Empress represents the psyche\'s capacity to nourish, contain and create. In shadow, care can become engulfing or self-sacrificing.',
    spiritual: 'Spiritually, The Empress reminds us that the sacred is not separate from the body or the material world. Beauty, nourishment and creation can themselves become forms of devotion.',
    symbolism: 'The Empress is surrounded by signs of fertility, vegetation and sensory richness. Her abundance is not merely possession; it is the capacity to generate and sustain life.',
    journalPrompt: 'What in my life is asking to be nourished rather than pushed?',
    connections: [
      { card: 'The Emperor', title: 'Creation Meets Structure', meaning: 'The Empress grows and nourishes; The Emperor defines and protects. Together they ask what conditions allow something valuable to endure.' },
      { card: 'The High Priestess', title: 'Mystery Becomes Form', meaning: 'The Priestess receives the seed of insight; The Empress carries it into lived, embodied reality.' }
    ]
  },
  {
    id: 4,
    roman: 'IV',
    name: 'The Emperor',
    subtitle: 'The Sovereign & Architect of Order',
    element: 'Fire',
    astrology: 'Aries · Mars',
    uprightKeywords: ['Authority', 'Structure', 'Boundaries'],
    reversedKeywords: ['Rigidity', 'Control', 'Instability'],
    upright: 'The Emperor is the capacity to create order that protects what matters. Upright, he represents boundaries, leadership, consistency and the willingness to make decisions that give a system strength.',
    reversed: 'Reversed, structure can harden into domination or become so brittle that it no longer serves life. It may also show a lack of dependable boundaries. The question is whether authority is supporting growth or merely defending itself.',
    numerology: 'Four is foundation: the square, the stable frame, the four directions. It brings containment, reliability and the challenge of balancing stability with flexibility.',
    psychological: 'Jungian lens: Logos, Father and Wise Sovereign. The Emperor reflects the psyche\'s capacity for limits, responsibility and coherent order. In shadow, authority becomes inflexible, punitive or disconnected from feeling.',
    spiritual: 'Spiritually, The Emperor asks how inner values become lived principles. Discipline is not the opposite of freedom when it creates a stable vessel for what you genuinely care about.',
    symbolism: 'The throne, stone and ram imagery evoke endurance, command and Aries fire. The landscape is austere: authority here is less about comfort than about responsibility and definition.',
    journalPrompt: 'Where would a clearer boundary or stronger structure create more freedom for me?',
    connections: [
      { card: 'The Empress', title: 'Structure and Creation', meaning: 'The Emperor provides form while The Empress provides life. Healthy order supports creativity rather than replacing it.' },
      { card: 'The Fool', title: 'Authority Meets Rebellion', meaning: 'The Fool questions inherited rules; The Emperor tests whether those rules are necessary. The pair can reveal where structure is protective and where it has become stale.' },
      { card: 'The Magician', title: 'Systematised Power', meaning: 'The Magician supplies skill and intent; The Emperor turns that capacity into a repeatable structure, role or institution.' }
    ]
  }
]
