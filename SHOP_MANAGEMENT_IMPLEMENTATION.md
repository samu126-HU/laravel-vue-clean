# Shop Management System Implementation

## Overview
Implemented a dual-mode shop management system that functions differently for admins and regular users:

### Admin Mode (Shop Layout Editor)
- Navigate to: `/admin/shops/{id}/layout`
- Features:
  - Upload DXF files to create shop floor plans
  - Edit aisle names via context menu
  - Assign categories to aisles
  - Calculate and edit shelf access points
  - Save changes with visual feedback
  - Track unsaved changes

### User Mode (Shop Viewer)
- Access via: "View" button in Shops page → Opens modal
- Features:
  - View shop information
  - Open floor plan with MapViewer
  - Navigate through shop layout
  - Future: Shopping list integration with auto-navigation

## Files Created/Modified

### New Files
1. **resources/js/pages/Admin/ShopLayout.vue**
   - Admin page for editing shop layouts
   - DXF upload with progress tracking
   - MapViewer integration with edit capabilities
   - Change tracking system

2. **resources/js/components/ShopViewModal.vue**
   - User-facing shop viewing modal
   - Two-view system: info and map
   - Shopping list panel structure (for future)

### Modified Files
1. **routes/web.php**
   - Added: `GET /admin/shops/{shop}/layout`

2. **routes/api.php**
   - Added: `POST /api/admin/shops/{shop}/upload-dxf`

3. **app/Http/Controllers/Admin/AdminShopController.php**
   - Added `uploadDxf()` method for DXF file processing
   - Added basic DXF parser (extracts LINE and POLYLINE entities)
   - Updated `update()` method to accept partial updates

4. **app/Http/Controllers/ShopController.php**
   - Updated `show()` method to return all shop fields including map_data

5. **resources/js/pages/Admin/Shops.vue**
   - Added "Edit Layout" button (purple)
   - Added `openLayoutEditor()` function

6. **resources/js/pages/User/Shops.vue**
   - Added ShopViewModal integration
   - Added state management for modal

## Architecture

### Admin Flow
```
Shops Table → "Edit Layout" button
  ↓
/admin/shops/{id}/layout page
  ↓
Upload DXF modal
  ↓
MapViewer with context menu editing
  ↓
Save changes → API call to update shop
```

### User Flow
```
Shops Grid → "View" button
  ↓
ShopViewModal (Info View)
  ↓
"Open Floor Plan" button
  ↓
MapViewer (Map View) with navigation
  ↓
(Future: Shopping list selection → auto-navigate)
```

## DXF Upload Process

1. Admin selects DXF file
2. File uploaded via FormData to `/api/admin/shops/{id}/upload-dxf`
3. Backend parses DXF:
   - Extracts LINE entities (walls, boundaries)
   - Extracts POLYLINE entities (complex shapes)
   - Calculates bounds
   - Organizes by layers
4. Returns parsed map_data JSON
5. Frontend updates MapViewer with new layout

## Data Structure

### Shop Model Fields
- `map_data` (array): Parsed map with bounds and entities
- `aisle_names` (array): Custom aisle names
- `aisle_categories` (array): Category assignments per aisle
- `shelf_access_points` (array): Navigation waypoints

### MapViewer Events
- `aisle-renamed`: When admin renames an aisle
- `aisle-categories-updated`: When admin assigns categories
- `access-points-calculated`: When access points are generated
- `access-point-updated`: When admin moves an access point

## Future Integration: Shopping Lists

The structure is ready for shopping list integration:

1. User selects a shopping list
2. System extracts unique categories from list products
3. MapViewer auto-selects aisles containing those categories
4. Pathfinding creates optimal navigation route
5. User follows highlighted path through shop

### Placeholder Code (ShopViewModal.vue)
```vue
<!-- Shopping List Panel -->
<div v-if="currentView === 'map'" class="absolute top-4 right-4 ...">
  <select class="...">
    <option value="">Select Shopping List</option>
    <!-- Future: Map shopping lists -->
  </select>
</div>
```

## Testing Checklist

### Admin Side
- [ ] Navigate to /admin/shops
- [ ] Click "Edit Layout" for a shop
- [ ] Upload a DXF file
- [ ] Verify MapViewer displays the layout
- [ ] Right-click an aisle to rename it
- [ ] Assign categories to aisles
- [ ] Click "Save Changes"
- [ ] Verify changes persist

### User Side
- [ ] Navigate to /shops
- [ ] Click "View" on a shop
- [ ] Modal opens with shop info
- [ ] Click "Open Floor Plan"
- [ ] Verify MapViewer displays (if shop has layout)
- [ ] Test navigation features
- [ ] Close modal properly

## API Endpoints

### Admin
- `GET /admin/shops/{id}/layout` - Render layout editor page
- `POST /api/admin/shops/{id}/upload-dxf` - Upload and process DXF file
- `PUT /api/admin/shops/{id}` - Update shop (supports partial updates)

### Public
- `GET /api/shops/{id}` - Get shop details with map_data

## Notes

- DXF parser is basic - only handles LINE and POLYLINE entities
- Access points are auto-saved (no explicit save needed)
- Aisle names and categories require clicking "Save Changes"
- Modal uses Teleport for proper z-index layering
- Admin detection works with boolean/number/string types

## Next Steps

1. Test DXF upload with real files
2. Enhance DXF parser for more entity types (CIRCLE, ARC, etc.)
3. Implement shopping list CRUD
4. Build shopping list → category → aisle mapping
5. Implement pathfinding algorithm
6. Add real-time navigation guidance
