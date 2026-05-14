import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { getYoutubeDefaultThumbnailUrl, getYoutubeEmbedUrl, getYoutubeVideoId } from '@/lib/youtube';
import { cn } from '@/lib/utils';

/**
 * Responsive 16:9 YouTube embed. Accepts either a full URL or an 11-char id.
 *
 * @param {{ src: string, title?: string, autoplay?: boolean, mute?: boolean, loop?: boolean, controls?: boolean, className?: string, clickToPlay?: boolean, playLabel?: string }} props
 */
export default function VideoEmbed({
  src,
  title = 'Video',
  autoplay,
  mute,
  loop,
  controls,
  className,
  clickToPlay = false,
  playLabel,
}) {
  const [revealed, setRevealed] = useState(false);
  const videoId = getYoutubeVideoId(src);

  if (clickToPlay && videoId && !revealed) {
    const thumbUrl = getYoutubeDefaultThumbnailUrl(videoId);
    const ariaLabel = playLabel || `Play video: ${title}`;
    return (
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/70',
          className,
        )}
      >
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="group absolute inset-0 block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={ariaLabel}
        >
          {thumbUrl && (
            <img
              src={thumbUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-colors group-hover:bg-foreground/30" />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <PlayCircle
              className="h-14 w-14 text-white drop-shadow-md transition-transform group-hover:scale-110"
              strokeWidth={1.5}
            />
          </span>
        </button>
      </div>
    );
  }

  const embedUrl = getYoutubeEmbedUrl(src, {
    autoplay: clickToPlay && revealed ? true : autoplay,
    mute: clickToPlay && revealed ? false : mute,
    loop,
    controls,
  });
  if (!embedUrl) return null;
  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-xl bg-foreground/90', className)}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={embedUrl}
        title={title}
        loading={clickToPlay && revealed ? 'eager' : 'lazy'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
