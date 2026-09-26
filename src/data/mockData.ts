import { Shop, DailySales, UdhaarRecord, Customer, InventoryItem, StaffActivity, AlertItem } from '../types';

export const INITIAL_SHOPS: Shop[] = [
  {
    id: 'shop-01',
    name: 'Sharma General Store',
    location: 'Kothrud, Pune',
    city: 'Pune',
    region: 'West',
    owner_contact: '+91 98220 14589',
    manager_name: 'Ramesh Sharma',
    status: 'At-Risk',
    status_reason: 'Revenue ↓18% vs prev week; Udhaar >30d ↑24%; 3 stockouts predicted',
    health_score: 48,
    health_reasons: [
      'Revenue down 18.2% vs previous 7-day average',
      'Overdue Udhaar (>30 days) increased by 24.1%',
      '3 high-velocity items below reorder threshold'
    ],
    store_size_sqft: 1450,
    daily_revenue: 26400,
    monthly_revenue: 214000,
    daily_profit: 2270,
    monthly_profit: 18420,
    profit_margin_pct: 8.6,
    udhaar_outstanding: 148500,
    stock_alert_count: 3,
    cash_variance_today: -1850,
    cash_expected_today: 12400,
    cash_actual_today: 10550,
    active_cashiers_count: 2,
    last_active: '2 mins ago'
  },
  {
    id: 'shop-02',
    name: 'Patel Mart',
    location: 'Andheri East, Mumbai',
    city: 'Mumbai',
    region: 'West',
    owner_contact: '+91 98200 88411',
    manager_name: 'Bhavesh Patel',
    status: 'At-Risk',
    status_reason: 'Profit margin compressed to 8.8%; cash variance -₹2,450',
    health_score: 54,
    health_reasons: [
      'Profit margin compressed to 8.8% (Target: 14%)',
      'Cash drawer shortage of -₹2,450 at end-of-shift',
      '4 items depleted below 2-day runway'
    ],
    store_size_sqft: 1600,
    daily_revenue: 31200,
    monthly_revenue: 242000,
    daily_profit: 2740,
    monthly_profit: 21180,
    profit_margin_pct: 8.8,
    udhaar_outstanding: 132000,
    stock_alert_count: 4,
    cash_variance_today: -2450,
    cash_expected_today: 14800,
    cash_actual_today: 12350,
    active_cashiers_count: 3,
    last_active: '5 mins ago'
  },
  {
    id: 'shop-03',
    name: 'Sai Kirana',
    location: 'Majiwada, Thane',
    city: 'Thane',
    region: 'West',
    owner_contact: '+91 98199 43210',
    manager_name: 'Santosh Shinde',
    status: 'At-Risk',
    status_reason: 'Chronic overdue udhaar (>60 days: ₹68,000); 3 consecutive days revenue dip',
    health_score: 52,
    health_reasons: [
      'High default risk: 52% of udhaar older than 45 days',
      'Revenue declined for 3 consecutive days',
      'Register cash variance of -₹1,600'
    ],
    store_size_sqft: 1100,
    daily_revenue: 28900,
    monthly_revenue: 226000,
    daily_profit: 2680,
    monthly_profit: 22040,
    profit_margin_pct: 9.7,
    udhaar_outstanding: 154000,
    stock_alert_count: 3,
    cash_variance_today: -1600,
    cash_expected_today: 11500,
    cash_actual_today: 9900,
    active_cashiers_count: 2,
    last_active: '12 mins ago'
  },
  {
    id: 'shop-04',
    name: 'Gupta Super Market',
    location: 'College Road, Nashik',
    city: 'Nashik',
    region: 'West',
    owner_contact: '+91 94222 71092',
    manager_name: 'Sunil Gupta',
    status: 'Watch',
    status_reason: 'Fast-selling edible oils reaching critical stockout runway (1.8 days)',
    health_score: 72,
    health_reasons: [
      'Inventory runway < 2 days for 2 fast-moving staples',
      'Daily footfall slightly down 4%'
    ],
    store_size_sqft: 1850,
    daily_revenue: 42100,
    monthly_revenue: 338000,
    daily_profit: 5470,
    monthly_profit: 43940,
    profit_margin_pct: 13.0,
    udhaar_outstanding: 78500,
    stock_alert_count: 2,
    cash_variance_today: -320,
    cash_expected_today: 16200,
    cash_actual_today: 15880,
    active_cashiers_count: 3,
    last_active: '1 min ago'
  },
  {
    id: 'shop-05',
    name: 'More Daily Needs',
    location: 'Dadar West, Mumbai',
    city: 'Mumbai',
    region: 'West',
    owner_contact: '+91 98205 19283',
    manager_name: 'Dattatray More',
    status: 'Watch',
    status_reason: 'Cash reconciliation discrepancies flagged twice this week',
    health_score: 74,
    health_reasons: [
      'Cash drawer discrepancy of -₹1,200',
      'Customer credit collection delayed by 6 days'
    ],
    store_size_sqft: 1300,
    daily_revenue: 46800,
    monthly_revenue: 374000,
    daily_profit: 6080,
    monthly_profit: 48620,
    profit_margin_pct: 13.0,
    udhaar_outstanding: 84200,
    stock_alert_count: 2,
    cash_variance_today: -1200,
    cash_expected_today: 18400,
    cash_actual_today: 17200,
    active_cashiers_count: 3,
    last_active: '3 mins ago'
  },
  {
    id: 'shop-06',
    name: 'Ganesh Stores',
    location: 'Paud Road, Pune',
    city: 'Pune',
    region: 'West',
    owner_contact: '+91 98230 45678',
    manager_name: 'Ganesh Jagtap',
    status: 'Healthy',
    status_reason: 'Exceptional +14% MoM profit growth and 97% on-time credit recovery',
    health_score: 96,
    health_reasons: [
      'Consistent revenue run rate (+14% MoM)',
      'Optimal inventory turnover of 4.2x',
      'Zero cash variance for 14 consecutive days'
    ],
    store_size_sqft: 2100,
    daily_revenue: 64500,
    monthly_revenue: 516000,
    daily_profit: 10960,
    monthly_profit: 87720,
    profit_margin_pct: 17.0,
    udhaar_outstanding: 46200,
    stock_alert_count: 0,
    cash_variance_today: +50,
    cash_expected_today: 22400,
    cash_actual_today: 22450,
    active_cashiers_count: 4,
    last_active: 'Just now'
  },
  {
    id: 'shop-07',
    name: 'Omkar Mart',
    location: 'Dharampeth, Nagpur',
    city: 'Nagpur',
    region: 'West',
    owner_contact: '+91 97640 12890',
    manager_name: 'Omkar Raut',
    status: 'Healthy',
    status_reason: 'Strong margins in spices & pulses, low credit default rate',
    health_score: 92,
    health_reasons: [
      'Healthy 16.2% margin on groceries',
      'Udhaar aging 92% under 15 days'
    ],
    store_size_sqft: 1500,
    daily_revenue: 38200,
    monthly_revenue: 305000,
    daily_profit: 6180,
    monthly_profit: 49410,
    profit_margin_pct: 16.2,
    udhaar_outstanding: 38900,
    stock_alert_count: 0,
    cash_variance_today: -60,
    cash_expected_today: 15200,
    cash_actual_today: 15140,
    active_cashiers_count: 2,
    last_active: '8 mins ago'
  },
  {
    id: 'shop-08',
    name: 'Krishna General Store',
    location: 'Sector 17, Vashi, Navi Mumbai',
    city: 'Mumbai',
    region: 'West',
    owner_contact: '+91 98211 98765',
    manager_name: 'Krishna Murthy',
    status: 'Healthy',
    status_reason: 'High UPI digital adoption (84%) and zero customer defaults',
    health_score: 94,
    health_reasons: [
      '84% digital UPI settlement',
      'Robust inventory safety stock buffer'
    ],
    store_size_sqft: 1750,
    daily_revenue: 52400,
    monthly_revenue: 419000,
    daily_profit: 8900,
    monthly_profit: 71230,
    profit_margin_pct: 17.0,
    udhaar_outstanding: 41500,
    stock_alert_count: 0,
    cash_variance_today: +120,
    cash_expected_today: 11000,
    cash_actual_today: 11120,
    active_cashiers_count: 3,
    last_active: '1 min ago'
  },
  {
    id: 'shop-09',
    name: 'Laxmi Provision Stores',
    location: 'Baner, Pune',
    city: 'Pune',
    region: 'West',
    owner_contact: '+91 98901 32411',
    manager_name: 'Nitin Deshmukh',
    status: 'Watch',
    status_reason: 'Atta & Sugar reorder thresholds breached; 1 low stock warning',
    health_score: 76,
    health_reasons: [
      '2 high velocity items near stockout',
      'Modest cash shortage of -₹480'
    ],
    store_size_sqft: 1200,
    daily_revenue: 37400,
    monthly_revenue: 299000,
    daily_profit: 5230,
    monthly_profit: 41860,
    profit_margin_pct: 14.0,
    udhaar_outstanding: 62400,
    stock_alert_count: 1,
    cash_variance_today: -480,
    cash_expected_today: 13500,
    cash_actual_today: 13020,
    active_cashiers_count: 2,
    last_active: '6 mins ago'
  },
  {
    id: 'shop-10',
    name: 'Shivaji Supermarket',
    location: 'Hadapsar, Pune',
    city: 'Pune',
    region: 'West',
    owner_contact: '+91 97632 88201',
    manager_name: 'Shivaji Kadam',
    status: 'Healthy',
    status_reason: 'High retail volume, robust local caterer accounts',
    health_score: 89,
    health_reasons: [
      'Steady daily sales volume',
      'Solid 15.5% blended margins'
    ],
    store_size_sqft: 1900,
    daily_revenue: 58900,
    monthly_revenue: 471000,
    daily_profit: 9130,
    monthly_profit: 73000,
    profit_margin_pct: 15.5,
    udhaar_outstanding: 58200,
    stock_alert_count: 1,
    cash_variance_today: -80,
    cash_expected_today: 20500,
    cash_actual_today: 20420,
    active_cashiers_count: 4,
    last_active: '4 mins ago'
  },
  {
    id: 'shop-11',
    name: 'Annapoorna Retail Mart',
    location: '100ft Road, Indiranagar, Bengaluru',
    city: 'Bengaluru',
    region: 'South',
    owner_contact: '+91 99801 88320',
    manager_name: 'Karthik Raman',
    status: 'Healthy',
    status_reason: 'Top grossing organic items mix, 18.2% margin',
    health_score: 98,
    health_reasons: [
      'Highest margin branch in network (18.2%)',
      '88% UPI adoption, near-zero cash variance'
    ],
    store_size_sqft: 2200,
    daily_revenue: 72400,
    monthly_revenue: 579000,
    daily_profit: 13170,
    monthly_profit: 105370,
    profit_margin_pct: 18.2,
    udhaar_outstanding: 34500,
    stock_alert_count: 0,
    cash_variance_today: +40,
    cash_expected_today: 12000,
    cash_actual_today: 12040,
    active_cashiers_count: 4,
    last_active: 'Just now'
  },
  {
    id: 'shop-12',
    name: 'Sri Venkateshwara Stores',
    location: '5th Block, Koramangala, Bengaluru',
    city: 'Bengaluru',
    region: 'South',
    owner_contact: '+91 98450 71234',
    manager_name: 'Gopal Reddy',
    status: 'Watch',
    status_reason: 'Dairy & fresh bakery runway depleted to 1.2 days',
    health_score: 75,
    health_reasons: [
      'Dairy stockout imminent within 30 hours',
      'Reorder PO pending vendor dispatch'
    ],
    store_size_sqft: 1400,
    daily_revenue: 49500,
    monthly_revenue: 396000,
    daily_profit: 7420,
    monthly_profit: 59400,
    profit_margin_pct: 15.0,
    udhaar_outstanding: 54000,
    stock_alert_count: 1,
    cash_variance_today: -180,
    cash_expected_today: 14200,
    cash_actual_today: 14020,
    active_cashiers_count: 3,
    last_active: '7 mins ago'
  },
  {
    id: 'shop-13',
    name: 'Balaji Supermart',
    location: '4th Block, Jayanagar, Bengaluru',
    city: 'Bengaluru',
    region: 'South',
    owner_contact: '+91 98455 66778',
    manager_name: 'Venkatesh Rao',
    status: 'Healthy',
    status_reason: 'Consistent grocery turnover, disciplined customer credit book',
    health_score: 91,
    health_reasons: [
      'Zero credit aging over 30 days',
      'Optimal inventory safety margins'
    ],
    store_size_sqft: 1650,
    daily_revenue: 44200,
    monthly_revenue: 353000,
    daily_profit: 7070,
    monthly_profit: 56480,
    profit_margin_pct: 16.0,
    udhaar_outstanding: 42100,
    stock_alert_count: 0,
    cash_variance_today: -90,
    cash_expected_today: 13800,
    cash_actual_today: 13710,
    active_cashiers_count: 3,
    last_active: '9 mins ago'
  },
  {
    id: 'shop-14',
    name: 'Aggarwal Departmental Store',
    location: 'Sector 9, Rohini, Delhi NCR',
    city: 'Delhi NCR',
    region: 'North',
    owner_contact: '+91 98110 56789',
    manager_name: 'Pradeep Aggarwal',
    status: 'Healthy',
    status_reason: 'High retail footfall, strong FMCG turnover',
    health_score: 93,
    health_reasons: [
      'Strong daily turnover',
      'Fast vendor turnaround cycle'
    ],
    store_size_sqft: 1800,
    daily_revenue: 53800,
    monthly_revenue: 430000,
    daily_profit: 8600,
    monthly_profit: 68800,
    profit_margin_pct: 16.0,
    udhaar_outstanding: 49800,
    stock_alert_count: 0,
    cash_variance_today: +70,
    cash_expected_today: 16500,
    cash_actual_today: 16570,
    active_cashiers_count: 3,
    last_active: '5 mins ago'
  },
  {
    id: 'shop-15',
    name: 'Gupta Brothers Mart',
    location: 'Sector 62, Noida, Delhi NCR',
    city: 'Delhi NCR',
    region: 'North',
    owner_contact: '+91 98712 34901',
    manager_name: 'Ashok Gupta',
    status: 'Watch',
    status_reason: 'Udhaar collection lagging; 1 critical low stock alert on cooking oil',
    health_score: 73,
    health_reasons: [
      'Customer credit aging bracket 31-60d elevated',
      'Cooking oil inventory below reorder point'
    ],
    store_size_sqft: 1550,
    daily_revenue: 39800,
    monthly_revenue: 318000,
    daily_profit: 4770,
    monthly_profit: 38160,
    profit_margin_pct: 12.0,
    udhaar_outstanding: 74200,
    stock_alert_count: 1,
    cash_variance_today: -650,
    cash_expected_today: 14500,
    cash_actual_today: 13850,
    active_cashiers_count: 2,
    last_active: '11 mins ago'
  }
];

