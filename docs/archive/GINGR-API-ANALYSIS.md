# Gingr API Analysis & Migration Strategy
**Date:** October 26, 2025  
**Status:** API is comprehensive - recommended approach

---

## 🎯 API Coverage Analysis

### ✅ **Excellent Coverage - All Core Data Available**

#### **Customers (Owners)**
- ✅ `GET /api/v1/owners` - Retrieve all owners with filtering
- ✅ `GET /api/v1/owner` - Get specific owner by ID, phone, or email
- ✅ `POST /api/v1/new_modified_owners` - Get recently created/modified owners
- ✅ Custom field search available

#### **Pets (Animals)**
- ✅ `GET /api/v1/animals` - Retrieve all animals with filtering
- ✅ `GET /api/v1/get_animal_immunizations` - Get vaccination records
- ✅ `GET /api/v1/get_feeding_info` - Get feeding information
- ✅ `GET /api/v1/get_medication_info` - Get medication information

#### **Reservations**
- ✅ `POST /api/v1/reservations` - Get reservations by date range (30-day max)
- ✅ `GET /api/v1/reservations_by_animal` - Get pet's reservation history
- ✅ `GET /api/v1/reservations_by_owner` - Get customer's reservation history
- ✅ `POST /api/v1/recently_cancelled_reservations` - Get cancelled reservations
- ✅ `GET /api/v1/reservation_types` - Get service types

#### **Financial Data**
- ✅ `GET /api/v1/list_invoices` - Get invoices (after Aug 1, 2019)
- ✅ `GET /api/v1/list_transactions` - Get transactions (before Aug 1, 2019)
- ✅ `POST /api/v1/transaction` - Get transaction details
- ✅ `GET /api/v1/existing_reservation_estimate` - Get pricing

#### **Reference Data**
- ✅ `GET /api/v1/get_locations` - Locations
- ✅ `GET /api/v1/get_species` - Species list
- ✅ `GET /api/v1/get_breeds` - Breeds list
- ✅ `GET /api/v1/get_vets` - Veterinarians
- ✅ `GET /api/v1/get_temperaments` - Temperaments
- ✅ `GET /api/v1/get_immunization_types` - Vaccination types
- ✅ `GET /api/v1/get_all_retail_items` - Products

#### **Subscriptions**
- ✅ `GET /api/v1/get_subscriptions` - Recurring services

---

## 🚀 Revised Recommendation: **Hybrid Approach**

### **Best Strategy: API + CSV Fallback**

**Why This is Now the Best Approach:**

1. ✅ **API is comprehensive** - Covers all core data
2. ✅ **Official supported method** - Less likely to break
3. ✅ **Real-time data** - Always current
4. ✅ **Validated data** - Cleaner than exports
5. ✅ **Can build CSV tool as backup** - For non-Gingr clients

---

## ⚠️ API Limitations to Handle

### **1. Date Range Limit: 30 Days**
**Issue:** Reservations API limited to 30-day windows  
**Solution:** Loop through 30-day chunks for historical data

```typescript
// Fetch all historical reservations
async function fetchAllReservations(startDate: Date, endDate: Date) {
  const reservations = [];
  let currentStart = startDate;
  
  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 29); // 30-day chunks
    
    const chunk = await fetchReservations(currentStart, currentEnd);
    reservations.push(...chunk);
    
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  
  return reservations;
}
```

### **2. Location-Specific Data**
**Issue:** Some endpoints filter by location  
**Solution:** Fetch from all locations and merge

### **3. Pagination**
**Issue:** Large datasets may need pagination  
**Solution:** Use `per_page` and `page` parameters where available

### **4. Rate Limiting**
**Issue:** Not documented, but likely exists  
**Solution:** 
- Add delays between requests (100-200ms)
- Implement exponential backoff on errors
- Process in batches

---

## 📋 Migration Implementation Plan

### **Phase 1: Gingr API Integration (12-15 hours)**

