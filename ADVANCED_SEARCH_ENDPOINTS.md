# Advanced Search & Filters - Complete API Reference

## Endpoint Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/search` | Advanced search with filters | ❌ |
| GET | `/api/filters/options` | Get available filter values | ❌ |
| POST | `/api/filters` | Save search filter | ✅ |
| GET | `/api/filters` | List saved filters | ✅ |
| GET | `/api/filters/:id` | Get specific filter | ✅ |
| PUT | `/api/filters/:id` | Update filter | ✅ |
| DELETE | `/api/filters/:id` | Delete filter | ✅ |
| POST | `/api/filters/:id/apply` | Apply saved filter | ✅ |
| GET | `/api/filters/popular` | Get popular filters | ✅ |

---

## 1. Advanced Search (GET)

```
GET /api/search
Query Parameters:
  q: Search keyword
  positions: Job position (array)
  locations: City/location (array)
  salaryMin: Minimum salary
  salaryMax: Maximum salary
  employmentTypes: Job type (array)
  experience: Years of experience
  sortBy: relevance, date, salary
  sortOrder: asc, desc
  page: Page number (default: 1)
  limit: Results per page (default: 20)
  mapView: true/false

Example:
GET /api/search?q=pharmacist&positions=Pharmacist&locations=Harare&salaryMin=8000&sortBy=date&page=1&limit=20

Response: 200 OK
{
  "success": true,
  "totalResults": 45,
  "totalPages": 3,
  "currentPage": 1,
  "pageSize": 20,
  "hasMore": true,
  "results": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Senior Pharmacist",
      "description": "Seeking experienced pharmacist...",
      "position": "Pharmacist",
      "locationCity": "Harare",
      "locationProvince": "Harare",
      "locationAddress": "123 Main St",
      "salaryMin": 8000,
      "salaryMax": 12000,
      "salaryCurrency": "ZWL",
      "employmentType": "Full-time",
      "requirements": ["Degree", "5+ years"],
      "responsibilities": ["Manage pharmacy"],
      "featured": true,
      "views": 150,
      "pharmacy": {
        "id": "507f1f77bcf86cd799439014",
        "firstName": "ABC",
        "lastName": "Pharmacy",
        "email": "hr@abcpharmacy.com"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "filters": {
    "query": "pharmacist",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "salaryMin": 8000,
    "sortBy": "date"
  }
}

With mapView=true:
"mapData": [
  {
    "id": "507f1f77bcf86cd799439012",
    "title": "Senior Pharmacist",
    "position": "Pharmacist",
    "location": "Harare",
    "latitude": -17.8252,
    "longitude": 31.0335,
    "salary": "8000 - 12000",
    "pharmacy": "ABC Pharmacy"
  }
]

Errors:
- 500: Database error
```

### Query Parameter Details

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| q | string | Search keyword | "pharmacist" |
| positions | array | Job positions | ["Pharmacist", "Manager"] |
| locations | array | Cities | ["Harare", "Bulawayo"] |
| salaryMin | number | Minimum salary | 8000 |
| salaryMax | number | Maximum salary | 15000 |
| employmentTypes | array | Job types | ["Full-time"] |
| experience | string | Years exp | "3-5 years" |
| sortBy | string | Sort field | "relevance", "date", "salary" |
| sortOrder | string | Sort order | "asc", "desc" |
| page | number | Page number | 1 |
| limit | number | Per page | 20 |
| mapView | boolean | Show map | true, false |

---

## 2. Get Filter Options (GET)

```
GET /api/filters/options

Response: 200 OK
{
  "success": true,
  "positions": [
    "Pharmacist",
    "Dispensary Assistant",
    "Pharmacy Manager",
    "Other"
  ],
  "locations": [
    "Bulawayo",
    "Chitungwiza",
    "Gweru",
    "Harare",
    "Kwekwe",
    "Mutare"
  ],
  "employmentTypes": [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary"
  ],
  "salaryRange": {
    "min": 2000,
    "max": 95000
  },
  "experience": [
    "0-1 years",
    "1-3 years",
    "3-5 years",
    "5+ years",
    "Any"
  ],
  "sortOptions": [
    {
      "value": "relevance",
      "label": "Relevance"
    },
    {
      "value": "date",
      "label": "Date Posted"
    },
    {
      "value": "salary",
      "label": "Salary"
    }
  ]
}

Errors:
- 500: Database error
```

---

## 3. Save Search Filter (POST)

