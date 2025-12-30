# Advanced Search & Filters - Implementation Checklist

## Status Overview
**Overall Progress: 60%** - Backend mostly complete, frontend needs enhancement

---

## 1. Multi-Select Filters
- [x] **Backend API** - `/advancedSearch/search` supports multi-select filters
  - [x] Location filter (multi-select)
  - [x] Salary range filter
  - [x] Employment type filter (multi-select)
  - [x] Position filter (multi-select)
  - [x] Experience level enum

- [ ] **Frontend Components** - Need multi-select UI components
  - [ ] Create `FilterPanel.js` component with checkboxes
  - [ ] Create `SalaryRangeSlider.js` component
  - [ ] Update `JobsPage.js` to use new filter components
  - [ ] Add mobile-responsive filter sidebar

---

## 2. Sorting Options
- [x] **Backend** - Fully implemented
  - [x] Sort by relevance (featured + date)
  - [x] Sort by date (newest first)
  - [x] Sort by salary (highest/lowest)
  - [x] Configurable sort order (asc/desc)

- [ ] **Frontend** - Needs UI
  - [ ] Create sort dropdown component
  - [ ] Integrate with search results page
  - [ ] Show current sort option

---

## 3. Save Search Filters
- [x] **Backend** - Fully implemented
  - [x] POST `/advancedSearch/filters` - Create saved filter
  - [x] GET `/advancedSearch/filters` - List user's filters
  - [x] PUT `/advancedSearch/filters/:id` - Update filter
  - [x] DELETE `/advancedSearch/filters/:id` - Delete filter
  - [x] POST `/advancedSearch/filters/:id/apply` - Apply saved filter
  - [x] SavedFilter model with usage tracking

- [ ] **Frontend** - Needs UI
  - [ ] Create `SavedFiltersPanel.js` component
  - [ ] Show saved filters list
  - [ ] Allow quick apply of saved filters
  - [ ] Add save current search as filter modal
  - [ ] Show usage stats (times used, last used)
  - [ ] Edit/delete saved filters

---

## 4. Location-Based Search (Map View)
- [ ] **Backend** - Partially implemented
  - [x] Map view query support (`?mapView=true`)
  - [x] Hardcoded coordinates for major Zimbabwe cities
  - [ ] Proper geocoding integration (needs improvement)
  - [ ] Real coordinates for all locations

- [ ] **Frontend** - Not implemented
  - [ ] Install leaflet or mapbox library
  - [ ] Create `JobsMapView.js` component
  - [ ] Show job markers on map with job details
  - [ ] Add map toggle button (list/map view)
  - [ ] Filter jobs by map bounds
  - [ ] Cluster pins for better UX

---

## 5. Filter Options API
- [x] **Backend** - Implemented
  - [x] GET `/advancedSearch/filters/options` - Returns dynamic filter options
  - [x] Positions list
  - [x] Locations list
  - [x] Employment types list
  - [x] Salary range
  - [x] Experience levels
  - [x] Sort options

- [ ] **Frontend** - Integration needed
  - [ ] Call `/filters/options` on page load
  - [ ] Populate filter dropdowns dynamically
  - [ ] Cache results (60s TTL)

---

## 6. Filter Persistence & Recommendations
- [x] **Backend**
  - [x] Usage tracking (usageCount, lastUsed)
  - [x] Popular filters endpoint
  - [x] Default filter flag
  - [x] Filter uniqueness per user

- [ ] **Frontend**
  - [ ] Show "My Saved Filters" section
  - [ ] Show popular filters with usage stats
  - [ ] Set default filter on page load

---

## 7. Advanced Search Page/Component
- [ ] Create comprehensive advanced search page with:
  - [ ] Multi-select filter sidebar
  - [ ] Search query input
  - [ ] Active filters display/management
  - [ ] Results count and pagination
  - [ ] Sort dropdown
  - [ ] Map/list view toggle
  - [ ] Save search option
  - [ ] Clear all filters button

---

## Files Already in Place

### Backend
- `routes/advancedSearch.js` - Core search API (169 lines)
- `routes/savedSearches.js` - Additional saved searches endpoint
- `models/SavedFilter.js` - Mongoose schema for filters
- `models-sequelize/Job.js` - Job model with search support

### Frontend (Needs Enhancement)
- `client/src/components/SearchBar.js` - Basic search bar
- `client/src/pages/JobsPage.js` - Current jobs page with basic filters

---

## Implementation Priority

### Phase 1 (High Priority) - Next
1. Create FilterPanel component with multi-select checkboxes
2. Create SalaryRangeSlider component
3. Create SortOptions dropdown
4. Update JobsPage to use new components
5. Integrate `/filters/options` API

### Phase 2 (Medium Priority) - Following
1. Create SavedFiltersPanel component
2. Add save/load filters functionality
3. Show saved filters on JobsPage
4. Add filter history

### Phase 3 (Optional) - Future
1. Install map library (leaflet/mapbox)
2. Create JobsMapView component
3. Add map markers and clustering
4. Implement map bounds filtering

---

## API Endpoints Available

```
GET    /advancedSearch/search?q=&positions=&locations=&salaryMin=&salaryMax=&employmentTypes=&experience=&sortBy=relevance&sortOrder=desc&page=1&limit=20&mapView=false
GET    /advancedSearch/filters/options
POST   /advancedSearch/filters
GET    /advancedSearch/filters
GET    /advancedSearch/filters/:id
PUT    /advancedSearch/filters/:id
DELETE /advancedSearch/filters/:id
POST   /advancedSearch/filters/:id/apply
GET    /advancedSearch/filters/popular
```

---

## Next Steps

1. [ ] Create `client/src/components/FilterPanel.js` - Multi-select filters UI
2. [ ] Create `client/src/components/SalaryRangeSlider.js` - Salary range slider
3. [ ] Create `client/src/components/SortOptions.js` - Sort dropdown
4. [ ] Create `client/src/components/SavedFiltersPanel.js` - Saved filters UI
5. [ ] Update `client/src/pages/JobsPage.js` to use new components
6. [ ] Test with real filter combinations
7. [ ] Optimize query performance for large result sets

---

## Notes
- Backend is 90% complete with robust API
- Frontend needs UI components to leverage existing APIs
- Map view needs proper geocoding (consider third-party API)
- Consider adding search suggestions/autocomplete
- Experience level filter needs better job data structure
