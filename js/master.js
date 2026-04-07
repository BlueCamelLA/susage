import { state, persist, today } from './state.js';

// ═══════════════════════════════════════════
// THE MASTER — Fantasy Sage Advisor System
// Channels: Goggins, Kobe, Naval, Bryan Johnson,
// Huberman, Munger, Jobs, Bruce Lee, Arnold, Jocko
// ═══════════════════════════════════════════

const STAT_COLORS = {
  STR: '#e94560', INT: '#6c63ff', CRE: '#f5c842', VIT: '#4ade80', WIL: '#38bdf8',
};

// ═══════════ DAILY WISDOM (60 quotes, 12 per stat) ═══════════

const DAILY_WISDOM = [
  // ——— STR (Goggins + Arnold) ———
  { id: 's1', stat: 'STR', text: 'The ancient warriors discovered a sacred truth: when your body screams that your strength is spent, you have burned through barely two-fifths of your reserves. The wall you feel is an illusion woven by a cautious mind.' },
  { id: 's2', stat: 'STR', text: 'Keep a sacred ledger of every trial you have survived. When the next battle feels impossible, open the ledger. You have already conquered worse. This is the warrior\'s greatest weapon — proof of endurance.' },
  { id: 's3', stat: 'STR', text: 'The final three strikes of any training — the ones that burn, the ones your body begs you to skip — those are the only strikes that forge new strength. Everything before was merely preparation.' },
  { id: 's4', stat: 'STR', text: 'Before you lift the weight, close your eyes and see yourself lifting it. The mind must conquer the burden before the body follows. Visualization is the first rep — and the most important one.' },
  { id: 's5', stat: 'STR', text: 'Comfort is a slow poison. The warrior who seeks ease finds their blade dulled by morning. Choose the harder path deliberately — that is where strength lives.' },
  { id: 's6', stat: 'STR', text: 'Your calluses tell your story. Every blister earned and healed makes the next grip stronger. Do not resent the pain of training — it is writing your legend into your skin.' },
  { id: 's7', stat: 'STR', text: 'The strongest warriors in the realm were not born with mighty arms. They were forged by showing up to train when every fiber wanted to stay in bed. Consistency defeats talent.' },
  { id: 's8', stat: 'STR', text: 'Never negotiate with your body at the moment of effort. The decision to train was made before dawn. When the moment arrives, there is no debate — only execution.' },
  { id: 's9', stat: 'STR', text: 'A warrior who trains only when motivated will be weak half the year. A warrior who trains on schedule, regardless of spirit, becomes unstoppable.' },
  { id: 's10', stat: 'STR', text: 'The weight does not care about your feelings. It does not know if you are tired or inspired. It yields only to those who apply force. This is the purest truth in all the realm.' },
  { id: 's11', stat: 'STR', text: 'Suffering is the currency of transformation. You cannot purchase a stronger body with comfort. Pay the price willingly, and the returns compound beyond measure.' },
  { id: 's12', stat: 'STR', text: 'Your body adapts to whatever you demand of it. Demand nothing, and it withers. Demand everything, and it becomes a fortress. The choice is yours, every single day.' },

  // ——— INT (Naval + Munger) ———
  { id: 'i1', stat: 'INT', text: 'The scholars of the ancient libraries understood: read not to collect knowledge like coins in a vault, but to build mental frameworks — scaffolding upon which all future wisdom can rest.' },
  { id: 'i2', stat: 'INT', text: 'The wise sage does not seek brilliance. Instead, they catalog every form of foolishness and simply avoid them all. Inversion — studying failure — is the shortest path to wisdom.' },
  { id: 'i3', stat: 'INT', text: 'Specific knowledge — the kind that cannot be taught in any academy — is found at the intersection of your curiosity and the world\'s need. Follow genuine fascination, not prescribed curricula.' },
  { id: 'i4', stat: 'INT', text: 'A mind trained in only one discipline is like a warrior with only one weapon. The greatest sages wield mental models from many domains — physics, biology, history, psychology — weaving them into a tapestry of understanding.' },
  { id: 'i5', stat: 'INT', text: 'Read obsessively, but not to finish books. Read to find the one idea that changes your entire model of the world. A single paragraph can be worth more than a hundred volumes.' },
  { id: 'i6', stat: 'INT', text: 'The compounding of knowledge works like compound gold in a vault. Each new idea earns interest upon every idea before it. Start early. Read daily. The returns are exponential.' },
  { id: 'i7', stat: 'INT', text: 'Never mistake activity for understanding. An hour of deep thought about one problem yields more wisdom than a week of busy reading. Depth defeats breadth.' },
  { id: 'i8', stat: 'INT', text: 'The best decisions come from understanding incentives. When you cannot understand why someone acts as they do, look to what rewards them. Incentives are the invisible architecture of all behavior.' },
  { id: 'i9', stat: 'INT', text: 'Leverage is the sage\'s secret: code, media, and capital work while you sleep. Build once, benefit forever. The wise invest time in creation, not repetition.' },
  { id: 'i10', stat: 'INT', text: 'The most dangerous phrase in any language is "everyone knows that." Question every assumption. The greatest discoveries hide behind walls of consensus.' },
  { id: 'i11', stat: 'INT', text: 'Seek out the people who disagree with you and understand WHY they disagree. Your blindest spots are protected by the comfortable armor of your own certainty.' },
  { id: 'i12', stat: 'INT', text: 'A clear mind makes better decisions than a busy one. Protect your thinking time as fiercely as a dragon guards its hoard. Solitude is not loneliness — it is the laboratory of insight.' },

  // ——— CRE (Jobs + Bruce Lee) ———
  { id: 'c1', stat: 'CRE', text: 'The master artisan knows that simplicity is the ultimate sophistication. It takes more skill to remove than to add. Strip away until only the essential remains — that is where beauty lives.' },
  { id: 'c2', stat: 'CRE', text: 'Be as water, young one. Water does not fight the rock — it flows around it, under it, through it. Rigidity is the enemy of creation. Adapt your form to what the moment demands.' },
  { id: 'c3', stat: 'CRE', text: 'Creativity is not invention from nothing. It is connecting existing dots in ways no one has seen before. The more experiences you collect, the more dots you have to connect.' },
  { id: 'c4', stat: 'CRE', text: 'Absorb what is useful, discard what is useless, and add what is uniquely your own. This is the path of the creative warrior — not blind imitation, but conscious synthesis.' },
  { id: 'c5', stat: 'CRE', text: 'The empty vessel holds the most potential. Approach every creative challenge as a beginner. Expertise can calcify into repetition. Keep your mind fluid.' },
  { id: 'c6', stat: 'CRE', text: 'Stay hungry, stay foolish. The moment you believe you know enough is the moment your art begins to die. The greatest creators maintained the curiosity of children.' },
  { id: 'c7', stat: 'CRE', text: 'Your time is limited. Do not waste it living someone else\'s vision. Have the courage to follow your own intuition — it already knows what you want to become.' },
  { id: 'c8', stat: 'CRE', text: 'A kick practiced ten thousand times is more dangerous than ten thousand different kicks practiced once. Master the fundamentals until they become invisible, then creativity flows naturally.' },
  { id: 'c9', stat: 'CRE', text: 'The obstacle is not the enemy of creativity — it IS the creative opportunity. Constraints force innovation. Embrace your limitations as the frame for your masterpiece.' },
  { id: 'c10', stat: 'CRE', text: 'Do not fear the blank canvas. Every master work began as nothing. The first stroke need not be perfect — it only needs to exist. Perfection is the enemy of creation.' },
  { id: 'c11', stat: 'CRE', text: 'Design is not how it looks. Design is how it works. True creativity serves a purpose beyond beauty — it solves a problem, tells a truth, or opens a door.' },
  { id: 'c12', stat: 'CRE', text: 'The creative spirit flows strongest in those who show up to create regardless of inspiration. Muses visit the working, not the waiting.' },

  // ——— VIT (Bryan Johnson + Huberman) ———
  { id: 'v1', stat: 'VIT', text: 'The alchemists discovered that sleep is the most potent elixir ever brewed. Eight hours of deep slumber repairs more damage than any healing spell. Guard your rest as you would guard your life.' },
  { id: 'v2', stat: 'VIT', text: 'Within the first hour of waking, seek the morning light. The sun resets your inner clock, synchronizing the ancient rhythms that govern energy, mood, and healing throughout the realm of your body.' },
  { id: 'v3', stat: 'VIT', text: 'Your body is not a temple to be worshipped — it is a machine to be measured. Track what you consume, how you move, how you sleep. Data reveals truths that feelings conceal.' },
  { id: 'v4', stat: 'VIT', text: 'Cold water is the warrior\'s morning ritual. Brief exposure to cold awakens dormant energy pathways, sharpens focus, and builds a resilience that carries through the entire day.' },
  { id: 'v5', stat: 'VIT', text: 'The foods you eat today become the body you inhabit tomorrow. Every meal is a potion — choose ingredients that heal, energize, and protect. Treat your nutrition as sacred alchemy.' },
  { id: 'v6', stat: 'VIT', text: 'Movement is medicine. Even ten minutes of walking sends healing energy through every limb. The body was built for motion — stillness, extended beyond rest, becomes rust.' },
  { id: 'v7', stat: 'VIT', text: 'Hydration is the foundation upon which all vitality stands. A dehydrated warrior is a diminished warrior. Two liters of water daily is not discipline — it is the minimum offering to your body.' },
  { id: 'v8', stat: 'VIT', text: 'The wise healer treats the body as a long-term investment. Small daily deposits of good sleep, clean food, and gentle movement compound into decades of powerful living.' },
  { id: 'v9', stat: 'VIT', text: 'Stress is not the enemy — unmanaged stress is. Learn to activate your body\'s recovery mode through breath: slow exhales longer than inhales. This is the physiological sigh — ancient magic hiding in your lungs.' },
  { id: 'v10', stat: 'VIT', text: 'The screens that glow in the dark hours steal your sleep. Blue light at night confuses the ancient clock within. Dim the world two hours before rest, and sleep will come deeper.' },
  { id: 'v11', stat: 'VIT', text: 'Your gut is your second mind. The bacteria within influence mood, energy, and clarity. Feed them fiber, fermented foods, and variety. A healthy gut is a healthy kingdom.' },
  { id: 'v12', stat: 'VIT', text: 'Do not wait for sickness to care for health. Prevention is the highest form of healing. Invest in vitality now, and disease will find no foothold in your fortress.' },

  // ——— WIL (Kobe + Jocko) ———
  { id: 'w1', stat: 'WIL', text: 'The Mamba strikes not with rage but with relentless precision. Study your craft while others sleep. Practice while others rest. When the moment arrives, your preparation will look like genius to those who didn\'t witness the work.' },
  { id: 'w2', stat: 'WIL', text: 'Discipline is not a cage — it is the key that opens every door. The warrior who rises before dawn does not sacrifice freedom. They purchase it, one morning at a time.' },
  { id: 'w3', stat: 'WIL', text: 'When something goes wrong, do not point outward. Point inward. Extreme ownership means every failure is yours to learn from, every problem yours to solve. This is not burden — it is power.' },
  { id: 'w4', stat: 'WIL', text: 'The Mamba did not fear failure. Every missed strike was data. Every defeat was a lesson inscribed in sweat. Embrace the loss — it is the tuition for mastery.' },
  { id: 'w5', stat: 'WIL', text: 'Good. It rained on your training day. Good. Your body aches. Good. The path is hard. Every obstacle is an invitation to prove your resolve. Say "good" — and keep moving.' },
  { id: 'w6', stat: 'WIL', text: 'The alarm rings in the dark hours not as punishment, but as opportunity. While the world sleeps, the disciplined warrior builds an empire of self-mastery, one quiet morning at a time.' },
  { id: 'w7', stat: 'WIL', text: 'Obsession is not madness when directed with purpose. The Mamba studied every opponent, every angle, every possibility. Obsessive preparation is what separates the great from the merely good.' },
  { id: 'w8', stat: 'WIL', text: 'Your default state should be action. Do not wait for motivation — it is unreliable. Discipline means executing the plan regardless of how you feel. Feelings follow action, not the reverse.' },
  { id: 'w9', stat: 'WIL', text: 'Rest is earned, not given. The warrior who collapses after giving everything sleeps deeper than the one who rests out of avoidance. Earn your rest through effort.' },
  { id: 'w10', stat: 'WIL', text: 'The gap between where you are and where you want to be is bridged by one thing: the willingness to do the work nobody else wants to do, for longer than anyone else is willing to do it.' },
  { id: 'w11', stat: 'WIL', text: 'Do not compare your chapter one to another\'s chapter twenty. Your journey is your own. The Mamba did not look sideways — only forward, only upward, only toward the next challenge.' },
  { id: 'w12', stat: 'WIL', text: 'Discipline and freedom are not opposites. They are partners. The more disciplined you become in the essentials, the more freedom you earn in everything else.' },
];

