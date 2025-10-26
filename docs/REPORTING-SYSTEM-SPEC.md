# Comprehensive Reporting System - Technical Specification

**Date**: October 25, 2025  
**Effort**: 17 hours (~2 days)  
**Priority**: CRITICAL for MVP  
**Status**: In Progress

---

## 🎯 Objective

Build a comprehensive reporting system that provides:
- Sales analytics for business decisions
- Tax reports for compliance
- Financial reports for accounting
- Customer insights for marketing
- Operational metrics for efficiency

---

## 📊 Report Types

### 1. Sales Reports
**Purpose**: Track revenue, transactions, and sales trends

**Reports**:
- Daily Sales Summary
- Weekly Sales Summary
- Monthly Sales Summary
- Year-to-Date (YTD) Sales
- Year-over-Year Comparison
- Sales by Service Type
- Sales by Payment Method
- Top Customers by Revenue

**Metrics**:
- Total sales
- Number of transactions
- Average transaction value
- Sales by service category
- Payment method breakdown
- Growth rates
- Trending analysis

**Filters**:
- Date range (custom, today, this week, this month, this year)
- Service type
- Payment method
- Customer
- Staff member

---

### 2. Tax Reports
**Purpose**: Tax compliance and filing

**Reports**:
- Monthly Tax Summary
- Quarterly Tax Summary
- Annual Tax Summary
- Taxable vs Non-Taxable Breakdown
- Tax by Service Type
- Tax Collection Report

**Metrics**:
- Total taxable sales
- Total non-taxable sales
- Tax collected
- Tax rate applied
- Tax by category
- Tax by location (if multi-location)

**Export Formats**:
- PDF (for filing)
- CSV (for accounting software)
- Excel (for analysis)

**Compliance Features**:
- Date range validation
- Audit trail
- Historical tax rates
- Tax jurisdiction support

---

### 3. Financial Reports
**Purpose**: Business financial health

**Reports**:
- Revenue Summary
- Profit & Loss (P&L)
- Outstanding Balances
- Payment Collection Report
- Refund Report
- Revenue by Service Line

**Metrics**:
- Total revenue
- Cost of goods sold (COGS)
- Gross profit
- Net profit
- Outstanding receivables
- Refunds issued
- Payment collection rate

**Time Periods**:
- Daily
- Weekly
- Monthly
- Quarterly
- Annual
- Custom range

---

### 4. Customer Reports
**Purpose**: Customer insights and marketing

**Reports**:
- Customer Acquisition Report
- Customer Retention Report
- Customer Lifetime Value (CLV)
- Customer Demographics
- Visit Frequency Analysis
- Inactive Customer Report
- Top Customers Report

**Metrics**:
- New customers
- Returning customers
- Customer churn rate
- Average customer value
- Visit frequency
- Customer segments
- Loyalty tier distribution

---

### 5. Operational Reports
**Purpose**: Business efficiency and capacity

**Reports**:
- Staff Performance Report
- Resource Utilization Report
- Booking Patterns Report
- Capacity Analysis Report
- Service Duration Report
- Peak Times Analysis

**Metrics**:
- Staff productivity
- Resource occupancy rate
- Booking lead time
- Capacity utilization
- Service completion time
- Peak hours/days
- Cancellation rates

---

## 🏗️ Technical Architecture

### Backend Structure

```
services/customer/src/
├── controllers/
│   └── reports.controller.ts       # Main reports controller
├── services/
│   ├── salesReportService.ts       # Sales report logic
│   ├── taxReportService.ts         # Tax report logic
│   ├── financialReportService.ts   # Financial report logic
│   ├── customerReportService.ts    # Customer report logic
│   └── operationalReportService.ts # Operational report logic
├── utils/
│   ├── reportGenerator.ts          # Report generation utilities
│   ├── pdfExporter.ts              # PDF export
│   └── csvExporter.ts              # CSV export
└── types/
    └── reports.types.ts            # TypeScript interfaces
```

### Frontend Structure

