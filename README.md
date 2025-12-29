# ZimPharmHub

A comprehensive pharmacy job board, product listing, and community platform for Zimbabwe.

## Features

### Job Board
- Pharmacy job listings (Pharmacist, Dispensary Assistant, Pharmacy Manager)
- Job seeker profiles with resume uploads
- Application tracking system
- Featured job listings

### Product Listings
- Pharmacy product catalog
- Search and filter by category and price
- Product reviews and ratings
- Availability tracking

### Pharmacy Profiles
- Business profile creation and management
- Operating hours, staff information
- License documentation
- Service offerings

### Community Forum
- Professional networking space
- Discussion categories
- Post creation and comments
- Tagging and search

### Resource Hub
- Articles and guides on pharmacy practices
- Training and certification opportunities
- Industry news and updates
- Category-based organization

### Events Calendar
- Upcoming pharmacy events and conferences
- Workshop and training listings
- Event registration
- Featured events

### Additional Features
- User authentication (JWT)
- Newsletter subscription
- Mobile-responsive design
- Payment integration (Stripe)
- Subscription-based features

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB
- JWT Authentication
- Stripe for payments
- Nodemailer for email

### Frontend
- React.js
- React Router
- Axios for HTTP requests
- CSS3 for styling
- React Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB installed and running
- Stripe account (optional, for payment features)

### Backend Setup

1. Clone the repository
```bash
git clone <repository-url>
cd ZimPharmHub
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`
```
MONGODB_URI=mongodb://localhost:27017/zimpharmhub
JWT_SECRET=your_secret_key_here
PORT=5000
STRIPE_SECRET_KEY=your_stripe_key
```

5. Start MongoDB
```bash
mongod
```

6. Run the server
```bash
npm run server
```

### Frontend Setup

1. Navigate to client directory
```bash
cd client
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

The application will run at `http://localhost:3000`

## Running Both Backend and Frontend

From the root directory:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (pharmacy)
- `POST /api/jobs/:id/apply` - Apply for job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `POST /api/products/:id/review` - Add product review

### Pharmacies
- `GET /api/pharmacies` - Get all pharmacies
- `GET /api/pharmacies/:id` - Get pharmacy details
- `POST /api/pharmacies` - Create pharmacy profile
- `PUT /api/pharmacies/:id` - Update pharmacy

### Forum
- `GET /api/forum` - Get forum posts
- `GET /api/forum/:id` - Get post details
- `POST /api/forum` - Create post
- `POST /api/forum/:id/comment` - Add comment
- `POST /api/forum/:id/like` - Like post

### Articles
- `GET /api/articles` - Get articles
- `GET /api/articles/:id` - Get article details
- `POST /api/articles` - Create article
- `PUT /api/articles/:id/publish` - Publish article

### Events
- `GET /api/events` - Get events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event
- `POST /api/events/:id/register` - Register for event

### Newsletter
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe

### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/upgrade-subscription` - Upgrade subscription
- `POST /api/payments/feature-job` - Feature job listing

## Project Structure

```
ZimPharmHub/
├── models/
│   ├── User.js
│   ├── Job.js
│   ├── Product.js
│   ├── Pharmacy.js
│   ├── ForumPost.js
│   ├── Article.js
│   ├── Event.js
│   └── Newsletter.js
├── routes/
│   ├── auth.js
│   ├── jobs.js
│   ├── products.js
│   ├── pharmacies.js
│   ├── users.js
│   ├── forum.js
│   ├── articles.js
│   ├── events.js
│   ├── newsletter.js
│   └── payments.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── JobsPage.js
│   │   │   ├── ProductsPage.js
│   │   │   ├── PharmaciesPage.js
│   │   │   ├── ForumPage.js
│   │   │   ├── ArticlesPage.js
│   │   │   ├── EventsPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   └── ProfilePage.js
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   │   └── index.html
│   └── package.json
├── server.js
├── package.json
└── .env.example
```

## Features to Implement Next

- Email notifications
- Advanced search filters
- User analytics dashboard
- Admin panel
- Payment webhook handling
- File upload to cloud storage (AWS S3)
- Real-time notifications
- Mentorship matching system
- Job application status tracking

## License

MIT

## Support

For support, email support@zimpharmhub.com or create an issue in the repository.
