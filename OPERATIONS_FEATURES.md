# Operations Features - ZimPharmHub

## Overview

Five powerful operations management features have been added to ZimPharmHub to help pharmacy managers streamline their business operations:

1. **Payroll System** - Manage staff payments and salary administration
2. **Shift Management** - Schedule and track staff availability
3. **Supplier Management** - Manage vendors and track orders
4. **Report Generator** - Generate sales, inventory, and staff reports
5. **SMS/Email Campaigns** - Marketing and customer communications

---

## 1. Payroll System

### Features
- Create and manage staff payroll records
- Track salary components (base, allowances, bonus, deductions, tax)
- Approval workflow (Pending → Approved → Paid)
- Multiple payment methods support
- Payroll history and audit trail

### Models
**Payroll** table fields:
- `id` - UUID primary key
- `staffId` - Reference to staff member
- `pharmacyId` - Reference to pharmacy
- `payPeriodStart/End` - Pay period dates
- `baseSalary` - Base monthly salary
- `allowances` - Housing, transport, etc.
- `bonus` - Performance bonus
- `deductions` - General deductions
- `taxDeduction` - Tax withheld
- `netSalary` - Final amount to pay
- `status` - Pending, Approved, Paid, Failed
- `paymentMethod` - Bank Transfer, Cash, Check, Mobile Money
- `paymentDate` - When it was paid

### API Endpoints

```
GET /api/operations/payroll
  - Get all payroll records
  - Query params: pharmacyId, staffId, status

POST /api/operations/payroll
  - Create new payroll record
  - Body: staffId, pharmacyId, payPeriodStart, payPeriodEnd, baseSalary, etc.

PUT /api/operations/payroll/:id/approve
  - Approve payroll record

PUT /api/operations/payroll/:id/pay
  - Mark payroll as paid (sets paymentDate)
```

### Example Request

```bash
curl -X POST http://localhost:5000/api/operations/payroll \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": "uuid-here",
    "pharmacyId": "uuid-here",
    "payPeriodStart": "2025-01-01",
    "payPeriodEnd": "2025-01-31",
    "baseSalary": 5000,
    "allowances": 500,
    "bonus": 200,
    "deductions": 100,
    "taxDeduction": 500,
    "paymentMethod": "Bank Transfer"
  }'
```

---

## 2. Shift Management

### Features
- Schedule staff shifts for any date
- Multiple shift types (Morning, Afternoon, Evening, Night, Full Day)
- Track shift status (Scheduled, Confirmed, Completed, Cancelled, No Show)
- View staff availability by date
- Edit and update shifts

### Models
**Shift** table fields:
- `id` - UUID primary key
- `pharmacyId` - Reference to pharmacy
- `staffId` - Reference to staff member
- `shiftName` - Name of shift (e.g., "Morning Shift")
- `date` - Shift date
- `startTime` - Start time (HH:MM)
- `endTime` - End time (HH:MM)
- `shiftType` - Morning, Afternoon, Evening, Night, Full Day
- `status` - Scheduled, Confirmed, Completed, Cancelled, No Show
- `notes` - Additional notes

### API Endpoints

```
GET /api/operations/shifts
  - Get all shifts
  - Query params: pharmacyId, date, status

POST /api/operations/shifts
  - Create new shift
  - Body: pharmacyId, staffId, shiftName, date, startTime, endTime, shiftType

PUT /api/operations/shifts/:id
  - Update shift status or details

GET /api/operations/shifts/availability/:date
  - Get all shifts for a specific date
```

### Example Request

```bash
curl -X POST http://localhost:5000/api/operations/shifts \
  -H "Content-Type: application/json" \
  -d '{
    "pharmacyId": "uuid-here",
    "staffId": "uuid-here",
    "shiftName": "Morning Shift",
    "date": "2025-01-10",
    "startTime": "08:00",
    "endTime": "16:00",
    "shiftType": "Morning"
  }'
```

---

## 3. Supplier Management

### Features
- Add and manage suppliers
- Track supplier contact info and ratings
- Create and monitor purchase orders
- Track order status from pending to delivered
- Manage invoices and payments
- Payment tracking

### Models

**Supplier** table fields:
- `id` - UUID primary key
- `pharmacyId` - Reference to pharmacy
- `name` - Supplier name
- `email` - Contact email
- `phone` - Contact phone
- `address`, `city`, `country` - Address details
- `contactPerson` - Primary contact
- `paymentTerms` - e.g., "Net 30"
- `status` - Active, Inactive, Suspended
- `rating` - Supplier rating (0-5)

**SupplierOrder** table fields:
- `id` - UUID primary key
- `supplierId` - Reference to supplier
- `pharmacyId` - Reference to pharmacy
- `orderNumber` - Auto-generated unique order ID
- `orderDate` - When order was placed
- `expectedDeliveryDate` - Expected arrival
- `actualDeliveryDate` - When it arrived
- `totalAmount` - Order total
- `status` - Pending, Confirmed, Shipped, Delivered, Cancelled
- `paymentStatus` - Unpaid, Partial, Paid

