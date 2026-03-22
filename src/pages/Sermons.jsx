import { useEffect, useState } from 'react';
import { getSermons, getSermonsByCategory } from '../services/sermonsService';
import { useLanguage } from '../contexts/LanguageContext';
import SermonCard from '../components/ui/SermonCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES_EN = ['All', 'Sunday Message', 'Bible Study', 'Special Series', 'Guest Speaker'];
const CATEGORIES_AM = ['ሁሉም', 'የእሁድ ስብከት', 'የመጽሐፍ ቅዱስ ጥናት', 'ልዩ ተከታታይ', 'የእንግዳ ተናጋሪ'];

export default function Sermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { t, language } = useLanguage();
  const am = language === 'am';

  useEffect(() => {
    setLoading(true);
    const fetch = activeCategory === 'All'
      ? getSermons(50)
      : getSermonsByCategory(activeCategory);
    fetch.then(setSermons).finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = sermons.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      (s.titleAm && s.titleAm.toLowerCase().includes(q)) ||
      s.speaker?.toLowerCase().includes(q) ||
      s.scripture?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-sermons">
      <section className="page-hero">
        <h1>{t('sermons.heroTitle')}</h1>
        <p>{t('sermons.heroSubtitle')}</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="sermon-filters">
            <input
              type="search"
              placeholder={t('sermons.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sermon-search"
            />
            <div className="category-tabs">
              {CATEGORIES_EN.map((cat, idx) => (
                <button
                  key={cat}
                  className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {am ? CATEGORIES_AM[idx] : cat}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingSpinner center size="lg" />}
          {!loading && filtered.length === 0 && (
            <p className="empty-state">{t('sermons.noSermons')}</p>
          )}
          {!loading && filtered.length > 0 && (
            <div className="sermons-grid">
              {filtered.map((s) => <SermonCard key={s.id} sermon={s} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
