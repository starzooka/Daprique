import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, cartAPI } from '../api/services.js';
import useAuthStore from '../context/authStore.js';
import '../styles/productDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getProductById(id);
      setProduct(response.data.product);
      setSelectedSize(response.data.product.sizes[0]);
      setSelectedColor(response.data.product.colors[0]);
      setActiveImageIndex(0);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setAdding(true);
      await cartAPI.addToCart({
        productId: product._id,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="container loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="container">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image-wrapper">
              <img
                src={product.images?.[activeImageIndex] || product.images?.[0]}
                alt={product.name}
                className="main-image"
              />
            </div>
            {product.images.length > 1 && (
              <div className="thumbnail-images">
                {product.images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    className={`thumbnail-btn ${idx === activeImageIndex ? 'active' : ''}`}
                    onMouseEnter={() => setActiveImageIndex(idx)}
                    onFocus={() => setActiveImageIndex(idx)}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="product-details">
            <h1>{product.name}</h1>

            <div className="rating">
              <span className="stars">⭐ {product.rating.toFixed(1)}</span>
              <span className="reviews">({product.reviews} reviews)</span>
            </div>

            <div className="price-section">
              {product.discountPrice ? (
                <>
                  <span className="original-price">₹{product.price}</span>
                  <span className="sale-price">₹{product.discountPrice}</span>
                  <span className="discount">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="price">₹{product.price}</span>
              )}
            </div>

            <div className="description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.stock > 0 ? (
              <div className="purchase-section">
                <div className="size-selector">
                  <label>Size:</label>
                  <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="color-selector">
                  <label>Color:</label>
                  <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                    {product.colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <div className="quantity-input">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <input type="number" value={quantity} readOnly />
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="add-to-cart-btn"
                >
                  {adding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            ) : (
              <div className="out-of-stock-message">
                <p>❌ Out of Stock</p>
              </div>
            )}

            <div className="stock-info">
              <p>Stock: {product.stock} available</p>
            </div>

            <div className="category-info">
              <span className="category-badge">{product.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
