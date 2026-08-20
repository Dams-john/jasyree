import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  viewAllTo?: string;
  viewAllLabel?: string;
}

export default function SectionHeader({ title, viewAllTo, viewAllLabel = 'View All' }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
      {viewAllTo && (
        <Link to={viewAllTo} className="flex items-center gap-0.5 text-sm font-medium text-[#e91e8c] hover:text-[#c41578] transition-colors">
          {viewAllLabel}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
