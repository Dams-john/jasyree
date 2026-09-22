import { useState, useEffect } from 'react';
import { Tag as TagIcon, Search } from 'lucide-react';
import { adminApi, Tag } from '../../lib/resources';

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listTags()
      .then(data => { if (data) setTags(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tags.filter(t =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.slug.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tags Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tags.length} tags registered</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-full sm:w-60"
          />
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <span className="w-8 h-8 border-2 border-[#e91e8c]/30 border-t-[#e91e8c] rounded-full animate-spin inline-block" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(tag => (
            <div key={tag.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#e91e8c]/10 text-[#e91e8c] flex items-center justify-center shrink-0">
                  <TagIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">#{tag.name}</p>
                  <p className="text-xs text-gray-400 truncate">{tag.slug}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 shrink-0">
                {tag.count} {tag.count === 1 ? 'novel' : 'novels'}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full card p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No tags found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

