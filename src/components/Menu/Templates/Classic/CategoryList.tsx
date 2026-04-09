import { motion } from 'motion/react';
import { useMenuContext } from '../../MenuProvider';

export default function CategoryList() {
  const { categories, activeCategory, setActiveCategory, primaryColor } = useMenuContext();

  return (
    <div className="sticky top-0 backdrop-blur-sm z-20 mt-6">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-1.5 flex items-center overflow-x-auto no-scrollbar gap-1 relative">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategory;
            
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={isActive}
                className={`relative px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] transition-colors duration-300 whitespace-nowrap rounded-xl focus-visible:ring-2 focus-visible:ring-orange-300 ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    className="absolute inset-0 z-0 rounded-xl"
                    style={{ backgroundColor: primaryColor }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

