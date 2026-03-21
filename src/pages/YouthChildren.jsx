import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { ChevronDownIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  getYoutubeVideoId,
  getYouthPageContent,
  getYouthVideos,
  normalizeYouthPageContent,
} from '../services/youthVideosService';
import { useLanguage } from '../contexts/LanguageContext';

function getYoutubeEmbedUrl(url = '') {
  const id = getYoutubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : '';
}

function YouthVideoCard({ video, language }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getYoutubeEmbedUrl(video.url);
  const videoId = getYoutubeVideoId(video.url);
  const thumb =
    (video.thumbnailUrl && String(video.thumbnailUrl).trim())
    || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '');

  const title =
    language === 'am' && video.titleAm
      ? video.titleAm
      : (video.title || (language === 'am' ? 'የአገልግሎት ቪዲዮ' : 'Ministry Video'));
  const description =
    language === 'am' && video.descriptionAm
      ? video.descriptionAm
      : video.description;

  if (!embedUrl) return null;

  return (
    <article className="video-card youth-video-card">
      <div className="video-embed-wrapper youth-video-frame">
        {playing ? (
          <iframe
            src={`${embedUrl}?autoplay=1`}
            title={title}
            className="sermon-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="youth-video-poster"
            onClick={() => setPlaying(true)}
            aria-label={language === 'am' ? 'ቪዲዮ ያጫውቱ' : 'Play video'}
          >
            {thumb ? (
              <img src={thumb} alt="" className="youth-video-poster-img" />
            ) : (
              <span className="youth-video-poster-fallback" aria-hidden />
            )}
            <span className="youth-video-play-ring">
              <PlayCircleIcon className="youth-video-play-icon" aria-hidden />
            </span>
          </button>
        )}
      </div>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      <p className="video-meta">{[video.speaker, video.category, video.duration].filter(Boolean).join(' • ')}</p>
    </article>
  );
}

