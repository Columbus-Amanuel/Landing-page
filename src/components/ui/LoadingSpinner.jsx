import { useLanguage } from '../../contexts/LanguageContext';

export default function LoadingSpinner({ size = 'md', center = false }) {
  const sizes = { sm: '1.5rem', md: '2.5rem', lg: '4rem' };
  const { t } = useLanguage();

  return (
    <div className={center ? 'spinner-center' : ''}>
      <div
        className="spinner"
        style={{ width: sizes[size], height: sizes[size] }}
        aria-label={t('common.loading')}
      />
    </div>
  );
}
