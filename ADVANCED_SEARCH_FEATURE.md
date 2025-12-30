# Advanced Search & Filters - Complete Feature Guide

## Overview

Advanced Search enhances job discovery with powerful filtering, sorting, saved searches, and location-based map view. Users can create complex search criteria and reuse them.

## Key Features

### 1. Multi-Select Filters
Users can filter jobs by:
- **Positions**: Pharmacist, Dispensary Assistant, Pharmacy Manager, etc.
- **Locations**: Multiple cities/provinces
- **Salary Range**: Minimum and maximum salary
- **Employment Type**: Full-time, Part-time, Contract, Temporary
- **Experience**: 0-1, 1-3, 3-5, 5+ years

### 2. Smart Sorting
- **Relevance** (default) - Featured jobs first, then by date
- **Date Posted** - Newest first or oldest first
- **Salary** - Highest or lowest first

### 3. Saved Search Filters
- Save favorite search combinations
- Reuse filters without recreating
- Default filter support
- Usage tracking for analytics
- Rename/update/delete filters

### 4. Map View
- Visual display of jobs by location
- Mock coordinates for Zimbabwean cities
- Shows job details on map
- Location-based discovery

### 5. Dynamic Filter Options
- Real-time generation from database
- Always shows available positions/locations
- Salary range based on actual jobs
- Helps users discover what's available

## Database Schema

### SavedFilter Model (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: ObjectId Ref,        // Link to User
  name: String,                // Unique per user
  description: String,         // Optional
  isDefault: Boolean,          // Mark as default search
  
  // Filter Criteria
  positions: [String],         // Job titles
  locations: [String],         // Cities
  salaryMin: Number,
  salaryMax: Number,
  employmentTypes: [String],
  experience: String,
  
  // Sorting
  sortBy: String,              // relevance, date, salary
  sortOrder: String,           // asc, desc
  
  // Additional
  keywords: [String],          // Search tags
  
  // Tracking
  usageCount: Number,          // Times applied
  lastUsed: Date,
  
  createdAt/updatedAt: Date
}