**Invoice** table fields:
- `id` - UUID primary key
- `orderIdId` - Reference to supplier order
- `pharmacyId` - Reference to pharmacy
- `invoiceNumber` - Auto-generated unique invoice ID
- `invoiceDate` - Invoice date
- `dueDate` - Payment due date
- `amount` - Invoice amount
- `tax` - Tax amount
- `totalAmount` - Total including tax
- `amountPaid` - Amount paid so far
- `status` - Draft, Sent, Paid, Overdue, Cancelled

### API Endpoints

```
GET /api/operations/suppliers
POST /api/operations/suppliers
PUT /api/operations/suppliers/:id

GET /api/operations/supplier-orders
POST /api/operations/supplier-orders
PUT /api/operations/supplier-orders/:id

GET /api/operations/invoices
POST /api/operations/invoices
PUT /api/operations/invoices/:id/payment
```

### Example Request - Create Supplier

```bash
curl -X POST http://localhost:5000/api/operations/suppliers \
  -H "Content-Type: application/json" \
  -d '{
    "pharmacyId": "uuid-here",
    "name": "ABC Pharmaceuticals",
    "email": "sales@abc-pharma.com",
    "phone": "+263712345678",
    "address": "123 Main Street",
    "city": "Harare",
    "country": "Zimbabwe",
    "contactPerson": "John Doe",
    "paymentTerms": "Net 30"
  }'
```

### Example Request - Create Order

```bash
curl -X POST http://localhost:5000/api/operations/supplier-orders \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "uuid-here",
    "pharmacyId": "uuid-here",
    "expectedDeliveryDate": "2025-01-20",
    "totalAmount": 15000
  }'
```

---

## 4. Report Generator

### Features
- Sales reports (jobs, applications, conversions)
- Staff reports (headcount, positions, status)
- Payroll reports (salaries, expenditure)
- Period-based filtering
- Summary statistics

### API Endpoints

```
GET /api/operations/reports/sales
  - Query params: pharmacyId, startDate, endDate
  - Returns: Daily job stats, applications, fills

GET /api/operations/reports/staff
  - Query params: pharmacyId
  - Returns: Staff list with positions and status

GET /api/operations/reports/payroll
  - Query params: pharmacyId, startDate, endDate
  - Returns: Payroll data with total expenditure
```

### Example Request - Sales Report

```bash
curl http://localhost:5000/api/operations/reports/sales \
  ?pharmacyId=uuid-here \
  &startDate=2025-01-01 \
  &endDate=2025-01-31
```

### Example Response

```json
[
  {
    "date": "2025-01-10",
    "totalJobs": 5,
    "filledJobs": 2,
    "uniqueApplicants": 8
  }
]
```

---

## 5. SMS/Email Campaigns

### Features
- Create email and SMS campaigns
- Schedule campaigns for future delivery
- Send immediately
- Target specific audiences
- Track open rates and click rates
- Campaign status tracking

### Models
**Campaign** table fields:
- `id` - UUID primary key
- `pharmacyId` - Reference to pharmacy
- `name` - Campaign name
- `description` - Campaign description
- `campaignType` - Email, SMS, or Both
- `subject` - Email subject (for email campaigns)
- `message` - Campaign message/content
- `targetAudience` - All Customers, Specific Group, Recent Buyers, Inactive Users
- `scheduledDate` - When to send
- `status` - Draft, Scheduled, Sent, Failed
- `totalRecipients` - Number of recipients
- `sentCount` - How many successfully sent
- `failedCount` - How many failed
- `openRate` - Email open rate percentage
- `clickRate` - Link click rate percentage

### API Endpoints

```
GET /api/operations/campaigns
  - Get all campaigns
  - Query params: pharmacyId, status

POST /api/operations/campaigns
  - Create new campaign

PUT /api/operations/campaigns/:id
  - Update campaign (only if status is Draft)

PUT /api/operations/campaigns/:id/schedule
  - Schedule campaign for later
  - Body: { scheduledDate: "2025-01-15" }

PUT /api/operations/campaigns/:id/send
  - Send campaign immediately
```

### Example Request - Create Campaign

```bash
curl -X POST http://localhost:5000/api/operations/campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "pharmacyId": "uuid-here",
    "name": "New Year Promotion",
    "description": "January sale announcement",
    "campaignType": "Email",
    "subject": "Special January Discount!",
    "message": "Join us for our New Year sale. Get 20% off all products!",
    "targetAudience": "All Customers",
    "totalRecipients": 500
  }'
```

### Example Request - Send Campaign

```bash
curl -X PUT http://localhost:5000/api/operations/campaigns/uuid-here/send
```

---

## Frontend Components

### Pages Created

1. **PayrollPage.js**
   - List all payroll records
   - Create new payroll
   - Approve and pay records
   - Filter by pharmacy, staff, status

