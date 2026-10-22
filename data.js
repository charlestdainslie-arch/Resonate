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
    upright: 'The Fool is the moment before experience hardens into certainty: openness, curiosity and the courage to move without needing every answer first. Upright, it favours a fresh beginning approached with alertness rather than fear. In a reading, this may describe a new chapter, an unfamiliar choice, or the feeling that life is asking you to move before every detail is known. In a Past position it can reflect the leap that brought you here; in the Present, a threshold you are standing at now; in the Future, an emerging possibility rather than a guaranteed event.',
    reversed: 'Reversed, the same openness can become either careless risk or fear disguised as caution. The question is not simply whether to leap, but whether you are seeing the ground clearly enough to choose freely. Depending on its position and surrounding cards, this may point to hesitation after an earlier risk, or invite a little more preparation before moving forward.',
    numerology: 'Zero is pure potential: the circle before the first mark, the unformed field from which every number emerges. In a reading it can amplify openness, uncertainty and the possibility of beginning again.',
    psychological: 'Jungian lens: the Puer Aeternus and Innocent. The Fool represents the part of the psyche that has not yet been over-defined by convention. At its best this is imagination and trust; in shadow it can avoid responsibility or experience.',
    wuWei: 'Wu Wei: notice where the next step may need openness rather than force. Moving with life does not mean moving blindly; it can mean staying responsive enough to recognise the path as it appears.',
    wabiSabi: 'Wabi-sabi: a beginning does not need to be polished or complete to be worthwhile. There can be beauty in being unfinished, uncertain and willing to learn along the way.',
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
    upright: 'The Magician is focused agency. Knowledge, language, skill and timing are brought together so that intention can become action. Upright, it is less about wishing and more about using what is already available with precision. In a reading, this may be asking what you can actually do with the resources in front of you. In a Past position it can describe an initiative or skill that set events in motion; in the Present, a moment to act consciously; in the Future, developing capability or an opportunity to put intention into practice.',
    reversed: 'Reversed, skill may be scattered, misdirected or used to control rather than create. It can also show ability that is present but not yet trusted. The task is to bring intention, ethics and action back into alignment. Surrounding cards can help distinguish between a temporary lack of confidence, scattered energy, and a situation where motives deserve a closer look.',
    numerology: 'One is the first point of definition: identity, initiative and directed force. It is the movement from possibility into a chosen line of action.',
    psychological: 'Jungian lens: the Conscious Ego and Alchemist. The Magician symbolises the developing capacity to direct attention, combine inner resources and act intentionally. In shadow, cleverness can become self-deception or manipulation.',
    wuWei: 'Wu Wei: effective action is not always greater effort. The Magician can ask where precise, well-timed action would achieve more than pushing harder in every direction.',
    wabiSabi: 'Wabi-sabi: you do not need perfect tools or perfect mastery before you begin. Skill grows through use, adjustment and an honest relationship with what is already in your hands.',
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
    upright: 'The High Priestess asks for receptivity rather than force. Upright, she points to intuition, silence, pattern recognition and information that becomes visible only when the mind stops trying to dominate the answer. In a reading, this may suggest that not everything needs to be decided immediately. In a Past position it can point to something sensed before it was understood; in the Present, an invitation to listen beneath the noise; in the Future, information or understanding that may unfold gradually rather than arrive all at once.',
    reversed: 'Reversed, the inner signal may be obscured by anxiety, projection or secrecy. It can also suggest that something known inwardly is being ignored because it is inconvenient to the conscious story. Rather than assuming deception, look to the position and surrounding cards for whether the issue is external uncertainty or difficulty trusting your own perception.',
    numerology: 'Two introduces polarity and relationship: self and other, conscious and unconscious, seen and unseen. Wisdom emerges through holding tension rather than collapsing it too quickly.',
    psychological: 'Jungian lens: the Anima and threshold to the unconscious. The High Priestess reflects symbolic intelligence, dream material and the psyche\'s capacity to know before it can fully explain.',
    wuWei: 'Wu Wei: this card can be an invitation to stop pulling at the answer. Stillness is not passivity when it allows what is already forming to become clear in its own time.',
    wabiSabi: 'Wabi-sabi: some things remain incomplete, ambiguous or partly hidden. There can be wisdom in allowing uncertainty to exist without forcing it into a neat explanation.',
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
    upright: 'The Empress represents life that grows when it is nourished. Upright, she speaks to creativity, embodiment, pleasure, care and the practical conditions that allow something living to flourish. In a reading, this may describe a relationship, project, home, creative impulse or part of yourself asking for genuine nourishment. In a Past position it can show what helped something grow; in the Present, what needs care now; in the Future, growth that may become possible when the right conditions are tended.',
    reversed: 'Reversed, nurturing can become depletion, control or neglect of the self. Creative energy may feel blocked because the environment around it is underfed. Restoration begins with attention to what actually sustains life. The surrounding cards may show whether this is about overgiving to others, neglecting your own needs, or allowing something to rest before expecting it to produce again.',
    numerology: 'Three is emergence: a third point created from the relationship between two. It is expression, growth, creativity and the first sense of form becoming fertile.',
    psychological: 'Jungian lens: the Great Mother and generative Anima. The Empress represents the psyche\'s capacity to nourish, contain and create. In shadow, care can become engulfing or self-sacrificing.',
    wuWei: 'Wu Wei: growth cannot always be hurried. The Empress may ask what would happen if you created the right conditions, offered steady care, and allowed life to do some of the growing for you.',
    wabiSabi: 'Wabi-sabi: living things are seasonal, textured and imperfect. Beauty can be found in what has been tended over time rather than made flawless, and in recognising when rest is part of growth.',
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
    upright: 'The Emperor is the capacity to create order that protects what matters. Upright, he represents boundaries, leadership, consistency and the willingness to make decisions that give a system strength. In a reading, this may describe your own need for structure or the influence of someone carrying strong leadership, authority or Aries-like qualities. In a Past position it can point to structures or authority that shaped the situation; in the Present, a need for clear boundaries or decisions; in the Future, greater stability that may come through deliberate organisation rather than prediction of a fixed outcome.',
    reversed: 'Reversed, structure can harden into domination or become so brittle that it no longer serves life. It may also show a lack of dependable boundaries. The question is whether authority is supporting growth or merely defending itself. Position and surrounding cards can help show whether this reflects another person, an institution, or your own relationship with control and responsibility.',
    numerology: 'Four is foundation: the square, the stable frame, the four directions. It brings containment, reliability and the challenge of balancing stability with flexibility.',
    psychological: 'Jungian lens: Logos, Father and Wise Sovereign. The Emperor reflects the psyche\'s capacity for limits, responsibility and coherent order. In shadow, authority becomes inflexible, punitive or disconnected from feeling.',
    wuWei: 'Wu Wei: good structure should support movement rather than fight it. The Emperor can ask where one clear boundary or decision would create enough stability for everything else to move more naturally.',
    wabiSabi: 'Wabi-sabi: a strong structure does not have to be rigid or immaculate. Mature authority can accommodate age, change and imperfection while still protecting what matters.',
    spiritual: 'Spiritually, The Emperor asks how inner values become lived principles. Discipline is not the opposite of freedom when it creates a stable vessel for what you genuinely care about.',
    symbolism: 'The throne, stone and ram imagery evoke endurance, command and Aries fire. The landscape is austere: authority here is less about comfort than about responsibility and definition.',
    journalPrompt: 'Where would a clearer boundary or stronger structure create more freedom for me?',
    connections: [
      { card: 'The Empress', title: 'Structure and Creation', meaning: 'The Emperor provides form while The Empress provides life. Healthy order supports creativity rather than replacing it.' },
      { card: 'The Fool', title: 'Authority Meets Rebellion', meaning: 'The Fool questions inherited rules; The Emperor tests whether those rules are necessary. The pair can reveal where structure is protective and where it has become stale.' },
      { card: 'The Magician', title: 'Systematised Power', meaning: 'The Magician supplies skill and intent; The Emperor turns that capacity into a repeatable structure, role or institution.' }
    ]
  }
];

