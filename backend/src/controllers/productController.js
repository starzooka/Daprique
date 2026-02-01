import Product from '../models/Product.js';

const normalizeCategory = (category) => {
  if (typeof category !== 'string') return category;
  const trimmed = category.trim();
  if (!trimmed) return trimmed;

  const lookup = {
    tops: 'tops',
    Tops: 'tops',
    bottoms: 'bottoms',
    Bottoms: 'bottoms',
    footwear: 'footwear',
    Footwear: 'footwear',
    accessories: 'accessories',
    Accessories: 'accessories',
    watches: 'watches',
    Watches: 'watches',
    jewelry: 'jewelry',
    Jewelry: 'jewelry',
    electronics: 'electronics',
    Electronics: 'electronics',
    fragrances: 'fragrances',
    Fragrances: 'fragrances',
    'Fragrances & Perfumes': 'fragrances',
    'fragrances & perfumes': 'fragrances',
    'Sunglasses & Frames': 'sunglasses-frames',
    'sunglasses & frames': 'sunglasses-frames',
    'sunglasses-frames': 'sunglasses-frames',
    'Bags & Trolleys': 'bags-trolleys',
    'bags & trolleys': 'bags-trolleys',
    'bags-trolleys': 'bags-trolleys',
  };

  if (lookup[trimmed]) return lookup[trimmed];

  return trimmed
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .limit(parseInt(limit))
      .skip(skip);

    res.status(200).json({
      message: 'Products fetched successfully',
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product fetched successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create product (Admin only)
export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, discountPrice, stock, images, sizes, colors } = req.body;

    const product = new Product({
      name,
      description,
      category: normalizeCategory(category),
      department: req.body.department,
      price,
      discountPrice,
      stock,
      images,
      sizes,
      colors,
    });

    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
        errors: Object.fromEntries(
          Object.entries(error.errors || {}).map(([key, val]) => [key, val.message])
        ),
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Update product (Admin only)
export const updateProduct = async (req, res) => {
  try {
    if (Object.prototype.hasOwnProperty.call(req.body, 'category')) {
      req.body.category = normalizeCategory(req.body.category);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
        errors: Object.fromEntries(
          Object.entries(error.errors || {}).map(([key, val]) => [key, val.message])
        ),
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Delete product (Admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
