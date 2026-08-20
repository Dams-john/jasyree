import { Link } from 'react-router-dom';
import { Star, Lock } from 'lucide-react';
import { Novel } from '../../data/novels';

interface NovelCardProps {
  novel: Novel;
  variant?: 'default' | 'horizontal' | 'continue';
  showProgress?: boolean;
}

export default function NovelCard({ novel, variant = 'default', showProgress = false }: NovelCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link to={`/novel/${novel.id}`} className="flex gap-3 group">
        <div className="relative shrink-0">
          <img src={novel.cover} alt={novel.title} className="w-14 h-20 object-cover rounded-lg" />
          {novel.isPremium && (
            <span className="absolute top-1 right-1 bg-[#e91e8c] rounded text-white" style={{ padding: '1px 3px', fontSize: '8px' }}>VIP</span>
          )}
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#e91e8c] transition-colors line-clamp-2 leading-snug">{novel.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{novel.penName}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{novel.rating}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">({(novel.reviews / 1000).toFixed(1)}K)</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'continue') {
    return (
      <Link to={`/read/${novel.id}/${novel.currentChapter || 1}`} className="flex flex-col group min-w-[120px]">
        <div className="relative overflow-hidden rounded-xl">
          <img src={novel.cover} alt={novel.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="text-white text-xs font-medium line-clamp-2 text-shadow leading-snug">{novel.title}</p>
            <p className="text-white/70 text-[10px] mt-0.5">Ch. {novel.currentChapter}</p>
          </div>
          {novel.progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div className="h-full bg-[#e91e8c] rounded-full" style={{ width: `${novel.progress}%` }} />
            </div>
          )}
        </div>
        {novel.progress !== undefined && (
          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 font-medium">{novel.progress}%</span>
        )}
      </Link>
    );
  }

  return (
    <Link to={`/novel/${novel.id}`} className="flex flex-col group">
      <div className="relative overflow-hidden rounded-xl aspect-[2/3]">
        <img src={novel.cover} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {novel.isPremium && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#e91e8c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            <Lock className="w-2.5 h-2.5" />
            VIP
          </div>
        )}
        {novel.status === 'Completed' && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            END
          </div>
        )}
        {showProgress && novel.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div className="h-full bg-[#e91e8c]" style={{ width: `${novel.progress}%` }} />
          </div>
        )}
      </div>
      <div className="mt-2 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#e91e8c] transition-colors line-clamp-2 leading-snug">{novel.title}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{novel.penName}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{novel.rating}</span>
        </div>
      </div>
    </Link>
  );
}
