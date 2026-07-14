export interface Chapter {
  id: number;
  novelId: number;
  number: number;
  title: string;
  publishedAt: string;
  wordCount: number;
  isPremium: boolean;
  isRead: boolean;
  coinCost: number;
}

export interface Novel {
  id: number;
  title: string;
  penName: string;
  cover: string;
  synopsis: string;
  genres: string[];
  tags: string[];
  status: 'Ongoing' | 'Completed' | 'Hiatus';
  rating: number;
  reviews: number;
  views: string;
  chapters: number;
  language: string;
  updatedAt: string;
  progress?: number;
  currentChapter?: number;
  isBookmarked?: boolean;
  isFavorite?: boolean;
  isPremium?: boolean;
}

export const NOVELS: Novel[] = [
  {
    id: 1,
    title: 'Use Me, Alpha Kaine',
    penName: 'Temijasire',
    cover: 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'The daughter of a rogue. The one no one wanted. Dealt and discarded. He was never meant to love her. He was never supposed to feel this. In a world ruled by power, fate, and vicious bloodlines, their forbidden bond could set them free—or destroy everything.',
    genres: ['Werewolf', 'Romance', 'Billionaire', 'Drama'],
    tags: ['Alpha', 'Forbidden Love', 'Pack Drama', 'Strong FL'],
    status: 'Ongoing',
    rating: 4.8,
    reviews: 12400,
    views: '124.5K',
    chapters: 48,
    language: 'en',
    updatedAt: '2024-05-12',
    progress: 72,
    currentChapter: 12,
    isBookmarked: true,
    isFavorite: false,
    isPremium: false,
  },
  {
    id: 2,
    title: 'Bound to the Ruthless Alpha',
    penName: 'Jaden Blake',
    cover: 'https://images.pexels.com/photos/3932839/pexels-photo-3932839.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'She never wanted a mate. He never expected to find one. When fate binds two broken souls together, their walls must crumble before love can bloom.',
    genres: ['Werewolf', 'Romance', 'Fantasy'],
    tags: ['Mate Bond', 'Alpha', 'Pack Life'],
    status: 'Ongoing',
    rating: 4.6,
    reviews: 8900,
    views: '98.2K',
    chapters: 32,
    language: 'en',
    updatedAt: '2024-05-10',
    progress: 60,
    currentChapter: 18,
    isBookmarked: false,
    isFavorite: true,
  },
  {
    id: 3,
    title: 'His Dark Luna',
    penName: 'Dire Night',
    cover: 'https://images.pexels.com/photos/2773977/pexels-photo-2773977.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'In the shadows of the moon, a luna rises. But she carries a darkness no one expected—and a secret that could shatter the entire pack.',
    genres: ['Werewolf', 'Mystery', 'Romance'],
    tags: ['Dark Theme', 'Luna', 'Secrets'],
    status: 'Ongoing',
    rating: 4.5,
    reviews: 6200,
    views: '72.1K',
    chapters: 18,
    language: 'en',
    updatedAt: '2024-05-08',
    progress: 41,
    currentChapter: 16,
    isPremium: true,
  },
  {
    id: 4,
    title: "The Alpha's Rejected Mate",
    penName: 'One Night',
    cover: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'Rejected. Humiliated. Left for dead. But the moon goddess has other plans for her, and the alpha who once rejected her will regret every word.',
    genres: ['Werewolf', 'Romance', 'Drama'],
    tags: ['Rejection', 'Second Chance', 'Strong FL', 'Revenge'],
    status: 'Ongoing',
    rating: 4.7,
    reviews: 11200,
    views: '105.8K',
    chapters: 27,
    language: 'en',
    updatedAt: '2024-05-06',
    progress: 28,
    currentChapter: 24,
    isFavorite: true,
  },
  {
    id: 5,
    title: 'Stolen by the Alpha King',
    penName: 'J. Belle',
    cover: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'She was never meant to be taken. But the King had made his choice, and in his world, kings always get what they want.',
    genres: ['Fantasy', 'Romance', 'Dark'],
    tags: ['King', 'Kidnapping', 'Dark Romance', 'Obsession'],
    status: 'Completed',
    rating: 4.9,
    reviews: 22100,
    views: '512K',
    chapters: 66,
    language: 'en',
    updatedAt: '2024-03-15',
    progress: 100,
    isPremium: true,
  },
  {
    id: 6,
    title: "Alpha Kaine's Obsession",
    penName: 'Luna Everhart',
    cover: 'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'When obsession meets love, boundaries blur and hearts break. Can she survive being the center of an alpha\'s relentless desire?',
    genres: ['Werewolf', 'Romance', 'Thriller'],
    tags: ['Obsession', 'Alpha', 'Possessive ML'],
    status: 'Ongoing',
    rating: 4.4,
    reviews: 5600,
    views: '63.4K',
    chapters: 22,
    language: 'en',
    updatedAt: '2024-05-11',
  },
  {
    id: 7,
    title: 'Captive of Alpha Kaine',
    penName: 'M. Isabella',
    cover: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'Captivity was never supposed to feel like home. But as days passed in his manor, she began to wonder who was truly the prisoner.',
    genres: ['Werewolf', 'Dark Romance', 'Suspense'],
    tags: ['Captive', 'Dark ML', 'Romance'],
    status: 'Ongoing',
    rating: 4.3,
    reviews: 4100,
    views: '48.7K',
    chapters: 15,
    language: 'en',
    updatedAt: '2024-05-09',
  },
  {
    id: 8,
    title: 'Alpha Kaine: Claimed',
    penName: 'Nyx Vega',
    cover: 'https://images.pexels.com/photos/2529159/pexels-photo-2529159.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'Being claimed by the most powerful alpha in the northern territory was never in her plans. But fate has a funny way of rewriting destinies.',
    genres: ['Werewolf', 'Romance'],
    tags: ['Claimed', 'Alpha', 'Fated Mates'],
    status: 'Ongoing',
    rating: 4.5,
    reviews: 7300,
    views: '81.2K',
    chapters: 29,
    language: 'en',
    updatedAt: '2024-05-07',
  },
  {
    id: 9,
    title: 'The Billionaire\'s Secret Wife',
    penName: 'Rose Ashford',
    cover: 'https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'A contract marriage. A cold billionaire. And feelings neither of them agreed to have.',
    genres: ['Romance', 'Billionaire', 'Contemporary'],
    tags: ['Contract Marriage', 'Billionaire', 'Office Romance'],
    status: 'Completed',
    rating: 4.6,
    reviews: 18900,
    views: '340K',
    chapters: 55,
    language: 'en',
    updatedAt: '2024-01-20',
    progress: 100,
  },
  {
    id: 10,
    title: 'Midnight Heir',
    penName: 'Shadow Quill',
    cover: 'https://images.pexels.com/photos/3617457/pexels-photo-3617457.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'The heir to the vampire throne never wanted the crown. But when a human girl discovers his secret, his world changes forever.',
    genres: ['Vampire', 'Fantasy', 'Romance'],
    tags: ['Vampire', 'Heir', 'Secret Identity'],
    status: 'Ongoing',
    rating: 4.7,
    reviews: 9800,
    views: '128.5K',
    chapters: 38,
    language: 'en',
    updatedAt: '2024-05-11',
  },
  {
    id: 11,
    title: 'Crown of Thorns',
    penName: 'Ivy Cross',
    cover: 'https://images.pexels.com/photos/2418664/pexels-photo-2418664.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'In a kingdom of roses and lies, only the sharpest thorns survive. She was born to be a pawn—until she decided to become a queen.',
    genres: ['Fantasy', 'Romance', 'Political Drama'],
    tags: ['Kingdom', 'Political Intrigue', 'Strong FL', 'Court'],
    status: 'Ongoing',
    rating: 4.8,
    reviews: 14600,
    views: '201K',
    chapters: 44,
    language: 'en',
    updatedAt: '2024-05-12',
    isPremium: true,
  },
  {
    id: 12,
    title: 'The Dragon King\'s Mate',
    penName: 'Ember Vale',
    cover: 'https://images.pexels.com/photos/3617501/pexels-photo-3617501.jpeg?auto=compress&cs=tinysrgb&w=400',
    synopsis: 'Dragons do not choose mates. They claim them. And the most ancient dragon of all has claimed her.',
    genres: ['Fantasy', 'Dragon', 'Romance'],
    tags: ['Dragon Shifter', 'Fated Mates', 'Fantasy Creatures'],
    status: 'Ongoing',
    rating: 4.6,
    reviews: 10200,
    views: '155K',
    chapters: 36,
    language: 'en',
    updatedAt: '2024-05-10',
  },
];

