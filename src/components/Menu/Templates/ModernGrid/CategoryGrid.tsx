import { useMenuContext } from '../../MenuProvider';

export default function CategoryGrid() {
  const { categories, activeCategory, setActiveCategory, primaryColor } = useMenuContext();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`rounded-3xl border px-4 py-3 text-sm font-semibold transition ${isActive ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
            style={{ boxShadow: isActive ? `0 8px 20px -10px ${primaryColor}30` : undefined }}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
