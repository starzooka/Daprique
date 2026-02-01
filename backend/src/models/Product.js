import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      enum: [
        'tops',
        'bottoms',
        'footwear',
        'sunglasses-frames',
        'watches',
        'bags-trolleys',
        'jewelry',
        'fragrances',
        'electronics',
        'accessories',
      ],
      required: [true, 'Please select a category'],
    },
    department: {
      type: String,
      enum: ['Unisex', 'Men', 'Women', 'Kids'],
      default: 'Unisex',
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    images: {
      type: [String],
      required: [true, 'Please add at least one image'],
    },
    sizes: {
      type: [String],
      enum: [
        'XS',
        'S',
        'M',
        'L',
        'XL',
        'XXL',
        'One Size',
        '38',
        '39',
        '40',
        '41',
        '42',
        '43',
        '44',
      ],
      default: ['M'],
    },
    colors: {
      type: [String],
      default: ['Black'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviews: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
