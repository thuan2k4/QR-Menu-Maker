import { useMenuContext } from '../../MenuProvider';

export default function CategoryGridBold() {
  const { categories, activeCategory, setActiveCategory } = useMenuContext();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {categories.map((category) => {
        const isActive = category.id === activeCategory;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`rounded-full backdrop-blur-sm font-bold py-3 px-4 text-sm transition-all duration-200 border shadow-md ${isActive
                ? 'bg-white text-emerald-600 border-white shadow-lg scale-105'
                : 'bg-white/20 text-white border-white/30 hover:bg-white/30 hover:border-white/50'
              }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