export const CHAPTERS: Chapter[] = [
  { id: 1, novelId: 1, number: 1, title: 'The Beginning', publishedAt: '2024-01-15', wordCount: 2100, isPremium: false, isRead: true, coinCost: 0 },
  { id: 2, novelId: 1, number: 2, title: 'First Encounter', publishedAt: '2024-01-18', wordCount: 2300, isPremium: false, isRead: true, coinCost: 0 },
  { id: 3, novelId: 1, number: 3, title: 'The Pack', publishedAt: '2024-01-22', wordCount: 1900, isPremium: false, isRead: true, coinCost: 0 },
  { id: 4, novelId: 1, number: 4, title: 'Shadows and Lies', publishedAt: '2024-02-01', wordCount: 2500, isPremium: false, isRead: true, coinCost: 0 },
  { id: 5, novelId: 1, number: 5, title: 'The Alpha\'s Challenge', publishedAt: '2024-02-08', wordCount: 2200, isPremium: false, isRead: true, coinCost: 0 },
  { id: 6, novelId: 1, number: 6, title: 'Hidden Truth', publishedAt: '2024-02-15', wordCount: 2400, isPremium: false, isRead: true, coinCost: 0 },
  { id: 7, novelId: 1, number: 7, title: 'Dangerous Games', publishedAt: '2024-02-22', wordCount: 2100, isPremium: false, isRead: true, coinCost: 0 },
  { id: 8, novelId: 1, number: 8, title: 'Shattered Trust', publishedAt: '2024-03-01', wordCount: 2600, isPremium: true, isRead: false, coinCost: 2 },
  { id: 9, novelId: 1, number: 9, title: 'Secrets on Fire', publishedAt: '2024-03-08', wordCount: 2300, isPremium: true, isRead: false, coinCost: 2 },
  { id: 10, novelId: 1, number: 10, title: 'Secrets on Fire', publishedAt: '2024-03-15', wordCount: 2800, isPremium: true, isRead: false, coinCost: 2 },
  { id: 11, novelId: 1, number: 11, title: 'Bound by Pain', publishedAt: '2024-04-10', wordCount: 2200, isPremium: true, isRead: false, coinCost: 2 },
  { id: 12, novelId: 1, number: 12, title: 'Dangerous Truths', publishedAt: '2024-05-12', wordCount: 3100, isPremium: true, isRead: false, coinCost: 2 },
];

