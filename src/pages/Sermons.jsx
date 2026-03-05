import { useEffect, useState } from 'react';
import { getSermons, getSermonsByCategory } from '../services/sermonsService';
import { useLanguage } from '../contexts/LanguageContext';
import SermonCard from '../components/ui/SermonCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CATEGORIES = ['All', 'Sunday Message', 'Bible Study', 'Special Series', 'Guest Speaker'];

export default function Sermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { language, t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    const fetch = activeCategory === 'All'
      ? getSermons(50)
      : getSermonsByCategory(activeCategory);
    fetch.then(setSermons).finally(() => setLoading(false));
  }, [activeCategory]);

  const filtered = sermons.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.speaker?.toLowerCase().includes(search.toLowerCase()) ||
    s.scripture?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-sermons">
      <section className="page-hero">
        <h1>{t('nav.sermons')}</h1>
        <p>{language === 'am' ? 'የሚያበረታቱ መልዕክቶችን ይመልከቱ።' : 'Dive into messages that challenge, encourage, and transform.'}</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="sermon-filters">
            <input
              type="search"
              placeholder={language === 'am' ? 'ስብከቶችን ፈልግ...' : 'Search sermons, speakers, scripture...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sermon-search"
            />
            <div className="category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && <LoadingSpinner center size="lg" />}
          {!loading && filtered.length === 0 && <p className="empty-state">{language === 'am' ? 'ምንም ስብከት አልተገኘም።' : 'No sermons found. Try a different search or category.'}</p>}
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
