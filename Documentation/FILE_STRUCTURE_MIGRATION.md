# 🗂️ File Structure Migration Plan

## 🎯 **Goal: Standardize folder names to kebab-case**

---

## 📊 **Current vs Proposed Structure:**

### **Folders to Rename:**

| Current Name | New Name | Status |
|-------------|----------|--------|
| `MAANPING` | `maan-ping` | ⏳ To Rename |
| `OTNALLSERVICESDETAIL` | `otn-all-services-detail` | ⏳ To Rename |
| `otnroutestatus` | `otn-route-status` | ⏳ To Rename |
| `cpanlinkdetail` | `cpan-link-detail` | ⏳ To Rename |
| `cpanlinkstatus` | `cpan-link-status` | ⏳ To Rename |
| `otn-route-details` | `otn-route-details` | ✅ Already Correct |
| `otn-port-status` | `otn-port-status` | ✅ Already Correct |
| `otn-service-failure-details` | `otn-service-failure-details` | ✅ Already Correct |
| `project-topology` | `project-topology` | ✅ Already Correct |

---

## 🔧 **Migration Steps:**

### **Step 1: MAANPING → maan-ping**

**Files to Update:**
```
1. Rename folder: app/MAANPING → app/maan-ping
2. Update imports in other files (if any)
3. Update navigation links
4. Update API routes (if any)
```

**Route Change:**
```
Before: /MAANPING
After:  /maan-ping
```

---

### **Step 2: OTNALLSERVICESDETAIL → otn-all-services-detail**

**Files to Update:**
```
1. Rename folder: app/OTNALLSERVICESDETAIL → app/otn-all-services-detail
2. Update imports
3. Update navigation links
4. Update API routes
```

**Route Change:**
```
Before: /OTNALLSERVICESDETAIL
After:  /otn-all-services-detail
```

---

### **Step 3: otnroutestatus → otn-route-status**

**Files to Update:**
```
1. Rename folder: app/otnroutestatus → app/otn-route-status
2. Update imports in:
   - app/hooks/useOtnRouteStatus.js
   - Navigation components
   - Any other references
3. Update API route: app/api/otn-route-status/route.js
4. Update navigation links
```

**Route Change:**
```
Before: /otnroutestatus
After:  /otn-route-status
```

**API Route Change:**
```
Before: /api/otn-route-status (already correct)
After:  /api/otn-route-status (no change needed)
```

---

### **Step 4: cpanlinkdetail → cpan-link-detail**

**Files to Update:**
```
1. Rename folder: app/cpanlinkdetail → app/cpan-link-detail
2. Update imports
3. Update navigation links
4. Update API routes
```

**Route Change:**
```
Before: /cpanlinkdetail
After:  /cpan-link-detail
```

---

### **Step 5: cpanlinkstatus → cpan-link-status**

**Files to Update:**
```
1. Rename folder: app/cpanlinkstatus → app/cpan-link-status
2. Update imports
3. Update navigation links
4. Update API routes
```

**Route Change:**
```
Before: /cpanlinkstatus
After:  /cpan-link-status
```

---

## 📝 **Files That Need Updates:**

### **1. Navigation Components:**
```
Check these files for route references:
- app/components/Sidebar.js (if exists)
- app/components/Navigation.js (if exists)
- app/layout.js
- app/layout-network.js
```

### **2. API Routes:**
```
Check these folders:
- app/api/otn-route-status/
- app/api/otn-route-detail/
- Any other API routes
```

### **3. Hooks:**
```
- app/hooks/useOtnRouteStatus.js
- app/hooks/useOtnRoutes.js
- Any other hooks
```

---

## 🚨 **Important Notes:**

### **Breaking Changes:**
```
⚠️ URL routes will change
⚠️ Bookmarks will break
⚠️ External links will break
⚠️ Need to update documentation
```

### **Non-Breaking:**
```
✅ API routes already use kebab-case
✅ Internal logic unchanged
✅ Data structure unchanged
```

