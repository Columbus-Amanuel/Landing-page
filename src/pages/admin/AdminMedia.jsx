import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  Copy,
  Trash2,
  Image as ImageIcon,
  FileText,
  Film,
  Music,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import EmptyState from '@/components/common/EmptyState';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/format';
import {
  listMediaFiles,
  uploadMediaFile,
  deleteMediaFile,
  MAX_UPLOAD_BYTES,
} from '@/services/mediaService';
import { cn } from '@/lib/utils';

const ACCEPT =
  'image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx';

function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function displayName(storageName) {
  const idx = storageName.indexOf('_');
  return idx >= 0 ? storageName.slice(idx + 1) : storageName;
}

function MediaPreview({ file }) {
  if (file.contentType?.startsWith('image/')) {
    return (
      <img
        src={file.url}
        alt=""
        className="h-20 w-20 shrink-0 rounded-md border border-border object-cover"
      />
    );
  }
  const type = file.contentType || '';
  const iconClass = 'h-8 w-8 text-muted-foreground';
  let icon = <FileText className={iconClass} />;
  if (type.startsWith('video/')) icon = <Film className={iconClass} />;
  else if (type.startsWith('audio/')) icon = <Music className={iconClass} />;
  else if (type.startsWith('image/')) icon = <ImageIcon className={iconClass} />;

  return (
    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
      {icon}
    </span>
  );
}

function MediaRow({ file, onDeleted }) {
  const { t } = useLanguage();
  const [deleting, setDeleting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.url);
      toast.success(t('admin.media.copied'));
    } catch {
      toast.error(t('admin.flash.error'));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteMediaFile(file.fullPath);
      toast.success(t('admin.flash.deleted'));
      onDeleted();
    } catch (err) {
      toast.error(err?.message || t('admin.flash.error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <MediaPreview file={file} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-primary" title={displayName(file.name)}>
            {displayName(file.name)}
          </p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {file.contentType && <span>{file.contentType}</span>}
            {file.size != null && <span>{formatFileSize(file.size)}</span>}
            {file.updated && (
              <span>
                {t('admin.media.uploaded')}{' '}
                {formatDate(file.updated, 'MMM d, yyyy h:mm a')}
              </span>
            )}
          </div>
          <p className="mt-2 truncate font-mono text-xs text-muted-foreground" title={file.url}>
            {file.url}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            {t('admin.media.copyUrl')}
          </Button>
          <Button type="button" variant="outline" size="sm" asChild>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              {t('admin.media.open')}
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                {t('admin.delete')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('admin.confirmDelete')}</AlertDialogTitle>
                <AlertDialogDescription>{t('admin.confirmDeleteBody')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('admin.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t('admin.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminMedia() {
  const { t } = useLanguage();
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    listMediaFiles()
      .then(setFiles)
      .catch(() => {
        setFiles([]);
        toast.error(t('admin.flash.error'));
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadFiles = async (fileList) => {
    const items = Array.from(fileList || []);
    if (items.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < items.length; i += 1) {
        const file = items[i];
        await uploadMediaFile(file, (pct) => {
          const overall = ((i + pct / 100) / items.length) * 100;
          setProgress(overall);
        });
      }
      toast.success(t('admin.media.uploadedSuccess'));
      refresh();
    } catch (err) {
      if (err?.message === 'FILE_TOO_LARGE') {
        toast.error(t('admin.media.error.tooLarge'));
      } else {
        toast.error(err?.message || t('admin.flash.error'));
      }
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onInputChange = (e) => uploadFiles(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!uploading) uploadFiles(e.dataTransfer.files);
  };

  const maxMb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));

  return (
    <>
      <header className="mb-8">
        <h1 className="font-hero text-3xl font-semibold text-primary md:text-4xl">
          {t('admin.media.title')}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.media.subtitle')}</p>
      </header>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
              dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
              uploading && 'pointer-events-none opacity-60',
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </span>
            <div>
              <p className="font-medium text-primary">{t('admin.media.dropzone')}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('admin.media.dropzoneHint').replace('{maxMb}', String(maxMb))}
              </p>
            </div>
            <Button type="button" variant="outline" disabled={uploading}>
              {t('admin.media.chooseFiles')}
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept={ACCEPT}
              className="sr-only"
              onChange={onInputChange}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>{t('admin.media.uploading')}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner size="lg" center />
      ) : files.length === 0 ? (
        <EmptyState icon={ImageIcon} title={t('admin.media.empty')} />
      ) : (
        <div className="space-y-4">
          {files.map((file) => (
            <MediaRow key={file.fullPath} file={file} onDeleted={refresh} />
          ))}
        </div>
      )}
    </>
  );
}