```
POST /api/filters
Content-Type: application/json
user-id: {userId}

Request Body:
{
  "name": "Senior Pharmacists in Harare",
  "description": "Looking for 5+ year experienced pharmacists",
  "positions": ["Pharmacist"],
  "locations": ["Harare"],
  "salaryMin": 8000,
  "salaryMax": 15000,
  "employmentTypes": ["Full-time"],
  "experience": "5+ years",
  "keywords": ["senior", "experienced"],
  "sortBy": "salary",
  "sortOrder": "desc",
  "isDefault": false
}

Response: 201 Created
{
  "success": true,
  "message": "Search filter saved",
  "filter": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Senior Pharmacists in Harare",
    "description": "Looking for 5+ year experienced pharmacists",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "salaryMin": 8000,
    "salaryMax": 15000,
    "employmentTypes": ["Full-time"],
    "experience": "5+ years",
    "keywords": ["senior", "experienced"],
    "sortBy": "salary",
    "sortOrder": "desc",
    "isDefault": false,
    "usageCount": 0,
    "lastUsed": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}

Errors:
- 400: Filter name required or already exists
- 401: No user-id header
- 500: Database error
```

---

## 4. Get All Saved Filters (GET)

```
GET /api/filters
user-id: {userId}

Response: 200 OK
{
  "success": true,
  "count": 3,
  "filters": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Senior Pharmacists in Harare",
      "positions": ["Pharmacist"],
      "locations": ["Harare"],
      "sortBy": "salary",
      "isDefault": true,
      "usageCount": 12,
      "lastUsed": "2024-01-15T14:20:00Z",
      "createdAt": "2024-01-10T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Any Pharmacy Job",
      "positions": [],
      "locations": [],
      "sortBy": "relevance",
      "isDefault": false,
      "usageCount": 3,
      "lastUsed": "2024-01-14T09:00:00Z",
      "createdAt": "2024-01-12T08:00:00Z"
    }
  ]
}

Errors:
- 401: No user-id header
- 500: Database error
```

---

## 5. Get Specific Filter (GET)

```
GET /api/filters/{filterId}
user-id: {userId}

Response: 200 OK
{
  "success": true,
  "filter": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Senior Pharmacists in Harare",
    "description": "Looking for 5+ year experienced",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "salaryMin": 8000,
    "salaryMax": 15000,
    "employmentTypes": ["Full-time"],
    "experience": "5+ years",
    "keywords": ["senior"],
    "sortBy": "salary",
    "sortOrder": "desc",
    "isDefault": true,
    "usageCount": 12,
    "lastUsed": "2024-01-15T14:20:00Z",
    "createdAt": "2024-01-10T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}

Errors:
- 401: No user-id header
- 403: Forbidden (not your filter)
- 404: Filter not found
- 500: Database error
```

---

## 6. Update Filter (PUT)

```
PUT /api/filters/{filterId}
Content-Type: application/json
user-id: {userId}

Request Body (all optional):
{
  "name": "Updated name",
  "locations": ["Harare", "Bulawayo"],
  "salaryMax": 20000,
  "sortBy": "date",
  "isDefault": true
}

Response: 200 OK
{
  "success": true,
  "message": "Filter updated",
  "filter": {
    "_id": "507f1f77bcf86cd799439020",
    "name": "Updated name",
    "locations": ["Harare", "Bulawayo"],
    "salaryMax": 20000,
    "sortBy": "date",
    "isDefault": true,
    "updatedAt": "2024-01-15T15:00:00Z"
  }
}

Errors:
- 400: Invalid data
- 401: No user-id header
- 403: Forbidden
- 404: Filter not found
- 500: Database error
```

---

## 7. Delete Filter (DELETE)

```
DELETE /api/filters/{filterId}
user-id: {userId}

Response: 200 OK
{
  "success": true,
  "message": "Filter deleted"
}

Errors:
- 401: No user-id header
- 403: Forbidden
- 404: Filter not found
- 500: Database error
```

---

## 8. Apply Saved Filter (POST)

```
POST /api/filters/{filterId}/apply
Content-Type: application/json
user-id: {userId}

Request Body:
{
  "page": 1,
  "limit": 20,
  "mapView": false
}

Response: 200 OK
{
  "success": true,
  "filterName": "Senior Pharmacists in Harare",
  "totalResults": 8,
  "totalPages": 1,
  "currentPage": 1,
  "pageSize": 20,
  "hasMore": false,
  "results": [
    {
      "id": "507f1f77bcf86cd799439012",
      "title": "Senior Pharmacist",
      "position": "Pharmacist",
      "locationCity": "Harare",
      "salaryMin": 8000,
      "salaryMax": 12000,
      "employmentType": "Full-time",
      "pharmacy": {...}
    }
  ],
  "filterUsed": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Senior Pharmacists in Harare",
    "positions": ["Pharmacist"],
    "locations": ["Harare"]
  }
}

Errors:
- 401: No user-id header
- 403: Forbidden
- 404: Filter not found
- 500: Database error
```