// ═══════════ LEVEL-UP TEACHINGS (30 total, 6 per stat) ═══════════

const TEACHINGS = [
  // STR milestones
  { id: 'STR_3', stat: 'STR', level: 3, title: 'The First Callus', text: 'Your hands have begun to harden. The early soreness fades as your body adapts to demand. This is the first law of strength: the body becomes what you repeatedly ask of it.', challenge: 'Today, add one extra set to your workout. Just one.' },
  { id: 'STR_5', stat: 'STR', level: 5, title: 'The 40% Doctrine', text: 'When your body screams to stop, know this — you have used barely two-fifths of your true capacity. The wall is a lie told by a protective mind. Push through, and discover reservoirs you never knew existed.', challenge: 'Next time you want to quit, do 5 more reps. Count them. Own them.' },
  { id: 'STR_7', stat: 'STR', level: 7, title: 'The Cookie Jar', text: 'Keep a sacred ledger of every victory, every hard day survived, every weight conquered. When doubt strikes, open this ledger. You have proof — undeniable, written proof — that you are capable of more than your fear suggests.', challenge: 'Write down your 5 hardest physical achievements. Read them before your next workout.' },
  { id: 'STR_10', stat: 'STR', level: 10, title: 'The Visualization Protocol', text: 'Before the body moves, the mind must see it move. Champions close their eyes and rehearse every rep, every stride, every victory — with such clarity that the body merely follows a path already walked.', challenge: 'Spend 2 minutes visualizing your workout before starting. See every rep clearly.' },
  { id: 'STR_15', stat: 'STR', level: 15, title: 'The Calloused Mind', text: 'Your body is now a weapon, but the true transformation was always mental. Physical training forged not just muscle but an unshakeable identity: you are someone who does hard things. Carry this into every domain of life.', challenge: 'Apply your physical discipline to one non-physical challenge this week.' },
  { id: 'STR_25', stat: 'STR', level: 25, title: 'The Living Fortress', text: 'You have become what most only dream of. Your strength is not merely physical — it radiates into every choice, every challenge, every moment. The fortress is complete. Now, help others build theirs.', challenge: 'Teach someone one thing you\'ve learned about strength and discipline.' },

  // INT milestones
  { id: 'INT_3', stat: 'INT', level: 3, title: 'The First Mental Model', text: 'You have begun collecting lenses through which to see the world. Each book, each idea, is a new lens. With three lenses, you can already see what others miss. With thirty, the world becomes transparent.', challenge: 'Learn one mental model today: Pareto Principle, Occam\'s Razor, or First Principles thinking.' },
  { id: 'INT_5', stat: 'INT', level: 5, title: 'The Art of Inversion', text: 'Instead of asking "how do I succeed?" ask "how would I certainly fail?" Then avoid those things. The sage who catalogs foolishness and simply avoids it all achieves more than the one who chases brilliance.', challenge: 'Write down 3 ways your current project could fail. Now prevent them.' },
  { id: 'INT_7', stat: 'INT', level: 7, title: 'The Compound Library', text: 'Knowledge compounds like gold in a vault. Each new idea earns interest on every previous idea. You now have enough foundation that new learning accelerates — connections form faster, patterns emerge sooner.', challenge: 'Connect something you learned this week to something from a completely different domain.' },
  { id: 'INT_10', stat: 'INT', level: 10, title: 'Specific Knowledge', text: 'There is knowledge that cannot be taught in any academy — it lives at the intersection of your unique curiosity and the world\'s need. This is your specific knowledge. Follow it relentlessly. It cannot be outsourced or competed away.', challenge: 'Identify one topic where your curiosity runs deepest. Spend 30 minutes going deeper.' },
  { id: 'INT_15', stat: 'INT', level: 15, title: 'The Multidisciplinary Mind', text: 'You now see with many eyes. Physics, psychology, biology, history — each discipline illuminates the others. The truly wise hold contradictory ideas simultaneously and still function. This is mastery of thought.', challenge: 'Read something completely outside your main interest. Find one parallel to your work.' },
  { id: 'INT_25', stat: 'INT', level: 25, title: 'The Oracle', text: 'Your mind has become a cathedral of understanding. You see patterns where others see chaos, simplicity where others see complexity. Use this gift wisely — teach generously, decide carefully, and never stop questioning.', challenge: 'Explain a complex concept to someone in simple terms. Simplicity is the final test of understanding.' },

  // CRE milestones
  { id: 'CRE_3', stat: 'CRE', level: 3, title: 'The Beginner\'s Flow', text: 'You have silenced the inner critic long enough to create. This is the hardest step — not perfection, but permission. Every master work began as a rough sketch. The act of creation IS the victory.', challenge: 'Create something in 5 minutes with zero judgment. Ugly is beautiful when it exists.' },
  { id: 'CRE_5', stat: 'CRE', level: 5, title: 'Be Like Water', text: 'Empty your cup. Rigid forms break under pressure; flowing forms adapt and endure. The creative warrior does not force solutions — they allow solutions to emerge by removing resistance.', challenge: 'Approach today\'s creative task with zero preconception. Let the work guide you.' },
  { id: 'CRE_7', stat: 'CRE', level: 7, title: 'Connecting the Dots', text: 'Creativity is not divine inspiration — it is pattern recognition across domains. The more varied your experiences, the richer your palette. Every conversation, every failure, every strange detour adds a dot waiting to be connected.', challenge: 'Combine two completely unrelated ideas into something new. Weird is wonderful.' },
  { id: 'CRE_10', stat: 'CRE', level: 10, title: 'The Simplicity Principle', text: 'Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away. The master artisan creates by subtraction. Strip every creation to its essence.', challenge: 'Take something you\'ve made and remove 30% of it. Does it improve?' },
  { id: 'CRE_15', stat: 'CRE', level: 15, title: 'Absorb What Is Useful', text: 'Study every technique, every style, every master. Then discard what doesn\'t serve you and keep what does. Add what is uniquely yours. This is the path to an original voice — not rebellion, but conscious synthesis.', challenge: 'Study one creator you admire. Identify the ONE technique you\'ll absorb. Discard the rest.' },
  { id: 'CRE_25', stat: 'CRE', level: 25, title: 'The Living Art', text: 'Your creativity now extends beyond any single medium. You see the world as raw material for beauty, meaning, and connection. Creation is no longer something you do — it is who you are.', challenge: 'Create something that helps someone else create. Pass the torch forward.' },

  // VIT milestones
  { id: 'VIT_3', stat: 'VIT', level: 3, title: 'The Morning Light Protocol', text: 'The ancient healers knew what modern sages confirmed: sunlight in the first hour of waking resets the body\'s deepest clock. Cortisol rises at the right time, melatonin prepares at the right time. This single habit governs all others.', challenge: 'Get 10 minutes of outdoor sunlight within 1 hour of waking. Do this for 3 days.' },
  { id: 'VIT_5', stat: 'VIT', level: 5, title: 'The Sleep Elixir', text: 'Sleep is not rest — it is active repair. During deep sleep, the body clears toxins, consolidates memory, and rebuilds tissue. Eight hours is not indulgence; it is the minimum investment in tomorrow\'s performance.', challenge: 'Set a consistent bedtime for 5 nights. No screens 1 hour before. Track how you feel.' },
  { id: 'VIT_7', stat: 'VIT', level: 7, title: 'The Blueprint Method', text: 'Stop guessing about your health. Measure it. Track sleep quality, energy levels, mood, exercise. Data reveals patterns invisible to intuition. The body speaks in numbers to those who listen.', challenge: 'Track one health metric this week: sleep hours, water intake, or energy level (1-10) each morning.' },
  { id: 'VIT_10', stat: 'VIT', level: 10, title: 'The Cold Forge', text: 'Deliberate cold exposure — cold water, cold air — triggers ancient survival pathways. Dopamine surges. Inflammation retreats. Resilience builds. The healer who befriends discomfort discovers a pharmacy within.', challenge: 'End your shower with 30 seconds of cold water. Breathe through it. Notice how you feel after.' },
  { id: 'VIT_15', stat: 'VIT', level: 15, title: 'The Breath Architect', text: 'Your breath is the only bridge between conscious and unconscious systems. Slow exhales activate recovery. Box breathing sharpens focus. The physiological sigh — double inhale, long exhale — resets stress in seconds.', challenge: 'Practice 5 minutes of box breathing: 4 seconds in, 4 hold, 4 out, 4 hold. Do it daily.' },
  { id: 'VIT_25', stat: 'VIT', level: 25, title: 'The Optimized Machine', text: 'Your body is now a finely tuned instrument. Every system — sleep, nutrition, movement, recovery — works in harmony. This is not the end of the journey but the beginning of longevity. Maintain the machine for decades.', challenge: 'Create your personal health protocol. Write it down. Follow it as gospel.' },

  // WIL milestones
  { id: 'WIL_3', stat: 'WIL', level: 3, title: 'The Morning Discipline', text: 'Discipline begins before the world wakes. The alarm rings in darkness not as punishment but as opportunity. Every morning you choose discipline over comfort, you cast a vote for the person you want to become.', challenge: 'Wake up 30 minutes earlier tomorrow. Use that time for something that matters.' },
  { id: 'WIL_5', stat: 'WIL', level: 5, title: 'The Mamba Mentality', text: 'The Mamba does not hope for victory. The Mamba prepares so thoroughly that victory is the only logical outcome. Obsessive preparation — studying every detail, practicing every scenario — is the foundation of clutch performance.', challenge: 'Pick one skill you\'re developing. Practice it with total focus for 15 minutes. No distractions.' },
  { id: 'WIL_7', stat: 'WIL', level: 7, title: 'Extreme Ownership', text: 'When something goes wrong, the weak look for someone to blame. The strong look in the mirror. Extreme ownership means: every problem in your life is your responsibility to solve. This is not guilt — it is power.', challenge: 'Identify one problem you\'ve been blaming on circumstances. Take ownership. What can YOU do?' },
  { id: 'WIL_10', stat: 'WIL', level: 10, title: 'Discipline Equals Freedom', text: 'The disciplined warrior has more freedom than the undisciplined dreamer. Discipline in finances creates financial freedom. Discipline in health creates physical freedom. Discipline in skills creates career freedom. The equation never lies.', challenge: 'Identify one area where more discipline would create more freedom. Start today.' },
  { id: 'WIL_15', stat: 'WIL', level: 15, title: 'The Dark Work', text: 'While others sleep, you sharpen your blade. While others celebrate, you study film. While others vacation, you refine your craft. The work nobody sees is the work that creates the results everybody envies. This is the dark work.', challenge: 'Spend 30 minutes on "dark work" — practice or study that nobody will ever see or praise you for.' },
  { id: 'WIL_25', stat: 'WIL', level: 25, title: 'The Unbreakable Spirit', text: 'Your will has been forged in fire. No obstacle surprises you, no setback defeats you. You have learned that the voice saying "quit" is the voice you must disobey. You are the master of yourself — and that is the only mastery that matters.', challenge: 'Write your personal code of discipline. Three rules you will never break. Live by them.' },
];

