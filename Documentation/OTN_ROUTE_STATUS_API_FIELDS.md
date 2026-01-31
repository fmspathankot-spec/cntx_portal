# 📊 OTN Route Status - API Fields Documentation

## 🎯 **API Fields - Complete Reference**

---

## 📋 **Field List:**

```
1. region       → Region name
2. linkname     → Link/Route name
3. section      → Section/Area
4. begin_time   → When the issue started
5. report_time  → When it was reported
6. down_time    → Total downtime duration
```

---

## 📊 **Expected API Response Format:**

```json
[
  {
    "region": "North",
    "linkname": "Link-A-to-B",
    "section": "Section-1",
    "begin_time": "2024-01-30 10:00:00",
    "report_time": "2024-01-30 10:05:00",
    "down_time": "5 minutes"
  },
  {
    "region": "South",
    "linkname": "Link-C-to-D",
    "section": "Section-2",
    "begin_time": "2024-01-30 09:30:00",
    "report_time": "2024-01-30 09:35:00",
    "down_time": "30 minutes"
  }
]
```

---

## 🔍 **Field Details:**

### **1. region (String)**
```
Description: Region name where the link is located
Example: "North", "South", "East", "West"
Required: Yes
Display: Table column 1
Filter: Yes (dropdown)
```

### **2. linkname (String)**
```
Description: Name of the link/route
Example: "Link-A-to-B", "Route-Delhi-Mumbai"
Required: Yes
Display: Table column 2
Search: Yes
```

### **3. section (String)**
```
Description: Section or area of the link
Example: "Section-1", "Area-A", "Zone-North"
Required: Yes
Display: Table column 3
Filter: Yes (dropdown)
```

### **4. begin_time (String/DateTime)**
```
Description: When the issue/downtime started
Format: "YYYY-MM-DD HH:MM:SS" or any readable format
Example: "2024-01-30 10:00:00"
Required: Yes
Display: Table column 4 (with clock icon)
```

### **5. report_time (String/DateTime)**
```
Description: When the issue was reported
Format: "YYYY-MM-DD HH:MM:SS" or any readable format
Example: "2024-01-30 10:05:00"
Required: Yes
Display: Table column 5 (with clock icon)
```

### **6. down_time (String)**
```
Description: Total downtime duration
Format: Any readable format
Example: "5 minutes", "2 hours", "30 mins"
Required: Yes
Display: Table column 6 (with warning badge)
```

---

## 🎨 **UI Display:**

### **Table Columns:**

```
┌────┬──────────┬──────────────┬──────────┬─────────────┬──────────────┬───────────┐
│ #  │ Region   │ Link Name    │ Section  │ Begin Time  │ Report Time  │ Down Time │
├────┼──────────┼──────────────┼──────────┼─────────────┼──────────────┼───────────┤
│ 1  │ North    │ Link-A-to-B  │ Sec-1    │ 🕐 10:00   │ 🕐 10:05    │ ⚠️ 5 min  │
│ 2  │ South    │ Link-C-to-D  │ Sec-2    │ 🕐 09:30   │ 🕐 09:35    │ ⚠️ 30 min │
└────┴──────────┴──────────────┴──────────┴─────────────┴──────────────┴───────────┘
```

### **Icons Used:**

```
Region:      No icon
Link Name:   No icon (bold text)
Section:     No icon
Begin Time:  🕐 Clock icon (blue)
Report Time: 🕐 Clock icon (green)
Down Time:   ⚠️ Warning icon (red badge)
```

---

## 🔍 **Search & Filter:**

### **Search:**
```
Searches in:
✅ region
✅ linkname
✅ section
✅ begin_time
✅ report_time
✅ down_time

Example:
User types: "North"
→ Shows all routes with "North" in any field
```

### **Region Filter:**
```
Dropdown with unique regions:
- All Regions (default)
- North
- South
- East
- West
```

### **Section Filter:**
```
Dropdown with unique sections:
- All Sections (default)
- Section-1
- Section-2
- Area-A
- Zone-North
```

---

## 📤 **Export Formats:**

### **CSV Export:**
```csv
#,Region,Link Name,Section,Begin Time,Report Time,Down Time
1,North,Link-A-to-B,Section-1,2024-01-30 10:00:00,2024-01-30 10:05:00,5 minutes
2,South,Link-C-to-D,Section-2,2024-01-30 09:30:00,2024-01-30 09:35:00,30 minutes
```

### **PDF Export:**
```
Same columns as CSV
Landscape orientation
Auto-table format
Page numbers
Generated date
Total count
```

---

## 🧪 **Sample API Responses:**

### **Success Response:**
```json
[
  {
    "region": "North Region",
    "linkname": "Delhi-Chandigarh Link",
    "section": "NH-1 Section",
    "begin_time": "2024-01-30 10:00:00",
    "report_time": "2024-01-30 10:05:00",
    "down_time": "5 minutes"
  },
  {
    "region": "South Region",
    "linkname": "Chennai-Bangalore Link",
    "section": "NH-4 Section",
    "begin_time": "2024-01-30 09:30:00",
    "report_time": "2024-01-30 09:35:00",
    "down_time": "30 minutes"
  },
  {
    "region": "East Region",
    "linkname": "Kolkata-Bhubaneswar Link",
    "section": "NH-16 Section",
    "begin_time": "2024-01-30 08:00:00",
    "report_time": "2024-01-30 08:10:00",
    "down_time": "1 hour"
  }
]
```

