import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Section from '@/components/common/Section';
import VideoEmbed from '@/components/common/VideoEmbed';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { resolvePublicMinistry } from '@/services/ministriesService';
import { getVideosForMinistry } from '@/services/youthVideosService';
import { ROUTES } from '@/constants/routes';
import NotFound from '@/pages/NotFound';

/**
 * @param {{ fixedSlug?: string }} props
 */
export default function MinistryPage({ fixedSlug } = {}) {
  const { slug: slugParam } = useParams();
  const slug = fixedSlug || slugParam;
  const { language, t } = useLanguage();
  const { youthContent } = useSiteSettings();
  const [resolved, setResolved] = useState({
    loading: true,
    ministry: null,
    notFound: false,
  });
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setResolved({ loading: true, ministry: null, notFound: false });
    resolvePublicMinistry(slug, youthContent).then((res) => {
      if (!active) return;
      if (!res) setResolved({ loading: false, ministry: null, notFound: true });
      else setResolved({ loading: false, ministry: res.ministry, notFound: false });
    });
    return () => {
      active = false;
    };
  }, [slug, youthContent]);

  const ministry = resolved.ministry;
  const wantVideos = ministry?.sections?.includes('videos');

  useEffect(() => {
    if (!wantVideos || !ministry) {
      setVideos([]);
      setVideosLoading(false);
      return;
    }
    let active = true;
    setVideosLoading(true);
    const legacyYouthMerge = slug === 'youth-children';
    getVideosForMinistry(ministry.id, { legacyYouthSlug: legacyYouthMerge })
      .then((data) => active && setVideos(data))
      .catch(() => active && setVideos([]))
      .finally(() => active && setVideosLoading(false));
    return () => {
      active = false;
    };
  }, [wantVideos, ministry, slug]);

  const pick = useMemo(() => {
    if (!ministry) return () => '';
    return (key) => (language === 'am' ? ministry[`${key}Am`] : ministry[`${key}En`]);
  }, [ministry, language]);

  if (resolved.loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (resolved.notFound || !ministry) {
    return <NotFound />;
  }

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'intro':
        return (
          <Section key="intro" containerSize="md">
            <h2 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
              {pick('introTitle')}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {pick('introBody')}
            </p>
          </Section>
        );
      case 'stats':
        if (!ministry.stats?.length) return null;
        return (
          <Section key="stats" tone="muted" className="py-16">
            <div className="grid gap-6 md:grid-cols-3">
              {ministry.stats.map((stat, idx) => (
                <Card key={idx} className="text-center">
                  <CardContent className="p-8">
                    <p className="font-hero text-5xl font-semibold text-primary">
                      {stat.valueEn}
                    </p>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {language === 'am' ? stat.labelAm : stat.labelEn}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        );
      case 'programs':
        if (!ministry.ministries?.length) return null;
        return (
          <Section
            key="programs"
            eyebrow={language === 'am' ? 'ቡድኖች' : 'How we gather'}
            title={language === 'am' ? 'መርሃ ግብር' : 'Programs'}
          >
            <div className="grid gap-6 md:grid-cols-3">
              {ministry.ministries.map((m, idx) => (
                <Card key={idx} className="h-full transition-all hover:border-primary/40 hover:shadow-float">
                  <CardContent className="p-7">
                    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-xl font-semibold text-primary">
                      {language === 'am' ? m.titleAm : m.titleEn}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {language === 'am' ? m.bodyAm : m.bodyEn}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        );
      case 'videos':
        return (
          <Section
            key="videos"
            tone="muted"
            eyebrow={language === 'am' ? 'ቪዲዮዎች' : 'Highlights'}
            title={language === 'am' ? 'ከእኛ ቤተሰብ' : 'From our family'}
          >
            {videosLoading ? (
              <LoadingSpinner size="lg" center />
            ) : videos.length === 0 ? (
              <EmptyState
                title={language === 'am' ? 'ቪዲዮ ገና አልተጨመረም።' : 'No videos yet.'}
                description={language === 'am' ? 'በቅርቡ ይመለስ።' : 'Check back soon.'}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {videos.map((video) => {
                  const displayTitle =
                    language === 'am' && video.titleAm ? video.titleAm : video.title;
                  return (
                  <Card key={video.id} className="overflow-hidden p-0">
                    <VideoEmbed
                      src={video.url}
                      title={displayTitle}
                      clickToPlay
                      className="rounded-none"
                      playLabel={`${t('common.playVideo')}: ${displayTitle}`}
                    />
                    <CardContent className="space-y-2 p-5">
                      <h3 className="font-display text-lg font-semibold text-primary">
                        {displayTitle}
                      </h3>
                      {(video.description || video.descriptionAm) && (
                        <p className="text-sm text-muted-foreground">
                          {language === 'am' && video.descriptionAm
                            ? video.descriptionAm
                            : video.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            )}
          </Section>
        );
      case 'faqs':
        if (!ministry.faqs?.length) return null;
        return (
          <Section
            key="faqs"
            eyebrow="FAQ"
            title={language === 'am' ? 'ተደጋጋሚ ጥያቄዎች' : 'Frequently asked'}
            containerSize="md"
          >
            <Accordion type="single" collapsible className="w-full">
              {ministry.faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger>
                    {language === 'am' ? faq.questionAm : faq.questionEn}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === 'am' ? faq.answerAm : faq.answerEn}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Section>
        );
      case 'cta':
        return (
          <Section key="cta" tone="primary" className="py-20 text-center">
            <h2 className="font-hero text-3xl font-semibold md:text-4xl">{pick('ctaTitle')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              {language === 'am'
                ? 'በእሁድ 4:00 ሰዓት እንጠብቅዎታለን።'
                : 'We worship every Sunday at 4:00 PM — bring the whole family.'}
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" variant="accent">
                <Link to={ROUTES.contact}>{pick('ctaButton')}</Link>
              </Button>
            </div>
          </Section>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <PageHero
        eyebrow={language === 'am' ? 'አገልግሎት' : 'Ministry'}
        title={pick('heroTitle')}
        subtitle={pick('heroSubtitle')}
      />
      {(ministry.sections || []).map((sectionId) => renderSection(sectionId))}
    </>
  );
}
