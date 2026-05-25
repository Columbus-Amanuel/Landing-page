import { Link } from 'react-router-dom';
import { PlayCircle, BookOpen, User, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/format';
import { buildPath, ROUTES } from '@/constants/routes';
import { getYoutubeDefaultThumbnailUrl } from '@/lib/youtube';
import { cn } from '@/lib/utils';

/**
 * Thumbnail-led sermon card. Falls back to the brand cross gradient when the
 * sermon has no thumbnail / video URL.
 */
export default function SermonCard({ sermon, className }) {
  const { t, pickLocalized, language } = useLanguage();
  const title = pickLocalized(sermon, 'title');

  const thumbnail =
    sermon.thumbnailUrl ||
    (sermon.videoUrl ? getYoutubeDefaultThumbnailUrl(sermon.videoUrl) : '');

  return (
    <Link
      to={buildPath(ROUTES.sermonDetail, { id: sermon.id })}
      className={cn('group block focus-visible:outline-none', className)}
    >
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-all group-hover:border-primary/40 group-hover:shadow-float group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary to-primary/70">
          {thumbnail && (
            <img
              src={thumbnail}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-colors group-hover:bg-foreground/30">
            <PlayCircle
              className="h-14 w-14 text-white drop-shadow-md transition-transform group-hover:scale-110"
              strokeWidth={1.5}
            />
          </div>
          {sermon.category && (
            <Badge variant="accent" className="absolute left-3 top-3 uppercase tracking-wider">
              {t(`sermons.category${sermon.category.charAt(0).toUpperCase()}${sermon.category.slice(1)}`) || sermon.category}
            </Badge>
          )}
        </div>

        <CardContent className="flex flex-1 flex-col gap-2 p-5">
          <h3 className="font-display text-lg font-semibold text-primary line-clamp-2">
            {title}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {sermon.speaker && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {sermon.speaker}
              </span>
            )}
            {sermon.date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(sermon.date)}
              </span>
            )}
          </div>
          {sermon.scripture && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {sermon.scripture}
            </p>
          )}
          <p className="sr-only">{language === 'am' ? 'ሰበካን ይመልከቱ' : 'View sermon'}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