---

## 🧪 **Testing Checklist:**

After each rename:
```
1. ✅ Build succeeds: npm run build
2. ✅ Page loads: http://localhost:3000/[new-route]
3. ✅ Navigation works
4. ✅ API calls work
5. ✅ No console errors
6. ✅ Data displays correctly
```

---

## 📋 **Migration Order:**

### **Phase 1: Simple Renames (No Dependencies)**
```
1. MAANPING → maan-ping
2. OTNALLSERVICESDETAIL → otn-all-services-detail
3. cpanlinkdetail → cpan-link-detail
4. cpanlinkstatus → cpan-link-status
```

### **Phase 2: Complex Rename (Has Dependencies)**
```
5. otnroutestatus → otn-route-status
   - Update hooks
   - Update API references
   - Update navigation
```

---

## 🔄 **Git Strategy:**

### **Option 1: One Commit Per Rename (Recommended)**
```bash
# Rename 1
git mv app/MAANPING app/maan-ping
git commit -m "Rename MAANPING to maan-ping"

# Rename 2
git mv app/OTNALLSERVICESDETAIL app/otn-all-services-detail
git commit -m "Rename OTNALLSERVICESDETAIL to otn-all-services-detail"

# ... and so on
```

### **Option 2: All at Once**
```bash
# Rename all folders
git mv app/MAANPING app/maan-ping
git mv app/OTNALLSERVICESDETAIL app/otn-all-services-detail
git mv app/otnroutestatus app/otn-route-status
git mv app/cpanlinkdetail app/cpan-link-detail
git mv app/cpanlinkstatus app/cpan-link-status

# Update all references
# ... update files ...

# Commit all changes
git commit -m "Standardize folder structure to kebab-case"
```

---

## 🎯 **Recommended Approach:**

### **Use GitHub API (Automated)**
```
1. Create new folders with correct names
2. Copy files to new folders
3. Update references
4. Delete old folders
5. Test thoroughly
6. Commit changes
```

---

## 📊 **Impact Analysis:**

### **Low Impact (Safe to Rename):**
```
✅ MAANPING
✅ OTNALLSERVICESDETAIL
✅ cpanlinkdetail
✅ cpanlinkstatus
```

### **Medium Impact (Has References):**
```
⚠️ otnroutestatus
   - Used in hooks
   - Used in API routes
   - Used in navigation
```

---

## 🚀 **Execution Plan:**

### **Step-by-Step:**
```
1. Check navigation/sidebar for route references
2. Rename folders one by one
3. Update references after each rename
4. Test after each rename
5. Commit after each successful rename
6. Final build test
7. Deploy
```

---

## 📝 **Post-Migration:**

### **Update Documentation:**
```
1. Update README.md
2. Update API documentation
3. Update user guides
4. Update deployment docs
```

### **Notify Users:**
```
1. Old URLs will not work
2. Update bookmarks
3. Update external links
```

---

## ✅ **Final Structure:**

```
app/
├── maan-ping/                          ✅ Renamed
├── otn-all-services-detail/            ✅ Renamed
├── otn-route-status/                   ✅ Renamed
├── cpan-link-detail/                   ✅ Renamed
├── cpan-link-status/                   ✅ Renamed
├── otn-route-details/                  ✅ Already correct
├── otn-port-status/                    ✅ Already correct
├── otn-service-failure-details/        ✅ Already correct
├── project-topology/                   ✅ Already correct
├── configuration/                      ✅ Already correct
├── dashboard/                          ✅ Already correct
├── contact/                            ✅ Already correct
├── services/                           ✅ Already correct
└── reports/                            ✅ Already correct
```

---

## 🎉 **Benefits:**

```
✅ Consistent naming convention
✅ Better readability
✅ Professional structure
✅ Easier to maintain
✅ SEO-friendly URLs
✅ Industry standard
```

---

**Ready to start migration? Let's do it systematically!** 🚀