2. **ShiftManagementPage.js**
   - Calendar-based shift scheduling
   - Create shifts by date
   - Update shift status
   - View daily availability

3. **SupplierManagementPage.js**
   - Two-tab interface (Suppliers & Orders)
   - Add new suppliers
   - Create and track orders
   - Manage invoices

4. **CampaignPage.js**
   - Create email/SMS campaigns
   - Draft and schedule campaigns
   - Send immediately
   - Track campaign performance

### Styling Files

Create corresponding CSS files:
- `client/src/styles/PayrollPage.css`
- `client/src/styles/ShiftManagementPage.css`
- `client/src/styles/SupplierManagementPage.css`
- `client/src/pages/CampaignPage.css`

Example CSS structure:

```css
.payroll-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-container {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

table thead {
  background: #f0f0f0;
}

table th, table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.approved {
  background: #cce5ff;
  color: #004085;
}

.status.paid {
  background: #d4edda;
  color: #155724;
}

.btn-primary {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #0056b3;
}
```

---

## Database Integration

### Models Registration

Update `config/database.js` to register all models:

```javascript
// In your sequelize setup, add:
const StaffMember = require('./models-sequelize/StaffMember')(sequelize);
const Payroll = require('./models-sequelize/Payroll')(sequelize);
const Shift = require('./models-sequelize/Shift')(sequelize);
const Supplier = require('./models-sequelize/Supplier')(sequelize);
const SupplierOrder = require('./models-sequelize/SupplierOrder')(sequelize);
const Invoice = require('./models-sequelize/Invoice')(sequelize);
const Campaign = require('./models-sequelize/Campaign')(sequelize);

// Associate models if needed:
// StaffMember.hasMany(Payroll);
// StaffMember.hasMany(Shift);
// etc.

module.exports = sequelize;
```

---

## Setup Instructions

### Step 1: Database Models
Models are already created:
- `/models-sequelize/StaffMember.js`
- `/models-sequelize/Payroll.js`
- `/models-sequelize/Shift.js`
- `/models-sequelize/Supplier.js`
- `/models-sequelize/SupplierOrder.js`
- `/models-sequelize/Invoice.js`
- `/models-sequelize/Campaign.js`

### Step 2: API Routes
Routes are created at `/routes/operations.js` and registered in `server.js`:
```javascript
app.use('/api/operations', require('./routes/operations'));
```

### Step 3: Frontend Pages
Add pages to your React app:
```javascript
// In App.js or router:
import PayrollPage from './pages/PayrollPage';
import ShiftManagementPage from './pages/ShiftManagementPage';
import SupplierManagementPage from './pages/SupplierManagementPage';
import CampaignPage from './pages/CampaignPage';

// Add routes:
<Route path="/operations/payroll" component={PayrollPage} />
<Route path="/operations/shifts" component={ShiftManagementPage} />
<Route path="/operations/suppliers" component={SupplierManagementPage} />
<Route path="/operations/campaigns" component={CampaignPage} />
```

### Step 4: Navigation
Add links to your navbar:
```javascript
<nav>
  <Link to="/operations/payroll">Payroll</Link>
  <Link to="/operations/shifts">Shifts</Link>
  <Link to="/operations/suppliers">Suppliers</Link>
  <Link to="/operations/campaigns">Campaigns</Link>
</nav>
```

---

## Next Steps

1. **Create CSS styling files** for each page component
2. **Register models** in your database configuration
3. **Add authentication/authorization** to restrict access by role
4. **Integrate payment providers** for payroll disbursement
5. **Set up email/SMS providers** (Twilio, SendGrid, etc.) for campaigns
6. **Add data validation** and error handling
7. **Create staff member management** page to link with payroll
8. **Set up scheduled tasks** for automatic campaign sending
9. **Add export/download** functionality for reports
10. **Implement dashboard** showing key metrics

---

## Testing

### Test Payroll Creation
```bash
curl -X POST http://localhost:5000/api/operations/payroll \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": "test-staff-1",
    "pharmacyId": "test-pharmacy-1",
    "payPeriodStart": "2025-01-01",
    "payPeriodEnd": "2025-01-31",
    "baseSalary": 5000,
    "allowances": 500,
    "deductions": 100,
    "taxDeduction": 500,
    "paymentMethod": "Bank Transfer"
  }'
```

### Test Shift Creation
```bash
curl -X POST http://localhost:5000/api/operations/shifts \
  -H "Content-Type: application/json" \
  -d '{
    "pharmacyId": "test-pharmacy-1",
    "staffId": "test-staff-1",
    "shiftName": "Morning Shift",
    "date": "2025-01-10",
    "startTime": "08:00",
    "endTime": "16:00",
    "shiftType": "Morning"
  }'
```

---

## Support

For issues or questions:
1. Check the API endpoint documentation above
2. Review the model definitions
3. Check the server logs
4. Verify database connectivity

---

**Last Updated**: January 9, 2025  
**Features Added**: 5  
**API Endpoints**: 20+  
**Database Models**: 7  
**Frontend Pages**: 4