Indexes:
- Unique: (userId, name)
```

## API Endpoints

### Search Operations (No Auth)
- `GET /api/search` - Advanced search with filters
- `GET /api/filters/options` - Get available filter values

### Filter Management (Authenticated)
- `POST /api/filters` - Save search filter
- `GET /api/filters` - List all saved filters
- `GET /api/filters/:id` - Get specific filter
- `PUT /api/filters/:id` - Update filter
- `DELETE /api/filters/:id` - Delete filter
- `POST /api/filters/:id/apply` - Apply saved filter
- `GET /api/filters/popular` - Get top filters

See `ADVANCED_SEARCH_ENDPOINTS.md` for complete endpoint details.

## Frontend Implementation

### 1. Search Component
```jsx
function AdvancedJobSearch() {
  const [filters, setFilters] = useState({
    query: '',
    positions: [],
    locations: [],
    salaryMin: null,
    salaryMax: null,
    employmentTypes: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [results, setResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});

  useEffect(() => {
    // Load filter options
    fetch('/api/filters/options')
      .then(r => r.json())
      .then(data => setFilterOptions(data));
  }, []);

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (filters.query) params.append('q', filters.query);
    filters.positions.forEach(p => params.append('positions', p));
    filters.locations.forEach(l => params.append('locations', l));
    if (filters.salaryMin) params.append('salaryMin', filters.salaryMin);
    if (filters.salaryMax) params.append('salaryMax', filters.salaryMax);
    filters.employmentTypes.forEach(t => params.append('employmentTypes', t));
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);

    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();
    setResults(data.results);
  };

  return (
    <div className="advanced-search">
      <div className="filters">
        <input 
          placeholder="Search jobs..."
          value={filters.query}
          onChange={e => setFilters({...filters, query: e.target.value})}
        />
        
        <MultiSelect 
          options={filterOptions.positions}
          value={filters.positions}
          onChange={positions => setFilters({...filters, positions})}
          label="Positions"
        />
        
        <MultiSelect 
          options={filterOptions.locations}
          value={filters.locations}
          onChange={locations => setFilters({...filters, locations})}
          label="Locations"
        />
        
        <RangeSlider 
          min={filterOptions.salaryRange?.min}
          max={filterOptions.salaryRange?.max}
          value={[filters.salaryMin, filters.salaryMax]}
          onChange={([min, max]) => setFilters({
            ...filters,
            salaryMin: min,
            salaryMax: max
          })}
          label="Salary Range"
        />
        
        <Select 
          options={filterOptions.sortOptions}
          value={filters.sortBy}
          onChange={sortBy => setFilters({...filters, sortBy})}
          label="Sort By"
        />
        
        <button onClick={handleSearch}>Search Jobs</button>
        <button onClick={handleSaveFilter}>Save This Search</button>
      </div>
      
      <div className="results">
        {results.map(job => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  );
}
```

### 2. Save Filter Component
```jsx
function SaveFilterDialog({ filters, onSave }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = async () => {
    const res = await fetch('/api/filters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId
      },
      body: JSON.stringify({
        name,
        description,
        ...filters,
        isDefault
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      onSave(data.filter);
    }
  };

  return (
    <dialog>
      <h2>Save This Search</h2>
      <input 
        placeholder="Filter name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <textarea 
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <label>
        <input 
          type="checkbox"
          checked={isDefault}
          onChange={e => setIsDefault(e.target.checked)}
        />
        Set as default search
      </label>
      <button onClick={handleSave}>Save Filter</button>
    </dialog>
  );
}
```

### 3. Saved Filters List
```jsx
function SavedFilters() {
  const [filters, setFilters] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    // Load saved filters
    fetch('/api/filters', { headers: { 'user-id': userId } })
      .then(r => r.json())
      .then(data => setFilters(data.filters));

    // Load popular filters
    fetch('/api/filters/popular', { headers: { 'user-id': userId } })
      .then(r => r.json())
      .then(data => setPopular(data.filters));
  }, []);

  const handleApplyFilter = async (filterId) => {
    const res = await fetch(`/api/filters/${filterId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId
      },
      body: JSON.stringify({ page: 1 })
    });
    
    const data = await res.json();
    // Display results
  };

  const handleDeleteFilter = async (filterId) => {
    const res = await fetch(`/api/filters/${filterId}`, {
      method: 'DELETE',
      headers: { 'user-id': userId }
    });
    
    if (res.ok) {
      setFilters(filters.filter(f => f._id !== filterId));
    }
  };

  return (
    <div className="saved-filters">
      <h2>My Saved Searches</h2>
      {filters.map(filter => (
        <div key={filter._id} className="filter-card">
          <h3>{filter.name}</h3>
          <p>{filter.description}</p>
          <p>Used {filter.usageCount} times</p>
          <button onClick={() => handleApplyFilter(filter._id)}>
            Apply Search
          </button>
          <button onClick={() => handleDeleteFilter(filter._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Map View Component
```jsx
function JobMapView() {
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    const loadMapData = async () => {
      const res = await fetch('/api/search?locations=Harare&mapView=true');
      const data = await res.json();
      setMapData(data.mapData);
    };
    loadMapData();
  }, []);

  return (
    <div className="map-view">
      <MapComponent>
        {mapData.map(job => (
          <MapMarker
            key={job.id}
            lat={job.latitude}
            lng={job.longitude}
            title={job.title}
            info={`${job.pharmacy} - ${job.salary}`}
          />
        ))}
      </MapComponent>
    </div>
  );
}
```

## Search Strategies

### Simple Keyword Search
```
User types: "pharmacist"
API Call: /api/search?q=pharmacist
Result: All jobs with "pharmacist" in title/description
```

### Location-Based Search
```
User selects: Harare, Bulawayo
API Call: /api/search?locations=Harare&locations=Bulawayo
Result: Jobs in those cities
```

### Salary-Based Search
```
User sets: 8000-15000
API Call: /api/search?salaryMin=8000&salaryMax=15000
Result: Jobs in salary range
```

### Complex Search
```
User filters:
- Position: Pharmacist
- Location: Harare
- Salary: 8000-15000
- Type: Full-time
- Sort: By salary (highest first)

API Call: /api/search?positions=Pharmacist&locations=Harare&salaryMin=8000&salaryMax=15000&employmentTypes=Full-time&sortBy=salary&sortOrder=desc

Result: Filtered and sorted jobs
```

## Performance Optimization

### Database Indexes
```javascript
// Job model should have these indexes:
- { status: 1 }
- { position: 1 }
- { locationCity: 1 }
- { salaryMax: 1 }
- { featured: 1, createdAt: -1 }
- { title: 'text', description: 'text' }
```

### Caching Strategy
1. Cache filter options (refreshed hourly)
2. Cache popular filters (per user)
3. Cache search results (per filter, 5 min TTL)
4. Invalidate cache on new job posted

### Pagination
- Default: 20 results per page
- Max: 100 results per page
- Use offset-based pagination

## Features by User Type

### Job Seeker
- Create custom filters
- Save searches
- Apply filters quickly
- View map of jobs
- Get recommendations based on popular filters

### Employer
- (No special features, search same as job seeker)

### Admin
- Track popular search terms
- Monitor filter usage
- Optimize job recommendations

## Analytics & Insights

### Tracked Metrics
- Popular search terms
- Most used filters
- Common filter combinations
- User search behavior
- Time to filter application

### Use Cases
- Recommend jobs based on user searches
- Display popular filters to new users
- Identify hiring trends
- Improve job matching algorithm

## Pagination Example

```javascript
// First page
GET /api/search?q=pharmacist&page=1&limit=20

Response includes:
- totalResults: 450
- totalPages: 23
- currentPage: 1
- hasMore: true

// Second page
GET /api/search?q=pharmacist&page=2&limit=20

// Last page
GET /api/search?q=pharmacist&page=23&limit=20
Response includes: hasMore: false
```

## Map View Coordinates

**Zimbabwe Cities (Mock Coordinates)**
- Harare: -17.8252, 31.0335
- Bulawayo: -20.1599, 28.5796
- Chitungwiza: -17.9992, 31.0161
- Mutare: -18.9667, 32.6669
- Gweru: -19.4517, 29.7747
- Kwekwe: -18.9256, 29.8256

In production, integrate with:
- Google Maps API
- Mapbox
- OpenStreetMap

## Error Handling

```
Search errors return:
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error"
}