// ═══════════ ADVENTURE COMMENTARY ═══════════

const ADVENTURE_ADVICE = {
  combat: [
    'True strength is choosing HOW to fight, not merely choosing TO fight. Consider every path.',
    'The warrior who knows their strengths avoids foolish gambles. Play to what you have built.',
    'Every battle tests a different blade. Choose the one you have sharpened most.',
  ],
  puzzle: [
    'The mind is the mightiest weapon in any arsenal. But even a sharp mind must know its limits.',
    'Not every lock yields to force. Some yield to patience. Some to cleverness. Some to sheer will.',
    'Intelligence without humility is a lantern without oil. Choose wisely.',
  ],
  social: [
    'Words can open doors that swords cannot. But only if the speaker has earned the skill to wield them.',
    'Charm, strength, endurance — each has its place in the dance of persuasion. Know your strongest suit.',
    'The greatest negotiators understand one truth: every person has a price, and it is rarely gold.',
  ],
  endurance: [
    'The body breaks before the spirit — unless the spirit breaks first. Steel your mind before testing your body.',
    'Endurance is not about speed. It is about outlasting. Choose the path your constitution can sustain.',
    'Nature does not care about your plans. It tests what you are, not what you wish to be.',
  ],
  mental: [
    'The mind is both your greatest weapon and your greatest vulnerability. Choose your approach with care.',
    'Not all darkness is defeated with light. Some must be endured. Some must be outsmarted. Some must be shattered.',
    'The shadows within are the hardest opponents. They know your every weakness. But you know theirs.',
  ],
};