#### **Step 1: API Client Setup (2 hours)**
```typescript
// File: services/customer/src/services/gingr-api.service.ts

class GingrApiClient {
  private baseUrl: string;
  private apiKey: string;
  
  constructor(subdomain: string, apiKey: string) {
    this.baseUrl = `https://${subdomain}.gingrapp.com/api/v1`;
    this.apiKey = apiKey;
  }
  
  // Rate limiting
  private async rateLimit() {
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  // Generic GET request
  private async get(endpoint: string, params: any = {}) {
    await this.rateLimit();
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append('key', this.apiKey);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url.toString());
    return response.json();
  }
  
  // Generic POST request
  private async post(endpoint: string, data: any = {}) {
    await this.rateLimit();
    const formData = new URLSearchParams();
    formData.append('key', this.apiKey);
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });
    
    return response.json();
  }
}
```

#### **Step 2: Data Fetchers (4 hours)**
```typescript
// Fetch all owners
async fetchAllOwners(): Promise<GingrOwner[]> {
  return this.get('/owners');
}

// Fetch all animals
async fetchAllAnimals(): Promise<GingrAnimal[]> {
  return this.get('/animals');
}

// Fetch reservations in 30-day chunks
async fetchAllReservations(startDate: Date, endDate: Date): Promise<GingrReservation[]> {
  const reservations = [];
  let currentStart = startDate;
  
  while (currentStart < endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 29);
    
    const chunk = await this.post('/reservations', {
      start_date: formatDate(currentStart),
      end_date: formatDate(Math.min(currentEnd, endDate))
    });
    
    reservations.push(...chunk.data);
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  
  return reservations;
}

// Fetch invoices
async fetchAllInvoices(fromDate: Date, toDate: Date): Promise<GingrInvoice[]> {
  return this.get('/list_invoices', {
    from_date: formatDate(fromDate),
    to_date: formatDate(toDate),
    complete: true
  });
}
```

#### **Step 3: Data Transformation (3 hours)**
```typescript
// Transform Gingr owner to Tailtown customer
function transformOwner(gingrOwner: GingrOwner): Customer {
  return {
    firstName: gingrOwner.first_name,
    lastName: gingrOwner.last_name,
    email: gingrOwner.email,
    phone: gingrOwner.cell_phone || gingrOwner.home_phone,
    address: gingrOwner.address,
    city: gingrOwner.city,
    state: gingrOwner.state,
    zipCode: gingrOwner.zip,
    emergencyContactName: gingrOwner.emergency_contact_name,
    emergencyContactPhone: gingrOwner.emergency_contact_phone,
    notes: gingrOwner.notes,
    // Store Gingr ID for reference
    externalId: gingrOwner.system_id
  };
}

// Transform Gingr animal to Tailtown pet
function transformAnimal(gingrAnimal: GingrAnimal): Pet {
  return {
    name: gingrAnimal.name,
    species: gingrAnimal.species,
    breed: gingrAnimal.breed,
    color: gingrAnimal.color,
    gender: gingrAnimal.gender,
    birthDate: new Date(gingrAnimal.birthday * 1000), // Unix timestamp
    weight: gingrAnimal.weight,
    microchipNumber: gingrAnimal.microchip,
    veterinarianName: gingrAnimal.vet_name,
    veterinarianPhone: gingrAnimal.vet_phone,
    medications: gingrAnimal.medications,
    allergies: gingrAnimal.allergies,
    specialNeeds: gingrAnimal.special_needs,
    notes: gingrAnimal.notes,
    externalId: gingrAnimal.id
  };
}
```

#### **Step 4: Migration Controller (3 hours)**
```typescript
// File: services/customer/src/controllers/migration.controller.ts

