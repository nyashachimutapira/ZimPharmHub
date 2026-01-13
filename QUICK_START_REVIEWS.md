# Pharmacy Reviews & Ratings - Quick Start

## Overview
The Pharmacy Reviews & Ratings feature allows users to review pharmacies with a 1-5 star rating system, verified badges, and pharmacist verification.

## Setup

### 1. Database Migration
```bash
npm run migrate
```

This creates the `PharmacyReviews` table with the following fields:
- `id` - UUID primary key
- `pharmacyId` - Reference to pharmacy
- `userId` - Reference to reviewer
- `rating` - 1-5 stars
- `title` - Review title
- `comment` - Review text
- `isPharmacist` - Auto-flagged if reviewer is pharmacist
- `verifiedPurchase` - Manual verification flag
- `helpfulCount` - Vote counter
- `unhelpfulCount` - Vote counter
- `approved` - Moderation status

### 2. Required User Fields
Update User model to include:
```javascript
{
  isPharmacist: Boolean,
  verifications: Array // for verified badges
}
```

## Core Endpoints

### Get Reviews for a Pharmacy
```
GET /api/reviews/pharmacy/:pharmacyId?page=1&limit=10&sortBy=createdAt
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `sortBy` - Sort field (default: createdAt)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "pharmacyId": "uuid",
      "userId": "uuid",
      "rating": 5,
      "title": "Excellent Service",
      "comment": "Great customer service and wide selection",
      "isPharmacist": true,
      "verifiedPurchase": true,
      "helpfulCount": 15,
      "unhelpfulCount": 1,
      "approved": true,
      "createdAt": "2024-01-10T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Create a Review
```
POST /api/reviews
```

**Required Body:**
```json
{
  "pharmacyId": "uuid",
  "rating": 4,
  "title": "Good pharmacy",
  "comment": "Friendly staff and quick service"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "pharmacyId": "uuid",
    "userId": "uuid",
    "rating": 4,
    "title": "Good pharmacy",
    "comment": "Friendly staff and quick service",
    "isPharmacist": true,
    "verifiedPurchase": false,
    "approved": false,
    "createdAt": "2024-01-10T10:30:00Z"
  },
  "message": "Review submitted for moderation"
}
```

### Update Review
```
PUT /api/reviews/:reviewId
```

**Body:**
```json
{
  "rating": 5,
  "title": "Excellent Service",
  "comment": "Updated review comment"
}
```

### Approve/Reject Review (Pharmacy Owner/Admin)
```
PATCH /api/reviews/:reviewId/approve
```

**Body:**
```json
{
  "approved": true
}
```

### Get Review Statistics
```
GET /api/reviews/stats/:pharmacyId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.5,
    "totalReviews": 45,
    "ratingDistribution": {
      "1": 2,
      "2": 3,
      "3": 5,
      "4": 15,
      "5": 20
    }
  }
}
```

### Mark as Helpful/Unhelpful
```
PATCH /api/reviews/:reviewId/helpful
```

**Body:**
```json
{
  "helpful": true
}
```

## Usage Examples

### Example 1: Submit a Review
```javascript
const createReview = async () => {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      pharmacyId: 'pharmacy-uuid',
      rating: 5,
      title: 'Excellent Service',
      comment: 'Staff was very helpful and knowledgeable'
    })
  });
  
  const result = await response.json();
  console.log('Review submitted:', result.data);
};
```

### Example 2: Get and Display Reviews
```javascript
const getPharmacyReviews = async (pharmacyId) => {
  const response = await fetch(`/api/reviews/pharmacy/${pharmacyId}?limit=5`);
  const result = await response.json();
  
  result.data.forEach(review => {
    console.log(`${review.rating}★ - ${review.title}`);
    console.log(`${review.comment}`);
    if (review.isPharmacist) console.log('[Verified Pharmacist]');
  });
};
```

### Example 3: Get Statistics for Pharmacy Profile
```javascript
const getPharmacyStats = async (pharmacyId) => {
  const response = await fetch(`/api/reviews/stats/${pharmacyId}`);
  const result = await response.json();
  const { averageRating, totalReviews, ratingDistribution } = result.data;
  
  console.log(`Rating: ${averageRating}/5 (${totalReviews} reviews)`);
  console.log('Distribution:', ratingDistribution);
};
```

## Moderation Workflow

### For Pharmacy Owners
```javascript
// Get pending reviews
const getPendingReviews = async (pharmacyId) => {
  const response = await fetch(`/api/reviews/pending/${pharmacyId}`, {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  });
  return await response.json();
};

