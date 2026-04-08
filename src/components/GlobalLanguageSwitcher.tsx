import { useTranslation } from '../i18n';

interface GlobalLanguageSwitcherProps {
  className?: string;
}

export default function GlobalLanguageSwitcher({ className = '' }: GlobalLanguageSwitcherProps) {
  const { lang, setLang, t } = useTranslation();

  return (
    <div
      className={`inline-flex items-center rounded-2xl border border-gray-200 bg-white p-1 shadow-sm ${className}`}
      role="group"
      aria-label={t('common.language')}
    >
      <button
        type="button"
        onClick={() => setLang('vi')}
        aria-pressed={lang === 'vi'}
        aria-label={t('common.switchToVietnamese')}
        className={`min-h-[44px] min-w-[52px] rounded-xl px-3 text-xs font-black tracking-[0.04em] transition-all focus-visible:ring-2 focus-visible:ring-orange-300 ${lang === 'vi'
          ? 'bg-orange-500 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
          }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        aria-label={t('common.switchToEnglish')}
        className={`ml-1 min-h-[44px] min-w-[52px] rounded-xl px-3 text-xs font-black tracking-[0.04em] transition-all focus-visible:ring-2 focus-visible:ring-orange-300 ${lang === 'en'
          ? 'bg-orange-500 text-white shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
          }`}
      >
        EN
      </button>
    </div>
  );
}
