import { useEffect, useState, useMemo } from 'react';
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

type SortField = 'date' | 'politicalLeaning' | 'emotionalIntensity' | 'headline';
type SortDir = 'asc' | 'desc';
type LeaningFilter = 'all' | 'left' | 'center' | 'right';

export default function ExplorerPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [publisher, setPublisher] = useState('all');
  const [leaning, setLeaning] = useState<LeaningFilter>('all');
  const [minIntensity, setMinIntensity] = useState(0);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getArticles().then(setArticles);
  }, []);

  const publishers = useMemo(() => {
    const set = new Set(articles.map(a => a.publisher));
    return ['all', ...Array.from(set)];
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles.filter(a => {
      const matchesSearch =
        a.headline.toLowerCase().includes(search.toLowerCase()) ||
        a.publisher.toLowerCase().includes(search.toLowerCase());
      const matchesPublisher = publisher === 'all' || a.publisher === publisher;
      const matchesLeaning =
        leaning === 'all' ||
        (leaning === 'left' && a.politicalLeaning < -0.2) ||
        (leaning === 'center' && a.politicalLeaning >= -0.2 && a.politicalLeaning <= 0.2) ||
        (leaning === 'right' && a.politicalLeaning > 0.2);
      const matchesIntensity = a.emotionalIntensity >= minIntensity;
      return matchesSearch && matchesPublisher && matchesLeaning && matchesIntensity;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date':
          cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'politicalLeaning':
          cmp = a.politicalLeaning - b.politicalLeaning;
          break;
        case 'emotionalIntensity':
          cmp = a.emotionalIntensity - b.emotionalIntensity;
          break;
        case 'headline':
          cmp = a.headline.localeCompare(b.headline);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [articles, search, publisher, leaning, minIntensity, sortField, sortDir]);

  const hasActiveFilters = publisher !== 'all' || leaning !== 'all' || minIntensity > 0;

  const clearFilters = () => {
    setPublisher('all');
    setLeaning('all');
    setMinIntensity(0);
    setSearch('');
  };

  const selectClass = "rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer";

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Article Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and analyze articles for media bias</p>
      </div>

      {/* Search + Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-foreground hover:bg-accent'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary-foreground text-primary h-5 w-5 flex items-center justify-center text-[10px] font-bold">
              {(publisher !== 'all' ? 1 : 0) + (leaning !== 'all' ? 1 : 0) + (minIntensity > 0 ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-card-foreground">Filters & Sorting</h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Publisher */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Publisher</label>
              <select value={publisher} onChange={e => setPublisher(e.target.value)} className={selectClass + " w-full"}>
                {publishers.map(p => (
                  <option key={p} value={p}>{p === 'all' ? 'All Publishers' : p}</option>
                ))}
              </select>
            </div>

            {/* Political Leaning */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Political Leaning</label>
              <select value={leaning} onChange={e => setLeaning(e.target.value as LeaningFilter)} className={selectClass + " w-full"}>
                <option value="all">All Leanings</option>
                <option value="left">Left-leaning</option>
                <option value="center">Center</option>
                <option value="right">Right-leaning</option>
              </select>
            </div>

            {/* Min Intensity */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Min Intensity: {Math.round(minIntensity * 100)}%
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={minIntensity}
                onChange={e => setMinIntensity(parseFloat(e.target.value))}
                className="w-full accent-primary h-1.5 mt-2"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort By</label>
              <div className="flex gap-2">
                <select value={sortField} onChange={e => setSortField(e.target.value as SortField)} className={selectClass + " flex-1 min-w-0"}>
                  <option value="date">Date</option>
                  <option value="politicalLeaning">Political Leaning</option>
                  <option value="emotionalIntensity">Intensity</option>
                  <option value="headline">Headline</option>
                </select>
                <button
                  onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  className="rounded-lg border bg-card px-3 py-2 hover:bg-accent transition-colors"
                  title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
        {hasActiveFilters && ' (filtered)'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No articles match your filters.</p>
      )}
    </div>
  );
}