Filter errors return:
{
  "success": false,
  "message": "Error description"
}
```

## Security & Privacy

✅ No authentication for public search  
✅ Authentication for personal saved filters  
✅ Users can only access their own filters  
✅ Input validation on all parameters  
✅ SQL injection prevention with parameterized queries  

## Testing Checklist

- [ ] Basic keyword search
- [ ] Multi-select filters
- [ ] Salary range search
- [ ] Employment type filter
- [ ] Date sorting
- [ ] Salary sorting
- [ ] Pagination
- [ ] Map view
- [ ] Save filter
- [ ] Load filter
- [ ] Update filter
- [ ] Delete filter
- [ ] Popular filters
- [ ] Filter options loading
- [ ] No results handling
- [ ] Error handling

## Future Enhancements

### Phase 2
- [ ] Search history tracking
- [ ] AI-powered search suggestions
- [ ] Fuzzy search (typo tolerance)
- [ ] Advanced boolean search
- [ ] Search analytics dashboard

### Phase 3
- [ ] Real map integration (Google Maps)
- [ ] Geolocation-based search
- [ ] Search distance radius
- [ ] Location autocomplete
- [ ] Saved map views

### Phase 4
- [ ] Machine learning recommendations
- [ ] Personalized search results
- [ ] Search-to-alert conversion
- [ ] Trending searches
- [ ] Search analytics API

## Files

### Code
- `models/SavedFilter.js` - MongoDB schema
- `routes/advancedSearch.js` - API endpoints
- `server.js` - Route registration

### Documentation
- `ADVANCED_SEARCH_QUICK_START.md` - Quick reference
- `ADVANCED_SEARCH_ENDPOINTS.md` - API documentation
- `ADVANCED_SEARCH_FEATURE.md` - This file

---

**Version**: 1.0  
**Status**: Backend complete, ready for frontend  
**Last Updated**: 2024-01-15