const SUCCESS_COMMENTARY = [
  'Your preparation speaks through your actions. This victory was earned long before today.',
  'Well chosen. The path of strength is walked by those who know themselves.',
  'Another proof for your sacred ledger. Remember this moment when doubt arrives.',
  'The Master nods with approval. Growth is not just visible — it is undeniable.',
  'This is what happens when daily discipline meets opportunity. Excellence.',
  'Victory flows naturally to those who have paid the price in training. You have paid.',
  'Your stat speaks for itself. Continue building, and no challenge will stand.',
  'The ancient texts speak of warriors like you — those who prepare so thoroughly that success becomes inevitable.',
  'Well done. But do not celebrate long. The next challenge awaits, and the Master expects more.',
  'This is not luck. This is the compound return on every habit completed, every day honored.',
];

const FAILURE_COMMENTARY = [
  'The forge of mastery requires heat. This failure is not your enemy — it is your teacher.',
  'Every master has failed more times than the beginner has tried. This is simply another lesson.',
  'Your stat revealed a gap today. Good. Now you know exactly where to grow.',
  'The Mamba lost games too. What made the Mamba different was what happened the morning after.',
  'Do not mourn this loss. Catalog it. Learn from it. Return stronger. This is the way.',
  'The recovery challenge awaits. Failure transformed into training is the highest alchemy.',
  'This gap between your ability and the challenge IS your growth zone. Lean into it.',
  'The path you chose tested something you have not yet built. Now build it.',
  'Good. You found a weakness. Weakness identified is weakness halfway conquered.',
  'The Master does not judge failure. The Master judges those who fail and do not rise.',
];

