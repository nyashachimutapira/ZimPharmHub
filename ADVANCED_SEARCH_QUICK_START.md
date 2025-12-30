# Advanced Search & Filters - Quick Start

## What's Advanced Search?

Powerful job discovery with multi-select filters, sorting options, saved searches, and map view for location-based browsing.

## Key Features

✅ **Multi-Select Filters** - Position, location, salary, employment type  
✅ **Smart Sorting** - Relevance, date posted, salary  
✅ **Save Searches** - Reuse favorite filter combinations  
✅ **Map View** - Visual location-based job browsing  
✅ **Filter Options** - Dynamic dropdown values from live jobs  
✅ **Usage Tracking** - Analytics on popular searches  

## Quick API Reference

### Basic Search
```
GET /api/search?q=pharmacist&locations=Harare&sortBy=date
Query Parameters:
  - q: Search keyword
  - positions: Job position (multi-select)
  - locations: City/location (multi-select)
  - salaryMin: Minimum salary
  - salaryMax: Maximum salary
  - employmentTypes: Job type (multi-select)
  - experience: Years of experience
  - sortBy: relevance, date, salary (default: relevance)
  - sortOrder: asc, desc (default: desc)
  - page: Page number (default: 1)
  - limit: Results per page (default: 20)
  - mapView: true/false for map coordinates
```

### Get Filter Options
```
GET /api/filters/options
Returns all available filter values (positions, locations, salary ranges)
```

### Save a Search Filter
```
POST /api/filters
Headers: user-id: {userId}
Body: {
  "name": "Senior Pharmacists in Harare",
  "positions": ["Pharmacist"],
  "locations": ["Harare"],
  "salaryMin": 8000,
  "salaryMax": 15000,
  "sortBy": "salary",
  "isDefault": false
}
```

### Get All Saved Filters
```
GET /api/filters
Headers: user-id: {userId}
Returns all user's saved search filters
```

### Apply Saved Filter
```
POST /api/filters/{filterId}/apply
Headers: user-id: {userId}
Body: {
  "page": 1,
  "limit": 20,
  "mapView": false
}
Returns search results using saved filter criteria
```

### Update Saved Filter
```
PUT /api/filters/{filterId}
Headers: user-id: {userId}
Body: { ...fields to update... }
```

### Delete Saved Filter
```
DELETE /api/filters/{filterId}
Headers: user-id: {userId}
```

### Get Popular Filters (Recommendations)
```
GET /api/filters/popular
Headers: user-id: {userId}
Returns user's most-used filters
```

## Frontend Integration

### 1. Basic Search
```jsx
const handleSearch = async (filters) => {
  const params = new URLSearchParams();
  if (filters.query) params.append('q', filters.query);
  if (filters.positions) {
    filters.positions.forEach(p => params.append('positions', p));
  }
  if (filters.locations) {
    filters.locations.forEach(l => params.append('locations', l));
  }
  if (filters.salaryMin) params.append('salaryMin', filters.salaryMin);
  if (filters.salaryMax) params.append('salaryMax', filters.salaryMax);
  params.append('sortBy', filters.sortBy || 'relevance');
  
  const res = await fetch(`/api/search?${params}`);
  return res.json();
};
```

### 2. Get Filter Options
```jsx
useEffect(() => {
  fetch('/api/filters/options')
    .then(r => r.json())
    .then(data => {
      setPositions(data.positions);
      setLocations(data.locations);
      setSalaryRange(data.salaryRange);
    });
}, []);
```

### 3. Save Current Filter
```jsx
const handleSaveFilter = async (filterName) => {
  const res = await fetch('/api/filters', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId
    },
    body: JSON.stringify({
      name: filterName,
      positions: selectedPositions,
      locations: selectedLocations,
      salaryMin: salaryRange[0],
      salaryMax: salaryRange[1],
      sortBy: 'relevance'
    })
  });
  return res.json();
};
```