### **Empty Response:**
```json
[]
```

### **Single Item Response:**
```json
{
  "region": "North",
  "linkname": "Link-A-to-B",
  "section": "Section-1",
  "begin_time": "2024-01-30 10:00:00",
  "report_time": "2024-01-30 10:05:00",
  "down_time": "5 minutes"
}
```
**Note:** Single item will be converted to array `[{...}]` automatically

---

## ✅ **Field Validation:**

### **Required Fields:**
```
All fields are required:
✅ region
✅ linkname
✅ section
✅ begin_time
✅ report_time
✅ down_time
```

### **Optional Fields:**
```
None - all fields are required
```

### **Fallback Values:**
```
If field is missing or null:
→ Display: "-"
→ Search: Skipped
→ Filter: Not included in dropdown
```

---

## 🎯 **Field Mapping in Code:**

### **Table Display:**
```javascript
<td>{route.region || '-'}</td>
<td>{route.linkname || '-'}</td>
<td>{route.section || '-'}</td>
<td>{route.begin_time || '-'}</td>
<td>{route.report_time || '-'}</td>
<td>{route.down_time || '-'}</td>
```

### **Search Fields:**
```javascript
const searchableFields = [
  route.region,
  route.linkname,
  route.section,
  route.begin_time,
  route.report_time,
  route.down_time
].filter(value => value);
```

### **Filter Dropdowns:**
```javascript
// Region filter
const regions = new Set();
allRoutes.forEach(route => {
  if (route.region) regions.add(route.region);
});

// Section filter
const sections = new Set();
allRoutes.forEach(route => {
  if (route.section) sections.add(route.section);
});
```

---

## 📊 **Data Types:**

```javascript
{
  region: String,       // Text
  linkname: String,     // Text
  section: String,      // Text
  begin_time: String,   // DateTime as string
  report_time: String,  // DateTime as string
  down_time: String     // Duration as string
}
```

---

## 🔧 **API Endpoint:**

```
URL: From OTN_ROUTE_STATUS environment variable
Method: GET
Response: JSON array
Content-Type: application/json
```

### **Example:**
```bash
# Request
curl http://your-api-url/api/otn-status

# Response
[
  {
    "region": "North",
    "linkname": "Link-A-to-B",
    "section": "Section-1",
    "begin_time": "2024-01-30 10:00:00",
    "report_time": "2024-01-30 10:05:00",
    "down_time": "5 minutes"
  }
]
```

---

## 🎨 **UI Components:**

### **Table Header:**
```
#  |  Region  |  Link Name  |  Section  |  Begin Time  |  Report Time  |  Down Time
```

### **Table Row:**
```
1  |  North   |  Link-A-B   |  Sec-1    |  🕐 10:00   |  🕐 10:05    |  ⚠️ 5 min
```

### **Filters:**
```
Search: [                    ]  🔍
Region: [All Regions ▼]
Section: [All Sections ▼]
[Clear]
```

---

## 📝 **Notes:**

### **Important:**
```
1. All fields are required
2. API must return JSON array
3. Single object will be converted to array
4. Empty array is valid (shows "No routes found")
5. Field names are case-sensitive
6. Use exact field names as documented
```

### **Best Practices:**
```
1. Use consistent date format
2. Use readable down_time format
3. Include all fields in response
4. Return empty array if no data
5. Use proper HTTP status codes
```

---

## 🧪 **Testing:**

### **Test API Response:**
```bash
# Test endpoint
curl http://localhost:3000/api/otn-route-status

# Expected response
[
  {
    "region": "North",
    "linkname": "Link-A-to-B",
    "section": "Section-1",
    "begin_time": "2024-01-30 10:00:00",
    "report_time": "2024-01-30 10:05:00",
    "down_time": "5 minutes"
  }
]
```

### **Test in Browser:**
```
1. Open: http://localhost:3000/otnroutestatus
2. Check table columns match field names
3. Test search with each field
4. Test region filter
5. Test section filter
6. Test CSV export
7. Test PDF export
```

---

## ✅ **Checklist:**

```
API Response:
☐ Returns JSON array
☐ All fields present
☐ Field names match exactly
☐ Data types correct
☐ No null values (use empty string)

UI Display:
☐ All columns show correctly
☐ Icons display properly
☐ Search works
☐ Region filter works
☐ Section filter works
☐ Pagination works
☐ Export works
```

---

**🎊 Perfect! Fields Updated! 🚀**

**Table Columns:**
```
1. # (Serial number)
2. Region
3. Link Name
4. Section
5. Begin Time (with clock icon)
6. Report Time (with clock icon)
7. Down Time (with warning badge)
```

**Filters:**
```
1. Search (all fields)
2. Region dropdown
3. Section dropdown
```

**Export:**
```
1. CSV (all fields)
2. PDF (all fields)
```

**Ab Test Karo! 🎉**
