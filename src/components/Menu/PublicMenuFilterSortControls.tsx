import { useEffect, useMemo, useState } from 'react';
import { Funnel, Search, SlidersHorizontal, X } from 'lucide-react';
import { MenuSortOption, useMenuContext } from './MenuProvider';

const SORT_OPTIONS: Array<{ value: MenuSortOption; label: string }> = [
  { value: 'default', label: 'Mặc định' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name_asc', label: 'Tên A-Z' },
  { value: 'name_desc', label: 'Tên Z-A' },
];

interface PublicMenuFilterSortControlsProps {
  disabled?: boolean;
  disabledReason?: string;
}

export default function PublicMenuFilterSortControls({
  disabled = false,
  disabledReason = 'Filter/Sort tam khoa khi menu dang o che do Private.',
}: PublicMenuFilterSortControlsProps) {
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
          title={disabled ? disabledReason : undefined}
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
          Filter/Sort
          {!disabled && activeFilterCount > 0 && (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-black text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {disabled && (
          <p className="mt-2 text-right text-[11px] font-semibold text-slate-500">{disabledReason}</p>
        )}

        {isOpen && !disabled && (
          <div
            id="public-menu-filter-panel"
            className="mt-2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur"
            style={{ borderColor: primaryColor }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.08em] text-slate-800">Lọc sản phẩm</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 text-slate-600 focus-visible:ring-2 focus-visible:ring-orange-300"
                aria-label="Đóng bộ lọc"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <label htmlFor="public-menu-search" className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate-600">Tìm kiếm</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
                  <Search size={14} className="text-slate-500" />
                  <input
                    id="public-menu-search"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                    placeholder="Tên món, mô tả, hashtag..."
                    className="w-full bg-transparent text-sm text-slate-800 outline-none focus-visible:ring-0"
                  />
                </div>
              </label>

              <label htmlFor="public-menu-sort" className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate-600">Sắp xếp</span>
                <select
                  id="public-menu-sort"
                  value={sortOption}
                  onChange={(event) => setSortOption(event.target.value as MenuSortOption)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
                  Có ảnh
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyWithVariants(!onlyWithVariants)}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 text-xs font-black uppercase tracking-[0.06em] transition focus-visible:ring-2 focus-visible:ring-orange-300 ${onlyWithVariants ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700'}`}
                  style={onlyWithVariants ? { borderColor: primaryColor, backgroundColor: primaryColor } : undefined}
                >
                  <Funnel size={12} />
                  Có biến thể
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                <span>{filteredProducts.length} sản phẩm đang hiển thị</span>
                <span>Tổng {products.length}</span>
              </div>

              <button
                type="button"
                onClick={resetProductFilters}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