export const CHAPTER_CONTENT = `Kaine's eyes never left hers.

They were storm and fire, danger and desire, all wrapped in one.

"You shouldn't be here, Lyria."

She swallowed. "Maybe."

"This is my territory."

"I know." She took a step closer.

"Then why did you come?"

"Because I wanted to see the man everyone is afraid of."

A slow smirk tugged at his lips.

"And? Are you afraid now?"

"No."

"Good."

The air between them thickened. Dangerous. Addictive. Raw.

She had spent years running from wolves like him. Men who took what they wanted and discarded what they didn't. Men who wore power like a second skin and wielded it without remorse.

But Kaine wasn't like them.

He was worse.

He was the reason girls like her disappeared. The reason mothers warned their daughters. The reason the entire northern territory bowed its head when his name was spoken.

And she had walked straight into his den.

"You're not afraid," he said, his voice low and dangerous. "Why?"

She lifted her chin. Because fear never saved anyone. Because she had learned that truth the hard way, in the cold ruins of her mother's pack, at seventeen years old with nothing but the clothes on her back.

"Because you haven't given me a reason to be."

He moved. One step, then two, and suddenly she could feel the heat radiating off his skin, could smell the pine and rain and something wilder beneath it. His hand came up slowly, not to grab, not to threaten—just to rest one finger beneath her chin, tilting it up.

Their eyes locked.

"Give it time," he murmured. "I always do."

Her heart hammered. Her knees threatened to betray her.

But she didn't step back.

And in that moment, something shifted between them. Something unnamed and dangerous and impossibly real.

She was in trouble.

And somehow—terrifyingly—she didn't want to run.`;

export const TRENDING_NOVELS = NOVELS.slice(0, 8);
export const FEATURED_NOVELS = NOVELS.slice(0, 4);
export const NEW_RELEASES = NOVELS.slice(4, 10);
export const COMPLETED_NOVELS = NOVELS.filter(n => n.status === 'Completed');
export const CONTINUE_READING = NOVELS.filter(n => n.progress !== undefined && n.progress! < 100);