### 4. Load Saved Filter
```jsx
const handleLoadFilter = async (filterId) => {
  const res = await fetch(`/api/filters/${filterId}/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'user-id': userId
    },
    body: JSON.stringify({ page: 1, limit: 20 })
  });
  const data = await res.json();
  setResults(data.results);
};
```

### 5. Map View
```jsx
const handleMapView = async (filters) => {
  const res = await fetch(
    `/api/search?locations=${filters.locations}&mapView=true`
  );
  const data = await res.json();
  // data.mapData contains latitude/longitude
  displayMap(data.mapData);
};
```

## Filter Options Structure

```json
{
  "positions": ["Pharmacist", "Dispensary Assistant", "Pharmacy Manager"],
  "locations": ["Harare", "Bulawayo", "Chitungwiza"],
  "employmentTypes": ["Full-time", "Part-time", "Contract"],
  "salaryRange": {
    "min": 2000,
    "max": 100000
  },
  "experience": ["0-1 years", "1-3 years", "3-5 years", "5+ years", "Any"],
  "sortOptions": [
    { "value": "relevance", "label": "Relevance" },
    { "value": "date", "label": "Date Posted" },
    { "value": "salary", "label": "Salary" }
  ]
}
```

## Sorting Strategies

| Sort By | Order | Use Case |
|---------|-------|----------|
| **Relevance** | Desc | Default, best matches first |
| **Date** | Desc | Newest jobs first |
| **Salary** | Desc | Highest salary first |
| **Salary** | Asc | Lowest salary first |

## Response Format

### Search Results
```json
{
  "success": true,
  "totalResults": 45,
  "totalPages": 3,
  "currentPage": 1,
  "pageSize": 20,
  "hasMore": true,
  "results": [
    {
      "id": "...",
      "title": "Senior Pharmacist",
      "description": "...",
      "position": "Pharmacist",
      "locationCity": "Harare",
      "locationProvince": "Harare",
      "salaryMin": 8000,
      "salaryMax": 12000,
      "employmentType": "Full-time",
      "pharmacy": { "firstName": "ABC", "lastName": "Pharmacy" },
      "featured": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "filters": {
    "query": "pharmacist",
    "positions": ["Pharmacist"],
    "sortBy": "relevance"
  }
}
```

### Map View Data
```json
"mapData": [
  {
    "id": "...",
    "title": "Senior Pharmacist",
    "position": "Pharmacist",
    "location": "Harare",
    "latitude": -17.8252,
    "longitude": 31.0335,
    "salary": "8000 - 12000",
    "pharmacy": "ABC Pharmacy"
  }
]
```

## Testing

### Search with Filters
```bash
curl "http://localhost:5000/api/search?q=pharmacist&locations=Harare&sortBy=date"
```

### Get Filter Options
```bash
curl http://localhost:5000/api/filters/options
```

### Save Filter
```bash
curl -X POST http://localhost:5000/api/filters \
  -H "Content-Type: application/json" \
  -H "user-id: user-123" \
  -d '{
    "name": "Harare Pharmacists",
    "positions": ["Pharmacist"],
    "locations": ["Harare"],
    "sortBy": "relevance"
  }'
```

### Get Saved Filters
```bash
curl http://localhost:5000/api/filters \
  -H "user-id: user-123"
```

### Apply Saved Filter
```bash
curl -X POST http://localhost:5000/api/filters/{filterId}/apply \
  -H "Content-Type: application/json" \
  -H "user-id: user-123" \
  -d '{"page": 1, "limit": 20}'
```

## Common Search Patterns

### Pattern 1: Simple Keyword Search
```
GET /api/search?q=pharmacist
```

### Pattern 2: Location-Based
```
GET /api/search?locations=Harare&locations=Bulawayo&sortBy=date
```

### Pattern 3: Salary Range
```
GET /api/search?salaryMin=8000&salaryMax=15000&sortBy=salary&sortOrder=desc
```

### Pattern 4: Employment Type
```
GET /api/search?employmentTypes=Full-time&employmentTypes=Contract
```

### Pattern 5: Combined Filters
```
GET /api/search?q=pharmacist&positions=Pharmacist&locations=Harare&salaryMin=8000&sortBy=date
```

### Pattern 6: Map View
```
GET /api/search?locations=Harare&mapView=true
```

## Performance Tips

1. **Use pagination** - Always use `limit` and `page` parameters
2. **Narrow filters** - More specific filters = faster results
3. **Save filters** - Reuse searches with `/api/filters/{id}/apply`
4. **Cache filter options** - Call `/api/filters/options` once on load

## Database Structure

### SavedFilter Schema
```javascript
{
  userId: ObjectId,           // Link to User
  name: String,               // Unique per user
  description: String,
  positions: [String],        // Job positions
  locations: [String],        // Cities
  salaryMin/Max: Number,
  employmentTypes: [String],
  sortBy: String,             // relevance, date, salary
  sortOrder: String,          // asc, desc
  keywords: [String],
  usageCount: Number,         // Track popularity
  lastUsed: Date,
  createdAt/updatedAt: Date
}
```

## Troubleshooting

**No results found?**
- Try broader filters
- Check spelling of location/position
- Use `/api/filters/options` to see available values
- Try searching without filters: `/api/search?q=term`

**Saved filter not working?**
- Verify filter ID is correct
- Check user-id header is present
- Ensure filter belongs to user (403 means unauthorized)

**Map not showing?**
- Add `mapView=true` parameter
- Check locations are spelled correctly (case-sensitive)
- Verify coordinates are returned in response

**Slow search?**
- Reduce limit to fewer results
- Add more specific filters
- Check database indexes exist

## Next Steps

1. Read `ADVANCED_SEARCH_ENDPOINTS.md` for complete API
2. Read `ADVANCED_SEARCH_FEATURE.md` for full guide
3. Implement UI components for filters
4. Test with real data
5. Optimize based on performance

## Files

- `models/SavedFilter.js` - MongoDB schema
- `routes/advancedSearch.js` - API endpoints
- `ADVANCED_SEARCH_QUICK_START.md` - This file
- `ADVANCED_SEARCH_ENDPOINTS.md` - Complete API reference
- `ADVANCED_SEARCH_FEATURE.md` - Full feature guide

---

For more details, see `ADVANCED_SEARCH_ENDPOINTS.md` and `ADVANCED_SEARCH_FEATURE.md`
