import { useEffect, useMemo, useState } from 'react';
import { Funnel, Search, SlidersHorizontal, X } from 'lucide-react';
import { MenuSortOption, useMenuContext } from './MenuProvider';
import { useTranslation } from '../../i18n';

const SORT_OPTIONS: Array<{ value: MenuSortOption; labelKey: string }> = [
  { value: 'default', labelKey: 'publicMenuFilters.sortDefault' },
  { value: 'price_asc', labelKey: 'publicMenuFilters.sortPriceAsc' },
  { value: 'price_desc', labelKey: 'publicMenuFilters.sortPriceDesc' },
  { value: 'name_asc', labelKey: 'publicMenuFilters.sortNameAsc' },
  { value: 'name_desc', labelKey: 'publicMenuFilters.sortNameDesc' },
];

interface PublicMenuFilterSortControlsProps {
  disabled?: boolean;
  disabledReason?: string;
}

export default function PublicMenuFilterSortControls({
  disabled = false,
  disabledReason,
}: PublicMenuFilterSortControlsProps) {
  const { t } = useTranslation();
  const {
    products,
    filteredProducts,
    searchKeyword,
    setSearchKeyword,
    sortOption,
    setSortOption,
    onlyWithImage,
    setOnlyWithImage,
    onlyWithVariants,
    setOnlyWithVariants,
    resetProductFilters,
    primaryColor,
  } = useMenuContext();
  const [isOpen, setIsOpen] = useState(false);
  const resolvedDisabledReason = disabledReason ?? t('publicMenuFilters.disabledReason');

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchKeyword.trim()) count += 1;
    if (sortOption !== 'default') count += 1;
    if (onlyWithImage) count += 1;
    if (onlyWithVariants) count += 1;
    return count;
  }, [searchKeyword, sortOption, onlyWithImage, onlyWithVariants]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-6 z-[35] flex flex-col-reverse items-end px-6 transition-transform duration-500 will-change-transform ${isVisible || isOpen ? 'translate-y-0' : 'translate-y-32'
        }`}
    >
      <div className="pointer-events-auto w-full sm:w-auto sm:max-w-md">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          title={disabled ? resolvedDisabledReason : undefined}
          className={`ml-auto relative flex min-h-[48px] items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold shadow-2xl backdrop-blur-xl focus-visible:ring-2 focus-visible:ring-orange-300 transition-all active:scale-95 ${disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none'
            : 'border-slate-300 bg-white/95 text-slate-800'
            }`}
          aria-expanded={isOpen}
          aria-controls="public-menu-filter-panel"
          aria-disabled={disabled}
          style={disabled ? undefined : { borderColor: primaryColor, color: primaryColor, backgroundColor: 'rgba(255,255,255,0.95)' }}
        >
          <SlidersHorizontal size={18} />
          {t('publicMenuFilters.trigger')}
          {!disabled && activeFilterCount > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 text-[10px] font-black text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {disabled && (
          <p className="mt-2 text-right text-[11px] font-semibold text-slate-500">{resolvedDisabledReason}</p>
        )}

        {isOpen && !disabled && (
          <div
            id="public-menu-filter-panel"
            className="mb-3 rounded-[28px] border border-slate-200 bg-white/98 p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] backdrop-blur-xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            style={{ borderColor: primaryColor }}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-800">{t('publicMenuFilters.panelTitle')}</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 active:scale-90"
                aria-label={t('publicMenuFilters.closePanel')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label htmlFor="public-menu-search" className="block">
                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{t('publicMenuFilters.searchLabel')}</span>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 focus-within:border-orange-300 focus-within:bg-white transition-all">
                  <Search size={16} className="text-slate-400" />
                  <input
                    id="public-menu-search"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder={t('publicMenuFilters.searchPlaceholder')}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label htmlFor="public-menu-sort" className="block">
                <span className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">{t('publicMenuFilters.sortLabel')}</span>
                <select
                  id="public-menu-sort"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as MenuSortOption)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-orange-300 focus:bg-white transition-all appearance-none"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOnlyWithImage(!onlyWithImage)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-[0.08em] transition-all hover:scale-[1.02] active:scale-95 ${onlyWithImage ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-300 bg-white text-slate-700 shadow-sm'}`}
                  style={onlyWithImage ? { borderColor: primaryColor, backgroundColor: primaryColor } : undefined}
                >
                  <Funnel size={14} />
                  {t('publicMenuFilters.withImage')}
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyWithVariants(!onlyWithVariants)}
                  className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-[0.08em] transition-all hover:scale-[1.02] active:scale-95 ${onlyWithVariants ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-300 bg-white text-slate-700 shadow-sm'}`}
                  style={onlyWithVariants ? { borderColor: primaryColor, backgroundColor: primaryColor } : undefined}
                >
                  <Funnel size={14} />
                  {t('publicMenuFilters.withVariants')}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-[11px] font-black text-slate-500">
                <span className="uppercase tracking-widest">{t('publicMenuFilters.visibleCount', { count: String(filteredProducts.length) })}</span>
                <span className="text-slate-400">/</span>
                <span className="uppercase tracking-widest">{t('publicMenuFilters.totalCount', { count: String(products.length) })}</span>
              </div>

              <button
                type="button"
                onClick={resetProductFilters}
                className="w-full min-h-[48px] rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.08em] text-slate-700 transition-all hover:border-slate-900 hover:text-slate-900 active:scale-[0.98]"
              >
                {t('publicMenuFilters.clearAll')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