// Complete Rider–Waite deck. IDs 0–4 and their original editorial content are preserved.
const originalCardMetadata = [
  {
    "id": 0,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 0,
    "image": "assets/deck/ar00.jpg",
    "atmosphere": "assets/whisper-fool.jpg"
  },
  {
    "id": 1,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 1,
    "image": "assets/deck/ar01.jpg",
    "atmosphere": "assets/whisper-magician.jpg"
  },
  {
    "id": 2,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 2,
    "image": "assets/deck/ar02.jpg",
    "atmosphere": "assets/whisper-high-priestess.jpg"
  },
  {
    "id": 3,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 3,
    "image": "assets/deck/ar03.jpg",
    "atmosphere": "assets/whisper-empress.jpg"
  },
  {
    "id": 4,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 4,
    "image": "assets/deck/ar04.jpg",
    "atmosphere": "assets/whisper-emperor.jpg"
  }
];
originalCardMetadata.forEach(meta => Object.assign(cards.find(card => card.id === meta.id), meta));
cards.push(...[
  {
    "id": 5,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 5,
    "roman": "V",
    "element": "Earth",
    "astrology": "Taurus",
    "name": "The Hierophant",
    "subtitle": "Tradition · Learning · Belonging",
    "uprightKeywords": [
      "Tradition",
      "Learning",
      "Belonging"
    ],
    "reversedKeywords": [
      "Dogma",
      "Conformity",
      "Questioning"
    ],
    "upright": "A teacher, tradition or shared practice can give your experience a useful framework. Learn the reasons behind the rules, then decide which values you want to carry into daily life.",
    "reversed": "Inherited rules may no longer fit your experience. Question a teaching without dismissing everything it offered; distinguish an honest search for meaning from obedience motivated by fear.",
    "symbolism": "A seated teacher, two students and crossed keys suggest initiation, shared knowledge and the structures through which a community passes on its values.",
    "journalPrompt": "Which teaching supports my integrity, and which rule am I following only to belong?",
    "psychological": "Psychological lens: The inner teacher develops when received wisdom is examined rather than simply repeated. Belonging need not require abandoning personal judgement.",
    "spiritual": "The Hierophant invites reflection on tradition, learning, belonging. Which teaching supports my integrity, and which rule am I following only to belong?",
    "wuWei": "A practice of unforced attention with The Hierophant: Which teaching supports my integrity, and which rule am I following only to belong?",
    "wabiSabi": "An imperfect, lived expression of tradition can be more useful than an ideal you cannot inhabit. The inner teacher develops when received wisdom is examined rather than simply repeated. Belonging need not require abandoning personal judgement.",
    "numerology": "Five disrupts an established pattern and invites a response to change. In The Hierophant, consider how this relates to tradition.",
    "connections": [
      {
        "card": "The High Priestess",
        "title": "Received Wisdom and Inner Knowing",
        "meaning": "The Hierophant offers a shared teaching; The High Priestess asks what your own experience knows. Let each test and enrich the other."
      }
    ],
    "image": "assets/deck/ar05.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 6,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 6,
    "roman": "VI",
    "element": "Air",
    "astrology": "Gemini",
    "name": "The Lovers",
    "subtitle": "Alignment · Partnership · Choice",
    "uprightKeywords": [
      "Alignment",
      "Partnership",
      "Choice"
    ],
    "reversedKeywords": [
      "Misalignment",
      "Division",
      "Compromise"
    ],
    "upright": "A meaningful relationship or choice asks you to act in line with your values. Mutual openness matters more than an ideal image of harmony; choose the commitments you can honestly sustain.",
    "reversed": "Attraction, duty and personal values may be pulling in different directions. Name the disagreement before promising unity, and avoid sacrificing your voice merely to keep a connection intact.",
    "symbolism": "Two figures beneath an angel stand before distinct trees. Their openness connects relationship with conscience, vulnerability and a freely made choice.",
    "journalPrompt": "What choice would bring my relationships and my values into closer agreement?",
    "psychological": "Psychological lens: Relationship brings disowned needs and desires into view. Integration asks for conscious choice rather than expecting another person to complete the self.",
    "spiritual": "The Lovers invites reflection on alignment, partnership, choice. What choice would bring my relationships and my values into closer agreement?",
    "wuWei": "A practice of unforced attention with The Lovers: What choice would bring my relationships and my values into closer agreement?",
    "wabiSabi": "An imperfect, lived expression of alignment can be more useful than an ideal you cannot inhabit. Relationship brings disowned needs and desires into view. Integration asks for conscious choice rather than expecting another person to complete the self.",
    "numerology": "Six explores adjustment, relationship and a more workable harmony. In The Lovers, consider how this relates to alignment.",
    "connections": [
      {
        "card": "Two of Cups",
        "title": "Choice and Reciprocity",
        "meaning": "The Lovers asks for alignment with values; Two of Cups tests whether an actual exchange is mutual. Attraction becomes a relationship through freely chosen participation."
      }
    ],
    "image": "assets/deck/ar06.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 7,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 7,
    "roman": "VII",
    "element": "Water",
    "astrology": "Cancer",
    "name": "The Chariot",
    "subtitle": "Direction · Discipline · Determination",
    "uprightKeywords": [
      "Direction",
      "Discipline",
      "Determination"
    ],
    "reversedKeywords": [
      "Drift",
      "Force",
      "Conflicting Aims"
    ],
    "upright": "Progress depends on bringing competing impulses into a chosen direction. Define what success means, keep your attention on the task, and let discipline coordinate the effort rather than intensify conflict.",
    "reversed": "Pushing harder may conceal uncertainty about where you are going. Reconcile conflicting priorities, check whether the goal is still yours, and regain direction before demanding more speed.",
    "symbolism": "An armoured driver stands above black and white sphinxes. Their opposing colours suggest forces that must cooperate for the vehicle to move.",
    "journalPrompt": "Which competing impulses need a shared direction before I move forward?",
    "psychological": "Psychological lens: The organising self can hold tension without allowing one impulse to dominate every decision. Agency grows through coordination, not constant suppression.",
    "spiritual": "The Chariot invites reflection on direction, discipline, determination. Which competing impulses need a shared direction before I move forward?",
    "wuWei": "A practice of unforced attention with The Chariot: Which competing impulses need a shared direction before I move forward?",
    "wabiSabi": "An imperfect, lived expression of direction can be more useful than an ideal you cannot inhabit. The organising self can hold tension without allowing one impulse to dominate every decision. Agency grows through coordination, not constant suppression.",
    "numerology": "Seven pauses to examine direction, effort and inner conviction. In The Chariot, consider how this relates to direction.",
    "connections": [
      {
        "card": "Strength",
        "title": "Direction and Gentleness",
        "meaning": "The Chariot gathers effort toward an aim; Strength asks how the instinct behind that effort is being treated. Progress can combine direction with compassionate limits."
      }
    ],
    "image": "assets/deck/ar07.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 8,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 8,
    "roman": "VIII",
    "element": "Fire",
    "astrology": "Leo",
    "name": "Strength",
    "subtitle": "Courage · Compassion · Patience",
    "uprightKeywords": [
      "Courage",
      "Compassion",
      "Patience"
    ],
    "reversedKeywords": [
      "Self-Doubt",
      "Reactivity",
      "Exhaustion"
    ],
    "upright": "Meet a strong feeling or difficult situation with patient courage. Firmness can be gentle: recognise the instinct beneath the reaction and respond without humiliating yourself or another person.",
    "reversed": "Fear, fatigue or harsh self-judgement may make a situation feel unmanageable. Reduce the strain before testing your endurance again; courage can begin with asking for support.",
    "symbolism": "A woman calmly tends a lion beneath an infinity sign. The image joins instinct and awareness through trust rather than a display of force.",
    "journalPrompt": "Where would compassionate firmness help more than trying to overpower my feelings?",
    "psychological": "Psychological lens: Instinct becomes less frightening when it is acknowledged. The task is to develop a relationship with anger, desire or fear instead of treating it as an enemy.",
    "spiritual": "Strength invites reflection on courage, compassion, patience. Where would compassionate firmness help more than trying to overpower my feelings?",
    "wuWei": "A practice of unforced attention with Strength: Where would compassionate firmness help more than trying to overpower my feelings?",
    "wabiSabi": "An imperfect, lived expression of courage can be more useful than an ideal you cannot inhabit. Instinct becomes less frightening when it is acknowledged. The task is to develop a relationship with anger, desire or fear instead of treating it as an enemy.",
    "numerology": "Eight develops power through practice, organisation or repeated engagement. In Strength, consider how this relates to courage.",
    "connections": [
      {
        "card": "The Emperor",
        "title": "Strength and Structure",
        "meaning": "Strength brings patient contact with feeling; The Emperor offers a dependable boundary. Together they ask for firmness that does not need domination."
      }
    ],
    "image": "assets/deck/ar08.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 9,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 9,
    "roman": "IX",
    "element": "Earth",
    "astrology": "Virgo",
    "name": "The Hermit",
    "subtitle": "Reflection · Discernment · Inner Guidance",
    "uprightKeywords": [
      "Reflection",
      "Discernment",
      "Inner Guidance"
    ],
    "reversedKeywords": [
      "Isolation",
      "Withdrawal",
      "Avoidance"
    ],
    "upright": "Step back from competing voices long enough to recognise your own understanding. Solitude, study or a trusted guide can help you identify the next honest step without needing the whole path illuminated.",
    "reversed": "Reflection may have become a way to postpone contact or action. Ask whether solitude is restoring your perspective or protecting you from the conversation you need to have.",
    "symbolism": "A cloaked figure holds a lantern on a mountain. The small light offers enough illumination for the next step, rather than a complete map.",
    "journalPrompt": "What do I hear in quiet, and when does quiet become a hiding place?",
    "psychological": "Psychological lens: Inner guidance develops through reflective distance. Returning from solitude with something useful is as important as withdrawing to find it.",
    "spiritual": "The Hermit invites reflection on reflection, discernment, inner guidance. What do I hear in quiet, and when does quiet become a hiding place?",
    "wuWei": "A practice of unforced attention with The Hermit: What do I hear in quiet, and when does quiet become a hiding place?",
    "wabiSabi": "An imperfect, lived expression of reflection can be more useful than an ideal you cannot inhabit. Inner guidance develops through reflective distance. Returning from solitude with something useful is as important as withdrawing to find it.",
    "numerology": "Nine draws experience toward maturity while asking what is still needed. In The Hermit, consider how this relates to reflection.",
    "connections": [
      {
        "card": "The High Priestess",
        "title": "Solitude and Listening",
        "meaning": "The Hermit steps back to discern a path; The High Priestess attends to what is not yet fully expressed. Give quiet understanding a practical next step."
      }
    ],
    "image": "assets/deck/ar09.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 10,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 10,
    "roman": "X",
    "element": "Fire",
    "astrology": "Jupiter",
    "name": "Wheel of Fortune",
    "subtitle": "Change · Cycles · Adaptability",
    "uprightKeywords": [
      "Change",
      "Cycles",
      "Adaptability"
    ],
    "reversedKeywords": [
      "Resistance",
      "Setbacks",
      "Repeating Patterns"
    ],
    "upright": "Circumstances are moving through a turn in the cycle. Notice what is changing beyond your control and use the choices still available; an opening becomes useful when preparation meets timing.",
    "reversed": "A setback or recurring pattern may be exposing the limits of control. Look for the part you can change without blaming yourself for every turn of circumstance.",
    "symbolism": "A great wheel turns among symbolic creatures while figures rise and fall around it. Movement and recurrence sit alongside the search for enduring understanding.",
    "journalPrompt": "What is changing around me, and where do I still have a useful choice?",
    "psychological": "Psychological lens: The self meets a wider world it cannot fully organise. Recognising a cycle can loosen the belief that either success or difficulty defines you permanently.",
    "spiritual": "Wheel of Fortune invites reflection on change, cycles, adaptability. What is changing around me, and where do I still have a useful choice?",
    "wuWei": "A practice of unforced attention with Wheel of Fortune: What is changing around me, and where do I still have a useful choice?",
    "wabiSabi": "An imperfect, lived expression of change can be more useful than an ideal you cannot inhabit. The self meets a wider world it cannot fully organise. Recognising a cycle can loosen the belief that either success or difficulty defines you permanently.",
    "numerology": "Ten completes a cycle and carries its consequences into another beginning. In Wheel of Fortune, consider how this relates to change.",
    "connections": [
      {
        "card": "Two of Pentacles",
        "title": "Change and Adaptation",
        "meaning": "The Wheel shows changing circumstances; Two of Pentacles explores daily adjustment. Use flexibility for what can be managed without expecting to control the whole cycle."
      }
    ],
    "image": "assets/deck/ar10.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 11,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 11,
    "roman": "XI",
    "element": "Air",
    "astrology": "Libra",
    "name": "Justice",
    "subtitle": "Fairness · Accountability · Clarity",
    "uprightKeywords": [
      "Fairness",
      "Accountability",
      "Clarity"
    ],
    "reversedKeywords": [
      "Bias",
      "Avoidance",
      "Imbalance"
    ],
    "upright": "Look carefully at evidence, agreements and consequences. A balanced decision requires honesty about your own part as well as the other side; make the choice you can explain and take responsibility for.",
    "reversed": "Something may be obscured by bias, avoidance or an unequal standard. Revisit the facts and hear the missing perspective before deciding what a fair repair would involve.",
    "symbolism": "A seated figure holds scales and an upright sword. Consideration and clear judgement must work together, with consequences following the decision.",
    "journalPrompt": "What would a fair account of this situation include about my own actions?",
    "psychological": "Psychological lens: Conscience matures when it can examine intention and impact together. Being accountable need not become a judgement that the whole self is beyond repair.",
    "spiritual": "Justice invites reflection on fairness, accountability, clarity. What would a fair account of this situation include about my own actions?",
    "wuWei": "A practice of unforced attention with Justice: What would a fair account of this situation include about my own actions?",
    "wabiSabi": "An imperfect, lived expression of fairness can be more useful than an ideal you cannot inhabit. Conscience matures when it can examine intention and impact together. Being accountable need not become a judgement that the whole self is beyond repair.",
    "numerology": "Eleven asks for conscious judgement as an established order is examined. In Justice, consider how this relates to fairness.",
    "connections": [
      {
        "card": "King of Swords",
        "title": "Fairness and Reason",
        "meaning": "Justice asks about accountability and consequences; King of Swords examines the principles behind a decision. A fair conclusion needs both evidence and consistency."
      }
    ],
    "image": "assets/deck/ar11.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 12,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 12,
    "roman": "XII",
    "element": "Water",
    "astrology": "Water",
    "name": "The Hanged Man",
    "subtitle": "Perspective · Surrender · Pause",
    "uprightKeywords": [
      "Perspective",
      "Surrender",
      "Pause"
    ],
    "reversedKeywords": [
      "Stagnation",
      "Resistance",
      "Needless Sacrifice"
    ],
    "upright": "A deliberate pause can reveal what effort has obscured. Try looking from another position, release the demand for an immediate result, and distinguish useful waiting from giving away your agency.",
    "reversed": "Waiting may have lost its purpose, or a sacrifice may no longer serve anyone. Name what you are postponing and what would make the pause a conscious choice again.",
    "symbolism": "A figure hangs by one foot with a calm face and a halo. Physical inversion becomes an image of changed perception rather than defeat.",
    "journalPrompt": "What becomes visible when I stop insisting on my usual point of view?",
    "psychological": "Psychological lens: An old way of solving problems can temporarily lose its power. Tolerating that uncertainty allows a different relationship to the situation to emerge.",
    "spiritual": "The Hanged Man invites reflection on perspective, surrender, pause. What becomes visible when I stop insisting on my usual point of view?",
    "wuWei": "A practice of unforced attention with The Hanged Man: What becomes visible when I stop insisting on my usual point of view?",
    "wabiSabi": "An imperfect, lived expression of perspective can be more useful than an ideal you cannot inhabit. An old way of solving problems can temporarily lose its power. Tolerating that uncertainty allows a different relationship to the situation to emerge.",
    "numerology": "Twelve marks a pause in the usual sequence and the possibility of a changed perspective. In The Hanged Man, consider how this relates to perspective.",
    "connections": [
      {
        "card": "Four of Swords",
        "title": "Perspective and Rest",
        "meaning": "The Hanged Man changes the viewpoint; Four of Swords gives the mind a pause. Distinguish restorative waiting from postponement that has lost its purpose."
      }
    ],
    "image": "assets/deck/ar12.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 13,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 13,
    "roman": "XIII",
    "element": "Water",
    "astrology": "Scorpio",
    "name": "Death",
    "subtitle": "Transition · Release · Renewal",
    "uprightKeywords": [
      "Transition",
      "Release",
      "Renewal"
    ],
    "reversedKeywords": [
      "Clinging",
      "Delayed Ending",
      "Fear of Change"
    ],
    "upright": "An ending or change of form asks you to release what has completed its purpose. Make room to grieve and attend to what remains alive; this card speaks symbolically of transition, not a prediction of physical death.",
    "reversed": "Holding tightly to an exhausted arrangement may prolong uncertainty. Ask what you fear losing, then consider a smaller, supported act of release rather than forcing yourself to change all at once.",
    "symbolism": "A skeletal rider passes people of different stations as the sun appears between towers. The scene links unavoidable change with the possibility of another beginning.",
    "journalPrompt": "What has finished its purpose, and how can I let it go with care?",
    "psychological": "Psychological lens: Identity can resist endings even when circumstances have already changed. Mourning a former role makes space for a self that is no longer organised around it.",
    "spiritual": "Death invites reflection on transition, release, renewal. What has finished its purpose, and how can I let it go with care?",
    "wuWei": "A practice of unforced attention with Death: What has finished its purpose, and how can I let it go with care?",
    "wabiSabi": "An imperfect, lived expression of transition can be more useful than an ideal you cannot inhabit. Identity can resist endings even when circumstances have already changed. Mourning a former role makes space for a self that is no longer organised around it.",
    "numerology": "Thirteen transforms a completed form so that another stage can begin. In Death, consider how this relates to transition.",
    "connections": [
      {
        "card": "Eight of Cups",
        "title": "Ending and Departure",
        "meaning": "Death asks what has completed its form; Eight of Cups explores the choice to leave what no longer nourishes. Make room for grief as well as movement."
      }
    ],
    "image": "assets/deck/ar13.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 14,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 14,
    "roman": "XIV",
    "element": "Fire",
    "astrology": "Sagittarius",
    "name": "Temperance",
    "subtitle": "Integration · Moderation · Healing",
    "uprightKeywords": [
      "Integration",
      "Moderation",
      "Healing"
    ],
    "reversedKeywords": [
      "Excess",
      "Discord",
      "Impatience"
    ],
    "upright": "Bring different needs into a workable relationship through measured adjustments. The useful balance is responsive rather than fixed: combine what helps, leave room for rest, and allow integration to take time.",
    "reversed": "An extreme response or impatient mixture may be increasing strain. Simplify the demands, identify what is out of proportion, and rebuild a rhythm you can maintain.",
    "symbolism": "An angel pours between two cups with one foot on land and one in water. A path leads toward distant light, suggesting patient integration.",
    "journalPrompt": "Which small adjustment would make my current rhythm more sustainable?",
    "psychological": "Psychological lens: Integration allows apparently opposing needs to inform one another. The aim is a living relationship between them rather than a perfect compromise reached once.",
    "spiritual": "Temperance invites reflection on integration, moderation, healing. Which small adjustment would make my current rhythm more sustainable?",
    "wuWei": "A practice of unforced attention with Temperance: Which small adjustment would make my current rhythm more sustainable?",
    "wabiSabi": "An imperfect, lived expression of integration can be more useful than an ideal you cannot inhabit. Integration allows apparently opposing needs to inform one another. The aim is a living relationship between them rather than a perfect compromise reached once.",
    "numerology": "Fourteen explores integration through patient adjustment rather than a fixed midpoint. In Temperance, consider how this relates to integration.",
    "connections": [
      {
        "card": "Two of Pentacles",
        "title": "Integration and Rhythm",
        "meaning": "Temperance blends different needs; Two of Pentacles manages their daily demands. Small changes in rhythm can make a larger integration sustainable."
      }
    ],
    "image": "assets/deck/ar14.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 15,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 15,
    "roman": "XV",
    "element": "Earth",
    "astrology": "Capricorn",
    "name": "The Devil",
    "subtitle": "Attachment · Awareness · Reclaiming Choice",
    "uprightKeywords": [
      "Attachment",
      "Awareness",
      "Reclaiming Choice"
    ],
    "reversedKeywords": [
      "Release",
      "Recognition",
      "Breaking Patterns"
    ],
    "upright": "A habit, agreement or desire may be narrowing your sense of choice. Look honestly at its rewards and costs, especially where shame keeps it hidden; begin with one boundary you can actually keep.",
    "reversed": "A binding pattern may be becoming easier to recognise or loosen. Support that awareness with practical changes and help where needed; insight alone does not have to carry the whole recovery.",
    "symbolism": "Two figures stand beneath a horned figure with loose chains around their necks. The scene asks what binds them and what room for movement remains.",
    "journalPrompt": "What am I calling unavoidable that may contain a choice I have not yet used?",
    "psychological": "Psychological lens: Shadow material becomes more powerful when denied. Bringing desire, dependence or shame into awareness can restore responsibility without turning the self into an enemy.",
    "spiritual": "The Devil invites reflection on attachment, awareness, reclaiming choice. What am I calling unavoidable that may contain a choice I have not yet used?",
    "wuWei": "A practice of unforced attention with The Devil: What am I calling unavoidable that may contain a choice I have not yet used?",
    "wabiSabi": "An imperfect, lived expression of attachment can be more useful than an ideal you cannot inhabit. Shadow material becomes more powerful when denied. Bringing desire, dependence or shame into awareness can restore responsibility without turning the self into an enemy.",
    "numerology": "Fifteen asks how desire and attachment shape the use of personal power. In The Devil, consider how this relates to attachment.",
    "connections": [
      {
        "card": "Eight of Swords",
        "title": "Attachment and Perceived Limits",
        "meaning": "The Devil examines a binding pattern; Eight of Swords asks which limits are real and which may be loosened. Awareness is most useful when supported by a concrete next step."
      }
    ],
    "image": "assets/deck/ar15.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 16,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 16,
    "roman": "XVI",
    "element": "Fire",
    "astrology": "Mars",
    "name": "The Tower",
    "subtitle": "Disruption · Revelation · Rebuilding",
    "uprightKeywords": [
      "Disruption",
      "Revelation",
      "Rebuilding"
    ],
    "reversedKeywords": [
      "Avoidance",
      "Instability",
      "Internal Upheaval"
    ],
    "upright": "A sudden change or unwelcome truth may expose a structure that could not hold. Attend first to immediate support and practical needs, then decide what deserves rebuilding on more honest foundations.",
    "reversed": "You may sense instability while trying to prevent any visible change. Take the warning signs seriously and make manageable repairs rather than waiting until the strain demands an emergency response.",
    "symbolism": "Lightning strikes a crowned tower and figures fall from it. The image shows the collapse of assumed security, without specifying a literal future event.",
    "journalPrompt": "Which foundation needs honest attention before I build anything more on it?",
    "psychological": "Psychological lens: A challenged belief can feel like a threat to identity. Grounding and support help the psyche revise its picture of the world without demanding instant meaning from disruption.",
    "spiritual": "The Tower invites reflection on disruption, revelation, rebuilding. Which foundation needs honest attention before I build anything more on it?",
    "wuWei": "A practice of unforced attention with The Tower: Which foundation needs honest attention before I build anything more on it?",
    "wabiSabi": "An imperfect, lived expression of disruption can be more useful than an ideal you cannot inhabit. A challenged belief can feel like a threat to identity. Grounding and support help the psyche revise its picture of the world without demanding instant meaning from disruption.",
    "numerology": "Sixteen breaks a familiar structure and exposes the foundations beneath it. In The Tower, consider how this relates to disruption.",
    "connections": [
      {
        "card": "The Star",
        "title": "Disruption and Renewal",
        "meaning": "The Tower exposes a failed structure; The Star offers replenishment after strain. Attend to immediate support before asking renewal to explain the disruption."
      }
    ],
    "image": "assets/deck/ar16.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 17,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 17,
    "roman": "XVII",
    "element": "Air",
    "astrology": "Aquarius",
    "name": "The Star",
    "subtitle": "Hope · Renewal · Openness",
    "uprightKeywords": [
      "Hope",
      "Renewal",
      "Openness"
    ],
    "reversedKeywords": [
      "Discouragement",
      "Disconnection",
      "Depletion"
    ],
    "upright": "After strain, a quieter sense of possibility can return. Replenish what has been depleted and give a modest hope some daily attention; renewal does not require pretending that the difficulty never happened.",
    "reversed": "Hope may feel remote because you are tired or comparing your recovery with an ideal. Seek a reliable source of nourishment and notice small signs of connection before demanding confidence.",
    "symbolism": "A kneeling figure pours water onto land and into a pool beneath a large star. Generosity and replenishment connect inner life with the wider world.",
    "journalPrompt": "What small practice helps me feel replenished and able to hope again?",
    "psychological": "Psychological lens: Trust can return gradually after disillusionment. Letting the self be seen without armour may restore connection more effectively than constructing a new ideal image.",
    "spiritual": "The Star invites reflection on hope, renewal, openness. What small practice helps me feel replenished and able to hope again?",
    "wuWei": "A practice of unforced attention with The Star: What small practice helps me feel replenished and able to hope again?",
    "wabiSabi": "An imperfect, lived expression of hope can be more useful than an ideal you cannot inhabit. Trust can return gradually after disillusionment. Letting the self be seen without armour may restore connection more effectively than constructing a new ideal image.",
    "numerology": "Seventeen opens a relationship with hope after the disruption of a former certainty. In The Star, consider how this relates to hope.",
    "connections": [
      {
        "card": "Ace of Cups",
        "title": "Hope and Receptivity",
        "meaning": "The Star restores a relationship with possibility; Ace of Cups opens a channel for feeling and care. Let small experiences of nourishment rebuild trust."
      }
    ],
    "image": "assets/deck/ar17.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 18,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 18,
    "roman": "XVIII",
    "element": "Water",
    "astrology": "Pisces",
    "name": "The Moon",
    "subtitle": "Uncertainty · Dreams · Intuition",
    "uprightKeywords": [
      "Uncertainty",
      "Dreams",
      "Intuition"
    ],
    "reversedKeywords": [
      "Emerging Clarity",
      "Confusion",
      "Projection"
    ],
    "upright": "Not everything is clear enough to conclude. Attend to dreams and feelings as information about your experience while checking assumptions against evidence; move carefully through ambiguity instead of mistaking fear for certainty.",
    "reversed": "Something previously obscured may be coming into view, though anxiety can still distort it. Separate what you know, what you imagine and what remains uncertain before choosing your response.",
    "symbolism": "A path runs between towers beneath the moon, with a dog, wolf and emerging crayfish. Familiar and instinctive responses meet at the edge of the unknown.",
    "journalPrompt": "What do I know, what do I fear, and what am I filling in for myself?",
    "psychological": "Psychological lens: Unconscious imagery can enrich understanding while also inviting projection. Holding an image symbolically helps prevent an inner fear from becoming an unquestioned claim about the outside world.",
    "spiritual": "The Moon invites reflection on uncertainty, dreams, intuition. What do I know, what do I fear, and what am I filling in for myself?",
    "wuWei": "A practice of unforced attention with The Moon: What do I know, what do I fear, and what am I filling in for myself?",
    "wabiSabi": "An imperfect, lived expression of uncertainty can be more useful than an ideal you cannot inhabit. Unconscious imagery can enrich understanding while also inviting projection. Holding an image symbolically helps prevent an inner fear from becoming an unquestioned claim about the outside world.",
    "numerology": "Eighteen enters uncertainty, where feeling and imagination need careful discernment. In The Moon, consider how this relates to uncertainty.",
    "connections": [
      {
        "card": "Seven of Cups",
        "title": "Uncertainty and Possibility",
        "meaning": "The Moon makes assumptions difficult to verify; Seven of Cups multiplies imagined options. Separate an image that reveals desire from evidence that supports a decision."
      }
    ],
    "image": "assets/deck/ar18.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 19,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 19,
    "roman": "XIX",
    "element": "Fire",
    "astrology": "Sun",
    "name": "The Sun",
    "subtitle": "Vitality · Joy · Clarity",
    "uprightKeywords": [
      "Vitality",
      "Joy",
      "Clarity"
    ],
    "reversedKeywords": [
      "Muted Joy",
      "Overconfidence",
      "Temporary Cloud"
    ],
    "upright": "Clarity, warmth or a shared success can restore your energy. Let yourself enjoy what is working and express it plainly; confidence is strongest when it leaves room for other people to shine too.",
    "reversed": "Joy may be temporarily muted, or enthusiasm may be overlooking an important detail. Lower the pressure to appear happy and check what would support a more grounded sense of confidence.",
    "symbolism": "A child rides a white horse beneath a bright sun, with sunflowers behind a wall. The scene joins openness, growth and uncomplicated vitality.",
    "journalPrompt": "What can I enjoy openly without needing to prove or perfect it?",
    "psychological": "Psychological lens: A more spontaneous self can emerge when it feels safe to be visible. Confidence becomes generous when recognition is shared rather than hoarded.",
    "spiritual": "The Sun invites reflection on vitality, joy, clarity. What can I enjoy openly without needing to prove or perfect it?",
    "wuWei": "A practice of unforced attention with The Sun: What can I enjoy openly without needing to prove or perfect it?",
    "wabiSabi": "An imperfect, lived expression of vitality can be more useful than an ideal you cannot inhabit. A more spontaneous self can emerge when it feels safe to be visible. Confidence becomes generous when recognition is shared rather than hoarded.",
    "numerology": "Nineteen brings experience into the light of conscious appreciation and shared vitality. In The Sun, consider how this relates to vitality.",
    "connections": [
      {
        "card": "Six of Wands",
        "title": "Joy and Recognition",
        "meaning": "The Sun invites open enjoyment; Six of Wands offers recognition for effort. Share the warmth without making applause the only measure of success."
      }
    ],
    "image": "assets/deck/ar19.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 20,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 20,
    "roman": "XX",
    "element": "Fire",
    "astrology": "Fire",
    "name": "Judgement",
    "subtitle": "Awakening · Review · Renewed Purpose",
    "uprightKeywords": [
      "Awakening",
      "Review",
      "Renewed Purpose"
    ],
    "reversedKeywords": [
      "Self-Criticism",
      "Avoidance",
      "Unanswered Call"
    ],
    "upright": "An honest review of the past can help you answer a new sense of purpose. Recognise what you have learned, make amends where possible, and choose the responsibility you are ready to accept now.",
    "reversed": "Harsh self-criticism or fear of change may be drowning out a useful inner call. Distinguish responsibility from punishment and take one concrete step instead of waiting to feel fully worthy.",
    "symbolism": "Figures rise toward an angel sounding a trumpet. The image suggests a summons to awareness and renewal rather than a final verdict on a person.",
    "journalPrompt": "What is asking for my response now, and what from the past can I carry differently?",
    "psychological": "Psychological lens: Revisiting the personal story can reveal possibilities that an older identity excluded. Integration includes accountability while allowing the self to develop beyond an earlier mistake.",
    "spiritual": "Judgement invites reflection on awakening, review, renewed purpose. What is asking for my response now, and what from the past can I carry differently?",
    "wuWei": "A practice of unforced attention with Judgement: What is asking for my response now, and what from the past can I carry differently?",
    "wabiSabi": "An imperfect, lived expression of awakening can be more useful than an ideal you cannot inhabit. Revisiting the personal story can reveal possibilities that an older identity excluded. Integration includes accountability while allowing the self to develop beyond an earlier mistake.",
    "numerology": "Twenty reviews the journey and invites a more conscious response to its meaning. In Judgement, consider how this relates to awakening.",
    "connections": [
      {
        "card": "Justice",
        "title": "Review and Responsibility",
        "meaning": "Judgement revisits the personal story; Justice considers actions and consequences. Accountability can guide a renewed purpose without becoming permanent self-condemnation."
      }
    ],
    "image": "assets/deck/ar20.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 21,
    "arcana": "Major",
    "suit": null,
    "rank": null,
    "number": 21,
    "roman": "XXI",
    "element": "Earth",
    "astrology": "Saturn",
    "name": "The World",
    "subtitle": "Completion · Integration · Participation",
    "uprightKeywords": [
      "Completion",
      "Integration",
      "Participation"
    ],
    "reversedKeywords": [
      "Unfinished Work",
      "Delayed Closure",
      "Fragmentation"
    ],
    "upright": "A cycle is reaching a meaningful completion. Recognise the skills and relationships that made it possible, attend to the final details, and let what you have learned inform your next participation in the world.",
    "reversed": "Something remains to be integrated before a chapter can close. Identify the unfinished task or unacknowledged feeling rather than chasing a new beginning that leaves the same loose end behind.",
    "symbolism": "A dancing figure stands within a wreath, surrounded by four creatures. Movement inside an enclosing form suggests both wholeness and continuing life.",
    "journalPrompt": "What needs acknowledgement or completion before I move into the next chapter?",
    "psychological": "Psychological lens: Wholeness is the capacity to hold different parts of experience in relationship. Completion can be celebrated without expecting the self to become finished forever.",
    "spiritual": "The World invites reflection on completion, integration, participation. What needs acknowledgement or completion before I move into the next chapter?",
    "wuWei": "A practice of unforced attention with The World: What needs acknowledgement or completion before I move into the next chapter?",
    "wabiSabi": "An imperfect, lived expression of completion can be more useful than an ideal you cannot inhabit. Wholeness is the capacity to hold different parts of experience in relationship. Completion can be celebrated without expecting the self to become finished forever.",
    "numerology": "Twenty-one gathers the cycle into a completion that can support further participation. In The World, consider how this relates to completion.",
    "connections": [
      {
        "card": "Ten of Pentacles",
        "title": "Completion and Continuity",
        "meaning": "The World gathers a cycle into wholeness; Ten of Pentacles asks what can endure and be passed on. Completion becomes useful through continuing participation."
      }
    ],
    "image": "assets/deck/ar21.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 22,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Ace",
    "number": 1,
    "roman": "I",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Ace of Wands",
    "subtitle": "Inspiration · Potential · Initiative",
    "uprightKeywords": [
      "Inspiration",
      "Potential",
      "Initiative"
    ],
    "reversedKeywords": [
      "Blocked Spark",
      "Delay",
      "False Start"
    ],
    "upright": "A fresh creative impulse asks for a first experiment. Give the idea a small practical outlet before deciding its final shape; enthusiasm needs somewhere to take root.",
    "reversed": "The spark may be real but the timing or energy is not yet right. Rest, narrow the idea, or test its purpose instead of forcing a grand beginning.",
    "symbolism": "A hand holds a budding wand above a fertile landscape, making possibility visible before a finished project exists.",
    "journalPrompt": "What small action would give my new idea somewhere to grow?",
    "psychological": "Psychological lens: Creative energy becomes usable when curiosity is given permission to act before mastery.",
    "spiritual": "Ace of Wands invites reflection on inspiration, potential, initiative. What small action would give my new idea somewhere to grow?",
    "wuWei": "A practice of unforced attention with Ace of Wands: What small action would give my new idea somewhere to grow?",
    "wabiSabi": "An imperfect, lived expression of inspiration can be more useful than an ideal you cannot inhabit. Creative energy becomes usable when curiosity is given permission to act before mastery.",
    "numerology": "One begins a cycle with a seed, focus or initial act. In Ace of Wands, consider how this relates to inspiration.",
    "connections": [
      {
        "card": "Ace of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa01.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 23,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Two",
    "number": 2,
    "roman": "II",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Two of Wands",
    "subtitle": "Planning · Possibility · Perspective",
    "uprightKeywords": [
      "Planning",
      "Possibility",
      "Perspective"
    ],
    "reversedKeywords": [
      "Fear of Expansion",
      "Indecision",
      "Small Horizons"
    ],
    "upright": "You have an initial foothold and can now consider a wider horizon. Compare the real demands of possible paths and make a plan that allows ambition to meet your circumstances.",
    "reversed": "You may be holding possibilities without choosing, or shrinking a wish to avoid uncertainty. Name the risk you can accept and the information you still need.",
    "symbolism": "A figure holds a globe between two wands while surveying distant land and sea.",
    "journalPrompt": "Which possibility am I ready to plan for rather than only imagine?",
    "psychological": "Psychological lens: A larger imagined life can guide development when it remains in dialogue with present reality.",
    "spiritual": "Two of Wands invites reflection on planning, possibility, perspective. Which possibility am I ready to plan for rather than only imagine?",
    "wuWei": "A practice of unforced attention with Two of Wands: Which possibility am I ready to plan for rather than only imagine?",
    "wabiSabi": "An imperfect, lived expression of planning can be more useful than an ideal you cannot inhabit. A larger imagined life can guide development when it remains in dialogue with present reality.",
    "numerology": "Two brings relationship, polarity and the need to consider another position. In Two of Wands, consider how this relates to planning.",
    "connections": [
      {
        "card": "Two of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa02.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 24,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Three",
    "number": 3,
    "roman": "III",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Three of Wands",
    "subtitle": "Expansion · Foresight · Cooperation",
    "uprightKeywords": [
      "Expansion",
      "Foresight",
      "Cooperation"
    ],
    "reversedKeywords": [
      "Delays",
      "Limited Reach",
      "Poor Preparation"
    ],
    "upright": "Early efforts are reaching beyond their starting point. Watch for feedback, coordinate with others and prepare for what growth will require rather than treating the first success as the whole journey.",
    "reversed": "Expansion may be delayed by missing support or an untested assumption. Review your preparation and adjust the scale before committing more energy.",
    "symbolism": "A figure watches ships from a height with three planted wands nearby.",
    "journalPrompt": "What support will I need if this project grows beyond me?",
    "psychological": "Psychological lens: Confidence matures when the wish to expand includes the capacity to wait and respond.",
    "spiritual": "Three of Wands invites reflection on expansion, foresight, cooperation. What support will I need if this project grows beyond me?",
    "wuWei": "A practice of unforced attention with Three of Wands: What support will I need if this project grows beyond me?",
    "wabiSabi": "An imperfect, lived expression of expansion can be more useful than an ideal you cannot inhabit. Confidence matures when the wish to expand includes the capacity to wait and respond.",
    "numerology": "Three develops expression, growth and the effects of working together. In Three of Wands, consider how this relates to expansion.",
    "connections": [
      {
        "card": "Three of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa03.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 25,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Four",
    "number": 4,
    "roman": "IV",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Four of Wands",
    "subtitle": "Celebration · Belonging · Stability",
    "uprightKeywords": [
      "Celebration",
      "Belonging",
      "Stability"
    ],
    "reversedKeywords": [
      "Unease at Home",
      "Disrupted Harmony",
      "Private Milestone"
    ],
    "upright": "Pause to recognise a milestone and the people who helped create it. Shared celebration can strengthen a sense of home, belonging or cooperation before the next period of work.",
    "reversed": "A celebration may not feel inclusive, or the home base may need attention. Ask what would make belonging more honest rather than performing harmony.",
    "symbolism": "Four wands support a garland as figures celebrate before a distant building.",
    "journalPrompt": "Who or what makes a place feel safe enough for me to celebrate?",
    "psychological": "Psychological lens: Belonging develops through shared recognition, not simply through appearing to fit in.",
    "spiritual": "Four of Wands invites reflection on celebration, belonging, stability. Who or what makes a place feel safe enough for me to celebrate?",
    "wuWei": "A practice of unforced attention with Four of Wands: Who or what makes a place feel safe enough for me to celebrate?",
    "wabiSabi": "An imperfect, lived expression of celebration can be more useful than an ideal you cannot inhabit. Belonging develops through shared recognition, not simply through appearing to fit in.",
    "numerology": "Four creates structure and stability while asking how much flexibility it allows. In Four of Wands, consider how this relates to celebration.",
    "connections": [
      {
        "card": "Four of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa04.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 26,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Five",
    "number": 5,
    "roman": "V",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Five of Wands",
    "subtitle": "Competition · Friction · Practice",
    "uprightKeywords": [
      "Competition",
      "Friction",
      "Practice"
    ],
    "reversedKeywords": [
      "Avoided Conflict",
      "Escalation",
      "Coordination"
    ],
    "upright": "Different aims or styles are colliding. Treat manageable disagreement as information: clarify the shared task and make room for fair challenge without turning every difference into a personal contest.",
    "reversed": "Conflict may be simmering beneath politeness or becoming a contest with no useful goal. Set clearer rules and decide which disagreements deserve your energy.",
    "symbolism": "Five figures raise wands in different directions without a clear common formation.",
    "journalPrompt": "What shared aim would make this disagreement more useful?",
    "psychological": "Psychological lens: Rivalry can expose a need for recognition that is easier to work with once named.",
    "spiritual": "Five of Wands invites reflection on competition, friction, practice. What shared aim would make this disagreement more useful?",
    "wuWei": "A practice of unforced attention with Five of Wands: What shared aim would make this disagreement more useful?",
    "wabiSabi": "An imperfect, lived expression of competition can be more useful than an ideal you cannot inhabit. Rivalry can expose a need for recognition that is easier to work with once named.",
    "numerology": "Five disrupts an established pattern and invites a response to change. In Five of Wands, consider how this relates to competition.",
    "connections": [
      {
        "card": "Five of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa05.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 27,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Six",
    "number": 6,
    "roman": "VI",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Six of Wands",
    "subtitle": "Recognition · Progress · Encouragement",
    "uprightKeywords": [
      "Recognition",
      "Progress",
      "Encouragement"
    ],
    "reversedKeywords": [
      "Dependence on Praise",
      "Setback",
      "Private Success"
    ],
    "upright": "An effort is being recognised or a difficult stage has been passed. Receive encouragement, share the credit and use the confidence to support continued work rather than rest everything on applause.",
    "reversed": "Recognition may be delayed, uneven or too important to your confidence. Reconnect with the standard that matters to you and acknowledge progress that others have not noticed.",
    "symbolism": "A rider crowned with a wreath carries a decorated wand among companions.",
    "journalPrompt": "What achievement can I acknowledge without needing everyone to approve?",
    "psychological": "Psychological lens: External recognition supports confidence best when it does not become its only source.",
    "spiritual": "Six of Wands invites reflection on recognition, progress, encouragement. What achievement can I acknowledge without needing everyone to approve?",
    "wuWei": "A practice of unforced attention with Six of Wands: What achievement can I acknowledge without needing everyone to approve?",
    "wabiSabi": "An imperfect, lived expression of recognition can be more useful than an ideal you cannot inhabit. External recognition supports confidence best when it does not become its only source.",
    "numerology": "Six explores adjustment, relationship and a more workable harmony. In Six of Wands, consider how this relates to recognition.",
    "connections": [
      {
        "card": "Six of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa06.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 28,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Seven",
    "number": 7,
    "roman": "VII",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Seven of Wands",
    "subtitle": "Conviction · Boundaries · Persistence",
    "uprightKeywords": [
      "Conviction",
      "Boundaries",
      "Persistence"
    ],
    "reversedKeywords": [
      "Overwhelm",
      "Defensiveness",
      "Giving Ground"
    ],
    "upright": "You may need to defend a position you have worked to establish. Choose a clear boundary and explain it where useful; standing your ground does not require answering every challenge.",
    "reversed": "Constant defence may be draining you or obscuring a reasonable alternative. Distinguish a meaningful boundary from the fear of ever appearing to yield.",
    "symbolism": "A figure on higher ground holds a wand against six rising from below.",
    "journalPrompt": "Which boundary deserves my effort, and which challenge can I leave unanswered?",
    "psychological": "Psychological lens: Conviction becomes more flexible when disagreement is not automatically experienced as an attack on identity.",
    "spiritual": "Seven of Wands invites reflection on conviction, boundaries, persistence. Which boundary deserves my effort, and which challenge can I leave unanswered?",
    "wuWei": "A practice of unforced attention with Seven of Wands: Which boundary deserves my effort, and which challenge can I leave unanswered?",
    "wabiSabi": "An imperfect, lived expression of conviction can be more useful than an ideal you cannot inhabit. Conviction becomes more flexible when disagreement is not automatically experienced as an attack on identity.",
    "numerology": "Seven pauses to examine direction, effort and inner conviction. In Seven of Wands, consider how this relates to conviction.",
    "connections": [
      {
        "card": "Seven of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa07.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 29,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Eight",
    "number": 8,
    "roman": "VIII",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Eight of Wands",
    "subtitle": "Momentum · Communication · Movement",
    "uprightKeywords": [
      "Momentum",
      "Communication",
      "Movement"
    ],
    "reversedKeywords": [
      "Delays",
      "Haste",
      "Crossed Messages"
    ],
    "upright": "Events or communications may be moving quickly. Respond clearly, check the destination and use the momentum for a task already prepared; speed is useful when everyone understands the direction.",
    "reversed": "Messages may be crossing or progress may have stalled. Confirm details and remove a specific blockage instead of sending more effort into the same confusion.",
    "symbolism": "Eight wands fly together across open sky above a river and landscape.",
    "journalPrompt": "What needs a clear response now, before momentum outruns understanding?",
    "psychological": "Psychological lens: Rapid movement can feel exciting or destabilising; attention gives it direction without needing to stop it entirely.",
    "spiritual": "Eight of Wands invites reflection on momentum, communication, movement. What needs a clear response now, before momentum outruns understanding?",
    "wuWei": "A practice of unforced attention with Eight of Wands: What needs a clear response now, before momentum outruns understanding?",
    "wabiSabi": "An imperfect, lived expression of momentum can be more useful than an ideal you cannot inhabit. Rapid movement can feel exciting or destabilising; attention gives it direction without needing to stop it entirely.",
    "numerology": "Eight develops power through practice, organisation or repeated engagement. In Eight of Wands, consider how this relates to momentum.",
    "connections": [
      {
        "card": "Eight of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa08.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 30,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Nine",
    "number": 9,
    "roman": "IX",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Nine of Wands",
    "subtitle": "Resilience · Vigilance · Endurance",
    "uprightKeywords": [
      "Resilience",
      "Vigilance",
      "Endurance"
    ],
    "reversedKeywords": [
      "Fatigue",
      "Guardedness",
      "Strained Limits"
    ],
    "upright": "Experience has made you alert, and the task may need one more measured effort. Protect your limits, use what you have learned and accept support rather than proving you can withstand everything alone.",
    "reversed": "Past strain may be turning caution into constant expectation of another blow. Rest and reassess the actual situation before committing to further defence.",
    "symbolism": "A bandaged figure stands watch before a row of eight wands while holding a ninth.",
    "journalPrompt": "What would protect my energy while allowing me to stay engaged?",
    "psychological": "Psychological lens: A protective response learned through difficulty may need updating when the present is safer than the past.",
    "spiritual": "Nine of Wands invites reflection on resilience, vigilance, endurance. What would protect my energy while allowing me to stay engaged?",
    "wuWei": "A practice of unforced attention with Nine of Wands: What would protect my energy while allowing me to stay engaged?",
    "wabiSabi": "An imperfect, lived expression of resilience can be more useful than an ideal you cannot inhabit. A protective response learned through difficulty may need updating when the present is safer than the past.",
    "numerology": "Nine draws experience toward maturity while asking what is still needed. In Nine of Wands, consider how this relates to resilience.",
    "connections": [
      {
        "card": "Nine of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa09.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 31,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Ten",
    "number": 10,
    "roman": "X",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Ten of Wands",
    "subtitle": "Responsibility · Burden · Limits",
    "uprightKeywords": [
      "Responsibility",
      "Burden",
      "Limits"
    ],
    "reversedKeywords": [
      "Release",
      "Delegation",
      "Overload"
    ],
    "upright": "A worthwhile commitment may have grown into an excessive load. Review what is truly yours, divide the work and protect the conditions that allow you to finish without losing yourself to the task.",
    "reversed": "You may be ready to put down a burden or struggling to admit it is too much. Seek a practical redistribution rather than waiting for endurance to solve the imbalance.",
    "symbolism": "A figure carries ten wands that obscure the view of the town ahead.",
    "journalPrompt": "Which responsibility could I share, simplify or put down?",
    "psychological": "Psychological lens: Worth can become tangled with being indispensable. Releasing a task may challenge that identity while making life more sustainable.",
    "spiritual": "Ten of Wands invites reflection on responsibility, burden, limits. Which responsibility could I share, simplify or put down?",
    "wuWei": "A practice of unforced attention with Ten of Wands: Which responsibility could I share, simplify or put down?",
    "wabiSabi": "An imperfect, lived expression of responsibility can be more useful than an ideal you cannot inhabit. Worth can become tangled with being indispensable. Releasing a task may challenge that identity while making life more sustainable.",
    "numerology": "Ten completes a cycle and carries its consequences into another beginning. In Ten of Wands, consider how this relates to responsibility.",
    "connections": [
      {
        "card": "Ten of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa10.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 32,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Page",
    "number": null,
    "roman": "Pg",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Page of Wands",
    "subtitle": "Exploration · Enthusiasm · Discovery",
    "uprightKeywords": [
      "Exploration",
      "Enthusiasm",
      "Discovery"
    ],
    "reversedKeywords": [
      "Restlessness",
      "Unfocused Energy",
      "Hesitation"
    ],
    "upright": "Approach an interest as a learner. Ask questions, try a modest experiment and let enthusiasm lead to experience rather than promising an expertise you have not yet developed.",
    "reversed": "Energy may be scattered among many beginnings or held back by fear of looking inexperienced. Choose one safe experiment and allow yourself to be new.",
    "symbolism": "A young figure studies a budding wand in a dry landscape, finding possibility in an unlikely place.",
    "journalPrompt": "What would I explore if being a beginner felt acceptable?",
    "psychological": "Psychological lens: The exploratory self needs room for play as well as feedback and limits.",
    "spiritual": "Page of Wands invites reflection on exploration, enthusiasm, discovery. What would I explore if being a beginner felt acceptable?",
    "wuWei": "A practice of unforced attention with Page of Wands: What would I explore if being a beginner felt acceptable?",
    "wabiSabi": "An imperfect, lived expression of exploration can be more useful than an ideal you cannot inhabit. The exploratory self needs room for play as well as feedback and limits.",
    "numerology": "Page is a court role, not a numbered pip card: a learner’s curiosity and an emerging practical relationship to the suit. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Page of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa11.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 33,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Knight",
    "number": null,
    "roman": "Kn",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Knight of Wands",
    "subtitle": "Adventure · Bold Action · Drive",
    "uprightKeywords": [
      "Adventure",
      "Bold Action",
      "Drive"
    ],
    "reversedKeywords": [
      "Impulsiveness",
      "Frustration",
      "Inconsistency"
    ],
    "upright": "A bold move can break inertia when it serves a clear purpose. Commit your energy, but consider the practical follow-through and the people who must live with the pace you set.",
    "reversed": "Action may be outrunning judgement or enthusiasm may disappear when work becomes routine. Slow down enough to choose a commitment you will still honour after the excitement fades.",
    "symbolism": "A rider on a rearing horse carries a wand through a dry landscape.",
    "journalPrompt": "Where can I act boldly while still taking responsibility for the follow-through?",
    "psychological": "Psychological lens: The adventurous impulse develops through relating freedom to consequence rather than treating them as opposites.",
    "spiritual": "Knight of Wands invites reflection on adventure, bold action, drive. Where can I act boldly while still taking responsibility for the follow-through?",
    "wuWei": "A practice of unforced attention with Knight of Wands: Where can I act boldly while still taking responsibility for the follow-through?",
    "wabiSabi": "An imperfect, lived expression of adventure can be more useful than an ideal you cannot inhabit. The adventurous impulse develops through relating freedom to consequence rather than treating them as opposites.",
    "numerology": "Knight is a court role, not a numbered pip card: an active way of pursuing the suit’s concerns, with both gifts and excesses. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Knight of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa12.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 34,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "Queen",
    "number": null,
    "roman": "Q",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "Queen of Wands",
    "subtitle": "Confidence · Warmth · Independence",
    "uprightKeywords": [
      "Confidence",
      "Warmth",
      "Independence"
    ],
    "reversedKeywords": [
      "Insecurity",
      "Jealousy",
      "Depletion"
    ],
    "upright": "Lead through warmth, confidence and a clear relationship to your own energy. Encourage others without shrinking your presence; creative authority can be both self-directed and generous.",
    "reversed": "Comparison or overextension may be weakening your sense of self. Restore a private source of vitality before looking to attention or control for reassurance.",
    "symbolism": "A queen holds a sunflower and wand; a black cat sits before her lion-decorated throne.",
    "journalPrompt": "What helps me take up space warmly and without apology?",
    "psychological": "Psychological lens: A confident public self grows stronger when it remains connected to private instinct and need.",
    "spiritual": "Queen of Wands invites reflection on confidence, warmth, independence. What helps me take up space warmly and without apology?",
    "wuWei": "A practice of unforced attention with Queen of Wands: What helps me take up space warmly and without apology?",
    "wabiSabi": "An imperfect, lived expression of confidence can be more useful than an ideal you cannot inhabit. A confident public self grows stronger when it remains connected to private instinct and need.",
    "numerology": "Queen is a court role, not a numbered pip card: a receptive, sustaining expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Queen of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa13.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 35,
    "arcana": "Minor",
    "suit": "Wands",
    "rank": "King",
    "number": null,
    "roman": "K",
    "element": "Fire",
    "astrology": "Fire · Wands",
    "name": "King of Wands",
    "subtitle": "Vision · Leadership · Enterprise",
    "uprightKeywords": [
      "Vision",
      "Leadership",
      "Enterprise"
    ],
    "reversedKeywords": [
      "Domination",
      "Impatience",
      "Unrealistic Ambition"
    ],
    "upright": "Give a shared vision a direction others can understand. Mature leadership combines initiative with trust in other people; set the purpose clearly and make the work possible rather than doing it all yourself.",
    "reversed": "Ambition may be becoming controlling or impatient with practical limits. Invite challenge, revise unrealistic expectations and ask whether leadership is serving the task or your need to command.",
    "symbolism": "A king holds a living wand on a throne decorated with lions and salamanders.",
    "journalPrompt": "How can I lead this vision without needing to control every part of it?",
    "psychological": "Psychological lens: Authority matures when personal drive can support other people’s agency.",
    "spiritual": "King of Wands invites reflection on vision, leadership, enterprise. How can I lead this vision without needing to control every part of it?",
    "wuWei": "A practice of unforced attention with King of Wands: How can I lead this vision without needing to control every part of it?",
    "wabiSabi": "An imperfect, lived expression of vision can be more useful than an ideal you cannot inhabit. Authority matures when personal drive can support other people’s agency.",
    "numerology": "King is a court role, not a numbered pip card: a directing, accountable expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "King of Cups",
        "title": "Fire and Feeling",
        "meaning": "Wands brings energy and initiative; Cups asks how the experience feels and connects. Let enthusiasm remain in conversation with care."
      }
    ],
    "image": "assets/deck/wa14.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 36,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Ace",
    "number": 1,
    "roman": "I",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Ace of Cups",
    "subtitle": "Openness · Compassion · New Feeling",
    "uprightKeywords": [
      "Openness",
      "Compassion",
      "New Feeling"
    ],
    "reversedKeywords": [
      "Emotional Block",
      "Depletion",
      "Inward Care"
    ],
    "upright": "A new feeling or opportunity for connection asks for receptivity. Offer care without demanding an immediate outcome, and notice what replenishes your capacity to give as well as receive.",
    "reversed": "Feelings may be held back or your capacity to care may be depleted. Create a little room to feel privately before expecting yourself to offer more.",
    "symbolism": "A hand presents an overflowing cup above water, with a dove descending toward it.",
    "journalPrompt": "Where am I ready to receive care rather than only offer it?",
    "psychological": "Psychological lens: Emotional openness needs a vessel: boundaries allow feeling to be experienced without being overwhelmed.",
    "spiritual": "Ace of Cups invites reflection on openness, compassion, new feeling. Where am I ready to receive care rather than only offer it?",
    "wuWei": "A practice of unforced attention with Ace of Cups: Where am I ready to receive care rather than only offer it?",
    "wabiSabi": "An imperfect, lived expression of openness can be more useful than an ideal you cannot inhabit. Emotional openness needs a vessel: boundaries allow feeling to be experienced without being overwhelmed.",
    "numerology": "One begins a cycle with a seed, focus or initial act. In Ace of Cups, consider how this relates to openness.",
    "connections": [
      {
        "card": "Ace of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu01.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 37,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Two",
    "number": 2,
    "roman": "II",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Two of Cups",
    "subtitle": "Mutuality · Connection · Agreement",
    "uprightKeywords": [
      "Mutuality",
      "Connection",
      "Agreement"
    ],
    "reversedKeywords": [
      "Imbalance",
      "Disconnection",
      "Broken Trust"
    ],
    "upright": "A connection can deepen through reciprocal attention and honest exchange. Ask what each person is offering freely and make the agreement explicit instead of relying on an imagined harmony.",
    "reversed": "A relationship or agreement may be unequal or out of tune. Name the difference and assess whether repair is mutual rather than assuming one person can restore the connection alone.",
    "symbolism": "Two people exchange cups beneath a winged lion and entwined staff.",
    "journalPrompt": "What would a more reciprocal exchange look like here?",
    "psychological": "Psychological lens: Meeting another person requires recognising both connection and separateness.",
    "spiritual": "Two of Cups invites reflection on mutuality, connection, agreement. What would a more reciprocal exchange look like here?",
    "wuWei": "A practice of unforced attention with Two of Cups: What would a more reciprocal exchange look like here?",
    "wabiSabi": "An imperfect, lived expression of mutuality can be more useful than an ideal you cannot inhabit. Meeting another person requires recognising both connection and separateness.",
    "numerology": "Two brings relationship, polarity and the need to consider another position. In Two of Cups, consider how this relates to mutuality.",
    "connections": [
      {
        "card": "Two of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu02.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 38,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Three",
    "number": 3,
    "roman": "III",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Three of Cups",
    "subtitle": "Friendship · Community · Celebration",
    "uprightKeywords": [
      "Friendship",
      "Community",
      "Celebration"
    ],
    "reversedKeywords": [
      "Exclusion",
      "Overindulgence",
      "Social Strain"
    ],
    "upright": "Friendship and shared joy can nourish a situation that has become too solitary. Make room for mutual support and celebrate together without overlooking anyone doing unseen work.",
    "reversed": "A social group may feel excluding or gatherings may be leaving you depleted. Choose connections that allow honest participation rather than belonging at any cost.",
    "symbolism": "Three figures raise cups in a circle among fruit and harvest produce.",
    "journalPrompt": "Which relationships leave room for everyone to be supported?",
    "psychological": "Psychological lens: The wish to belong can be met through shared participation rather than performance for the group.",
    "spiritual": "Three of Cups invites reflection on friendship, community, celebration. Which relationships leave room for everyone to be supported?",
    "wuWei": "A practice of unforced attention with Three of Cups: Which relationships leave room for everyone to be supported?",
    "wabiSabi": "An imperfect, lived expression of friendship can be more useful than an ideal you cannot inhabit. The wish to belong can be met through shared participation rather than performance for the group.",
    "numerology": "Three develops expression, growth and the effects of working together. In Three of Cups, consider how this relates to friendship.",
    "connections": [
      {
        "card": "Three of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu03.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 39,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Four",
    "number": 4,
    "roman": "IV",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Four of Cups",
    "subtitle": "Contemplation · Reassessment · Disengagement",
    "uprightKeywords": [
      "Contemplation",
      "Reassessment",
      "Disengagement"
    ],
    "reversedKeywords": [
      "Renewed Interest",
      "Withdrawal",
      "Missed Opening"
    ],
    "upright": "A pause in interest may be asking you to examine what you actually want. Rest from automatic choices, while remaining willing to notice an offer that differs from your expectations.",
    "reversed": "Interest may be returning, or withdrawal may be keeping a useful opening out of view. Re-engage gradually and test what feels nourishing rather than forcing enthusiasm.",
    "symbolism": "A seated figure faces three cups while a fourth is offered from a cloud.",
    "journalPrompt": "What am I overlooking because it does not resemble the offer I expected?",
    "psychological": "Psychological lens: Turning inward can clarify desire, but habitual detachment can also protect it from being tested.",
    "spiritual": "Four of Cups invites reflection on contemplation, reassessment, disengagement. What am I overlooking because it does not resemble the offer I expected?",
    "wuWei": "A practice of unforced attention with Four of Cups: What am I overlooking because it does not resemble the offer I expected?",
    "wabiSabi": "An imperfect, lived expression of contemplation can be more useful than an ideal you cannot inhabit. Turning inward can clarify desire, but habitual detachment can also protect it from being tested.",
    "numerology": "Four creates structure and stability while asking how much flexibility it allows. In Four of Cups, consider how this relates to contemplation.",
    "connections": [
      {
        "card": "Four of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu04.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 40,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Five",
    "number": 5,
    "roman": "V",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Five of Cups",
    "subtitle": "Grief · Disappointment · Remaining Support",
    "uprightKeywords": [
      "Grief",
      "Disappointment",
      "Remaining Support"
    ],
    "reversedKeywords": [
      "Acceptance",
      "Lingering Regret",
      "Reconnection"
    ],
    "upright": "Give a disappointment its proper weight without making it the whole picture. Grief and remaining support can coexist; acknowledge the loss, then notice who or what is still available.",
    "reversed": "Acceptance may be growing, or regret may be repeating without bringing new understanding. Reach toward the support that remains and let moving forward include, rather than erase, the loss.",
    "symbolism": "A cloaked figure looks at three spilled cups while two stand behind, with a bridge nearby.",
    "journalPrompt": "What deserves mourning, and what support have I not yet turned toward?",
    "psychological": "Psychological lens: Attention can become fixed on absence. Integration makes room for loss within a larger life.",
    "spiritual": "Five of Cups invites reflection on grief, disappointment, remaining support. What deserves mourning, and what support have I not yet turned toward?",
    "wuWei": "A practice of unforced attention with Five of Cups: What deserves mourning, and what support have I not yet turned toward?",
    "wabiSabi": "An imperfect, lived expression of grief can be more useful than an ideal you cannot inhabit. Attention can become fixed on absence. Integration makes room for loss within a larger life.",
    "numerology": "Five disrupts an established pattern and invites a response to change. In Five of Cups, consider how this relates to grief.",
    "connections": [
      {
        "card": "Five of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu05.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 41,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Six",
    "number": 6,
    "roman": "VI",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Six of Cups",
    "subtitle": "Memory · Kindness · Familiarity",
    "uprightKeywords": [
      "Memory",
      "Kindness",
      "Familiarity"
    ],
    "reversedKeywords": [
      "Idealised Past",
      "Growing Beyond",
      "Old Patterns"
    ],
    "upright": "A memory, familiar place or simple kindness can reconnect you with something valuable. Receive its warmth while recognising how your present needs differ from those of an earlier time.",
    "reversed": "Nostalgia may be editing the past or an old role may no longer fit. Keep what was nourishing without asking the present to recreate an earlier chapter exactly.",
    "symbolism": "A child offers a flower-filled cup to another figure in a sheltered courtyard.",
    "journalPrompt": "What from my past nourishes me now, and what can remain in the past?",
    "psychological": "Psychological lens: Earlier experiences shape expectations of care. Revisiting them consciously can loosen automatic repetition.",
    "spiritual": "Six of Cups invites reflection on memory, kindness, familiarity. What from my past nourishes me now, and what can remain in the past?",
    "wuWei": "A practice of unforced attention with Six of Cups: What from my past nourishes me now, and what can remain in the past?",
    "wabiSabi": "An imperfect, lived expression of memory can be more useful than an ideal you cannot inhabit. Earlier experiences shape expectations of care. Revisiting them consciously can loosen automatic repetition.",
    "numerology": "Six explores adjustment, relationship and a more workable harmony. In Six of Cups, consider how this relates to memory.",
    "connections": [
      {
        "card": "Six of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu06.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 42,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Seven",
    "number": 7,
    "roman": "VII",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Seven of Cups",
    "subtitle": "Possibilities · Imagination · Discernment",
    "uprightKeywords": [
      "Possibilities",
      "Imagination",
      "Discernment"
    ],
    "reversedKeywords": [
      "Focus",
      "Overwhelm",
      "Escapism"
    ],
    "upright": "Many attractive possibilities may be competing for attention. Enjoy imagination, then check what each option actually involves; choose one step that can turn a wish into lived experience.",
    "reversed": "Options may be narrowing usefully, or fantasy may be delaying a necessary choice. Test the most promising possibility against your resources and values before committing.",
    "symbolism": "Seven cups hold varied visions in clouds, mixing desirable prizes with unsettling forms.",
    "journalPrompt": "Which possibility remains worthwhile when I consider its real demands?",
    "psychological": "Psychological lens: Fantasy reveals desire but cannot by itself distinguish nourishment from distraction.",
    "spiritual": "Seven of Cups invites reflection on possibilities, imagination, discernment. Which possibility remains worthwhile when I consider its real demands?",
    "wuWei": "A practice of unforced attention with Seven of Cups: Which possibility remains worthwhile when I consider its real demands?",
    "wabiSabi": "An imperfect, lived expression of possibilities can be more useful than an ideal you cannot inhabit. Fantasy reveals desire but cannot by itself distinguish nourishment from distraction.",
    "numerology": "Seven pauses to examine direction, effort and inner conviction. In Seven of Cups, consider how this relates to possibilities.",
    "connections": [
      {
        "card": "Seven of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu07.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 43,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Eight",
    "number": 8,
    "roman": "VIII",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Eight of Cups",
    "subtitle": "Departure · Searching · Honest Release",
    "uprightKeywords": [
      "Departure",
      "Searching",
      "Honest Release"
    ],
    "reversedKeywords": [
      "Fear of Leaving",
      "Return",
      "Aimless Seeking"
    ],
    "upright": "Something may be intact on the surface yet no longer meaningful enough to sustain you. Consider what is missing, then leave or renegotiate consciously rather than abandoning the situation without understanding why.",
    "reversed": "You may be unsure whether to stay, return or leave. Distinguish avoidance of difficulty from an honest recognition that a chapter has ended.",
    "symbolism": "A figure walks away from stacked cups toward mountains beneath a moon.",
    "journalPrompt": "What am I seeking that this situation no longer provides?",
    "psychological": "Psychological lens: Separating from a familiar emotional arrangement can be part of developing a more truthful life.",
    "spiritual": "Eight of Cups invites reflection on departure, searching, honest release. What am I seeking that this situation no longer provides?",
    "wuWei": "A practice of unforced attention with Eight of Cups: What am I seeking that this situation no longer provides?",
    "wabiSabi": "An imperfect, lived expression of departure can be more useful than an ideal you cannot inhabit. Separating from a familiar emotional arrangement can be part of developing a more truthful life.",
    "numerology": "Eight develops power through practice, organisation or repeated engagement. In Eight of Cups, consider how this relates to departure.",
    "connections": [
      {
        "card": "Eight of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu08.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 44,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Nine",
    "number": 9,
    "roman": "IX",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Nine of Cups",
    "subtitle": "Contentment · Enjoyment · Appreciation",
    "uprightKeywords": [
      "Contentment",
      "Enjoyment",
      "Appreciation"
    ],
    "reversedKeywords": [
      "Dissatisfaction",
      "Excess",
      "External Validation"
    ],
    "upright": "Enjoy what has been achieved and acknowledge enough when it is present. Satisfaction grows through inhabiting the experience, rather than immediately turning it into a demand for the next reward.",
    "reversed": "An apparent success may not be meeting the need beneath it. Ask what you hoped the reward would provide before reaching for more of the same.",
    "symbolism": "A seated figure rests before an arrangement of nine cups, appearing pleased with the display.",
    "journalPrompt": "What does enough feel like when no one else is watching?",
    "psychological": "Psychological lens: Pleasure supports wellbeing when it remains connected to feeling rather than becoming a substitute for it.",
    "spiritual": "Nine of Cups invites reflection on contentment, enjoyment, appreciation. What does enough feel like when no one else is watching?",
    "wuWei": "A practice of unforced attention with Nine of Cups: What does enough feel like when no one else is watching?",
    "wabiSabi": "An imperfect, lived expression of contentment can be more useful than an ideal you cannot inhabit. Pleasure supports wellbeing when it remains connected to feeling rather than becoming a substitute for it.",
    "numerology": "Nine draws experience toward maturity while asking what is still needed. In Nine of Cups, consider how this relates to contentment.",
    "connections": [
      {
        "card": "Nine of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu09.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 45,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Ten",
    "number": 10,
    "roman": "X",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Ten of Cups",
    "subtitle": "Emotional Fulfilment · Shared Values · Belonging",
    "uprightKeywords": [
      "Emotional Fulfilment",
      "Shared Values",
      "Belonging"
    ],
    "reversedKeywords": [
      "Strained Ideal",
      "Disharmony",
      "Different Needs"
    ],
    "upright": "Shared care can create a strong sense of belonging. Notice the daily choices behind a happy picture and make room for different needs within the relationship or chosen community.",
    "reversed": "The ideal of harmony may be hiding real differences. Speak about needs and expectations without treating disagreement as proof that the whole connection has failed.",
    "symbolism": "A family raises its arms beneath a rainbow of cups beside a home and landscape.",
    "journalPrompt": "Which daily acts make our idea of belonging real?",
    "psychological": "Psychological lens: An image of a happy life becomes more humane when it can include ordinary frustration and difference.",
    "spiritual": "Ten of Cups invites reflection on emotional fulfilment, shared values, belonging. Which daily acts make our idea of belonging real?",
    "wuWei": "A practice of unforced attention with Ten of Cups: Which daily acts make our idea of belonging real?",
    "wabiSabi": "An imperfect, lived expression of emotional fulfilment can be more useful than an ideal you cannot inhabit. An image of a happy life becomes more humane when it can include ordinary frustration and difference.",
    "numerology": "Ten completes a cycle and carries its consequences into another beginning. In Ten of Cups, consider how this relates to emotional fulfilment.",
    "connections": [
      {
        "card": "Ten of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu10.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 46,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Page",
    "number": null,
    "roman": "Pg",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Page of Cups",
    "subtitle": "Sensitivity · Creative Curiosity · Emotional Discovery",
    "uprightKeywords": [
      "Sensitivity",
      "Creative Curiosity",
      "Emotional Discovery"
    ],
    "reversedKeywords": [
      "Emotional Immaturity",
      "Blocked Expression",
      "Self-Doubt"
    ],
    "upright": "An unexpected feeling or creative idea deserves a curious response. Express it simply and listen with care; a tentative beginning does not need to become a promise before it has been understood.",
    "reversed": "Sensitivity may be mixed with fear of embarrassment or an expectation that others should guess your feelings. Find a direct, manageable way to communicate what you mean.",
    "symbolism": "A young figure studies a fish emerging from a cup beside the sea.",
    "journalPrompt": "What surprising feeling or idea could I meet with curiosity?",
    "psychological": "Psychological lens: Imagination often arrives in an awkward or surprising form before it becomes something the conscious self can explain.",
    "spiritual": "Page of Cups invites reflection on sensitivity, creative curiosity, emotional discovery. What surprising feeling or idea could I meet with curiosity?",
    "wuWei": "A practice of unforced attention with Page of Cups: What surprising feeling or idea could I meet with curiosity?",
    "wabiSabi": "An imperfect, lived expression of sensitivity can be more useful than an ideal you cannot inhabit. Imagination often arrives in an awkward or surprising form before it becomes something the conscious self can explain.",
    "numerology": "Page is a court role, not a numbered pip card: a learner’s curiosity and an emerging practical relationship to the suit. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Page of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu11.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 47,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Knight",
    "number": null,
    "roman": "Kn",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Knight of Cups",
    "subtitle": "Invitation · Romance · Creative Pursuit",
    "uprightKeywords": [
      "Invitation",
      "Romance",
      "Creative Pursuit"
    ],
    "reversedKeywords": [
      "Idealisation",
      "Moodiness",
      "Unkept Promise"
    ],
    "upright": "Follow a meaningful feeling with a clear and considerate gesture. An invitation, proposal or creative pursuit becomes trustworthy when its emotional promise is matched by realistic action.",
    "reversed": "An appealing image may be outrunning commitment. Check whether words and actions agree, and let disappointment inform your judgement without closing your capacity for feeling.",
    "symbolism": "A rider calmly carries a cup toward a river on a white horse.",
    "journalPrompt": "How can I turn a feeling into an honest, achievable gesture?",
    "psychological": "Psychological lens: The romantic imagination can guide action while still needing contact with another person’s actual response.",
    "spiritual": "Knight of Cups invites reflection on invitation, romance, creative pursuit. How can I turn a feeling into an honest, achievable gesture?",
    "wuWei": "A practice of unforced attention with Knight of Cups: How can I turn a feeling into an honest, achievable gesture?",
    "wabiSabi": "An imperfect, lived expression of invitation can be more useful than an ideal you cannot inhabit. The romantic imagination can guide action while still needing contact with another person’s actual response.",
    "numerology": "Knight is a court role, not a numbered pip card: an active way of pursuing the suit’s concerns, with both gifts and excesses. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Knight of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu12.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 48,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "Queen",
    "number": null,
    "roman": "Q",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "Queen of Cups",
    "subtitle": "Empathy · Receptivity · Emotional Wisdom",
    "uprightKeywords": [
      "Empathy",
      "Receptivity",
      "Emotional Wisdom"
    ],
    "reversedKeywords": [
      "Overabsorption",
      "Poor Boundaries",
      "Neglected Self"
    ],
    "upright": "Listen deeply while keeping a place for your own experience. Empathy can help another person feel understood, but it does not require taking responsibility for every feeling in the room.",
    "reversed": "You may be absorbing others’ emotions or neglecting your own needs. Step back enough to distinguish care from emotional overinvolvement and restore a clear boundary.",
    "symbolism": "A queen contemplates an ornate closed cup at the edge of the sea.",
    "journalPrompt": "What is mine to feel, and what can I witness without carrying?",
    "psychological": "Psychological lens: Receptivity becomes wisdom when it can differentiate inner experience from another person’s emotional life.",
    "spiritual": "Queen of Cups invites reflection on empathy, receptivity, emotional wisdom. What is mine to feel, and what can I witness without carrying?",
    "wuWei": "A practice of unforced attention with Queen of Cups: What is mine to feel, and what can I witness without carrying?",
    "wabiSabi": "An imperfect, lived expression of empathy can be more useful than an ideal you cannot inhabit. Receptivity becomes wisdom when it can differentiate inner experience from another person’s emotional life.",
    "numerology": "Queen is a court role, not a numbered pip card: a receptive, sustaining expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Queen of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu13.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 49,
    "arcana": "Minor",
    "suit": "Cups",
    "rank": "King",
    "number": null,
    "roman": "K",
    "element": "Water",
    "astrology": "Water · Cups",
    "name": "King of Cups",
    "subtitle": "Emotional Balance · Diplomacy · Steadiness",
    "uprightKeywords": [
      "Emotional Balance",
      "Diplomacy",
      "Steadiness"
    ],
    "reversedKeywords": [
      "Suppression",
      "Emotional Control",
      "Volatility"
    ],
    "upright": "Meet strong feeling with steadiness and honest expression. You can acknowledge an emotion without allowing it to direct every action; use that balance to support a difficult conversation.",
    "reversed": "Calm may be masking suppression, or feeling may be used to influence others. Ask whether the response allows truth and mutual choice rather than merely maintaining control.",
    "symbolism": "A king holds cup and sceptre on a throne surrounded by moving water.",
    "journalPrompt": "How can I stay steady while still letting the truth of my feelings be heard?",
    "psychological": "Psychological lens: Emotional maturity joins containment with contact; composure alone does not guarantee that feeling has been understood.",
    "spiritual": "King of Cups invites reflection on emotional balance, diplomacy, steadiness. How can I stay steady while still letting the truth of my feelings be heard?",
    "wuWei": "A practice of unforced attention with King of Cups: How can I stay steady while still letting the truth of my feelings be heard?",
    "wabiSabi": "An imperfect, lived expression of emotional balance can be more useful than an ideal you cannot inhabit. Emotional maturity joins containment with contact; composure alone does not guarantee that feeling has been understood.",
    "numerology": "King is a court role, not a numbered pip card: a directing, accountable expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "King of Swords",
        "title": "Feeling and Discernment",
        "meaning": "Cups attends to emotional meaning; Swords asks what can be stated and examined clearly. Neither feeling nor analysis needs to erase the other."
      }
    ],
    "image": "assets/deck/cu14.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 50,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Ace",
    "number": 1,
    "roman": "I",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Ace of Swords",
    "subtitle": "Clarity · Truth · Decision",
    "uprightKeywords": [
      "Clarity",
      "Truth",
      "Decision"
    ],
    "reversedKeywords": [
      "Confusion",
      "Harshness",
      "Unclear Thinking"
    ],
    "upright": "A clear distinction or honest conversation can cut through confusion. Check your evidence, name the central issue and use the insight constructively rather than turning being right into the only goal.",
    "reversed": "An idea may be incomplete or language may be sharper than the situation requires. Revisit the facts and clarify your intention before delivering a judgement.",
    "symbolism": "A hand raises a crowned sword above mountains, joining clear thought with responsibility.",
    "journalPrompt": "What needs to be stated clearly, and how can I say it responsibly?",
    "psychological": "Psychological lens: Insight can separate a tangled problem into workable parts, provided certainty remains open to correction.",
    "spiritual": "Ace of Swords invites reflection on clarity, truth, decision. What needs to be stated clearly, and how can I say it responsibly?",
    "wuWei": "A practice of unforced attention with Ace of Swords: What needs to be stated clearly, and how can I say it responsibly?",
    "wabiSabi": "An imperfect, lived expression of clarity can be more useful than an ideal you cannot inhabit. Insight can separate a tangled problem into workable parts, provided certainty remains open to correction.",
    "numerology": "One begins a cycle with a seed, focus or initial act. In Ace of Swords, consider how this relates to clarity.",
    "connections": [
      {
        "card": "Ace of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw01.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 51,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Two",
    "number": 2,
    "roman": "II",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Two of Swords",
    "subtitle": "Deliberation · Stalemate · Boundaries",
    "uprightKeywords": [
      "Deliberation",
      "Stalemate",
      "Boundaries"
    ],
    "reversedKeywords": [
      "Overload",
      "Avoided Decision",
      "New Information"
    ],
    "upright": "A decision may be held between competing needs. Protect enough quiet to hear both sides, but notice which missing fact or feeling must be acknowledged before a genuine choice is possible.",
    "reversed": "Avoidance or too much information may be making the decision harder. Name the underlying concern and choose a practical next step rather than demanding perfect certainty.",
    "symbolism": "A blindfolded figure holds crossed swords before water under a crescent moon.",
    "journalPrompt": "What am I keeping out of view in order to hold this balance?",
    "psychological": "Psychological lens: A stalemate can protect the psyche from conflict while also preventing a needed encounter with it.",
    "spiritual": "Two of Swords invites reflection on deliberation, stalemate, boundaries. What am I keeping out of view in order to hold this balance?",
    "wuWei": "A practice of unforced attention with Two of Swords: What am I keeping out of view in order to hold this balance?",
    "wabiSabi": "An imperfect, lived expression of deliberation can be more useful than an ideal you cannot inhabit. A stalemate can protect the psyche from conflict while also preventing a needed encounter with it.",
    "numerology": "Two brings relationship, polarity and the need to consider another position. In Two of Swords, consider how this relates to deliberation.",
    "connections": [
      {
        "card": "Two of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw02.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 52,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Three",
    "number": 3,
    "roman": "III",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Three of Swords",
    "subtitle": "Sorrow · Painful Truth · Acknowledgement",
    "uprightKeywords": [
      "Sorrow",
      "Painful Truth",
      "Acknowledgement"
    ],
    "reversedKeywords": [
      "Recovery",
      "Held Resentment",
      "Release"
    ],
    "upright": "A painful truth, separation or disappointment deserves honest acknowledgement. Seek a form of expression and support that lets the feeling move, without treating this moment as a verdict on all future connection.",
    "reversed": "Recovery may be beginning or hurt may be turning inward. Allow time and support, and distinguish forgiving yourself from pretending that the wound did not matter.",
    "symbolism": "Three swords pierce a heart beneath rain clouds, giving emotional pain a direct visual form.",
    "journalPrompt": "What painful truth can I acknowledge without making it my whole identity?",
    "psychological": "Psychological lens: Naming hurt can interrupt the attempt to manage it entirely through thought or blame.",
    "spiritual": "Three of Swords invites reflection on sorrow, painful truth, acknowledgement. What painful truth can I acknowledge without making it my whole identity?",
    "wuWei": "A practice of unforced attention with Three of Swords: What painful truth can I acknowledge without making it my whole identity?",
    "wabiSabi": "An imperfect, lived expression of sorrow can be more useful than an ideal you cannot inhabit. Naming hurt can interrupt the attempt to manage it entirely through thought or blame.",
    "numerology": "Three develops expression, growth and the effects of working together. In Three of Swords, consider how this relates to sorrow.",
    "connections": [
      {
        "card": "Three of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw03.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 53,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Four",
    "number": 4,
    "roman": "IV",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Four of Swords",
    "subtitle": "Rest · Recovery · Contemplation",
    "uprightKeywords": [
      "Rest",
      "Recovery",
      "Contemplation"
    ],
    "reversedKeywords": [
      "Restlessness",
      "Burnout",
      "Re-entry"
    ],
    "upright": "Step away from continual mental effort and let recovery become part of the task. A deliberate pause can restore perspective before you return to the issue with clearer attention.",
    "reversed": "You may be resisting necessary rest or preparing to return after a pause. Check your actual capacity and choose a manageable pace rather than resuming every demand at once.",
    "symbolism": "A recumbent figure rests beneath three swords, with a fourth below and stained glass nearby.",
    "journalPrompt": "What kind of rest would help my mind become available again?",
    "psychological": "Psychological lens: Temporary withdrawal can allow experiences to settle instead of being continuously defended against.",
    "spiritual": "Four of Swords invites reflection on rest, recovery, contemplation. What kind of rest would help my mind become available again?",
    "wuWei": "A practice of unforced attention with Four of Swords: What kind of rest would help my mind become available again?",
    "wabiSabi": "An imperfect, lived expression of rest can be more useful than an ideal you cannot inhabit. Temporary withdrawal can allow experiences to settle instead of being continuously defended against.",
    "numerology": "Four creates structure and stability while asking how much flexibility it allows. In Four of Swords, consider how this relates to rest.",
    "connections": [
      {
        "card": "Four of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw04.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 54,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Five",
    "number": 5,
    "roman": "V",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Five of Swords",
    "subtitle": "Conflict · Costly Victory · Self-Interest",
    "uprightKeywords": [
      "Conflict",
      "Costly Victory",
      "Self-Interest"
    ],
    "reversedKeywords": [
      "Repair",
      "Resentment",
      "Unresolved Conflict"
    ],
    "upright": "A conflict may offer a victory that costs too much in trust or connection. Consider what winning would leave behind, and decide whether a boundary, withdrawal or different conversation better serves your aim.",
    "reversed": "A wish to repair may be emerging, but resentment or unequal responsibility can keep the conflict alive. Seek an honest account before asking everyone to move on.",
    "symbolism": "One figure gathers swords while others turn away beneath a turbulent sky.",
    "journalPrompt": "What would I lose by insisting on winning this argument?",
    "psychological": "Psychological lens: Defending the self through humiliation of another can leave both sides less secure.",
    "spiritual": "Five of Swords invites reflection on conflict, costly victory, self-interest. What would I lose by insisting on winning this argument?",
    "wuWei": "A practice of unforced attention with Five of Swords: What would I lose by insisting on winning this argument?",
    "wabiSabi": "An imperfect, lived expression of conflict can be more useful than an ideal you cannot inhabit. Defending the self through humiliation of another can leave both sides less secure.",
    "numerology": "Five disrupts an established pattern and invites a response to change. In Five of Swords, consider how this relates to conflict.",
    "connections": [
      {
        "card": "Five of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw05.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 55,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Six",
    "number": 6,
    "roman": "VI",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Six of Swords",
    "subtitle": "Transition · Support · Perspective",
    "uprightKeywords": [
      "Transition",
      "Support",
      "Perspective"
    ],
    "reversedKeywords": [
      "Resistance to Transition",
      "Unfinished Business",
      "Difficult Passage"
    ],
    "upright": "A move toward calmer conditions may be possible with help. Bring what you have learned without expecting an immediate emotional reset; a transition can be useful even when it is not joyful.",
    "reversed": "A transition may be blocked by unfinished practical or emotional matters. Identify what needs attending to and what support would make movement possible.",
    "symbolism": "A boat carries passengers and upright swords across water toward another shore.",
    "journalPrompt": "What support would help me move toward a calmer situation?",
    "psychological": "Psychological lens: Distance can create perspective, while the mind still carries patterns that will need attention on the new shore.",
    "spiritual": "Six of Swords invites reflection on transition, support, perspective. What support would help me move toward a calmer situation?",
    "wuWei": "A practice of unforced attention with Six of Swords: What support would help me move toward a calmer situation?",
    "wabiSabi": "An imperfect, lived expression of transition can be more useful than an ideal you cannot inhabit. Distance can create perspective, while the mind still carries patterns that will need attention on the new shore.",
    "numerology": "Six explores adjustment, relationship and a more workable harmony. In Six of Swords, consider how this relates to transition.",
    "connections": [
      {
        "card": "Six of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw06.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 56,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Seven",
    "number": 7,
    "roman": "VII",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Seven of Swords",
    "subtitle": "Strategy · Discretion · Independent Action",
    "uprightKeywords": [
      "Strategy",
      "Discretion",
      "Independent Action"
    ],
    "reversedKeywords": [
      "Exposure",
      "Self-Deception",
      "Reconsideration"
    ],
    "upright": "A delicate situation may call for discretion and careful strategy. Check the ethics and likely consequences of the approach; independence is different from avoiding an agreement that others reasonably rely on.",
    "reversed": "A concealed issue or a flaw in your own strategy may be coming into view. Use the opportunity to clarify intentions and make a more accountable plan.",
    "symbolism": "A figure carries five swords away from a camp while looking back at two left behind.",
    "journalPrompt": "Where is discretion helpful, and where am I avoiding accountability?",
    "psychological": "Psychological lens: A clever protective strategy can become self-defeating when its hidden assumptions remain unexamined.",
    "spiritual": "Seven of Swords invites reflection on strategy, discretion, independent action. Where is discretion helpful, and where am I avoiding accountability?",
    "wuWei": "A practice of unforced attention with Seven of Swords: Where is discretion helpful, and where am I avoiding accountability?",
    "wabiSabi": "An imperfect, lived expression of strategy can be more useful than an ideal you cannot inhabit. A clever protective strategy can become self-defeating when its hidden assumptions remain unexamined.",
    "numerology": "Seven pauses to examine direction, effort and inner conviction. In Seven of Swords, consider how this relates to strategy.",
    "connections": [
      {
        "card": "Seven of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw07.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 57,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Eight",
    "number": 8,
    "roman": "VIII",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Eight of Swords",
    "subtitle": "Restriction · Fear · Limited Perspective",
    "uprightKeywords": [
      "Restriction",
      "Fear",
      "Limited Perspective"
    ],
    "reversedKeywords": [
      "New Options",
      "Self-Release",
      "Persistent Doubt"
    ],
    "upright": "A situation may feel more closed than it is, though some limits may be real. Separate concrete constraints from feared consequences and look for one safe step that increases your room to choose.",
    "reversed": "You may be seeing an opening or doubting your ability to use it. Seek information and support that make the next step manageable instead of blaming yourself for feeling stuck.",
    "symbolism": "A bound, blindfolded figure stands among swords with open ground nearby.",
    "journalPrompt": "Which limit is a fact, and which might change with information or support?",
    "psychological": "Psychological lens: A protective belief can narrow perception until alternatives become difficult to imagine. Recognition begins to widen the field.",
    "spiritual": "Eight of Swords invites reflection on restriction, fear, limited perspective. Which limit is a fact, and which might change with information or support?",
    "wuWei": "A practice of unforced attention with Eight of Swords: Which limit is a fact, and which might change with information or support?",
    "wabiSabi": "An imperfect, lived expression of restriction can be more useful than an ideal you cannot inhabit. A protective belief can narrow perception until alternatives become difficult to imagine. Recognition begins to widen the field.",
    "numerology": "Eight develops power through practice, organisation or repeated engagement. In Eight of Swords, consider how this relates to restriction.",
    "connections": [
      {
        "card": "Eight of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw08.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 58,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Nine",
    "number": 9,
    "roman": "IX",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Nine of Swords",
    "subtitle": "Worry · Rumination · Distress",
    "uprightKeywords": [
      "Worry",
      "Rumination",
      "Distress"
    ],
    "reversedKeywords": [
      "Support",
      "Easing Anxiety",
      "Hidden Distress"
    ],
    "upright": "Worry may be growing in isolation or repeating through the night. Bring the concern into daylight with someone trustworthy, distinguish evidence from feared outcomes and attend to what would support rest.",
    "reversed": "A burden may be easing, or you may be hiding how difficult things feel. Reach for support and judge progress in manageable steps rather than expecting distress to disappear immediately.",
    "symbolism": "A figure sits upright in bed with hands over the face beneath nine swords.",
    "journalPrompt": "What fear needs compassionate attention rather than another round of private argument?",
    "psychological": "Psychological lens: Thought can intensify distress when it tries to solve uncertainty by rehearsing every possible threat.",
    "spiritual": "Nine of Swords invites reflection on worry, rumination, distress. What fear needs compassionate attention rather than another round of private argument?",
    "wuWei": "A practice of unforced attention with Nine of Swords: What fear needs compassionate attention rather than another round of private argument?",
    "wabiSabi": "An imperfect, lived expression of worry can be more useful than an ideal you cannot inhabit. Thought can intensify distress when it tries to solve uncertainty by rehearsing every possible threat.",
    "numerology": "Nine draws experience toward maturity while asking what is still needed. In Nine of Swords, consider how this relates to worry.",
    "connections": [
      {
        "card": "Nine of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw09.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 59,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Ten",
    "number": 10,
    "roman": "X",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Ten of Swords",
    "subtitle": "Ending · Exhaustion · Acceptance",
    "uprightKeywords": [
      "Ending",
      "Exhaustion",
      "Acceptance"
    ],
    "reversedKeywords": [
      "Recovery",
      "Resistance to an Ending",
      "Renewed Ground"
    ],
    "upright": "A painful chapter may have reached its limit. Acknowledge what cannot be sustained and prioritise support and recovery; the image marks an ending rather than a literal prediction of harm.",
    "reversed": "Recovery may be beginning, or an ending may still be resisted. Let the first improvement be modest and protect yourself from returning too quickly to the conditions that exhausted you.",
    "symbolism": "A prone figure lies beneath ten swords while light appears beyond dark clouds.",
    "journalPrompt": "What can I stop trying to revive so that recovery has room to begin?",
    "psychological": "Psychological lens: When a familiar story collapses, the psyche needs care before it can construct a more spacious one.",
    "spiritual": "Ten of Swords invites reflection on ending, exhaustion, acceptance. What can I stop trying to revive so that recovery has room to begin?",
    "wuWei": "A practice of unforced attention with Ten of Swords: What can I stop trying to revive so that recovery has room to begin?",
    "wabiSabi": "An imperfect, lived expression of ending can be more useful than an ideal you cannot inhabit. When a familiar story collapses, the psyche needs care before it can construct a more spacious one.",
    "numerology": "Ten completes a cycle and carries its consequences into another beginning. In Ten of Swords, consider how this relates to ending.",
    "connections": [
      {
        "card": "Ten of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw10.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 60,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Page",
    "number": null,
    "roman": "Pg",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Page of Swords",
    "subtitle": "Curiosity · Observation · Questions",
    "uprightKeywords": [
      "Curiosity",
      "Observation",
      "Questions"
    ],
    "reversedKeywords": [
      "Gossip",
      "Defensiveness",
      "Untested Claims"
    ],
    "upright": "Ask a precise question and remain alert to new information. Curiosity is useful when it includes checking a source and listening fully, rather than turning every observation into an immediate conclusion.",
    "reversed": "Information may be incomplete or attention may be turning suspicious. Verify before repeating a claim and notice when questioning has become a way to stay defended.",
    "symbolism": "A young figure holds a sword in a windy landscape while looking to the side.",
    "journalPrompt": "Which question would help me understand rather than merely defend my position?",
    "psychological": "Psychological lens: An enquiring mind grows through tolerating the difference between noticing something and knowing what it means.",
    "spiritual": "Page of Swords invites reflection on curiosity, observation, questions. Which question would help me understand rather than merely defend my position?",
    "wuWei": "A practice of unforced attention with Page of Swords: Which question would help me understand rather than merely defend my position?",
    "wabiSabi": "An imperfect, lived expression of curiosity can be more useful than an ideal you cannot inhabit. An enquiring mind grows through tolerating the difference between noticing something and knowing what it means.",
    "numerology": "Page is a court role, not a numbered pip card: a learner’s curiosity and an emerging practical relationship to the suit. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Page of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw11.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 61,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Knight",
    "number": null,
    "roman": "Kn",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Knight of Swords",
    "subtitle": "Directness · Resolve · Swift Action",
    "uprightKeywords": [
      "Directness",
      "Resolve",
      "Swift Action"
    ],
    "reversedKeywords": [
      "Recklessness",
      "Argument",
      "Tunnel Vision"
    ],
    "upright": "A clear aim may call for a direct response. Act decisively where the facts support it, while leaving enough attention for consequences, timing and information that challenges your initial view.",
    "reversed": "Urgency may be narrowing your judgement or making a conversation unnecessarily combative. Pause long enough to ask whether speed is helping the purpose you claim to serve.",
    "symbolism": "A rider charges forward with a raised sword under a turbulent sky.",
    "journalPrompt": "Where do I need decisiveness, and where am I confusing urgency with certainty?",
    "psychological": "Psychological lens: The wish to cut through difficulty can become rigid when thought loses contact with feeling and circumstance.",
    "spiritual": "Knight of Swords invites reflection on directness, resolve, swift action. Where do I need decisiveness, and where am I confusing urgency with certainty?",
    "wuWei": "A practice of unforced attention with Knight of Swords: Where do I need decisiveness, and where am I confusing urgency with certainty?",
    "wabiSabi": "An imperfect, lived expression of directness can be more useful than an ideal you cannot inhabit. The wish to cut through difficulty can become rigid when thought loses contact with feeling and circumstance.",
    "numerology": "Knight is a court role, not a numbered pip card: an active way of pursuing the suit’s concerns, with both gifts and excesses. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Knight of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw12.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 62,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "Queen",
    "number": null,
    "roman": "Q",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "Queen of Swords",
    "subtitle": "Discernment · Candour · Boundaries",
    "uprightKeywords": [
      "Discernment",
      "Candour",
      "Boundaries"
    ],
    "reversedKeywords": [
      "Harsh Judgement",
      "Bitterness",
      "Emotional Distance"
    ],
    "upright": "Speak clearly from experience and hold a fair boundary. Discernment can protect what matters while still allowing compassion; you do not need to soften the truth into something you no longer mean.",
    "reversed": "Past hurt may be sharpening judgement or creating distance where dialogue is possible. Reconsider the tone without abandoning the boundary that protects your integrity.",
    "symbolism": "A queen holds an upright sword and extends an open hand from her throne.",
    "journalPrompt": "How can I be clear and fair without closing my capacity for connection?",
    "psychological": "Psychological lens: Experience can become wisdom when it informs a boundary rather than hardening into a judgement of everyone.",
    "spiritual": "Queen of Swords invites reflection on discernment, candour, boundaries. How can I be clear and fair without closing my capacity for connection?",
    "wuWei": "A practice of unforced attention with Queen of Swords: How can I be clear and fair without closing my capacity for connection?",
    "wabiSabi": "An imperfect, lived expression of discernment can be more useful than an ideal you cannot inhabit. Experience can become wisdom when it informs a boundary rather than hardening into a judgement of everyone.",
    "numerology": "Queen is a court role, not a numbered pip card: a receptive, sustaining expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Queen of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw13.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 63,
    "arcana": "Minor",
    "suit": "Swords",
    "rank": "King",
    "number": null,
    "roman": "K",
    "element": "Air",
    "astrology": "Air · Swords",
    "name": "King of Swords",
    "subtitle": "Reason · Integrity · Clear Standards",
    "uprightKeywords": [
      "Reason",
      "Integrity",
      "Clear Standards"
    ],
    "reversedKeywords": [
      "Rigidity",
      "Manipulation",
      "Cold Authority"
    ],
    "upright": "Bring clear standards and careful reasoning to a decision. Explain the principles you are using, consider relevant evidence and make room for the human effects of a technically correct answer.",
    "reversed": "Reason may be used selectively to justify control or conceal feeling. Test your standards for consistency and invite scrutiny of the assumptions behind the conclusion.",
    "symbolism": "A king faces forward holding an upright sword, with butterflies and clouds around his throne.",
    "journalPrompt": "Would I accept this reasoning if it were applied fairly to everyone involved?",
    "psychological": "Psychological lens: Intellectual authority becomes trustworthy when it can recognise its limits and remain accountable to lived experience.",
    "spiritual": "King of Swords invites reflection on reason, integrity, clear standards. Would I accept this reasoning if it were applied fairly to everyone involved?",
    "wuWei": "A practice of unforced attention with King of Swords: Would I accept this reasoning if it were applied fairly to everyone involved?",
    "wabiSabi": "An imperfect, lived expression of reason can be more useful than an ideal you cannot inhabit. Intellectual authority becomes trustworthy when it can recognise its limits and remain accountable to lived experience.",
    "numerology": "King is a court role, not a numbered pip card: a directing, accountable expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "King of Pentacles",
        "title": "Thought and Practice",
        "meaning": "Swords offers distinctions and decisions; Pentacles tests them in practical conditions. Ask what action would put an idea in contact with reality."
      }
    ],
    "image": "assets/deck/sw14.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 64,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Ace",
    "number": 1,
    "roman": "I",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Ace of Pentacles",
    "subtitle": "Opportunity · Resources · Grounding",
    "uprightKeywords": [
      "Opportunity",
      "Resources",
      "Grounding"
    ],
    "reversedKeywords": [
      "Missed Opening",
      "Unready Plan",
      "Instability"
    ],
    "upright": "A practical opportunity can become valuable through steady attention. Look at the resources, skills or conditions available and choose a first step that makes the possibility concrete.",
    "reversed": "An opportunity may need preparation before it can take root. Check costs, capacity and follow-through rather than confusing the promise of a result with a workable plan.",
    "symbolism": "A hand offers a pentacle above a garden path leading through an archway.",
    "journalPrompt": "What practical first step would help this opportunity take root?",
    "psychological": "Psychological lens: A sense of possibility becomes more secure when it is translated into tangible action.",
    "spiritual": "Ace of Pentacles invites reflection on opportunity, resources, grounding. What practical first step would help this opportunity take root?",
    "wuWei": "A practice of unforced attention with Ace of Pentacles: What practical first step would help this opportunity take root?",
    "wabiSabi": "An imperfect, lived expression of opportunity can be more useful than an ideal you cannot inhabit. A sense of possibility becomes more secure when it is translated into tangible action.",
    "numerology": "One begins a cycle with a seed, focus or initial act. In Ace of Pentacles, consider how this relates to opportunity.",
    "connections": [
      {
        "card": "Ace of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe01.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 65,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Two",
    "number": 2,
    "roman": "II",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Two of Pentacles",
    "subtitle": "Adaptability · Balance · Priorities",
    "uprightKeywords": [
      "Adaptability",
      "Balance",
      "Priorities"
    ],
    "reversedKeywords": [
      "Overcommitment",
      "Disorganisation",
      "Strain"
    ],
    "upright": "Several demands may need an adaptable rhythm. Keep the essentials visible and revise your priorities as circumstances change; balance can involve movement rather than holding everything perfectly still.",
    "reversed": "Too many demands may be exceeding your capacity. Simplify commitments and choose what can wait rather than relying on constant adjustment to make an impossible load sustainable.",
    "symbolism": "A figure handles two pentacles linked by a loop while ships rise and fall on waves.",
    "journalPrompt": "Which priority needs protecting while I adapt to everything else?",
    "psychological": "Psychological lens: Flexibility supports the self when it remains a choice rather than a permanent response to overload.",
    "spiritual": "Two of Pentacles invites reflection on adaptability, balance, priorities. Which priority needs protecting while I adapt to everything else?",
    "wuWei": "A practice of unforced attention with Two of Pentacles: Which priority needs protecting while I adapt to everything else?",
    "wabiSabi": "An imperfect, lived expression of adaptability can be more useful than an ideal you cannot inhabit. Flexibility supports the self when it remains a choice rather than a permanent response to overload.",
    "numerology": "Two brings relationship, polarity and the need to consider another position. In Two of Pentacles, consider how this relates to adaptability.",
    "connections": [
      {
        "card": "Two of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe02.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 66,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Three",
    "number": 3,
    "roman": "III",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Three of Pentacles",
    "subtitle": "Craft · Collaboration · Learning",
    "uprightKeywords": [
      "Craft",
      "Collaboration",
      "Learning"
    ],
    "reversedKeywords": [
      "Poor Coordination",
      "Undervalued Work",
      "Skill Gaps"
    ],
    "upright": "A shared task benefits from distinct skills and practical feedback. Clarify roles, respect the knowledge each person brings and let the quality of the work grow through cooperation.",
    "reversed": "The work may be suffering from unclear roles or dismissed expertise. Agree on a common standard and address a specific skill or communication gap before assigning blame.",
    "symbolism": "A craftsperson discusses a building with two figures who hold a plan.",
    "journalPrompt": "Whose knowledge would improve this work if I made room for it?",
    "psychological": "Psychological lens: Competence can grow through recognition of interdependence rather than an insistence on self-sufficiency.",
    "spiritual": "Three of Pentacles invites reflection on craft, collaboration, learning. Whose knowledge would improve this work if I made room for it?",
    "wuWei": "A practice of unforced attention with Three of Pentacles: Whose knowledge would improve this work if I made room for it?",
    "wabiSabi": "An imperfect, lived expression of craft can be more useful than an ideal you cannot inhabit. Competence can grow through recognition of interdependence rather than an insistence on self-sufficiency.",
    "numerology": "Three develops expression, growth and the effects of working together. In Three of Pentacles, consider how this relates to craft.",
    "connections": [
      {
        "card": "Three of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe03.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 67,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Four",
    "number": 4,
    "roman": "IV",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Four of Pentacles",
    "subtitle": "Security · Conservation · Boundaries",
    "uprightKeywords": [
      "Security",
      "Conservation",
      "Boundaries"
    ],
    "reversedKeywords": [
      "Clinging",
      "Release",
      "Fear of Scarcity"
    ],
    "upright": "Protecting resources can create a useful foundation. Check whether your boundaries serve genuine security or whether the effort to hold everything tightly is reducing your freedom to use what you have.",
    "reversed": "You may be loosening a restrictive hold or feeling unsafe enough to cling harder. Distinguish a thoughtful reserve from fear-driven control before deciding what to share or release.",
    "symbolism": "A seated figure grips a pentacle, balances one on the head and rests feet on two more.",
    "journalPrompt": "What am I protecting, and what is the cost of holding it so tightly?",
    "psychological": "Psychological lens: Material control can become a stand-in for inner safety. Recognising that link allows more deliberate boundaries.",
    "spiritual": "Four of Pentacles invites reflection on security, conservation, boundaries. What am I protecting, and what is the cost of holding it so tightly?",
    "wuWei": "A practice of unforced attention with Four of Pentacles: What am I protecting, and what is the cost of holding it so tightly?",
    "wabiSabi": "An imperfect, lived expression of security can be more useful than an ideal you cannot inhabit. Material control can become a stand-in for inner safety. Recognising that link allows more deliberate boundaries.",
    "numerology": "Four creates structure and stability while asking how much flexibility it allows. In Four of Pentacles, consider how this relates to security.",
    "connections": [
      {
        "card": "Four of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe04.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 68,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Five",
    "number": 5,
    "roman": "V",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Five of Pentacles",
    "subtitle": "Hardship · Exclusion · Need for Support",
    "uprightKeywords": [
      "Hardship",
      "Exclusion",
      "Need for Support"
    ],
    "reversedKeywords": [
      "Help",
      "Recovery",
      "Lingering Scarcity"
    ],
    "upright": "A period of practical or emotional hardship may be making you feel outside the circle of support. Name the need and investigate available help rather than assuming you must manage it unseen.",
    "reversed": "Support or recovery may be becoming available, though a sense of exclusion can persist. Accept a specific offer and let renewed stability develop gradually.",
    "symbolism": "Two figures pass through snow beneath an illuminated window bearing five pentacles.",
    "journalPrompt": "What help could I ask for instead of assuming I have to cope alone?",
    "psychological": "Psychological lens: Feeling excluded can make support difficult to recognise or receive. Need does not erase dignity or belonging.",
    "spiritual": "Five of Pentacles invites reflection on hardship, exclusion, need for support. What help could I ask for instead of assuming I have to cope alone?",
    "wuWei": "A practice of unforced attention with Five of Pentacles: What help could I ask for instead of assuming I have to cope alone?",
    "wabiSabi": "An imperfect, lived expression of hardship can be more useful than an ideal you cannot inhabit. Feeling excluded can make support difficult to recognise or receive. Need does not erase dignity or belonging.",
    "numerology": "Five disrupts an established pattern and invites a response to change. In Five of Pentacles, consider how this relates to hardship.",
    "connections": [
      {
        "card": "Five of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe05.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 69,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Six",
    "number": 6,
    "roman": "VI",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Six of Pentacles",
    "subtitle": "Generosity · Reciprocity · Fair Exchange",
    "uprightKeywords": [
      "Generosity",
      "Reciprocity",
      "Fair Exchange"
    ],
    "reversedKeywords": [
      "Strings Attached",
      "Unequal Exchange",
      "Overgiving"
    ],
    "upright": "Resources or attention are being exchanged. Notice who has the power to give, ask or refuse, and aim for help that respects the recipient’s dignity and real needs.",
    "reversed": "An exchange may carry unspoken conditions or ask too much of one side. Make the terms visible and distinguish generosity from a pattern that creates dependency or resentment.",
    "symbolism": "A standing figure distributes coins while holding scales above two kneeling figures.",
    "journalPrompt": "What would make this exchange fair and freely chosen?",
    "psychological": "Psychological lens: Giving can express care or manage a need for power and approval. Examining the motive protects mutual dignity.",
    "spiritual": "Six of Pentacles invites reflection on generosity, reciprocity, fair exchange. What would make this exchange fair and freely chosen?",
    "wuWei": "A practice of unforced attention with Six of Pentacles: What would make this exchange fair and freely chosen?",
    "wabiSabi": "An imperfect, lived expression of generosity can be more useful than an ideal you cannot inhabit. Giving can express care or manage a need for power and approval. Examining the motive protects mutual dignity.",
    "numerology": "Six explores adjustment, relationship and a more workable harmony. In Six of Pentacles, consider how this relates to generosity.",
    "connections": [
      {
        "card": "Six of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe06.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 70,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Seven",
    "number": 7,
    "roman": "VII",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Seven of Pentacles",
    "subtitle": "Patience · Assessment · Cultivation",
    "uprightKeywords": [
      "Patience",
      "Assessment",
      "Cultivation"
    ],
    "reversedKeywords": [
      "Impatience",
      "Poor Return",
      "Unfocused Effort"
    ],
    "upright": "Pause to assess the return on sustained effort. Consider what is growing, what needs adjustment and whether the result still matters to you before investing more of your time.",
    "reversed": "Effort may be continuing without a useful return, or impatience may be obscuring slow growth. Set a realistic review point and decide what evidence would justify continuing.",
    "symbolism": "A figure leans on a tool while looking at pentacles growing on a vine.",
    "journalPrompt": "What evidence will help me decide whether to keep tending this effort?",
    "psychological": "Psychological lens: Investment can create attachment to a plan. Reflective assessment separates commitment from the fear of admitting a change is needed.",
    "spiritual": "Seven of Pentacles invites reflection on patience, assessment, cultivation. What evidence will help me decide whether to keep tending this effort?",
    "wuWei": "A practice of unforced attention with Seven of Pentacles: What evidence will help me decide whether to keep tending this effort?",
    "wabiSabi": "An imperfect, lived expression of patience can be more useful than an ideal you cannot inhabit. Investment can create attachment to a plan. Reflective assessment separates commitment from the fear of admitting a change is needed.",
    "numerology": "Seven pauses to examine direction, effort and inner conviction. In Seven of Pentacles, consider how this relates to patience.",
    "connections": [
      {
        "card": "Seven of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe07.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 71,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Eight",
    "number": 8,
    "roman": "VIII",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Eight of Pentacles",
    "subtitle": "Practice · Skill · Dedication",
    "uprightKeywords": [
      "Practice",
      "Skill",
      "Dedication"
    ],
    "reversedKeywords": [
      "Perfectionism",
      "Disengagement",
      "Repetition Without Growth"
    ],
    "upright": "A skill or project benefits from focused practice. Work on a specific detail, use feedback and let repetition build understanding instead of treating competence as something you either possess or lack.",
    "reversed": "Repetition may be losing purpose or perfectionism may be preventing completion. Reconnect with the skill you want to learn and choose a useful standard for this stage.",
    "symbolism": "A craftsperson works on a pentacle while completed pieces line the wall nearby.",
    "journalPrompt": "Which specific skill would improve through patient practice now?",
    "psychological": "Psychological lens: Mastery develops through a relationship with error that supports learning rather than threatens self-worth.",
    "spiritual": "Eight of Pentacles invites reflection on practice, skill, dedication. Which specific skill would improve through patient practice now?",
    "wuWei": "A practice of unforced attention with Eight of Pentacles: Which specific skill would improve through patient practice now?",
    "wabiSabi": "An imperfect, lived expression of practice can be more useful than an ideal you cannot inhabit. Mastery develops through a relationship with error that supports learning rather than threatens self-worth.",
    "numerology": "Eight develops power through practice, organisation or repeated engagement. In Eight of Pentacles, consider how this relates to practice.",
    "connections": [
      {
        "card": "Eight of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe08.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 72,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Nine",
    "number": 9,
    "roman": "IX",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Nine of Pentacles",
    "subtitle": "Independence · Enjoyment · Self-Respect",
    "uprightKeywords": [
      "Independence",
      "Enjoyment",
      "Self-Respect"
    ],
    "reversedKeywords": [
      "Dependence",
      "Overwork",
      "Uneasy Success"
    ],
    "upright": "Recognise the independence or comfort that patient work has made possible. Enjoy it deliberately and maintain the boundaries and relationships that help your life feel chosen rather than merely productive.",
    "reversed": "Success may feel insecure, isolating or too costly to maintain. Reassess the standard you are trying to sustain and the support you need to enjoy what you have built.",
    "symbolism": "A figure stands in a cultivated garden with a falcon and nine pentacles among the vines.",
    "journalPrompt": "How can I enjoy what I have built without making achievement my only source of worth?",
    "psychological": "Psychological lens: Autonomy includes the freedom to receive pleasure and connection, not just the ability to function alone.",
    "spiritual": "Nine of Pentacles invites reflection on independence, enjoyment, self-respect. How can I enjoy what I have built without making achievement my only source of worth?",
    "wuWei": "A practice of unforced attention with Nine of Pentacles: How can I enjoy what I have built without making achievement my only source of worth?",
    "wabiSabi": "An imperfect, lived expression of independence can be more useful than an ideal you cannot inhabit. Autonomy includes the freedom to receive pleasure and connection, not just the ability to function alone.",
    "numerology": "Nine draws experience toward maturity while asking what is still needed. In Nine of Pentacles, consider how this relates to independence.",
    "connections": [
      {
        "card": "Nine of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe09.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 73,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Ten",
    "number": 10,
    "roman": "X",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Ten of Pentacles",
    "subtitle": "Legacy · Continuity · Shared Resources",
    "uprightKeywords": [
      "Legacy",
      "Continuity",
      "Shared Resources"
    ],
    "reversedKeywords": [
      "Family Strain",
      "Unstable Foundation",
      "Inherited Expectations"
    ],
    "upright": "Consider the long-term structures that support a household, community or shared endeavour. Resources include knowledge, care and belonging as well as possessions; ask what you want to pass on.",
    "reversed": "An inherited expectation or shared arrangement may be undermining stability. Make responsibilities and assumptions explicit and consider whose needs are missing from the family or institutional picture.",
    "symbolism": "Several generations appear with dogs beneath an archway, surrounded by ten pentacles.",
    "journalPrompt": "What kind of security and belonging do I want my choices to help sustain?",
    "psychological": "Psychological lens: Inherited structures shape the self, but continuity can include conscious revision rather than unquestioned repetition.",
    "spiritual": "Ten of Pentacles invites reflection on legacy, continuity, shared resources. What kind of security and belonging do I want my choices to help sustain?",
    "wuWei": "A practice of unforced attention with Ten of Pentacles: What kind of security and belonging do I want my choices to help sustain?",
    "wabiSabi": "An imperfect, lived expression of legacy can be more useful than an ideal you cannot inhabit. Inherited structures shape the self, but continuity can include conscious revision rather than unquestioned repetition.",
    "numerology": "Ten completes a cycle and carries its consequences into another beginning. In Ten of Pentacles, consider how this relates to legacy.",
    "connections": [
      {
        "card": "Ten of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe10.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 74,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Page",
    "number": null,
    "roman": "Pg",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Page of Pentacles",
    "subtitle": "Study · Practical Beginning · Application",
    "uprightKeywords": [
      "Study",
      "Practical Beginning",
      "Application"
    ],
    "reversedKeywords": [
      "Procrastination",
      "Lack of Focus",
      "Unrealised Plan"
    ],
    "upright": "Choose a skill or practical goal and approach it as a student. Careful attention to a small task can turn interest into experience and reveal the resources you need next.",
    "reversed": "Planning may be replacing practice or the goal may be too vague to start. Choose one concrete task and learn from doing it before expanding the ambition.",
    "symbolism": "A young figure studies a pentacle held above a green landscape and cultivated field.",
    "journalPrompt": "What can I learn by doing one small practical task today?",
    "psychological": "Psychological lens: The learner develops trust through contact with real materials, limits and feedback.",
    "spiritual": "Page of Pentacles invites reflection on study, practical beginning, application. What can I learn by doing one small practical task today?",
    "wuWei": "A practice of unforced attention with Page of Pentacles: What can I learn by doing one small practical task today?",
    "wabiSabi": "An imperfect, lived expression of study can be more useful than an ideal you cannot inhabit. The learner develops trust through contact with real materials, limits and feedback.",
    "numerology": "Page is a court role, not a numbered pip card: a learner’s curiosity and an emerging practical relationship to the suit. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Page of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe11.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 75,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Knight",
    "number": null,
    "roman": "Kn",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Knight of Pentacles",
    "subtitle": "Reliability · Steady Work · Commitment",
    "uprightKeywords": [
      "Reliability",
      "Steady Work",
      "Commitment"
    ],
    "reversedKeywords": [
      "Stagnation",
      "Inflexibility",
      "Work Without Rest"
    ],
    "upright": "A worthwhile task may need consistency more than speed. Make a realistic plan, honour the next commitment and let steady work build trust without requiring a dramatic display of progress.",
    "reversed": "Routine may have become rigid or effort may be continuing after its purpose has gone. Review the method and make room for rest or a necessary change in direction.",
    "symbolism": "A rider on a still horse holds a pentacle above a ploughed field.",
    "journalPrompt": "Which steady commitment serves me, and which routine needs reconsidering?",
    "psychological": "Psychological lens: Reliability supports identity when it remains connected to choice rather than fear of ever changing course.",
    "spiritual": "Knight of Pentacles invites reflection on reliability, steady work, commitment. Which steady commitment serves me, and which routine needs reconsidering?",
    "wuWei": "A practice of unforced attention with Knight of Pentacles: Which steady commitment serves me, and which routine needs reconsidering?",
    "wabiSabi": "An imperfect, lived expression of reliability can be more useful than an ideal you cannot inhabit. Reliability supports identity when it remains connected to choice rather than fear of ever changing course.",
    "numerology": "Knight is a court role, not a numbered pip card: an active way of pursuing the suit’s concerns, with both gifts and excesses. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Knight of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe12.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 76,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "Queen",
    "number": null,
    "roman": "Q",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "Queen of Pentacles",
    "subtitle": "Practical Care · Resourcefulness · Comfort",
    "uprightKeywords": [
      "Practical Care",
      "Resourcefulness",
      "Comfort"
    ],
    "reversedKeywords": [
      "Neglected Needs",
      "Overfunctioning",
      "Insecurity"
    ],
    "upright": "Care becomes tangible through a meal, a workable space, a clear budget or time made available. Use your resources with warmth while keeping your own needs inside the circle of care.",
    "reversed": "You may be holding daily life together for everyone while becoming depleted yourself. Restore practical support and distinguish being caring from being endlessly available.",
    "symbolism": "A queen holds a pentacle in a lush landscape with a rabbit nearby.",
    "journalPrompt": "What practical care do I need to include myself in?",
    "psychological": "Psychological lens: Nurturing becomes sustainable when the self is recognised as someone worthy of the same care it offers others.",
    "spiritual": "Queen of Pentacles invites reflection on practical care, resourcefulness, comfort. What practical care do I need to include myself in?",
    "wuWei": "A practice of unforced attention with Queen of Pentacles: What practical care do I need to include myself in?",
    "wabiSabi": "An imperfect, lived expression of practical care can be more useful than an ideal you cannot inhabit. Nurturing becomes sustainable when the self is recognised as someone worthy of the same care it offers others.",
    "numerology": "Queen is a court role, not a numbered pip card: a receptive, sustaining expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "Queen of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe13.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  },
  {
    "id": 77,
    "arcana": "Minor",
    "suit": "Pentacles",
    "rank": "King",
    "number": null,
    "roman": "K",
    "element": "Earth",
    "astrology": "Earth · Pentacles",
    "name": "King of Pentacles",
    "subtitle": "Stewardship · Stability · Competence",
    "uprightKeywords": [
      "Stewardship",
      "Stability",
      "Competence"
    ],
    "reversedKeywords": [
      "Possessiveness",
      "Status Anxiety",
      "Rigid Control"
    ],
    "upright": "Use experience and resources to create dependable conditions for yourself and others. Mature stewardship values maintenance, fair responsibility and a result that can last beyond a single achievement.",
    "reversed": "Security or status may be turning into possessiveness or resistance to change. Ask whether your resources are supporting life or whether protecting the position has become the main task.",
    "symbolism": "A king rests with a pentacle and sceptre amid vines, bull imagery and a substantial estate.",
    "journalPrompt": "How can I use what I have built to create lasting, shared stability?",
    "psychological": "Psychological lens: Material authority develops when competence serves a wider responsibility rather than only defending an image of success.",
    "spiritual": "King of Pentacles invites reflection on stewardship, stability, competence. How can I use what I have built to create lasting, shared stability?",
    "wuWei": "A practice of unforced attention with King of Pentacles: How can I use what I have built to create lasting, shared stability?",
    "wabiSabi": "An imperfect, lived expression of stewardship can be more useful than an ideal you cannot inhabit. Material authority develops when competence serves a wider responsibility rather than only defending an image of success.",
    "numerology": "King is a court role, not a numbered pip card: a directing, accountable expression of the suit’s qualities. It can describe an approach or quality in anyone, without prescribing age or gender.",
    "connections": [
      {
        "card": "King of Wands",
        "title": "Foundation and Initiative",
        "meaning": "Pentacles sustains the work; Wands gives it energy and direction. Growth needs both a viable foundation and a reason to begin."
      }
    ],
    "image": "assets/deck/pe14.jpg",
    "atmosphere": "assets/landing-reading.jpg"
  }
]);
