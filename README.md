# Fashion Ecommerce Store - MERN Stack

A full-stack ecommerce application for fashion items (tops, bottoms, and accessories) built with the MERN stack.

## Project Structure

```
ecommerce/
├── backend/              # Express.js + MongoDB backend
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── models/      # Mongoose schemas
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Server entry point
│   ├── .env             # Environment variables
│   ├── package.json
│   └── README.md
│
└── frontend/             # React + Vite frontend
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── api/         # API services
    │   ├── context/     # State management
    │   ├── styles/      # CSS files
    │   ├── assets/      # Static files
    │   ├── App.jsx      # Main app component
    │   └── main.jsx     # Entry point
    ├── .env             # Environment variables
    ├── vite.config.js
    ├── package.json
    └── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud - MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file and configure:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fashion_ecommerce
JWT_SECRET=your_secret_key_change_this_in_production
JWT_EXPIRY=30d
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

Backend will run at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file and configure:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run at `http://localhost:3000`

## Features

### User Management
- User registration and authentication with JWT
- Profile management
- Address management for checkout

### Products
- Browse products by category (tops, bottoms, accessories)
- Search products
- Filter and pagination
- Detailed product views
- Product images
- Size and color options
- Stock management

### Shopping Cart
- Add/remove items
- Update quantities
- Cart persistence
- Real-time price calculation

### Orders
- Create orders from cart
- Order history
- Order tracking
- Cancel orders
- Payment method selection

### Admin Features
- Create/edit/delete products
- Update order status
- View all orders

## Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Request validation
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **CSS 3** - Styling (responsive design)

## API Documentation

See [Backend README](./backend/README.md) for complete API endpoint documentation.

## Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Database Schema

### Collections
- **users** - User accounts and profiles
- **products** - Product catalog
- **carts** - Shopping carts
- **orders** - Customer orders

## Environment Variables

### Backend (.env)
- PORT - Server port
- MONGODB_URI - MongoDB connection string
- JWT_SECRET - Secret key for JWT
- JWT_EXPIRY - Token expiry duration
- NODE_ENV - Environment mode

### Frontend (.env)
- VITE_API_URL - Backend API URL

## Security Considerations

- Passwords hashed with bcryptjs
- JWT tokens for authentication
- Protected routes on backend
- CORS configured
- Input validation with express-validator
- Environment variables for secrets

## Future Enhancements

- Payment gateway integration
- Email notifications
- Admin dashboard
- Product reviews and ratings
- Wishlist feature
- Social media integration
- Advanced analytics

## License

MIT

## Support

For issues or questions, please refer to individual README files in backend and frontend folders.