---

## 9. Get Popular Filters (GET)

```
GET /api/filters/popular
user-id: {userId}

Response: 200 OK
{
  "success": true,
  "count": 3,
  "filters": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "name": "Senior Pharmacists in Harare",
      "usageCount": 12,
      "lastUsed": "2024-01-15T14:20:00Z",
      "positions": ["Pharmacist"],
      "locations": ["Harare"]
    },
    {
      "_id": "507f1f77bcf86cd799439021",
      "name": "Any Pharmacy Job",
      "usageCount": 3,
      "lastUsed": "2024-01-14T09:00:00Z",
      "positions": [],
      "locations": []
    }
  ]
}

Errors:
- 401: No user-id header
- 500: Database error
```

---

## cURL Examples

### Basic Search
```bash
curl "http://localhost:5000/api/search?q=pharmacist&sortBy=date"
```

### Multi-Select Search
```bash
curl "http://localhost:5000/api/search?positions=Pharmacist&positions=Manager&locations=Harare&locations=Bulawayo"
```

### Salary Range Search
```bash
curl "http://localhost:5000/api/search?salaryMin=8000&salaryMax=15000&sortBy=salary&sortOrder=desc"
```

### Map View Search
```bash
curl "http://localhost:5000/api/search?locations=Harare&mapView=true"
```

### Get Filter Options
```bash
curl http://localhost:5000/api/filters/options
```

### Save Filter
```bash
curl -X POST http://localhost:5000/api/filters \
  -H "Content-Type: application/json" \
  -H "user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "name": "My Pharmacist Search",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "salaryMin": 8000,
    "sortBy": "salary"
  }'
```

### Get Saved Filters
```bash
curl http://localhost:5000/api/filters \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Apply Saved Filter
```bash
curl -X POST http://localhost:5000/api/filters/507f1f77bcf86cd799439020/apply \
  -H "Content-Type: application/json" \
  -H "user-id: 507f1f77bcf86cd799439011" \
  -d '{"page": 1, "limit": 20}'
```

### Update Filter
```bash
curl -X PUT http://localhost:5000/api/filters/507f1f77bcf86cd799439020 \
  -H "Content-Type: application/json" \
  -H "user-id: 507f1f77bcf86cd799439011" \
  -d '{
    "locations": ["Harare", "Bulawayo"],
    "salaryMax": 20000
  }'
```

### Delete Filter
```bash
curl -X DELETE http://localhost:5000/api/filters/507f1f77bcf86cd799439020 \
  -H "user-id: 507f1f77bcf86cd799439011"
```

### Get Popular Filters
```bash
curl http://localhost:5000/api/filters/popular \
  -H "user-id: 507f1f77bcf86cd799439011"
```

---

## Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Search completed |
| 201 | Created | Filter saved |
| 400 | Bad Request | Missing required field |
| 401 | Unauthorized | No user-id header |
| 403 | Forbidden | Not your filter |
| 404 | Not Found | Filter doesn't exist |
| 500 | Server Error | Database error |

---

## Search URL Examples

```
# Simple keyword
/api/search?q=pharmacist

# With position filter
/api/search?q=pharmacist&positions=Pharmacist

# Multiple positions
/api/search?positions=Pharmacist&positions=Manager

# Location filter
/api/search?locations=Harare

# Multiple locations
/api/search?locations=Harare&locations=Bulawayo

# Salary range
/api/search?salaryMin=8000&salaryMax=15000

# Employment type
/api/search?employmentTypes=Full-time&employmentTypes=Contract

# Combined filters
/api/search?q=pharmacist&positions=Pharmacist&locations=Harare&salaryMin=8000&sortBy=date

# With pagination
/api/search?q=pharmacist&page=2&limit=25

# Map view
/api/search?locations=Harare&mapView=true
```

---

## Search Result Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Job ID |
| title | string | Job title |
| description | string | Job description |
| position | string | Job position type |
| locationCity | string | City |
| locationProvince | string | Province |
| salaryMin | number | Minimum salary |
| salaryMax | number | Maximum salary |
| employmentType | string | Full-time, Part-time, etc |
| featured | boolean | Is featured job |
| views | number | Number of views |
| pharmacy | object | Employer details |
| requirements | array | Requirements list |
| createdAt | string | Created timestamp |

---

## Filter Limits & Performance

- **Max results per page**: 100
- **Default page size**: 20
- **Max saved filters per user**: 100 (recommended)
- **Search response time**: <500ms
- **Indexed fields**: userId, status, position, location

---

**Version**: 1.0  
**Status**: Complete  
**Last Updated**: 2024-01-15
