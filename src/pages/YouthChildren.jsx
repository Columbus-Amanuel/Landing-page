import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getYouthVideos } from '../services/youthVideosService';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getYouthVideos()
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-youth-children">
      <section className="page-hero">
        <h1>{language === 'am' ? 'የወጣቶች እና የህፃናት አገልግሎት' : 'Youth & Children Ministry'}</h1>
        <p>
          {language === 'am'
            ? 'ለህፃናት እና ለወጣቶች እምነትን የሚያበረታታ፣ ማህበረሰብን የሚገነባ እና መሪነትን የሚያዳብር ፕሮግራሞች።'
            : 'Programs that build faith, community, and leadership for children and youth.'}
        </p>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            {language === 'am' ? 'የአገልግሎት ክፍሎች' : 'Ministry Areas'}
          </h2>
          <div className="youth-content-grid">
            <article className="youth-card">
              <h3>{language === 'am' ? 'የህፃናት እሁድ ትምህርት' : 'Children Sunday School'}</h3>
              <p>{language === 'am' ? 'በእድሜ ተመጣጣኝ መንገድ የመጽሐፍ ቅዱስ ትምህርት፣ ዝማሬ እና ተግባራዊ እንቅስቃሴዎች።' : 'Age-based Bible lessons, worship songs, and interactive activities.'}</p>
            </article>
            <article className="youth-card">
              <h3>{language === 'am' ? 'የወጣቶች ኅብረት' : 'Youth Fellowship'}</h3>
              <p>{language === 'am' ? 'ሳምንታዊ የወጣቶች ስብሰባ ለጸሎት፣ ውይይት እና የክርስቲያን ሕይወት ልምድ መጋራት።' : 'Weekly gathering for prayer, discussion, and practical Christian living.'}</p>
            </article>
            <article className="youth-card">
              <h3>{language === 'am' ? 'የቤተሰብ ስልጠና' : 'Family Discipleship'}</h3>
              <p>{language === 'am' ? 'ወላጆችን በቤት ውስጥ ልጆቻቸውን በእምነት ለማሳደግ የሚረዱ ሀብቶችና መመሪያዎች።' : 'Resources and guidance for parents to disciple children at home.'}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">{language === 'am' ? 'የYouTube ቪዲዮዎች' : 'YouTube Videos'}</h2>

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