export const migrateFromGingr = async (req: Request, res: Response) => {
  const { subdomain, apiKey, startDate, endDate } = req.body;
  
  try {
    const gingr = new GingrApiClient(subdomain, apiKey);
    const progress = {
      total: 0,
      completed: 0,
      errors: []
    };
    
    // Step 1: Fetch all data
    console.log('Fetching owners...');
    const owners = await gingr.fetchAllOwners();
    progress.total += owners.length;
    
    console.log('Fetching animals...');
    const animals = await gingr.fetchAllAnimals();
    progress.total += animals.length;
    
    console.log('Fetching reservations...');
    const reservations = await gingr.fetchAllReservations(
      new Date(startDate),
      new Date(endDate)
    );
    progress.total += reservations.length;
    
    // Step 2: Import owners
    for (const owner of owners) {
      try {
        const customer = transformOwner(owner);
        await prisma.customer.create({ data: customer });
        progress.completed++;
      } catch (error) {
        progress.errors.push({
          type: 'owner',
          id: owner.system_id,
          error: error.message
        });
      }
    }
    
    // Step 3: Import animals (linked to owners)
    for (const animal of animals) {
      try {
        const pet = transformAnimal(animal);
        // Find customer by externalId
        const customer = await prisma.customer.findFirst({
          where: { externalId: animal.owner_id }
        });
        
        if (customer) {
          await prisma.pet.create({
            data: { ...pet, customerId: customer.id }
          });
          progress.completed++;
        }
      } catch (error) {
        progress.errors.push({
          type: 'animal',
          id: animal.id,
          error: error.message
        });
      }
    }
    
    // Step 4: Import reservations
    // ... similar pattern
    
    res.json({
      success: true,
      progress
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

#### **Step 5: Progress Tracking UI (2 hours)**
```typescript
// File: frontend/src/pages/admin/GingrMigration.tsx

Features:
- Input for Gingr subdomain and API key
- Date range selector
- "Start Migration" button
- Real-time progress bar
- Error log display
- Success/failure summary
```

---

### **Phase 2: CSV Fallback Tool (16 hours)**
Build the universal CSV tool as planned for:
- Non-Gingr clients
- Backup if API fails
- Custom data imports

---

## ⏱️ Timeline Comparison

### **Option A: API First (Recommended)**
- Week 1: Build Gingr API integration (12-15 hours)
- Week 2: Test with real Gingr account (4 hours)
- Week 3: Perform migration (4 hours)
- Week 4: Build CSV tool as backup (16 hours)
- **Total: 36-39 hours (~5 weeks)**

### **Option B: CSV First**
- Week 1: Build CSV tool (16 hours)
- Week 2: Test with Gingr exports (4 hours)
- Week 3: Perform migration (8 hours)
- **Total: 28 hours (~3.5 weeks)**

---

## 💡 Final Recommendation

### **Build Both: API First, Then CSV**

**Rationale:**
1. ✅ **API for Gingr clients** - Faster, cleaner, official
2. ✅ **CSV for everyone else** - Universal solution
3. ✅ **Best of both worlds** - Competitive advantage

**Priority Order:**
1. **Week 1-2:** Gingr API integration (immediate need)
2. **Week 3:** Test and migrate first Gingr client
3. **Week 4-5:** Build CSV tool (future clients)

---

## 🔑 Required Information

To start Gingr API migration, you need:
1. **Gingr Subdomain** - e.g., "yourcompany" from yourcompany.gingrapp.com
2. **API Key** - User-specific API key from Gingr
3. **Date Range** - How far back to import reservations
4. **Location IDs** - If multi-location

---

## 📊 Migration Checklist

### **Pre-Migration**
- [ ] Get Gingr API credentials
- [ ] Test API access with sample calls
- [ ] Determine date range for historical data
- [ ] Backup Tailtown database
- [ ] Test with 10-20 sample records

### **Migration**
- [ ] Import reference data (species, breeds, locations)
- [ ] Import customers (owners)
- [ ] Import pets (animals) with relationships
- [ ] Import services (reservation types)
- [ ] Import reservations (in 30-day chunks)
- [ ] Import invoices
- [ ] Import subscriptions

### **Post-Migration**
- [ ] Verify record counts
- [ ] Test customer/pet relationships
- [ ] Verify reservation data
- [ ] Check financial totals
- [ ] Test search functionality

---

## 🎯 Next Steps

1. **Get Gingr API credentials** from client
2. **Start building API integration** (12-15 hours)
3. **Test with real data** (4 hours)
4. **Perform migration** (4 hours)
5. **Build CSV tool** as backup (16 hours)

**Total: 5 weeks to have both solutions ready**

---

**Last Updated:** October 26, 2025  
**Status:** API analysis complete - ready to build  
**Recommended:** Start with Gingr API integration
