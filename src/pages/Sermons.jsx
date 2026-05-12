import { useEffect, useMemo, useState } from 'react';
import { Search, Frown } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import SermonCard from '@/components/common/SermonCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getSermons, getSermonsByCategory } from '@/services/sermonsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { SERMON_CATEGORIES, DEFAULT_CATEGORY_ID } from '@/constants/sermonCategories';

export default function Sermons() {
  const { t } = useLanguage();
  const [category, setCategory] = useState(DEFAULT_CATEGORY_ID);
  const [query, setQuery] = useState('');
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const promise =
      category === DEFAULT_CATEGORY_ID ? getSermons() : getSermonsByCategory(category);
    promise
      .then((data) => active && setSermons(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [category]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sermons;
    return sermons.filter((s) => {
      return [s.title, s.titleAm, s.speaker, s.scripture, s.description, s.descriptionAm]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [sermons, query]);

  return (
    <>
      <PageHero
        eyebrow={t('common.churchName')}
        title={t('sermons.heroTitle')}
        subtitle={t('sermons.heroSubtitle')}
      />

      <Section>
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('sermons.searchPlaceholder')}
              className="pl-10"
              aria-label={t('sermons.searchPlaceholder')}
            />
          </div>

          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="flex h-auto flex-wrap">
              {SERMON_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {t(cat.labelKey)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Frown} title={t('sermons.noSermons')} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