const PENALTY_ENCOURAGEMENT = {
  STR: [
    'These reps are not punishment. They are offerings to your future strength. Give them everything.',
    'The body you want lives on the other side of this discomfort. Push through.',
    'Every squat, every push-up — these are bricks in the fortress of your physical power.',
  ],
  INT: [
    'Knowledge gained in the aftermath of failure sticks deeper than any casual lesson. Learn well.',
    'These minutes of reading are medicine for the mind. Take the full dose.',
    'The sage studies hardest after defeat. This is when the mind is most receptive.',
  ],
  CRE: [
    'Create not for perfection but for practice. Every mark on the page rewires your creative pathways.',
    'The muse visits those who work through failure, not those who wait for inspiration.',
    'Five minutes of creation after defeat is worth an hour of creation in comfort.',
  ],
  VIT: [
    'The body heals itself when given the right conditions. Stretching, breathing, hydrating — this is active recovery.',
    'Treat this challenge as medicine. Your body needs this investment right now.',
    'Vitality is built in small moments like this one. Every stretch, every breath counts.',
  ],
  WIL: [
    'Discipline is forged in the moments you least want to practice it. This is that moment. Own it.',
    'The meditation or journaling you do now, in this difficult moment, builds more willpower than a week of easy practice.',
    'This is where the Mamba Mentality lives — not in victory, but in what you do immediately after defeat.',
  ],
};