```
frontend/src/
├── pages/
│   └── reports/
│       ├── ReportsPage.tsx         # Main reports page
│       ├── SalesReports.tsx        # Sales reports tab
│       ├── TaxReports.tsx          # Tax reports tab
│       ├── FinancialReports.tsx    # Financial reports tab
│       ├── CustomerReports.tsx     # Customer reports tab
│       └── OperationalReports.tsx  # Operational reports tab
├── components/
│   └── reports/
│       ├── ReportFilters.tsx       # Date range & filter controls
│       ├── ReportTable.tsx         # Data table component
│       ├── ReportChart.tsx         # Chart visualization
│       ├── ExportButton.tsx        # Export functionality
│       └── ReportSummary.tsx       # Summary cards
└── services/
    └── reportService.ts            # API calls
```

---

## 🔌 API Endpoints

### Sales Reports
```
GET /api/reports/sales/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/sales/weekly?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/sales/monthly?year=YYYY&month=MM
GET /api/reports/sales/ytd?year=YYYY
GET /api/reports/sales/by-service?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/sales/by-payment-method?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/sales/top-customers?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=10
```

### Tax Reports
```
GET /api/reports/tax/monthly?year=YYYY&month=MM
GET /api/reports/tax/quarterly?year=YYYY&quarter=Q
GET /api/reports/tax/annual?year=YYYY
GET /api/reports/tax/breakdown?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Financial Reports
```
GET /api/reports/financial/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/financial/profit-loss?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/financial/outstanding-balances
GET /api/reports/financial/refunds?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Customer Reports
```
GET /api/reports/customers/acquisition?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/customers/retention?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/customers/lifetime-value?limit=100
GET /api/reports/customers/inactive?days=90
```

### Operational Reports
```
GET /api/reports/operations/staff-performance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/operations/resource-utilization?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/operations/booking-patterns?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/operations/capacity?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Export Endpoints
```
POST /api/reports/export/pdf
  Body: { reportType, filters, data }
  
POST /api/reports/export/csv
  Body: { reportType, filters, data }
  
POST /api/reports/export/excel
  Body: { reportType, filters, data }
```

---

## 📐 Data Models

### Report Response Interface
```typescript
interface ReportResponse {
  reportType: string;
  title: string;
  generatedAt: Date;
  filters: ReportFilters;
  summary: ReportSummary;
  data: ReportData[];
  metadata: ReportMetadata;
}

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  serviceType?: string;
  paymentMethod?: string;
  customerId?: string;
  staffId?: string;
}

interface ReportSummary {
  totalRevenue?: number;
  totalTransactions?: number;
  averageTransaction?: number;
  taxCollected?: number;
  [key: string]: any;
}

interface ReportData {
  date?: string;
  category?: string;
  value: number;
  count?: number;
  percentage?: number;
  [key: string]: any;
}

interface ReportMetadata {
  totalRecords: number;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
}
```

### Sales Report Data
```typescript
interface SalesReportData {
  date: string;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  serviceBreakdown: ServiceSales[];
  paymentMethodBreakdown: PaymentMethodSales[];
}

interface ServiceSales {
  serviceName: string;
  serviceType: string;
  revenue: number;
  count: number;
  percentage: number;
}

interface PaymentMethodSales {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}
```

### Tax Report Data
```typescript
interface TaxReportData {
  period: string; // "2025-10", "2025-Q4", "2025"
  taxableRevenue: number;
  nonTaxableRevenue: number;
  taxRate: number;
  taxCollected: number;
  breakdown: TaxBreakdown[];
}

interface TaxBreakdown {
  category: string;
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
}
```

---

## 🎨 UI Components

### Report Filters Component
```typescript
interface ReportFiltersProps {
  onFilterChange: (filters: ReportFilters) => void;
  availableFilters: string[]; // ['dateRange', 'serviceType', 'paymentMethod']
}

// Features:
// - Date range picker (preset ranges + custom)
// - Service type dropdown
// - Payment method dropdown
// - Customer search
// - Staff member dropdown
// - Apply/Reset buttons
```

### Report Table Component
```typescript
interface ReportTableProps {
  columns: ColumnDef[];
  data: any[];
  sortable?: boolean;
  pagination?: boolean;
  exportable?: boolean;
}

// Features:
// - Sortable columns
// - Pagination
// - Row highlighting
// - Totals row
// - Export button
```

### Report Chart Component
```typescript
interface ReportChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartData[];
  title: string;
  xAxis: string;
  yAxis: string;
}