// Approve review
const approveReview = async (reviewId) => {
  const response = await fetch(`/api/reviews/${reviewId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({ approved: true })
  });
  return await response.json();
};
```

## Frontend Integration Points

### Pharmacy Profile Page
Display:
- Average rating
- Review count
- Star distribution chart
- Recent approved reviews
- "Write Review" button

### User Dashboard
Display:
- User's own reviews
- Review status (approved/pending)
- Edit/delete options
- Helpful count

### Review Card Component
```javascript
<ReviewCard
  rating={review.rating}
  title={review.title}
  comment={review.comment}
  author={review.userName}
  isPharmacist={review.isPharmacist}
  verifiedPurchase={review.verifiedPurchase}
  helpfulCount={review.helpfulCount}
  date={review.createdAt}
/>
```

## Permissions Matrix

| Action | User | Pharmacy Owner | Admin |
|--------|------|---|---|
| Create Review | ✓ | ✓ | ✓ |
| View Approved | ✓ | ✓ | ✓ |
| View Pending | ✗ | Own pharmacy | ✓ |
| Approve Review | ✗ | Own pharmacy | ✓ |
| Delete Review | Own review | Own pharmacy | ✓ |
| Edit Review | Own review | ✗ | ✓ |

## Business Logic

1. **Automatic Pharmacist Badge**
   - Flag is auto-set if user type = 'pharmacist'
   - Displayed prominently on review

2. **Review Moderation**
   - New reviews default to `approved: false`
   - Pharmacy owner must approve before appearing
   - Can be rejected and removed

3. **Rating Calculation**
   - Only approved reviews count toward pharmacy rating
   - Updated in real-time when review approved
   - Average calculated as mean of all approved ratings

4. **Helpful Voting**
   - Users can vote helpful/unhelpful
   - Only for user engagement metrics
   - Does not affect review visibility

## Validation Rules

- **Rating**: Must be between 1-5
- **Title**: Required, max 200 characters
- **Comment**: Optional, max 5000 characters
- **Duplicate Prevention**: One review per pharmacy per user
- **Time Limit**: Can edit review within 48 hours of creation

## Performance Tips

1. Cache pharmacy ratings (30-minute TTL)
2. Paginate reviews (default 10 per page)
3. Index queries on `(pharmacyId, approved, createdAt)`
4. Lazy-load review comments
5. Debounce helpful/unhelpful votes

## Common Tasks

### Task: Display pharmacy rating on listing page
```javascript
const renderPharmacyCard = async (pharmacy) => {
  const stats = await fetch(`/api/reviews/stats/${pharmacy.id}`);
  const { averageRating, totalReviews } = (await stats.json()).data;
  
  return `
    <div class="pharmacy-card">
      <h3>${pharmacy.name}</h3>
      <div class="rating">
        ${renderStars(averageRating)} ${averageRating.toFixed(1)} (${totalReviews})
      </div>
    </div>
  `;
};
```

### Task: Get pharmacist-only reviews
```javascript
// On frontend: filter reviews where isPharmacist = true
const pharmacistReviews = allReviews.filter(r => r.isPharmacist);
```

### Task: Show review submission form
```javascript
// Check if user already reviewed this pharmacy
const hasReviewed = await fetch(
  `/api/reviews?userId=${userId}&pharmacyId=${pharmacyId}`
);

if (!hasReviewed) {
  // Show review form
}
```

## Troubleshooting

**Q: Review not appearing after submission**
A: Check if approved flag is false. Pharmacy owner must approve through /pending endpoint.

**Q: Cannot update review**
A: Check if user is the review author and within 48-hour edit window.

**Q: Rating not updating on pharmacy profile**
A: Ensure review is approved. Only approved reviews affect rating calculation.

## Next Steps

1. Deploy migration
2. Update User model with `isPharmacist` field
3. Create review form component
4. Integrate into pharmacy profile page
5. Add review moderation panel for pharmacy owners
6. Set up email notifications for new reviews