export default function YouthChildren() {
  const { language } = useLanguage();
  const am = language === 'am';
  const [videos, setVideos] = useState([]);
  const [pageContent, setPageContent] = useState(() => normalizeYouthPageContent(null));
  const [loading, setLoading] = useState(true);
  const statsSectionRef = useRef(null);
  const [statsSectionVisible, setStatsSectionVisible] = useState(false);
  useEffect(() => {
    const el = statsSectionRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsSectionVisible(true);
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    Promise.all([getYouthVideos(), getYouthPageContent()])
      .then(([videoItems, rawContent]) => {
        setVideos(videoItems);
        setPageContent(normalizeYouthPageContent(rawContent));
      })
      .finally(() => setLoading(false));
  }, []);

  const pc = pageContent;

  const contentCards = useMemo(() => [
    {
      title: am ? (pc.cardOneTitleAm || 'የህፃናት እሁድ ትምህርት') : (pc.cardOneTitleEn || 'Children Sunday School'),
      description: am
        ? (pc.cardOneDescriptionAm || 'በእድሜ ተመጣጣኝ መንገድ የመጽሐፍ ቅዱስ ትምህርት፣ ዝማሬ እና ተግባራዊ እንቅስቃሴዎች።')
        : (pc.cardOneDescriptionEn || 'Age-based Bible lessons, worship songs, and interactive activities.'),
    },
    {
      title: am ? (pc.cardTwoTitleAm || 'የወጣቶች ኅብረት') : (pc.cardTwoTitleEn || 'Youth Fellowship'),
      description: am
        ? (pc.cardTwoDescriptionAm || 'ሳምንታዊ የወጣቶች ስብሰባ ለጸሎት፣ ውይይት እና የክርስቲያን ሕይወት ልምድ መጋራት።')
        : (pc.cardTwoDescriptionEn || 'Weekly gathering for prayer, discussion, and practical Christian living.'),
    },
    {
      title: am ? (pc.cardThreeTitleAm || 'የቤተሰብ ስልጠና') : (pc.cardThreeTitleEn || 'Family Discipleship'),
      description: am
        ? (pc.cardThreeDescriptionAm || 'ወላጆችን በቤት ውስጥ ልጆቻቸውን በእምነት ለማሳደግ የሚረዱ ሀብቶችና መመሪያዎች።')
        : (pc.cardThreeDescriptionEn || 'Resources and guidance for parents to disciple children at home.'),
    },
  ], [am, pc]);

  const stats = useMemo(
    () => [
      { value: pc.stat1Value, label: am ? pc.stat1LabelAm : pc.stat1LabelEn },
      { value: pc.stat2Value, label: am ? pc.stat2LabelAm : pc.stat2LabelEn },
      { value: pc.stat3Value, label: am ? pc.stat3LabelAm : pc.stat3LabelEn },
    ],
    [am, pc],
  );

  const hasStats = stats.some((s) => (s.value && s.value.trim()) || (s.label && s.label.trim()));

  const faqs = Array.isArray(pc.faqs) ? pc.faqs : [];
  const faqsVisible = faqs.filter((item) => {
    const q = am ? (item.questionAm || item.questionEn) : (item.questionEn || item.questionAm);
    const a = am ? (item.answerAm || item.answerEn) : (item.answerEn || item.answerAm);
    return (q && q.trim()) || (a && a.trim());
  });

  const showIntro =
    (pc.introTitleEn || pc.introTitleAm || pc.introBodyEn || pc.introBodyAm)
    && (am
      ? (pc.introTitleAm || pc.introBodyAm || pc.introTitleEn || pc.introBodyEn)
      : (pc.introTitleEn || pc.introBodyEn || pc.introTitleAm || pc.introBodyAm));

  const ctaHref = (pc.ctaHref || '').trim();
  const ctaIsInternal = ctaHref.startsWith('/') && !ctaHref.startsWith('//');
  const ctaTitle = am ? (pc.ctaTitleAm || pc.ctaTitleEn) : (pc.ctaTitleEn || pc.ctaTitleAm);
  const ctaButton = am ? (pc.ctaButtonAm || pc.ctaButtonEn) : (pc.ctaButtonEn || pc.ctaButtonAm);
  const showCta = (ctaTitle && ctaTitle.trim()) || (ctaButton && ctaButton.trim());

  return (
    <div className="page-youth-children">
      <section className="page-hero">
        <h1>
          {am
            ? (pc.heroTitleAm || 'የወጣቶች እና የህፃናት አገልግሎት')
            : (pc.heroTitleEn || 'Youth & Children Ministry')}
        </h1>
        <p>
          {am
            ? (pc.heroSubtitleAm || 'ለህፃናት እና ለወጣቶች እምነትን የሚያበረታታ፣ ማህበረሰብን የሚገነባ እና መሪነትን የሚያዳብር ፕሮግራሞች።')
            : (pc.heroSubtitleEn || 'Programs that build faith, community, and leadership for children and youth.')}
        </p>
      </section>

      {showIntro ? (
        <section className="section youth-intro-section">
          <div className="container youth-intro-inner">
            <h2 className="youth-intro-title">
              {am
                ? (pc.introTitleAm || pc.introTitleEn || '')
                : (pc.introTitleEn || pc.introTitleAm || '')}
            </h2>
            <div className="youth-intro-body">
              {(am ? (pc.introBodyAm || pc.introBodyEn) : (pc.introBodyEn || pc.introBodyAm))
                .split('\n')
                .filter(Boolean)
                .map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </div>
        </section>
      ) : null}

      {hasStats ? (
        <section
          className={`section section-alt youth-stats-section${statsSectionVisible ? ' is-revealed' : ''}`}
          ref={statsSectionRef}
        >
          <div className="container">
            <h2 className="section-title">
              {am
                ? (pc.statsSectionTitleAm || 'በአጭሩ')
                : (pc.statsSectionTitleEn || 'At a glance')}
            </h2>
            <ul className="youth-stats-grid">
              {stats.map((s, i) => (
                <li key={i} className="youth-stat-card" style={{ '--stagger': i }}>
                  {s.value ? <span className="youth-stat-value">{s.value}</span> : null}
                  {s.label ? <span className="youth-stat-label">{s.label}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">
            {am
              ? (pc.ministrySectionTitleAm || 'የአገልግሎት ክፍሎች')
              : (pc.ministrySectionTitleEn || 'Ministry Areas')}
          </h2>
          <div className="youth-content-grid">
            {contentCards.map((card) => (
              <article className="youth-card youth-card-interactive" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {faqsVisible.length > 0 ? (
        <section className="section youth-faq-section">
          <div className="container container-narrow">
            <h2 className="section-title">
              {am
                ? (pc.faqSectionTitleAm || 'ተደጋጋሚ ጥያቄዎች')
                : (pc.faqSectionTitleEn || 'Questions parents & youth ask')}
            </h2>
            <div className="youth-faq-list">
              {faqsVisible.map((item, index) => {
                const q = am ? (item.questionAm || item.questionEn) : (item.questionEn || item.questionAm);
                const a = am ? (item.answerAm || item.answerEn) : (item.answerEn || item.answerAm);
                return (
                  <Disclosure key={`${index}-${q.slice(0, 24)}`} as="div" className="youth-faq-item">
                    {({ open }) => (
                      <>
                        <DisclosureButton className="youth-faq-trigger">
                          <span>{q}</span>
                          <ChevronDownIcon className={`youth-faq-chevron${open ? ' is-open' : ''}`} aria-hidden />
                        </DisclosureButton>
                        <DisclosurePanel className="youth-faq-panel">
                          <p>{a}</p>
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <h2 className="section-title">
            {am
              ? (pc.videosSectionTitleAm || 'የYouTube ቪዲዮዎች')
              : (pc.videosSectionTitleEn || 'YouTube Videos')}
          </h2>

          {loading ? (
            <LoadingSpinner center />
          ) : videos.length === 0 ? (
            <p className="empty-state text-center">
              {am
                ? (pc.emptyVideosMessageAm || 'እስካሁን ምንም ቪዲዮ አልተጨመረም።')
                : (pc.emptyVideosMessageEn || 'No videos added yet.')}
            </p>
          ) : (
            <div className="youth-videos-grid">
              {videos.map((video) => (
                <YouthVideoCard key={video.id} video={video} language={language} />
              ))}
            </div>
          )}
        </div>
      </section>

      {showCta ? (
        <section className="section youth-cta-section">
          <div className="container youth-cta-inner">
            {ctaTitle ? <h2 className="youth-cta-title">{ctaTitle}</h2> : null}
            {ctaButton && ctaHref ? (
              ctaIsInternal ? (
                <Link to={ctaHref} className="btn btn-primary youth-cta-btn">
                  {ctaButton}
                </Link>
              ) : (
                <a href={ctaHref || '#'} className="btn btn-primary youth-cta-btn">
                  {ctaButton}
                </a>
              )
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
