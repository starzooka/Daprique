import '../styles/productCard.css';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import useAuthStore from '../context/authStore.js';
import useWishlistStore from '../context/wishlistStore.js';

export default function ProductCard({ product }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const ensureForUser = useWishlistStore((state) => state.ensureForUser);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const inWishlist = useWishlistStore((state) => state.items.some((p) => p?._id === product?._id));

  useEffect(() => {
    ensureForUser(user);
  }, [ensureForUser, user]);

  return (
    <Link
      to={`/product/${product._id}`}
      className="product-card"
      aria-label={`View details for ${product.name}`}
    >
      <div className="product-image-container">
        <button
          type="button"
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!user) {
              navigate('/login');
              return;
            }

            toggleWishlist(product);
          }}
        >
          {inWishlist ? <FaHeart /> : <FaRegHeart />}
        </button>

        <img
          src={product.images[0]}
          alt={product.name}
          className="product-image"
        />
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        <div className="product-category">
          <span className="category-badge">{product.category}</span>
        </div>

        <div className="product-rating">
          <span className="stars">⭐ {product.rating.toFixed(1)}</span>
          <span className="reviews">({product.reviews} reviews)</span>
        </div>

        <div className="product-price">
          {product.discountPrice ? (
            <>
              <span className="original-price">₹{product.price}</span>
              <span className="sale-price">₹{product.discountPrice}</span>
            </>
          ) : (
            <span className="price">₹{product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
