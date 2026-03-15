import { useEffect, useMemo, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getYouthPageContent, getYouthVideos } from '../services/youthVideosService';
import { useLanguage } from '../contexts/LanguageContext';

function getYoutubeEmbedUrl(url = '') {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';

  const shortMatch = trimmedUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  const watchMatch = trimmedUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const embedMatch = trimmedUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

  return '';
}

export default function YouthChildren() {
  const { language } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getYouthVideos(), getYouthPageContent()])
      .then(([videoItems, content]) => {
        setVideos(videoItems);
        setPageContent(content || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const contentCards = useMemo(() => [
    {
      title: language === 'am'
        ? (pageContent?.cardOneTitleAm || 'የህፃናት እሁድ ትምህርት')
        : (pageContent?.cardOneTitleEn || 'Children Sunday School'),
      description: language === 'am'
        ? (pageContent?.cardOneDescriptionAm || 'በእድሜ ተመጣጣኝ መንገድ የመጽሐፍ ቅዱስ ትምህርት፣ ዝማሬ እና ተግባራዊ እንቅስቃሴዎች።')
        : (pageContent?.cardOneDescriptionEn || 'Age-based Bible lessons, worship songs, and interactive activities.'),
    },
    {
      title: language === 'am'
        ? (pageContent?.cardTwoTitleAm || 'የወጣቶች ኅብረት')
        : (pageContent?.cardTwoTitleEn || 'Youth Fellowship'),
      description: language === 'am'
        ? (pageContent?.cardTwoDescriptionAm || 'ሳምንታዊ የወጣቶች ስብሰባ ለጸሎት፣ ውይይት እና የክርስቲያን ሕይወት ልምድ መጋራት።')
        : (pageContent?.cardTwoDescriptionEn || 'Weekly gathering for prayer, discussion, and practical Christian living.'),
    },
    {
      title: language === 'am'
        ? (pageContent?.cardThreeTitleAm || 'የቤተሰብ ስልጠና')
        : (pageContent?.cardThreeTitleEn || 'Family Discipleship'),
      description: language === 'am'
        ? (pageContent?.cardThreeDescriptionAm || 'ወላጆችን በቤት ውስጥ ልጆቻቸውን በእምነት ለማሳደግ የሚረዱ ሀብቶችና መመሪያዎች።')
        : (pageContent?.cardThreeDescriptionEn || 'Resources and guidance for parents to disciple children at home.'),
    },
  ], [language, pageContent]);

  return (
    <div className="page-youth-children">
      <section className="page-hero">
        <h1>
          {language === 'am'
            ? (pageContent?.heroTitleAm || 'የወጣቶች እና የህፃናት አገልግሎት')
            : (pageContent?.heroTitleEn || 'Youth & Children Ministry')}
        </h1>
        <p>
          {language === 'am'
            ? (pageContent?.heroSubtitleAm || 'ለህፃናት እና ለወጣቶች እምነትን የሚያበረታታ፣ ማህበረሰብን የሚገነባ እና መሪነትን የሚያዳብር ፕሮግራሞች።')
            : (pageContent?.heroSubtitleEn || 'Programs that build faith, community, and leadership for children and youth.')}
        </p>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            {language === 'am'
              ? (pageContent?.ministrySectionTitleAm || 'የአገልግሎት ክፍሎች')
              : (pageContent?.ministrySectionTitleEn || 'Ministry Areas')}
          </h2>
          <div className="youth-content-grid">
            {contentCards.map((card) => (
              <article className="youth-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">
            {language === 'am'
              ? (pageContent?.videosSectionTitleAm || 'የYouTube ቪዲዮዎች')
              : (pageContent?.videosSectionTitleEn || 'YouTube Videos')}
          </h2>

          {loading ? (
            <LoadingSpinner center />
          ) : videos.length === 0 ? (
            <p className="empty-state text-center">
              {language === 'am' ? 'እስካሁን ምንም ቪዲዮ አልተጨመረም።' : 'No videos added yet.'}
            </p>
          ) : (
            <div className="youth-videos-grid">
              {videos.map((video) => {
                const embedUrl = getYoutubeEmbedUrl(video.url);
                if (!embedUrl) return null;

                return (
                  <article key={video.id} className="video-card">
                    <div className="video-embed-wrapper">
                      <iframe
                        src={embedUrl}
                        title={video.title || 'Youth Ministry Video'}
                        className="sermon-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <h3>{video.title || (language === 'am' ? 'የአገልግሎት ቪዲዮ' : 'Ministry Video')}</h3>
                    {video.description && <p>{video.description}</p>}
                    <p className="video-meta">{[video.speaker, video.category, video.duration].filter(Boolean).join(' • ')}</p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
