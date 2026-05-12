import { getYoutubeEmbedUrl } from '@/lib/youtube';
import { cn } from '@/lib/utils';

/**
 * Responsive 16:9 YouTube embed. Accepts either a full URL or an 11-char id.
 *
 * @param {{ src: string, title?: string, autoplay?: boolean, mute?: boolean, loop?: boolean, controls?: boolean, className?: string }} props
 */
export default function VideoEmbed({ src, title = 'Video', autoplay, mute, loop, controls, className }) {
  const embedUrl = getYoutubeEmbedUrl(src, { autoplay, mute, loop, controls });
  if (!embedUrl) return null;
  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-xl bg-foreground/90', className)}>
      <iframe
        className="absolute inset-0 h-full w-full"
        src={embedUrl}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