// ═══════════ HELPER FUNCTIONS ═══════════

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateHash(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getWeakestStat() {
  const entries = Object.entries(state.stats);
  entries.sort((a, b) => {
    if (a[1].level !== b[1].level) return a[1].level - b[1].level;
    return a[1].xp - b[1].xp;
  });
  return entries[0][0];
}

// ═══════════ DAILY WISDOM ═══════════

export function getDailyWisdom() {
  const d = today();
  const m = state.master;

  // Return cached if same day
  if (m.lastDate === d && m.currentQuote) {
    return DAILY_WISDOM.find(q => q.id === m.currentQuote) || DAILY_WISDOM[0];
  }

  // New day — pick a new quote
  const weakest = getWeakestStat();
  const pool = DAILY_WISDOM.filter(q => q.stat === weakest && !m.seenQuotes.includes(q.id));

  // Reset if all seen for this stat
  if (pool.length === 0) {
    m.seenQuotes = m.seenQuotes.filter(id => {
      const q = DAILY_WISDOM.find(w => w.id === id);
      return q && q.stat !== weakest;
    });
    return getDailyWisdom(); // recurse with reset pool
  }

  // Deterministic pick based on date
  const idx = dateHash(d) % pool.length;
  const quote = pool[idx];

  m.currentQuote = quote.id;
  m.lastDate = d;
  m.seenQuotes.push(quote.id);
  persist();

  return quote;
}

export function renderMasterWisdom() {
  const el = document.getElementById('master-wisdom');
  if (!el) return;

  const quote = getDailyWisdom();
  el.innerHTML = `
    <div class="wisdom-icon">&#128220;</div>
    <p class="wisdom-text">${quote.text}</p>
    <span class="wisdom-stat" style="color:${STAT_COLORS[quote.stat]}">${quote.stat}</span>
  `;
}

// ═══════════ ADVENTURE INTEGRATION ═══════════

export function getMasterAdvice(sceneType) {
  const pool = ADVENTURE_ADVICE[sceneType] || ADVENTURE_ADVICE.combat;
  return pickRandom(pool);
}

export function getMasterSuccessLine() {
  return pickRandom(SUCCESS_COMMENTARY);
}

export function getMasterFailureLine() {
  return pickRandom(FAILURE_COMMENTARY);
}

export function getMasterPenaltyLine(stat) {
  const pool = PENALTY_ENCOURAGEMENT[stat] || PENALTY_ENCOURAGEMENT.WIL;
  return pickRandom(pool);
}

// ═══════════ TEACHING SYSTEM ═══════════

const MILESTONE_LEVELS = [3, 5, 7, 10, 15, 25];

export function checkTeachingUnlock(stat, level) {
  if (!MILESTONE_LEVELS.includes(level)) return null;

  const teachingId = `${stat}_${level}`;
  const m = state.master;

  if (m.unlockedTeachings.includes(teachingId)) return null;

  const teaching = TEACHINGS.find(t => t.id === teachingId);
  if (!teaching) return null;

  m.unlockedTeachings.push(teachingId);
  persist();

  // Show teaching modal after level-up overlay clears
  setTimeout(() => showTeachingModal(teaching), 2500);
  return teaching;
}

function showTeachingModal(teaching) {
  let modal = document.getElementById('teaching-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="teaching-content">
      <div class="teaching-header">
        <span class="teaching-icon">&#128220;</span>
        <span class="teaching-badge" style="color:${STAT_COLORS[teaching.stat]}">${teaching.stat} Level ${teaching.level}</span>
      </div>
      <h3 class="teaching-title">${teaching.title}</h3>
      <p class="teaching-text">${teaching.text}</p>
      <div class="teaching-challenge">
        <span class="challenge-label">Master's Challenge:</span>
        <p class="challenge-text">${teaching.challenge}</p>
      </div>
      <button class="adv-action-btn" id="teaching-close">I Understand</button>
    </div>
  `;
  modal.classList.remove('hidden');
  document.getElementById('teaching-close').onclick = () => modal.classList.add('hidden');
}

// ═══════════ CODEX ═══════════

export function getUnlockedTeachings() {
  return state.master.unlockedTeachings.map(id => TEACHINGS.find(t => t.id === id)).filter(Boolean);
}

export function showCodex() {
  const modal = document.getElementById('teaching-modal');
  if (!modal) return;

  const teachings = getUnlockedTeachings();

  if (teachings.length === 0) {
    modal.innerHTML = `
      <div class="teaching-content">
        <h3 class="teaching-title">The Master's Codex</h3>
        <p class="teaching-text">No teachings unlocked yet. Reach stat milestones (Level 3, 5, 7, 10, 15, 25) to unlock wisdom.</p>
        <button class="adv-action-btn" id="teaching-close">Close</button>
      </div>
    `;
  } else {
    let list = teachings.map(t => `
      <div class="codex-entry">
        <div class="codex-entry-header">
          <span class="teaching-badge" style="color:${STAT_COLORS[t.stat]}">${t.stat} ${t.level}</span>
          <span class="codex-entry-title">${t.title}</span>
        </div>
        <p class="codex-entry-text">${t.text}</p>
        <p class="codex-entry-challenge">Challenge: ${t.challenge}</p>
      </div>
    `).join('');

    modal.innerHTML = `
      <div class="teaching-content codex-view">
        <h3 class="teaching-title">The Master's Codex</h3>
        <p class="codex-subtitle">${teachings.length} / ${TEACHINGS.length} teachings unlocked</p>
        <div class="codex-list">${list}</div>
        <button class="adv-action-btn" id="teaching-close">Close</button>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  document.getElementById('teaching-close').onclick = () => modal.classList.add('hidden');
}

// ═══════════ INIT ═══════════

export function initMaster() {
  const codexBtn = document.getElementById('codex-btn');
  if (codexBtn) codexBtn.addEventListener('click', showCodex);
}
