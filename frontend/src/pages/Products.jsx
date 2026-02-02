import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../api/services.js';
import ProductCard from '../components/ProductCard.jsx';
import { Slider } from '../components/ui/slider.jsx';
import '../styles/products.css';

export default function Products() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const PRICE_MIN_DEFAULT = 0;
  const PRICE_MAX_DEFAULT = 10000;

  const formatInr = (value) => `₹${new Intl.NumberFormat('en-IN').format(value)}`;
  const formatMax = (value) => (value === PRICE_MAX_DEFAULT ? `${formatInr(value)}+` : formatInr(value));
  const parseMax = (raw) => {
    const parsed = parseInt(raw);
    if (Number.isNaN(parsed)) return PRICE_MIN_DEFAULT;
    return Math.min(PRICE_MAX_DEFAULT, Math.max(PRICE_MIN_DEFAULT, parsed));
  };

  const [priceMax, setPriceMax] = useState(PRICE_MAX_DEFAULT);
  const [sortBy, setSortBy] = useState('');
  const [inStock, setInStock] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Temporary filter states for modal
  const [tempPriceMax, setTempPriceMax] = useState(PRICE_MAX_DEFAULT);
  const [tempSortBy, setTempSortBy] = useState('');
  const [tempInStock, setTempInStock] = useState(false);
  const [tempSelectedCategories, setTempSelectedCategories] = useState([]);
  const [tempSelectedSizes, setTempSelectedSizes] = useState([]);

  const categoryOptions = [
    { value: 'tops', label: 'Tops' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'footwear', label: 'Footwear' },
    { value: 'sunglasses-frames', label: 'Sunglasses & Frames' },
    { value: 'watches', label: 'Watches' },
    { value: 'bags-trolleys', label: 'Bags & Trolleys' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'fragrances', label: 'Fragrances & Perfumes' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'accessories', label: 'Accessories' },
  ];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const resolveCategoryParam = (raw) => {
    if (!raw) return null;
    const value = String(raw).trim();
    if (!value) return null;

    const direct = categoryOptions.find((c) => c.value === value);
    if (direct) return direct.value;

    const lower = value.toLowerCase();
    const byLabel = categoryOptions.find((c) => c.label.toLowerCase() === lower);
    if (byLabel) return byLabel.value;

    return null;
  };

  useEffect(() => {
    const initialCategory = resolveCategoryParam(searchParams.get('category'));
    if (!initialCategory) return;
    setSelectedCategories([initialCategory]);
    setTempSelectedCategories([initialCategory]);
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts({
        page,
        limit: 12,
      });
      setProducts(response.data.products);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFilters = () => {
    setTempPriceMax(priceMax);
    setTempSortBy(sortBy);
    setTempInStock(inStock);
    setTempSelectedCategories(selectedCategories);
    setTempSelectedSizes(selectedSizes);
    setShowFilters(true);
  };

  const handleApplyFilters = () => {
    setPriceMax(tempPriceMax);
    setSortBy(tempSortBy);
    setInStock(tempInStock);
    setSelectedCategories(tempSelectedCategories);
    setSelectedSizes(tempSelectedSizes);
    setShowFilters(false);
  };

  const handleDiscardFilters = () => {
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setPriceMax(PRICE_MAX_DEFAULT);
    setSortBy('');
    setInStock(false);
    setSelectedCategories([]);
    setSelectedSizes([]);
  };

  const hasActiveFilters =
    sortBy ||
    inStock ||
    priceMax !== PRICE_MAX_DEFAULT ||
    selectedCategories.length > 0 ||
    selectedSizes.length > 0;

  const getEffectivePrice = (product) => {
    const basePrice = Number(product?.price);
    const discountPrice = Number(product?.discountPrice);

    if (Number.isFinite(discountPrice) && discountPrice > 0 && (!Number.isFinite(basePrice) || discountPrice < basePrice)) {
      return discountPrice;
    }

    return Number.isFinite(basePrice) ? basePrice : 0;
  };

  const filteredProducts = useMemo(() => {
    const isPriceFilterActive = priceMax !== PRICE_MAX_DEFAULT;

    return products
      .filter((product) => {
        const effectivePrice = getEffectivePrice(product);
        const priceMatch = !isPriceFilterActive || effectivePrice <= priceMax;
        const stockMatch = !inStock || product.stock > 0;
        const categoryMatch =
          selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const sizeMatch =
          selectedSizes.length === 0 ||
          (product.sizes && product.sizes.some((size) => selectedSizes.includes(size)));
        return priceMatch && stockMatch && categoryMatch && sizeMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return getEffectivePrice(a) - getEffectivePrice(b);
        if (sortBy === 'price-desc') return getEffectivePrice(b) - getEffectivePrice(a);
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [products, priceMax, inStock, selectedCategories, selectedSizes, sortBy]);

  return (
    <div className="products-page">
      <div className="container">
        {/* Filters Button */}
        <div className="filters-header">
          <button onClick={handleOpenFilters} className="filters-btn">
            🔍 Filters & Sort
          </button>
          {hasActiveFilters && (
            <>
              <button onClick={handleResetFilters} className="reset-filters-btn">
                ✕ Reset All Filters
              </button>
              <span className="active-filters">Active filters applied</span>
            </>
          )}
        </div>

        {/* Filters Modal */}
        {showFilters && (
          <>
            <div className="filter-overlay" onClick={handleDiscardFilters}></div>
            <div className="filter-modal">
              <div className="filter-modal-header">
                <h3>Filters & Sort</h3>
                <button onClick={handleDiscardFilters} className="close-btn">
                  ✕
                </button>
              </div>

              <div className="filter-modal-body">
                <div className="filter-group">
                  <label>Sort By</label>
                  <select
                    value={tempSortBy}
                    onChange={(e) => setTempSortBy(e.target.value)}
                    className="category-select"
                  >
                    <option value="">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Price Range</label>
                  {(() => {
                    const isTempPriceFilterActive = tempPriceMax !== PRICE_MAX_DEFAULT;

                    return (
                      <div className="price-range">
                        <div className="price-range-top">
                          <span className={`price-badge ${isTempPriceFilterActive ? 'active' : ''}`}>
                            {isTempPriceFilterActive ? 'Applied' : 'Default'}
                          </span>
                          <div className="price-values">
                            <span>Up to</span>
                            <span>{formatMax(tempPriceMax)}</span>
                          </div>
                        </div>

                        <div className="price-max-controls">
                          <div className="price-max-input-wrap">
                            <label className="price-input-label" htmlFor="price-max-input">
                              Max
                            </label>
                            <input
                              id="price-max-input"
                              type="number"
                              min={PRICE_MIN_DEFAULT}
                              max={PRICE_MAX_DEFAULT}
                              value={tempPriceMax}
                              onChange={(e) => setTempPriceMax(parseMax(e.target.value))}
                              className="price-max-input"
                            />
                          </div>

                          <div className="price-slider">
                            <Slider
                              className="price-slider-ui"
                              value={[tempPriceMax]}
                              min={PRICE_MIN_DEFAULT}
                              max={PRICE_MAX_DEFAULT}
                              step={50}
                              onValueChange={(value) => setTempPriceMax(parseMax(value?.[0]))}
                              aria-label="Maximum price"
                            />
                          </div>
                        </div>

                        <p className="price-hint">
                          Default is {formatMax(PRICE_MAX_DEFAULT)} (no price filtering) — lower the max price to apply a filter.
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <div className="filter-group">
                  <label>Categories</label>
                  <div className="checkbox-grid">
                    {categoryOptions.map((category) => (
                      <label key={category.value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={tempSelectedCategories.includes(category.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempSelectedCategories([...tempSelectedCategories, category.value]);
                            } else {
                              setTempSelectedCategories(
                                tempSelectedCategories.filter((c) => c !== category.value)
                              );
                            }
                          }}
                        />
                        <span>{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Sizes</label>
                  <div className="size-grid">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-btn ${tempSelectedSizes.includes(size) ? 'active' : ''}`}
                        onClick={() => {
                          if (tempSelectedSizes.includes(size)) {
                            setTempSelectedSizes(tempSelectedSizes.filter(s => s !== size));
                          } else {
                            setTempSelectedSizes([...tempSelectedSizes, size]);
                          }
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={tempInStock}
                      onChange={(e) => setTempInStock(e.target.checked)}
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              <div className="filter-modal-footer">
                <button onClick={handleDiscardFilters} className="discard-btn">
                  Discard
                </button>
                <button onClick={handleApplyFilters} className="apply-btn">
                  Apply Filters
                </button>
              </div>
            </div>
          </>
        )}

        {/* Products Grid */}
        <div className="products-section">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="page-btn"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="no-products">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
