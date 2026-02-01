import { useState, useEffect } from 'react';
import { productAPI } from '../api/services.js';
import '../styles/productForm.css';

export default function ProductForm({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tops',
    department: 'Unisex', // Changed from 'gender' to 'department'
    price: '',
    discountPrice: '',
    stock: '',
    images: [''],
    sizes: ['M'],
    colors: ['Black'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        department: product.department || 'Unisex', // Load existing department
        price: product.price,
        discountPrice: product.discountPrice || '',
        stock: product.stock,
        images: product.images,
        sizes: product.sizes,
        colors: product.colors,
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
      };

      if (product) {
        await productAPI.updateProduct(product._id, dataToSubmit);
      } else {
        await productAPI.createProduct(dataToSubmit);
      }

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const toggleSize = (size) => {
    const newSizes = formData.sizes.includes(size)
      ? formData.sizes.filter(s => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes: newSizes });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="footwear">Footwear</option>
                <option value="sunglasses-frames">Sunglasses & Frames</option>
                <option value="watches">Watches</option>
                <option value="bags-trolleys">Bags & Trolleys</option>
                <option value="jewelry">Jewelry</option>
                <option value="fragrances">Fragrances & Perfumes</option>
                <option value="electronics">Electronics</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* New Row for Department & Stock */}
          <div className="form-row">
            <div className="form-group">
              <label>Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              >
                <option value="Unisex">Unisex</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Discount Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Product Images (URLs) *</label>
            {formData.images.map((image, index) => (
              <div key={index} className="image-input-group">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required={index === 0}
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeImageField(index)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-image-btn" onClick={addImageField}>
              + Add Image
            </button>
          </div>

          <div className="form-group">
            <label>Available Sizes</label>
            <div className="size-selector">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size', '38', '39', '40', '41', '42', '43', '44'].map(size => (
                <button
                  key={size}
                  type="button"
                  className={`size-btn ${formData.sizes.includes(size) ? 'active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Colors (comma separated)</label>
            <input
              type="text"
              value={formData.colors.join(', ')}
              onChange={(e) =>
                setFormData({ ...formData, colors: e.target.value.split(',').map(c => c.trim()) })
              }
              placeholder="Black, White, Blue, Gold"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}