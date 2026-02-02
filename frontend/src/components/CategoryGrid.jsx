import CategoryTile from './CategoryTile.jsx';

export default function CategoryGrid({ categories, onCategoryClick, imageMap }) {
  if (!categories?.length) return null;

  return (
    <div className="categories-grid">
      {categories.map((item) => {
        const categoryName = typeof item === 'string' ? item : item?.name;
        if (!categoryName) return null;

        const categoryValue = typeof item === 'string' ? item : item?.value || item?.name;

        const icon = typeof item === 'string' ? undefined : item?.icon;
        const colors = typeof item === 'string' ? undefined : item?.colors;
        const imageSrc = imageMap?.[categoryName];

        return (
          <CategoryTile
            key={categoryName}
            category={categoryName}
            imageSrc={imageSrc}
            icon={icon}
            colors={colors}
            onClick={() => onCategoryClick?.(categoryValue)}
          />
        );
      })}
    </div>
  );
}
