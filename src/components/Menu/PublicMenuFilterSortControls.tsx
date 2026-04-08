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
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end p-3 sm:p-4">
      <div className="pointer-events-auto w-full sm:w-auto sm:max-w-md">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={disabled}
          title={disabled ? resolvedDisabledReason : undefined}
          className={`ml-auto flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold shadow-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-orange-300 ${disabled
            ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none'
            : 'border-slate-300 bg-white/95 text-slate-800'
            }`}
          aria-expanded={isOpen}
          aria-controls="public-menu-filter-panel"
          aria-disabled={disabled}
          style={disabled ? undefined : { borderColor: primaryColor, color: primaryColor, backgroundColor: 'rgba(255,255,255,0.95)' }}
        >
          <SlidersHorizontal size={16} />
          {t('publicMenuFilters.trigger')}
          {!disabled && activeFilterCount > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-black text-white">
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
            className="mt-2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur"
            style={{ borderColor: primaryColor }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.08em] text-slate-800">{t('publicMenuFilters.panelTitle')}</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 text-slate-600 focus-visible:ring-2 focus-visible:ring-orange-300"
                aria-label={t('publicMenuFilters.closePanel')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label htmlFor="public-menu-search" className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate-600">{t('publicMenuFilters.searchLabel')}</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <Search size={14} className="text-slate-500" />
                  <input
                    id="public-menu-search"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder={t('publicMenuFilters.searchPlaceholder')}
                    className="w-full bg-transparent text-sm text-slate-800 outline-none focus-visible:ring-0"
                  />
                </div>
              </label>

              <label htmlFor="public-menu-sort" className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate-600">{t('publicMenuFilters.sortLabel')}</span>
                <select
                  id="public-menu-sort"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as MenuSortOption)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
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
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-xs font-black uppercase tracking-[0.06em] transition focus-visible:ring-2 focus-visible:ring-orange-300 ${onlyWithImage ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                  style={onlyWithImage ? { borderColor: primaryColor, backgroundColor: primaryColor } : undefined}
                >
                  <Funnel size={12} />
                  {t('publicMenuFilters.withImage')}
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyWithVariants(!onlyWithVariants)}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-xs font-black uppercase tracking-[0.06em] transition focus-visible:ring-2 focus-visible:ring-orange-300 ${onlyWithVariants ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                  style={onlyWithVariants ? { borderColor: primaryColor, backgroundColor: primaryColor } : undefined}
                >
                  <Funnel size={12} />
                  {t('publicMenuFilters.withVariants')}
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                <span>{t('publicMenuFilters.visibleCount', { count: String(filteredProducts.length) })}</span>
                <span>{t('publicMenuFilters.totalCount', { count: String(products.length) })}</span>
              </div>

              <button
                type="button"
                onClick={resetProductFilters}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-orange-300"
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
