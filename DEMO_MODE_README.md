# Demo Mode - Sample Data Guide

This MSR Dashboard template works **immediately out of the box** without requiring any backend configuration!

## What Works in Demo Mode

All features work with realistic sample data:

### ✅ Main Dashboard (`index.html`)
- **10 Purchase Orders** totaling $28.3M
- **10 Shipments** (3 delivered, 5 in transit, 2 ready to ship)
- **KPI Cards** showing procurement and installation metrics
- **Charts** for PO status, shipment status, and discipline breakdown
- **Installation data** for 862 items across 5 disciplines

### ✅ GPS Tracker Map (`samsara-tracking.html`)
- **12 GPS Trackers** across the US
- 5 trackers "On Site" (Texas Panhandle)
- 7 trackers "In Transit" (Dallas, Tulsa, Houston, Denver, LA, Chicago, Austin)
- Interactive map with geofencing
- Filter and export capabilities

### ✅ Project Schedule (`project-schedule.html`)
- **14 Schedule Activities** from design through COD
- Milestones, critical path, and progress tracking
- Timeline visualization
- Category breakdown (Design, Procurement, Installation, Commissioning, Startup)

### ✅ Delivery Dates (`delivery-dates.html`)
- **10 Material Deliveries** with status tracking
- On Track, Early, At Risk, and Delivered statuses
- Calendar and list views
- Supplier and category filtering

### ✅ Gap Analysis (`gap-analysis.html`)
- Static analysis page (no data backend needed)
- Shows available features vs. missing data
- Recommendations and action items

### ⚠️ Material Tracking (`material-tracking.html`)
- Requires Supabase configuration to function
- Shows configuration instructions when not set up
- This is the only page that requires backend setup

## Sample Data Files

All sample data is located in `sample_data/`:

```
sample_data/
├── sample_tracker_locations.json    # GPS tracker demo data
├── sample_purchase_orders.json      # PO data (10 orders)
├── sample_shipments.json            # Shipment tracking (10 shipments)
├── sample_dashboard_metrics.json    # Dashboard KPIs
├── sample_project_schedule.json     # Schedule activities (14 items)
└── sample_delivery_dates.json       # Delivery tracking (10 items)
```

## How Fallback Works

Each page automatically detects if Supabase is configured:

1. **If Supabase is configured:** Loads live data from database
2. **If Supabase is NOT configured:** Falls back to sample JSON files
3. **Demo mode indicator:** Console shows "DEMO MODE: Using sample data"

## Upgrading to Live Mode

To switch from demo to live data:

1. **Configure Supabase:**
   - Update `supabase-config.js` with your project URL and anon key
   - Run database schemas in `supabase/` directory

2. **Sync Your Data:**
   ```bash
   # Sync PO and Shipment data
   python sync_po_shipment_data.py

   # Sync Project Schedule (optional)
   python sync_project_schedule.py

   # Sync Samsara GPS data (optional)
   python sync_samsara_data.py
   ```

3. **Pages will automatically switch to live mode** when they detect valid Supabase data

## Customizing Sample Data

To update sample data for your demo:

1. Edit the JSON files in `sample_data/`
2. Maintain the same JSON structure (field names and types)
3. Update values to match your project needs
4. No code changes required!

## Demo Data Highlights

### Purchase Orders
- Realistic equipment types (turbine, HRSG, switchgear, etc.)
- Various statuses (Finished Goods, In Transit, RTS, Not RTS)
- Major suppliers (Siemens, ABB, Emerson, etc.)
- Values ranging from $185K to $12.5M

### GPS Trackers
- Mix of on-site and in-transit equipment
- Real US city coordinates (Dallas, Houston, Denver, LA, Chicago)
- Realistic distance calculations from project site
- Recent timestamps for "live" feel

### Project Schedule
- 14 activities spanning engineering through startup
- Critical path identification
- Milestones clearly marked
- Realistic progress percentages (0-95%)
- Target COD: September 2026

### Delivery Dates
- Status variety (On Track, Early, At Risk, Delivered)
- Aligned with project schedule
- Realistic lead times
- Multiple material categories

## Benefits of Demo Mode

1. **Instant Evaluation** - See all features working immediately
2. **No Setup Required** - Perfect for demonstrations and testing
3. **Training Tool** - Use sample data to train team before go-live
4. **Template Reference** - Shows expected data structure
5. **Client Demos** - Present without exposing real project data

---

**Ready to customize?** Replace "Project X" with your project name and update the sample data files to match your needs!
