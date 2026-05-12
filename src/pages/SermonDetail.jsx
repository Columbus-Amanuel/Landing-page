import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { User, Calendar, BookOpen, Download } from 'lucide-react';
import Container from '@/components/common/Container';
import BackLink from '@/components/common/BackLink';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import VideoEmbed from '@/components/common/VideoEmbed';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getSermonById } from '@/services/sermonsService';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';

export default function SermonDetail() {
  const { id } = useParams();
  const { t, pickLocalized } = useLanguage();
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getSermonById(id)
      .then((data) => active && setSermon(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LoadingSpinner size="lg" center />;
  if (!sermon) {
    return (
      <Container className="py-24">
        <EmptyState
          title={t('sermons.notFound')}
          action={
            <Button asChild>
              <Link to={ROUTES.sermons}>{t('sermons.backToSermons')}</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const title = pickLocalized(sermon, 'title');
  const description = pickLocalized(sermon, 'description');

  return (
    <article className="pb-24 pt-12">
      <Container size="lg">
        <BackLink to={ROUTES.sermons} className="mb-8">
          {t('sermons.backToSermons')}
        </BackLink>

        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <div>
            {sermon.videoUrl ? (
              <VideoEmbed src={sermon.videoUrl} title={title} />
            ) : sermon.audioUrl ? (
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center gap-4 p-8">
                  <p className="text-sm font-medium text-muted-foreground">{t('sermons.watchListen')}</p>
                  <audio controls className="w-full" src={sermon.audioUrl}>
                    Your browser does not support audio playback.
                  </audio>
                </CardContent>
              </Card>
            ) : null}

            <div className="mt-8">
              {sermon.category && (
                <Badge variant="accent" className="mb-4 uppercase tracking-wider">
                  {sermon.category}
                </Badge>
              )}
              <h1 className="font-hero text-4xl font-semibold text-primary md:text-5xl">
                {title}
              </h1>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {sermon.speaker && (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4 text-accent" />
                    {sermon.speaker}
                  </span>
                )}
                {sermon.date && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-accent" />
                    {formatDate(sermon.date)}
                  </span>
                )}
                {sermon.scripture && (
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-accent" />
                    {sermon.scripture}
                  </span>
                )}
              </div>

              {description && (
                <p className="mt-8 text-lg leading-relaxed text-foreground/90">{description}</p>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            {sermon.notesUrl && (
              <Card>
                <CardContent className="flex flex-col gap-3 p-6">
                  <h2 className="font-display text-lg font-semibold text-primary">
                    {t('sermons.notes')}
                  </h2>
                  <Button asChild variant="outline" className="w-full">
                    <a href={sermon.notesUrl} target="_blank" rel="noopener noreferrer">
                      <Download /> {t('sermons.downloadNotes')}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </Container>
    </article>
  );
}