// Helper to generate realistic 30-day sales history with intentional anomalies
export function generateDailySalesHistory(shops: Shop[]): DailySales[] {
  const records: DailySales[] = [];
  const today = new Date('2026-09-26');

  shops.forEach((shop) => {
    const baseDailyRev = Math.round(shop.monthly_revenue / 30);
    const baseMargin = shop.profit_margin_pct / 100;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.28 : 1.0;
      
      // Intentional trend/drop for At-Risk stores in the last 7 days
      let riskTrend = 1.0;
      if (shop.id === 'shop-01') { // Sharma General Store: revenue down 18.2%
        if (i <= 7) riskTrend = 0.818;
      } else if (shop.id === 'shop-02') { // Patel Mart
        if (i <= 7) riskTrend = 0.85;
      } else if (shop.id === 'shop-03') { // Sai Kirana: 3 consecutive days decline
        if (i <= 2) riskTrend = 0.76 - (2 - i) * 0.05;
      }

      const randomSeed = Math.sin(shop.id.charCodeAt(5) + i * 1.7) * 0.06;
      const dayFactor = (1 + randomSeed) * weekendFactor * riskTrend;

      const revenue = Math.round(baseDailyRev * dayFactor);
      const profit = Math.round(revenue * baseMargin * (0.96 + Math.cos(i) * 0.04));
      const transactionCount = Math.round(revenue / (240 + (i % 6) * 18));

      const digitalRatio = shop.city === 'Bengaluru' ? 0.82 : (shop.city === 'Mumbai' ? 0.76 : 0.65);
      const digitalSales = Math.round(revenue * digitalRatio);
      const cashSales = revenue - digitalSales;
      
      const expectedCash = cashSales;
      const cashVariance = (i === 0) ? shop.cash_variance_today : Math.round((Math.sin(i) * 150));
      const actualCash = expectedCash + cashVariance;

      records.push({
        shop_id: shop.id,
        date: dateStr,
        revenue,
        profit,
        transaction_count: transactionCount,
        cash_sales: cashSales,
        digital_sales: digitalSales,
        cash_expected: expectedCash,
        cash_actual: actualCash,
        cash_variance: cashVariance
      });
    }
  });

  return records;
}

