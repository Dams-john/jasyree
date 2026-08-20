export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  coins: number;
  subscription: 'free' | 'silver' | 'gold' | 'diamond';
  joinedAt: string;
  booksRead: number;
  following: number;
  followers: number;
  totalReadTime: number;
}

export interface Notification {
  id: number;
  type: 'chapter' | 'reward' | 'system' | 'promo' | 'comment';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  novelId?: number;
  avatar?: string;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  novelId: number;
  chapterId?: number;
  content: string;
  likes: number;
  time: string;
  replies: CommentReply[];
}

export interface CommentReply {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  time: string;
}

export const CURRENT_USER: User = {
  id: 1,
  name: 'Lyria Blackwood',
  email: 'lyria@example.com',
  avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  coins: 2450,
  subscription: 'gold',
  joinedAt: '2023-08-15',
  booksRead: 47,
  following: 23,
  followers: 156,
  totalReadTime: 12480,
};

export const NOTIFICATIONS: Notification[] = [
  { id: 1, type: 'chapter', title: 'New Chapter Available', message: 'Chapter 13 of "Use Me, Alpha Kaine" is now available!', time: '2 min ago', isRead: false, novelId: 1 },
  { id: 2, type: 'reward', title: 'Daily Reward Earned', message: 'You earned 20 coins for your 3-day streak!', time: '1 hour ago', isRead: false },
  { id: 3, type: 'comment', title: 'MoonLover22 replied', message: 'MoonLover22 replied to your comment on Chapter 12', time: '3 hours ago', isRead: true, novelId: 1 },
  { id: 4, type: 'promo', title: 'Weekend Sale!', message: 'Get 50% bonus coins on all purchases this weekend!', time: '5 hours ago', isRead: true },
  { id: 5, type: 'chapter', title: 'New Chapter Available', message: 'Chapter 25 of "The Alpha\'s Rejected Mate" is now available!', time: '1 day ago', isRead: true, novelId: 4 },
  { id: 6, type: 'system', title: 'Account Security', message: 'Your password was changed successfully.', time: '2 days ago', isRead: true },
  { id: 7, type: 'reward', title: 'Reading Achievement', message: 'Congratulations! You\'ve read 500,000 words total!', time: '3 days ago', isRead: true },
  { id: 8, type: 'chapter', title: 'New Chapter Available', message: 'Chapter 19 of "Crown of Thorns" is now available!', time: '3 days ago', isRead: true, novelId: 11 },
];

export const COMMENTS: Comment[] = [
  {
    id: 1, userId: 2, userName: 'MoonLover22', userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
    novelId: 1, chapterId: 12, content: 'Kaine is everything!! This tension is insane 🔥🔥🔥', likes: 124, time: '2 hours ago',
    replies: [
      { id: 1, userId: 3, userName: 'LunaDreams', userAvatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=100', content: 'I need more chapters ASAP', likes: 56, time: '1 hour ago' },
    ],
  },
  {
    id: 2, userId: 4, userName: 'WolfHeartReader', userAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100',
    novelId: 1, content: 'The author really knows how to write tension. I\'m obsessed with this story!', likes: 89, time: '5 hours ago',
    replies: [],
  },
  {
    id: 3, userId: 5, userName: 'BookDragon99', userAvatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    novelId: 1, content: 'Chapter 12 absolutely wrecked me emotionally. 10/10 cannot stop reading.', likes: 201, time: '1 day ago',
    replies: [
      { id: 2, userId: 2, userName: 'MoonLover22', userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', content: 'Same!! The writing is just *chef\'s kiss*', likes: 34, time: '20 hours ago' },
    ],
  },
  {
    id: 4, userId: 6, userName: 'NightOwlNovels', userAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
    novelId: 1, content: 'Temijasire is one of the best authors on this platform. Every chapter is perfection.', likes: 167, time: '2 days ago',
    replies: [],
  },
];

export const ADMIN_USERS = [
  { id: 1, name: 'LunaQueen', email: 'luna@example.com', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100', subscription: 'gold', coins: 1200, joinedAt: 'May 10, 2024', status: 'active' },
  { id: 2, name: 'WolfHeart', email: 'wolf@example.com', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100', subscription: 'diamond', coins: 5400, joinedAt: 'May 10, 2024', status: 'active' },
  { id: 3, name: 'MoonLover22', email: 'moon@example.com', avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100', subscription: 'free', coins: 80, joinedAt: 'May 9, 2024', status: 'active' },
  { id: 4, name: 'BookDragon99', email: 'book@example.com', avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100', subscription: 'silver', coins: 320, joinedAt: 'May 8, 2024', status: 'suspended' },
  { id: 5, name: 'StarlightReader', email: 'star@example.com', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100', subscription: 'gold', coins: 890, joinedAt: 'May 7, 2024', status: 'active' },
];