// Uses: Chart.js or Recharts
```

---

## 📤 Export Functionality

### PDF Export
**Library**: `pdfkit` or `jspdf`

**Features**:
- Company logo/header
- Report title and date range
- Summary section
- Data table
- Charts/graphs
- Footer with page numbers

**Template**:
```
┌─────────────────────────────────────┐
│ [Logo]  Tailtown Pet Resort         │
│                                     │
│ Sales Report - October 2025         │
│ Generated: Oct 25, 2025 6:30 PM    │
├─────────────────────────────────────┤
│ SUMMARY                             │
│ Total Revenue:      $12,450.00     │
│ Transactions:       156            │
│ Avg Transaction:    $79.81         │
├─────────────────────────────────────┤
│ DETAILS                             │
│ [Data Table]                        │
│ [Charts]                            │
└─────────────────────────────────────┘
```

### CSV Export
**Format**: Standard CSV with headers

```csv
Date,Service,Revenue,Transactions,Avg Transaction
2025-10-01,Boarding,$1250.00,15,$83.33
2025-10-02,Grooming,$890.00,12,$74.17
...
```

### Excel Export
**Library**: `exceljs` or `xlsx`

**Features**:
- Multiple sheets (Summary, Details, Charts)
- Formatted cells
- Formulas
- Charts

---

## 🔍 Query Optimization

### Database Indexes
```sql
-- Invoice queries
CREATE INDEX idx_invoices_issue_date ON invoices(tenantId, issueDate);
CREATE INDEX idx_invoices_status_date ON invoices(tenantId, status, issueDate);

-- Payment queries
CREATE INDEX idx_payments_date ON payments(tenantId, paymentDate);
CREATE INDEX idx_payments_method ON payments(tenantId, method, paymentDate);

-- Reservation queries
CREATE INDEX idx_reservations_dates ON reservations(tenantId, startDate, endDate);
CREATE INDEX idx_reservations_service ON reservations(tenantId, serviceId, startDate);
```

### Caching Strategy
```typescript
// Cache report results for 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache key format: report:{type}:{filters}:{date}
const cacheKey = `report:sales:daily:2025-10-25`;
```

---

## ✅ Implementation Checklist

### Phase 1: Backend (8 hours)
- [ ] Create report types and interfaces
- [ ] Implement sales report service
- [ ] Implement tax report service
- [ ] Implement financial report service
- [ ] Create report controller
- [ ] Add API endpoints
- [ ] Add database indexes
- [ ] Write unit tests

### Phase 2: Frontend (6 hours)
- [ ] Create reports page layout
- [ ] Build filter components
- [ ] Build table components
- [ ] Build chart components
- [ ] Implement API integration
- [ ] Add loading states
- [ ] Add error handling

### Phase 3: Export (2 hours)
- [ ] Implement PDF export
- [ ] Implement CSV export
- [ ] Add export buttons
- [ ] Test exports

### Phase 4: Testing (1 hour)
- [ ] Test all report types
- [ ] Test filters
- [ ] Test exports
- [ ] Test with real data
- [ ] Performance testing

**Total**: 17 hours

---

## 🎯 Success Metrics

### Functionality
- ✅ All 5 report categories working
- ✅ Filters apply correctly
- ✅ Data accuracy verified
- ✅ Exports generate properly

### Performance
- ✅ Reports load in < 2 seconds
- ✅ Exports generate in < 5 seconds
- ✅ No UI blocking

### Usability
- ✅ Intuitive interface
- ✅ Clear data presentation
- ✅ Easy to export
- ✅ Mobile responsive

---

## 📚 Dependencies

### Backend
```json
{
  "pdfkit": "^0.13.0",
  "csv-writer": "^1.6.0",
  "exceljs": "^4.3.0"
}
```

### Frontend
```json
{
  "recharts": "^2.5.0",
  "date-fns": "^2.29.3",
  "react-datepicker": "^4.10.0"
}
```

---

## 🚀 Next Steps

1. **Start with Sales Reports** (highest value)
2. **Add Tax Reports** (compliance requirement)
3. **Build Financial Reports** (business need)
4. **Add Export Functionality** (critical feature)
5. **Test Everything** (quality assurance)

---

**Let's build this! Starting with the backend...**

