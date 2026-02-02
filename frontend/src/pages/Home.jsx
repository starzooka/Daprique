import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../api/services.js';
import ProductCard from '../components/ProductCard.jsx';
import CategoryGrid from '../components/CategoryGrid.jsx';
import { PiTShirtFill } from 'react-icons/pi';
import { GiTrousers, GiRunningShoe, GiPerfumeBottle } from 'react-icons/gi';
import { FaGlasses, FaRegClock, FaGem } from 'react-icons/fa';
import '../styles/home.css';

export default function Home() {
  const [carouselProducts, setCarouselProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();

  const HOME_CATEGORIES = [
    {
      value: 'tops',
      name: 'Tops',
      icon: PiTShirtFill,
      colors: { from: '#60a5fa', to: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
    },
    {
      value: 'bottoms',
      name: 'Bottoms',
      icon: GiTrousers,
      colors: { from: '#a78bfa', to: '#f472b6', glow: 'rgba(244, 114, 182, 0.40)' },
    },
    {
      value: 'footwear',
      name: 'Footwear',
      icon: GiRunningShoe,
      colors: { from: '#34d399', to: '#22c55e', glow: 'rgba(34, 197, 94, 0.40)' },
    },
    {
      value: 'sunglasses-frames',
      name: 'Sunglasses & Frames',
      icon: FaGlasses,
      colors: { from: '#fb7185', to: '#f97316', glow: 'rgba(249, 115, 22, 0.42)' },
    },
    {
      value: 'watches',
      name: 'Watches',
      icon: FaRegClock,
      colors: { from: '#22d3ee', to: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.45)' },
    },
    {
      value: 'accessories',
      name: 'Accessories',
      icon: FaGem,
      colors: { from: '#fbbf24', to: '#f97316', glow: 'rgba(251, 191, 36, 0.42)' },
    },
    {
      value: 'fragrances',
      name: 'Fragrances',
      icon: GiPerfumeBottle,
      colors: { from: '#c084fc', to: '#818cf8', glow: 'rgba(129, 140, 248, 0.42)' },
    },
  ];

  useEffect(() => {
    fetchHomeProducts();
  }, []);

  const fetchHomeProducts = async () => {
    try {
      const response = await productAPI.getAllProducts({ limit: 20 });
      const products = response.data.products;
      setCarouselProducts(products.slice(0, 8));
      setBestSellers(products.slice(0, 6));
      setTrending(products.slice(6, 12));

      setCategories(HOME_CATEGORIES);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carousel auto-advance
  useEffect(() => {
    if (carouselProducts.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => {
        const maxIndex = Math.max(0, carouselProducts.length - 4);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselProducts.length]);

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? Math.max(0, carouselProducts.length - 4) : prev - 1));
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => {
      const maxIndex = Math.max(0, carouselProducts.length - 4);
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const handleCategoryClick = (category) => {
    if (!category) return;
    const value = typeof category === 'string' ? category : category?.value || category?.name;
    if (!value) return;
    navigate(`/products?category=${encodeURIComponent(value)}`);
  };

  return (
    <div className="home">
      {/* Carousel Section */}
      <section className="carousel-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Collection</h2>
            <p className="lede">Handpicked highlights — explore what’s trending now</p>
          </div>

          {!loading && carouselProducts.length > 0 && (
            <div className="carousel-container">
              <button
                onClick={handleCarouselPrev}
                className="carousel-btn carousel-btn-prev"
                aria-label="Previous featured products"
                type="button"
              >
                ❮
              </button>
              
              <div className="carousel-wrapper">
                <div className="carousel-track" style={{
                  transform: `translateX(-${carouselIndex * 25}%)`
                }}>
                  {carouselProducts.map((product) => (
                    <div key={product._id} className="carousel-slide">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCarouselNext}
                className="carousel-btn carousel-btn-next"
                aria-label="Next featured products"
                type="button"
              >
                ❯
              </button>

              <div className="carousel-dots">
                {Array.from({ length: Math.max(1, carouselProducts.length - 3) }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`dot ${idx === carouselIndex ? 'active' : ''}`}
                    onClick={() => setCarouselIndex(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header centered">
            <h2>Shop by Category</h2>
            <p className="lede">Quick picks to match your vibe</p>
          </div>

          {loading ? (
            <p className="loading">Loading categories...</p>
          ) : (
            <CategoryGrid
              categories={categories}
              onCategoryClick={handleCategoryClick}
            />
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="best-sellers-section">
        <div className="container">
          <div className="section-header centered">
            <h2>Best Sellers</h2>
            <p className="lede">Our most loved items by customers</p>
          </div>
          {loading ? (
            <p className="loading">Loading products...</p>
          ) : (
            <div className="products-grid">
              {bestSellers.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header centered">
            <h2>Trending Now</h2>
            <p className="lede">What's popular this season</p>
          </div>
          {loading ? (
            <p className="loading">Loading products...</p>
          ) : (
            <div className="products-grid">
              {trending.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore More Section */}
      <section className="explore-section">
        <div className="container">
          <div className="explore-content">
            <h2>Explore More</h2>
            <p>Discover our complete collection and find your perfect style.</p>
            <button 
              onClick={() => navigate('/products')} 
              className="explore-btn"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
