import { useMenuContext } from '../../MenuProvider';

export default function CategoryList() {
  const { categories, activeCategory, setActiveCategory, selectedTemplate, primaryColor } = useMenuContext();

  return (
    <div className="sticky top-0 backdrop-blur-sm z-20 mt-6">
      <div className="max-w-2xl mx-auto px-4 py-3 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap gap-3 px-1">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategory;
            const baseClass = 'whitespace-nowrap text-sm font-bold transition-all duration-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-orange-300';
            const style = selectedTemplate.navStyle;
            const className = style === 'underline'
              ? `px-3 py-2 rounded-full ${isActive ? 'text-white bg-gradient-to-r from-orange-500 to-pink-500 border-0' : 'text-gray-600 bg-white/80 border border-gray-100'}`
              : style === 'block'
                ? `px-5 py-2.5 rounded-full ${isActive ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-500' : 'text-gray-600 bg-gray-100 border border-gray-200'}`
                : `px-5 py-2.5 rounded-full ${isActive ? 'text-white bg-gradient-to-r from-blue-500 to-teal-500 shadow-lg' : 'text-gray-600 bg-white/85 border border-gray-200'}`;

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={isActive}
                className={`${baseClass} ${className}`}
                style={{
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isActive ? `0 8px 20px -8px ${primaryColor}66` : undefined,
                }}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
