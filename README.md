# Affket - Affiliate Marketing Platform

A comprehensive fullstack affiliate marketing platform with Admin and Affiliate dashboards.

## Tech Stack

- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: React.js, Chart.js
- **Styling**: CSS with CSS Variables (White & Dark Blue Theme)

## Project Structure

```
affket/
├── backend/                 # Express.js Backend API
│   ├── src/
│   │   ├── config/         # Database & Email configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── database/       # Migration & Seed scripts
│   │   ├── middleware/     # Auth & Validation middleware
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   ├── uploads/            # File uploads directory
│   ├── .env                # Environment variables
│   └── package.json
│
├── frontend/               # React.js Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   ├── affiliate/  # Affiliate dashboard pages
│   │   │   └── auth/       # Login/Signup pages
│   │   ├── services/       # API service
│   │   └── App.js          # Main App component
│   ├── public/
│   ├── .env                # Environment variables
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=affket_db
DB_USER=root
DB_PASSWORD=your_password
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Seed the database (optional):
```bash
npm run db:seed
```

6. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Default Credentials

After running the seed script:

**Admin:**
- Email: admin@affket.com
- Password: admin123

**Test Affiliate:**
- Email: affiliate@test.com
- Password: affiliate123

## Features

### Affiliate Dashboard
- **Dashboard**: View clicks, conversions, earnings (Today/Yesterday/MTD) with charts
- **Reports**: Click reports & Conversion reports with customizable columns and date filters
- **Offers**:
  - Browse all available offers
  - Apply for offers
  - View approved offers with tracking links
  - Add postbacks for conversions
- **Postbacks**: Manage all postback URLs
- **Wallet**: View balance, request withdrawals, transaction history
- **Profile**: Update personal info and bank details

### Admin Dashboard
- **Dashboard**: Network overview with top affiliates and offers
- **Offers**: Create, edit, enable/disable offers with goals
- **Users**: Manage affiliates, approve/reject signups, manage features
- **Applications**: Review and approve offer applications
- **Withdrawals**: Process withdrawal requests
- **Gateways**: Configure payment and SMS gateway APIs

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new affiliate
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/bank-details` - Update bank details

### Offers
- `GET /api/offers` - List offers (affiliate)
- `GET /api/offers/approved` - List approved offers
- `GET /api/offers/:id` - Get offer details
- `POST /api/offers/apply` - Apply for offer
- `GET /api/offers/admin/all` - List all offers (admin)
- `POST /api/offers/admin/create` - Create offer (admin)
- `PUT /api/offers/admin/:id` - Update offer (admin)

### Reports
- `GET /api/reports/dashboard` - Affiliate dashboard stats
- `GET /api/reports/clicks` - Clicks report
- `GET /api/reports/conversions` - Conversions report
- `GET /api/reports/admin/dashboard` - Admin dashboard stats

### Tracking
- `GET /track/:offer_id/:user_id` - Track click
- `GET /postback` - Conversion postback

### Wallet
- `GET /api/wallet` - Get wallet balance and transactions
- `POST /api/wallet/withdraw` - Request withdrawal
- `GET /api/wallet/admin/withdrawals` - List withdrawals (admin)
- `PATCH /api/wallet/admin/withdrawals/:id` - Update withdrawal status

### Users (Admin)
- `GET /api/users` - List affiliates
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id/status` - Update user status
- `PATCH /api/users/:id/features` - Update user features

### Postbacks
- `GET /api/postbacks` - List postbacks
- `POST /api/postbacks` - Create postback
- `PUT /api/postbacks/:id` - Update postback
- `DELETE /api/postbacks/:id` - Delete postback

### Gateways (Admin)
- `GET /api/gateways` - List gateways
- `POST /api/gateways` - Create gateway
- `PUT /api/gateways/:id` - Update gateway
- `DELETE /api/gateways/:id` - Delete gateway

## Environment Variables

### Backend (.env)
```env
BRAND_NAME=Affket
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=affket_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_BRAND_NAME=Affket
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_TRACKING_URL=http://localhost:5000
```

## Color Theme

- Primary Color: #1e3a5f (Dark Blue)
- Secondary Color: #ffffff (White)
- Accent Color: #3b82f6 (Blue)
- Success Color: #10b981 (Green)
- Warning Color: #f59e0b (Orange)
- Error Color: #ef4444 (Red)

## License

ISC
# affket