export const INITIAL_DAILY_SALES: DailySales[] = generateDailySalesHistory(INITIAL_SHOPS);

// Multi-Shop Customers Directory with Khata Balances & Risk
export const INITIAL_CUSTOMERS: Customer[] = [
  // Sharma General Store Customers
  { id: 'cust-01', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Mahesh Shirole', phone: '+91 98223 91011', total_udhaar: 18400, credit_limit: 20000, days_outstanding: 47, risk_level: 'High', status: 'overdue', last_transaction_date: '2026-08-10', repayment_score: 42 },
  { id: 'cust-02', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Ramesh Traders (Caterer)', phone: '+91 98220 44211', total_udhaar: 42000, credit_limit: 45000, days_outstanding: 68, risk_level: 'Critical', status: 'blocked', last_transaction_date: '2026-07-20', repayment_score: 28 },
  { id: 'cust-03', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Deepak More', phone: '+91 97630 11920', total_udhaar: 24500, credit_limit: 30000, days_outstanding: 34, risk_level: 'High', status: 'overdue', last_transaction_date: '2026-08-23', repayment_score: 50 },
  { id: 'cust-04', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Dr. G. K. Apte', phone: '+91 94220 88200', total_udhaar: 12500, credit_limit: 25000, days_outstanding: 18, risk_level: 'Medium', status: 'active', last_transaction_date: '2026-09-08', repayment_score: 75 },
  { id: 'cust-05', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Sunita Joshi', phone: '+91 98900 77122', total_udhaar: 8400, credit_limit: 15000, days_outstanding: 6, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-20', repayment_score: 95 },

  // Patel Mart Customers
  { id: 'cust-06', shop_id: 'shop-02', shop_name: 'Patel Mart', name: 'Oasis Film Production Mess', phone: '+91 98201 12345', total_udhaar: 48000, credit_limit: 50000, days_outstanding: 58, risk_level: 'Critical', status: 'blocked', last_transaction_date: '2026-07-30', repayment_score: 35 },
  { id: 'cust-07', shop_id: 'shop-02', shop_name: 'Patel Mart', name: 'Bhavna Parekh', phone: '+91 98205 66710', total_udhaar: 22500, credit_limit: 25000, days_outstanding: 38, risk_level: 'High', status: 'overdue', last_transaction_date: '2026-08-19', repayment_score: 48 },
  { id: 'cust-08', shop_id: 'shop-02', shop_name: 'Patel Mart', name: 'Shabnam Khan', phone: '+91 98209 87654', total_udhaar: 16400, credit_limit: 20000, days_outstanding: 14, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-12', repayment_score: 88 },

  // Sai Kirana Customers
  { id: 'cust-09', shop_id: 'shop-03', shop_name: 'Sai Kirana', name: 'Chaudhary Builders Site Office', phone: '+91 98230 55432', total_udhaar: 58000, credit_limit: 50000, days_outstanding: 74, risk_level: 'Critical', status: 'blocked', last_transaction_date: '2026-07-14', repayment_score: 22 },
  { id: 'cust-10', shop_id: 'shop-03', shop_name: 'Sai Kirana', name: 'Kundan Tea & Canteen', phone: '+91 97621 99011', total_udhaar: 36500, credit_limit: 40000, days_outstanding: 62, risk_level: 'Critical', status: 'overdue', last_transaction_date: '2026-07-26', repayment_score: 38 },
  { id: 'cust-11', shop_id: 'shop-03', shop_name: 'Sai Kirana', name: 'Sanjay Thorat', phone: '+91 94231 66720', total_udhaar: 21400, credit_limit: 25000, days_outstanding: 28, risk_level: 'Medium', status: 'active', last_transaction_date: '2026-08-29', repayment_score: 65 },

  // Other Shops Customers (Healthy & Active)
  { id: 'cust-12', shop_id: 'shop-06', shop_name: 'Ganesh Stores', name: 'Sudhir Barve', phone: '+91 94220 11990', total_udhaar: 14200, credit_limit: 30000, days_outstanding: 11, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-15', repayment_score: 96 },
  { id: 'cust-13', shop_id: 'shop-06', shop_name: 'Ganesh Stores', name: 'Pratibha Rathi', phone: '+91 94225 33410', total_udhaar: 12500, credit_limit: 25000, days_outstanding: 7, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-19', repayment_score: 98 },
  { id: 'cust-14', shop_id: 'shop-11', shop_name: 'Annapoorna Retail Mart', name: 'Dr. Srinivas Murthy', phone: '+91 99805 11234', total_udhaar: 15400, credit_limit: 35000, days_outstanding: 5, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-21', repayment_score: 99 },
  { id: 'cust-15', shop_id: 'shop-12', shop_name: 'Sri Venkateshwara Stores', name: 'Rohan Hegde', phone: '+91 98451 99081', total_udhaar: 21000, credit_limit: 30000, days_outstanding: 22, risk_level: 'Medium', status: 'active', last_transaction_date: '2026-09-04', repayment_score: 82 },
  { id: 'cust-16', shop_id: 'shop-14', shop_name: 'Aggarwal Departmental Store', name: 'Harish Chawla', phone: '+91 98115 67890', total_udhaar: 26000, credit_limit: 40000, days_outstanding: 14, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-12', repayment_score: 94 }
];

// Udhaar Records
export const INITIAL_UDHAAR_RECORDS: UdhaarRecord[] = [
  { id: 'udh-01', shop_id: 'shop-01', customer_id: 'cust-01', customer_name: 'Mahesh Shirole', amount: 18400, date_given: '2026-08-10', days_outstanding: 47, phone: '+91 98223 91011', credit_limit: 20000, risk_category: '31-60d', risk_level: 'High' },
  { id: 'udh-02', shop_id: 'shop-01', customer_id: 'cust-02', customer_name: 'Ramesh Traders (Caterer)', amount: 42000, date_given: '2026-07-20', days_outstanding: 68, phone: '+91 98220 44211', credit_limit: 45000, risk_category: '60d+', risk_level: 'Critical' },
  { id: 'udh-03', shop_id: 'shop-01', customer_id: 'cust-03', customer_name: 'Deepak More', amount: 24500, date_given: '2026-08-23', days_outstanding: 34, phone: '+91 97630 11920', credit_limit: 30000, risk_category: '31-60d', risk_level: 'High' },
  { id: 'udh-04', shop_id: 'shop-01', customer_id: 'cust-04', customer_name: 'Dr. G. K. Apte', amount: 12500, date_given: '2026-09-08', days_outstanding: 18, phone: '+91 94220 88200', credit_limit: 25000, risk_category: '8-30d', risk_level: 'Medium' },
  { id: 'udh-05', shop_id: 'shop-01', customer_id: 'cust-05', customer_name: 'Sunita Joshi', amount: 8400, date_given: '2026-09-20', days_outstanding: 6, phone: '+91 98900 77122', credit_limit: 15000, risk_category: '0-7d', risk_level: 'Low' },

  { id: 'udh-06', shop_id: 'shop-02', customer_id: 'cust-06', customer_name: 'Oasis Film Production Mess', amount: 48000, date_given: '2026-07-30', days_outstanding: 58, phone: '+91 98201 12345', credit_limit: 50000, risk_category: '31-60d', risk_level: 'Critical' },
  { id: 'udh-07', shop_id: 'shop-02', customer_id: 'cust-07', customer_name: 'Bhavna Parekh', amount: 22500, date_given: '2026-08-19', days_outstanding: 38, phone: '+91 98205 66710', credit_limit: 25000, risk_category: '31-60d', risk_level: 'High' },
  { id: 'udh-08', shop_id: 'shop-02', customer_id: 'cust-08', customer_name: 'Shabnam Khan', amount: 16400, date_given: '2026-09-12', days_outstanding: 14, phone: '+91 98209 87654', credit_limit: 20000, risk_category: '8-30d', risk_level: 'Low' },

  { id: 'udh-09', shop_id: 'shop-03', customer_id: 'cust-09', customer_name: 'Chaudhary Builders Site Office', amount: 58000, date_given: '2026-07-14', days_outstanding: 74, phone: '+91 98230 55432', credit_limit: 50000, risk_category: '60d+', risk_level: 'Critical' },
  { id: 'udh-10', shop_id: 'shop-03', customer_id: 'cust-10', customer_name: 'Kundan Tea & Canteen', amount: 36500, date_given: '2026-07-26', days_outstanding: 62, phone: '+91 97621 99011', credit_limit: 40000, risk_category: '60d+', risk_level: 'Critical' },
  { id: 'udh-11', shop_id: 'shop-03', customer_id: 'cust-11', customer_name: 'Sanjay Thorat', amount: 21400, date_given: '2026-08-29', days_outstanding: 28, phone: '+91 94231 66720', credit_limit: 25000, risk_category: '8-30d', risk_level: 'Medium' },

  { id: 'udh-12', shop_id: 'shop-06', customer_id: 'cust-12', customer_name: 'Sudhir Barve', amount: 14200, date_given: '2026-09-15', days_outstanding: 11, phone: '+91 94220 11990', credit_limit: 30000, risk_category: '8-30d', risk_level: 'Low' },
  { id: 'udh-13', shop_id: 'shop-06', customer_id: 'cust-13', customer_name: 'Pratibha Rathi', amount: 12500, date_given: '2026-09-19', days_outstanding: 7, phone: '+91 94225 33410', credit_limit: 25000, risk_category: '0-7d', risk_level: 'Low' },
  { id: 'udh-14', shop_id: 'shop-11', customer_id: 'cust-14', customer_name: 'Dr. Srinivas Murthy', amount: 15400, date_given: '2026-09-21', days_outstanding: 5, phone: '+91 99805 11234', credit_limit: 35000, risk_category: '0-7d', risk_level: 'Low' },
  { id: 'udh-15', shop_id: 'shop-12', customer_id: 'cust-15', customer_name: 'Rohan Hegde', amount: 21000, date_given: '2026-09-04', days_outstanding: 22, phone: '+91 98451 99081', credit_limit: 30000, risk_category: '8-30d', risk_level: 'Medium' },
  { id: 'udh-16', shop_id: 'shop-14', customer_id: 'cust-16', customer_name: 'Harish Chawla', amount: 26000, date_given: '2026-09-12', days_outstanding: 14, phone: '+91 98115 67890', credit_limit: 40000, risk_category: '8-30d', risk_level: 'Low' }
];

// Predictive Stockout Inventory Items with Sales Velocity
export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // Sharma General Store (3 predicted stockouts)
  {
    id: 'inv-01',
    shop_id: 'shop-01',
    item_name: 'Amul Taaza Milk (1L Tetra)',
    category: 'Dairy & Fresh',
    current_stock: 9,
    reorder_threshold: 25,
    sales_velocity: 7.2, // units / day
    unit_price: 74,
    cost_price: 66,
    unit: 'packs',
    supplier: 'Amul Dairy Pune Distributor',
    last_restock_date: '2026-09-21',
    estimated_stockout_days: 1.3,
    estimated_stockout_date: 'Tomorrow, 5:00 PM',
    suggested_reorder_qty: 40
  },
  {
    id: 'inv-02',
    shop_id: 'shop-01',
    item_name: 'Fortune Sunlite Sunflower Oil (1L)',
    category: 'Edible Oils',
    current_stock: 12,
    reorder_threshold: 30,
    sales_velocity: 6.8,
    unit_price: 155,
    cost_price: 138,
    unit: 'pouches',
    supplier: 'Adani Wilmar West Agency',
    last_restock_date: '2026-09-18',
    estimated_stockout_days: 1.8,
    estimated_stockout_date: 'In 1.8 days',
    suggested_reorder_qty: 50
  },
  {
    id: 'inv-03',
    shop_id: 'shop-01',
    item_name: 'Aashirvaad Shudh Chakki Atta (10kg)',
    category: 'Staples & Grains',
    current_stock: 8,
    reorder_threshold: 20,
    sales_velocity: 4.5,
    unit_price: 460,
    cost_price: 410,
    unit: 'bags',
    supplier: 'ITC Wholesale Pune Hub',
    last_restock_date: '2026-09-19',
    estimated_stockout_days: 1.8,
    estimated_stockout_date: 'In 1.8 days',
    suggested_reorder_qty: 30
  },
  {
    id: 'inv-04',
    shop_id: 'shop-01',
    item_name: 'Tata Salt Vaccum Evaporated (1kg)',
    category: 'Staples & Grains',
    current_stock: 64,
    reorder_threshold: 25,
    sales_velocity: 8.5,
    unit_price: 28,
    cost_price: 23,
    unit: 'packs',
    supplier: 'Tata Consumer Wholesale',
    last_restock_date: '2026-09-24',
    estimated_stockout_days: 7.5,
    estimated_stockout_date: 'Safe (>7 days)',
    suggested_reorder_qty: 0
  },

  // Patel Mart (4 critical items)
  {
    id: 'inv-05',
    shop_id: 'shop-02',
    item_name: 'Fortune Sunlite Sunflower Oil (1L)',
    category: 'Edible Oils',
    current_stock: 8,
    reorder_threshold: 25,
    sales_velocity: 8.0,
    unit_price: 155,
    cost_price: 138,
    unit: 'pouches',
    supplier: 'Adani Wilmar Mumbai',
    last_restock_date: '2026-09-20',
    estimated_stockout_days: 1.0,
    estimated_stockout_date: 'Today, 8:00 PM',
    suggested_reorder_qty: 60
  },
  {
    id: 'inv-06',
    shop_id: 'shop-02',
    item_name: 'Madhur Pure Sugar (5kg)',
    category: 'Staples & Grains',
    current_stock: 5,
    reorder_threshold: 18,
    sales_velocity: 4.2,
    unit_price: 245,
    cost_price: 215,
    unit: 'bags',
    supplier: 'Renuka Sugars Agency',
    last_restock_date: '2026-09-17',
    estimated_stockout_days: 1.2,
    estimated_stockout_date: 'Tomorrow, 2:00 PM',
    suggested_reorder_qty: 25
  },
  {
    id: 'inv-07',
    shop_id: 'shop-02',
    item_name: 'Everest Turmeric Powder (500g)',
    category: 'Spices & Condiments',
    current_stock: 4,
    reorder_threshold: 12,
    sales_velocity: 3.0,
    unit_price: 145,
    cost_price: 120,
    unit: 'packs',
    supplier: 'Everest Spices Agency',
    last_restock_date: '2026-09-15',
    estimated_stockout_days: 1.3,
    estimated_stockout_date: 'Tomorrow, 4:00 PM',
    suggested_reorder_qty: 20
  },
  {
    id: 'inv-08',
    shop_id: 'shop-02',
    item_name: 'Dettol Original Soap (Pack of 4)',
    category: 'Personal Care',
    current_stock: 6,
    reorder_threshold: 15,
    sales_velocity: 3.8,
    unit_price: 185,
    cost_price: 155,
    unit: 'packs',
    supplier: 'Reckitt Mumbai Depot',
    last_restock_date: '2026-09-16',
    estimated_stockout_days: 1.6,
    estimated_stockout_date: 'In 1.6 days',
    suggested_reorder_qty: 25
  },

  // Sai Kirana (3 stockouts)
  {
    id: 'inv-09',
    shop_id: 'shop-03',
    item_name: 'Fortune Kachi Ghani Mustard Oil (1L)',
    category: 'Edible Oils',
    current_stock: 3,
    reorder_threshold: 20,
    sales_velocity: 5.5,
    unit_price: 165,
    cost_price: 145,
    unit: 'bottles',
    supplier: 'Adani Wilmar Thane',
    last_restock_date: '2026-09-17',
    estimated_stockout_days: 0.5,
    estimated_stockout_date: 'Today, 6:00 PM (Critical)',
    suggested_reorder_qty: 35
  },
  {
    id: 'inv-10',
    shop_id: 'shop-03',
    item_name: 'Tata Sampann Toor Dal (1kg)',
    category: 'Staples & Grains',
    current_stock: 5,
    reorder_threshold: 20,
    sales_velocity: 4.8,
    unit_price: 185,
    cost_price: 160,
    unit: 'packs',
    supplier: 'Tata Consumer Thane',
    last_restock_date: '2026-09-19',
    estimated_stockout_days: 1.0,
    estimated_stockout_date: 'Tomorrow, 11:00 AM',
    suggested_reorder_qty: 30
  },
  {
    id: 'inv-11',
    shop_id: 'shop-03',
    item_name: 'Amul Butter (500g)',
    category: 'Dairy & Fresh',
    current_stock: 4,
    reorder_threshold: 15,
    sales_velocity: 3.5,
    unit_price: 285,
    cost_price: 258,
    unit: 'packs',
    supplier: 'Amul Thane Dairy',
    last_restock_date: '2026-09-20',
    estimated_stockout_days: 1.1,
    estimated_stockout_date: 'Tomorrow, 1:00 PM',
    suggested_reorder_qty: 20
  },

  // Additional low stock items across other shops to total exactly 18 alerts
  {
    id: 'inv-12',
    shop_id: 'shop-04',
    item_name: 'Fortune Sunlite Sunflower Oil (1L)',
    category: 'Edible Oils',
    current_stock: 6,
    reorder_threshold: 25,
    sales_velocity: 4.8,
    unit_price: 155,
    cost_price: 138,
    unit: 'pouches',
    supplier: 'Adani Wilmar Nashik',
    last_restock_date: '2026-09-18',
    estimated_stockout_days: 1.25,
    estimated_stockout_date: 'Tomorrow, 3:00 PM',
    suggested_reorder_qty: 35
  },
  {
    id: 'inv-13',
    shop_id: 'shop-04',
    item_name: 'Gemini Refined Soybean Oil (1L)',
    category: 'Edible Oils',
    current_stock: 8,
    reorder_threshold: 20,
    sales_velocity: 5.0,
    unit_price: 140,
    cost_price: 124,
    unit: 'pouches',
    supplier: 'Cargill Nashik Agency',
    last_restock_date: '2026-09-19',
    estimated_stockout_days: 1.6,
    estimated_stockout_date: 'In 1.6 days',
    suggested_reorder_qty: 30
  },
  {
    id: 'inv-14',
    shop_id: 'shop-05',
    item_name: 'Parle-G Gold Biscuits (1kg)',
    category: 'Snacks & Beverages',
    current_stock: 7,
    reorder_threshold: 20,
    sales_velocity: 5.2,
    unit_price: 110,
    cost_price: 94,
    unit: 'packs',
    supplier: 'Parle Products Agency',
    last_restock_date: '2026-09-19',
    estimated_stockout_days: 1.3,
    estimated_stockout_date: 'Tomorrow, 5:00 PM',
    suggested_reorder_qty: 30
  },
  {
    id: 'inv-15',
    shop_id: 'shop-05',
    item_name: 'Surf Excel Detergent (2kg)',
    category: 'Personal Care',
    current_stock: 4,
    reorder_threshold: 12,
    sales_velocity: 2.8,
    unit_price: 360,
    cost_price: 310,
    unit: 'packs',
    supplier: 'Hindustan Unilever Dadar',
    last_restock_date: '2026-09-18',
    estimated_stockout_days: 1.4,
    estimated_stockout_date: 'Tomorrow, 6:00 PM',
    suggested_reorder_qty: 20
  },
  {
    id: 'inv-16',
    shop_id: 'shop-09',
    item_name: 'Aashirvaad Atta (10kg)',
    category: 'Staples & Grains',
    current_stock: 9,
    reorder_threshold: 18,
    sales_velocity: 5.2,
    unit_price: 460,
    cost_price: 410,
    unit: 'bags',
    supplier: 'ITC Wholesale Baner',
    last_restock_date: '2026-09-20',
    estimated_stockout_days: 1.7,
    estimated_stockout_date: 'In 1.7 days',
    suggested_reorder_qty: 25
  },
  {
    id: 'inv-17',
    shop_id: 'shop-10',
    item_name: 'Fortune Sunlite Sunflower Oil (1L)',
    category: 'Edible Oils',
    current_stock: 10,
    reorder_threshold: 25,
    sales_velocity: 6.0,
    unit_price: 155,
    cost_price: 138,
    unit: 'pouches',
    supplier: 'Adani Wilmar Hadapsar',
    last_restock_date: '2026-09-20',
    estimated_stockout_days: 1.6,
    estimated_stockout_date: 'In 1.6 days',
    suggested_reorder_qty: 35
  },
  {
    id: 'inv-18',
    shop_id: 'shop-12',
    item_name: 'Nandini GoodLife Milk (500ml)',
    category: 'Dairy & Fresh',
    current_stock: 8,
    reorder_threshold: 30,
    sales_velocity: 18.0,
    unit_price: 32,
    cost_price: 28,
    unit: 'packs',
    supplier: 'KMF Nandini Dairy Bengaluru',
    last_restock_date: '2026-09-24',
    estimated_stockout_days: 0.44,
    estimated_stockout_date: 'Today, 4:00 PM (Urgent)',
    suggested_reorder_qty: 80
  },
  {
    id: 'inv-19',
    shop_id: 'shop-15',
    item_name: 'Catch Super Garam Masala (100g)',
    category: 'Spices & Condiments',
    current_stock: 5,
    reorder_threshold: 15,
    sales_velocity: 3.2,
    unit_price: 98,
    cost_price: 80,
    unit: 'packs',
    supplier: 'DS Group Noida Depot',
    last_restock_date: '2026-09-18',
    estimated_stockout_days: 1.5,
    estimated_stockout_date: 'In 1.5 days',
    suggested_reorder_qty: 20
  }
];

// Staff Activity Log
export const INITIAL_STAFF_ACTIVITIES: StaffActivity[] = [
  { id: 'act-01', shop_id: 'shop-01', staff_name: 'Rahul More', role: 'Head Cashier', action: 'Billed 6 items via Voice Order: Atta, Salt, Oil', timestamp: '4 mins ago', category: 'voice_order', amount: 840, metadata: 'POS Terminal 1' },
  { id: 'act-02', shop_id: 'shop-01', staff_name: 'Ramesh Sharma', role: 'Store Manager', action: 'Logged Udhaar repayment from Sunita Joshi', timestamp: '22 mins ago', category: 'udhaar', amount: 2000, metadata: 'UPI Reference: #9822' },
  { id: 'act-03', shop_id: 'shop-01', staff_name: 'Ramesh Sharma', role: 'Store Manager', action: 'End-of-shift Cash Count: ₹10,550 (Discrepancy: -₹1,850)', timestamp: '45 mins ago', category: 'cash_reconciliation', amount: -1850, metadata: 'Register Drawer A' },
  { id: 'act-04', shop_id: 'shop-01', staff_name: 'Karan Patil', role: 'Stock Assistant', action: 'Inventory update: 3 items below safety threshold', timestamp: '1 hour ago', category: 'inventory', metadata: 'System Alert' },

  { id: 'act-05', shop_id: 'shop-02', staff_name: 'Bhavesh Patel', role: 'Store Manager', action: 'Physical cash shortage logged (-₹2,450)', timestamp: '35 mins ago', category: 'cash_reconciliation', amount: -2450, metadata: 'Shift 1 Close' },
  { id: 'act-06', shop_id: 'shop-02', staff_name: 'Pravin Joshi', role: 'Cashier', action: 'Voice Order created: 12 grocery items', timestamp: '1 hour ago', category: 'voice_order', amount: 2180, metadata: 'POS Terminal 2' },

  { id: 'act-07', shop_id: 'shop-03', staff_name: 'Santosh Shinde', role: 'Store Manager', action: 'Credit limit override approved for Chaudhary Builders', timestamp: '50 mins ago', category: 'udhaar', amount: 8500, metadata: 'Override Approved' },
  { id: 'act-08', shop_id: 'shop-03', staff_name: 'Santosh Shinde', role: 'Store Manager', action: 'Cash register discrepancy recorded (-₹1,600)', timestamp: '2 hours ago', category: 'cash_reconciliation', amount: -1600, metadata: 'Drawer 1' },

  { id: 'act-09', shop_id: 'shop-06', staff_name: 'Ganesh Jagtap', role: 'Store Manager', action: 'Shift closed: ₹22,450 counted (+₹50 exact match)', timestamp: '18 mins ago', category: 'cash_reconciliation', amount: 22450, metadata: 'Terminal All' },
  { id: 'act-10', shop_id: 'shop-06', staff_name: 'Mahesh Shinde', role: 'Cashier', action: 'Completed POS billing - UPI payment received', timestamp: '38 mins ago', category: 'billing', amount: 1450, metadata: 'UPI QR' },

  { id: 'act-11', shop_id: 'shop-11', staff_name: 'Karthik Raman', role: 'Store Manager', action: 'Stock intake updated: 40 packs Organic Oats', timestamp: '2 hours ago', category: 'inventory', metadata: 'Batch #2026-44' },
  { id: 'act-12', shop_id: 'shop-12', staff_name: 'Gopal Reddy', role: 'Store Manager', action: 'Urgent Milk Reorder PO dispatched to KMF Nandini', timestamp: '3 hours ago', category: 'inventory', metadata: 'PO #8841' }
];

// Centralized Alerts
export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-01',
    shop_id: 'shop-01',
    shop_name: 'Sharma General Store',
    category: 'revenue',
    severity: 'critical',
    title: 'Sudden Revenue Drop (-18.2%)',
    message: '7-day moving average revenue dropped by 18.2% vs previous week baseline.',
    timestamp: 'Today, 10:30 AM',
    reason: 'Drop in high-ticket weekend orders & 3 fast-moving SKUs running out of stock.',
    supporting_data: 'Current 7-day avg: ₹26,400/day vs Baseline: ₹32,280/day.',
    recommended_action: 'Audit store pricing, review cashier voice order logs, and replenish milk/atta SKUs.',
    status: 'active'
  },
  {
    id: 'alt-02',
    shop_id: 'shop-01',
    shop_name: 'Sharma General Store',
    category: 'inventory',
    severity: 'critical',
    title: 'Imminent Stock-Out Predicted (Amul Milk 1L)',
    message: 'Amul Milk (1L) has only 1.3 days of runway left based on sales velocity (7.2 units/day).',
    timestamp: 'Today, 09:15 AM',
    reason: 'Current stock: 9 packs. Daily sales velocity: 7.2 packs/day. Reorder threshold is 25 packs.',
    supporting_data: 'Estimated stockout: Tomorrow 5:00 PM. Suggested reorder: 40 packs.',
    recommended_action: 'Dispatch emergency reorder PO to Amul Pune Distributor.',
    status: 'active'
  },
  {
    id: 'alt-03',
    shop_id: 'shop-01',
    shop_name: 'Sharma General Store',
    category: 'udhaar',
    severity: 'critical',
    title: 'Udhaar Overdue Spiked (+24.1%)',
    message: 'Udhaar aging past 30 days increased by 24.1% over the last 14 days.',
    timestamp: 'Today, 08:45 AM',
    reason: 'Ramesh Traders (₹42,000, 68 days) and Mahesh Shirole (₹18,400, 47 days) crossed critical credit limit.',
    supporting_data: 'Total overdue >30d: ₹84,900 (57% of total branch credit).',
    recommended_action: 'Freeze new credit sales for overdue accounts and dispatch 1-click WhatsApp reminders.',
    status: 'active'
  },
  {
    id: 'alt-04',
    shop_id: 'shop-02',
    shop_name: 'Patel Mart',
    category: 'cash',
    severity: 'critical',
    title: 'Unusual Cash Variance (-₹2,450)',
    message: 'Physical cash counted in register is ₹2,450 lower than POS billing totals.',
    timestamp: 'Today, 11:00 AM',
    reason: 'Expected cash: ₹14,800. Actual cash in drawer: ₹12,350 (16.5% discrepancy).',
    supporting_data: 'Terminal 2 closed by Shift Supervisor Bhavesh Patel.',
    recommended_action: 'Audit register transaction audit trail and inspect voided bills.',
    status: 'active'
  },
  {
    id: 'alt-05',
    shop_id: 'shop-03',
    shop_name: 'Sai Kirana',
    category: 'udhaar',
    severity: 'critical',
    title: 'Chronic Credit Default Exposure (>60 Days)',
    message: 'Chaudhary Builders Site Office has ₹58,000 unpaid for 74 days.',
    timestamp: 'Yesterday, 06:20 PM',
    reason: 'Balance exceeded credit limit of ₹50,000 with zero repayments in 60 days.',
    supporting_data: 'Customer phone: +91 98230 55432. Status: Blocked.',
    recommended_action: 'Escalate to Area Manager for field recovery and legal notice.',
    status: 'active'
  },
  {
    id: 'alt-06',
    shop_id: 'shop-12',
    shop_name: 'Sri Venkateshwara Stores',
    category: 'inventory',
    severity: 'warning',
    title: 'Fresh Dairy Runway Below 12 Hours',
    message: 'Nandini GoodLife Milk has 8 packs remaining with burn rate of 18 packs/day.',
    timestamp: 'Today, 11:30 AM',
    reason: 'Rapid morning demand depleted buffer. Stockout expected by 4:00 PM.',
    supporting_data: 'Runway: 0.44 days. Suggested PO: 80 packs.',
    recommended_action: 'Confirm PO dispatch with KMF Nandini distributor.',
    status: 'active'
  }
];
