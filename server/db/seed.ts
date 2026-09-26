import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database.js';

export async function seedDatabase() {
  console.log('[Seed] Ensuring schema is up to date...');
  initDatabase();

  const countShops = db.prepare('SELECT count(*) as count FROM shops').get() as { count: number };
  if (countShops && countShops.count > 0) {
    console.log(`[Seed] Database already has ${countShops.count} shops. Skipping full reseed.`);
    return;
  }

  console.log('[Seed] Seeding normalized database with enterprise data...');

  const passwordHash = await bcrypt.hash('DemoPass2026!', 10);

  // 1. Regions
  const insertRegion = db.prepare('INSERT OR REPLACE INTO regions (id, name, code) VALUES (?, ?, ?)');
  insertRegion.run('reg-west', 'West Region (Maharashtra & Goa)', 'WEST');
  insertRegion.run('reg-north', 'North Region (Delhi NCR & UP)', 'NORTH');
  insertRegion.run('reg-south', 'South Region (Karnataka & Tamil Nadu)', 'SOUTH');

  // 2. Franchises
  const insertFranchise = db.prepare('INSERT OR REPLACE INTO franchises (id, name, owner_name, contact_phone) VALUES (?, ?, ?, ?)');
  insertFranchise.run('fran-01', 'Patel Retail Network', 'Amit Patel', '+91 98200 88411');
  insertFranchise.run('fran-02', 'Sharma Marts & Groceries', 'Ramesh Sharma', '+91 98220 14589');
  insertFranchise.run('fran-03', 'National Metro Marts', 'Aditya Singhal', '+91 98100 12345');

  // 3. Seed Users (Including the 5 demo accounts from PRD)
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, name, role, region_id, franchise_id, shop_id, phone, avatar_initials)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Demo Accounts
  insertUser.run('user-01', 'hq.owner@demo.khatacopilot.com', passwordHash, 'Aditya Singhal', 'HQ_OWNER', null, null, null, '+91 98110 54321', 'AS');
  insertUser.run('user-02', 'hq.it@demo.khatacopilot.com', passwordHash, 'Priya Nair', 'HQ_IT', null, null, null, '+91 98230 77123', 'PN');
  insertUser.run('user-03', 'area.manager@demo.khatacopilot.com', passwordHash, 'Vikram Sawant', 'AREA_MANAGER', 'reg-west', null, null, '+91 98201 33490', 'VS');
  insertUser.run('user-04', 'franchise.owner@demo.khatacopilot.com', passwordHash, 'Amit Patel', 'FRANCHISE_OWNER', null, 'fran-01', null, '+91 98200 88411', 'AP');
  insertUser.run('user-05', 'store.manager@demo.khatacopilot.com', passwordHash, 'Ramesh Sharma', 'STORE_MANAGER', 'reg-west', 'fran-02', 'shop-01', '+91 98220 14589', 'RS');

  // Also seed with realistic enterprise emails
  insertUser.run('user-01b', 'aditya.singhal@khatacopilot.com', passwordHash, 'Aditya Singhal', 'HQ_OWNER', null, null, null, '+91 98110 54321', 'AS');
  insertUser.run('user-02b', 'priya.nair@khatacopilot.com', passwordHash, 'Priya Nair', 'HQ_IT', null, null, null, '+91 98230 77123', 'PN');
  insertUser.run('user-03b', 'vikram.sawant@khatacopilot.com', passwordHash, 'Vikram Sawant', 'AREA_MANAGER', 'reg-west', null, null, '+91 98201 33490', 'VS');

  // 4. Seed Shops (All 15)
  const SHOPS_SEED = [
    {
      id: 'shop-01', name: 'Sharma General Store', location: 'Kothrud, Pune', city: 'Pune', region: 'West', region_id: 'reg-west', franchise_id: 'fran-02',
      owner_contact: '+91 98220 14589', manager_name: 'Ramesh Sharma', status: 'At-Risk',
      status_reason: 'Revenue ↓18% vs prev week; Udhaar >30d ↑24%; 3 stockouts predicted', health_score: 48,
      health_reasons: JSON.stringify(['Revenue down 18.2% vs previous 7-day average', 'Overdue Udhaar (>30 days) increased by 24.1%', '3 high-velocity items below reorder threshold']),
      store_size_sqft: 1450, daily_revenue: 26400, monthly_revenue: 214000, daily_profit: 2270, monthly_profit: 18420, profit_margin_pct: 8.6,
      udhaar_outstanding: 148500, stock_alert_count: 3, cash_variance_today: -1850, cash_expected_today: 12400, cash_actual_today: 10550, active_cashiers_count: 2, last_active: '2 mins ago'
    },
    {
      id: 'shop-02', name: 'Patel Mart', location: 'Andheri East, Mumbai', city: 'Mumbai', region: 'West', region_id: 'reg-west', franchise_id: 'fran-01',
      owner_contact: '+91 98200 88411', manager_name: 'Bhavesh Patel', status: 'At-Risk',
      status_reason: 'Profit margin compressed to 8.8%; cash variance -₹2,450', health_score: 54,
      health_reasons: JSON.stringify(['Profit margin compressed to 8.8% (Target: 14%)', 'Cash drawer shortage of -₹2,450 at end-of-shift', '4 items depleted below 2-day runway']),
      store_size_sqft: 1600, daily_revenue: 31200, monthly_revenue: 242000, daily_profit: 2740, monthly_profit: 21180, profit_margin_pct: 8.8,
      udhaar_outstanding: 132000, stock_alert_count: 4, cash_variance_today: -2450, cash_expected_today: 14800, cash_actual_today: 12350, active_cashiers_count: 3, last_active: '5 mins ago'
    },
    {
      id: 'shop-03', name: 'Sai Kirana', location: 'Majiwada, Thane', city: 'Thane', region: 'West', region_id: 'reg-west', franchise_id: 'fran-01',
      owner_contact: '+91 98199 43210', manager_name: 'Santosh Shinde', status: 'At-Risk',
      status_reason: 'Chronic overdue udhaar (>60 days: ₹68,000); 3 consecutive days revenue dip', health_score: 52,
      health_reasons: JSON.stringify(['High default risk: 52% of udhaar older than 45 days', 'Revenue declined for 3 consecutive days', 'Register cash variance of -₹1,600']),
      store_size_sqft: 1100, daily_revenue: 28900, monthly_revenue: 226000, daily_profit: 2680, monthly_profit: 22040, profit_margin_pct: 9.7,
      udhaar_outstanding: 154000, stock_alert_count: 3, cash_variance_today: -1600, cash_expected_today: 11500, cash_actual_today: 9900, active_cashiers_count: 2, last_active: '12 mins ago'
    },
    {
      id: 'shop-04', name: 'Gupta Super Market', location: 'College Road, Nashik', city: 'Nashik', region: 'West', region_id: 'reg-west', franchise_id: 'fran-03',
      owner_contact: '+91 94222 71092', manager_name: 'Sunil Gupta', status: 'Watch',
      status_reason: 'Fast-selling edible oils reaching critical stockout runway (1.8 days)', health_score: 72,
      health_reasons: JSON.stringify(['Inventory runway < 2 days for 2 fast-moving staples', 'Daily footfall slightly down 4%']),
      store_size_sqft: 1850, daily_revenue: 42100, monthly_revenue: 338000, daily_profit: 5470, monthly_profit: 43940, profit_margin_pct: 13.0,
      udhaar_outstanding: 78500, stock_alert_count: 2, cash_variance_today: -320, cash_expected_today: 16200, cash_actual_today: 15880, active_cashiers_count: 3, last_active: '1 min ago'
    },
    {
      id: 'shop-05', name: 'More Daily Needs', location: 'Dadar West, Mumbai', city: 'Mumbai', region: 'West', region_id: 'reg-west', franchise_id: 'fran-01',
      owner_contact: '+91 98205 19283', manager_name: 'Dattatray More', status: 'Watch',
      status_reason: 'Cash reconciliation discrepancies flagged twice this week', health_score: 74,
      health_reasons: JSON.stringify(['Cash drawer discrepancy of -₹1,200', 'Customer credit collection delayed by 6 days']),
      store_size_sqft: 1300, daily_revenue: 46800, monthly_revenue: 374000, daily_profit: 6080, monthly_profit: 48620, profit_margin_pct: 13.0,
      udhaar_outstanding: 84200, stock_alert_count: 2, cash_variance_today: -1200, cash_expected_today: 18400, cash_actual_today: 17200, active_cashiers_count: 3, last_active: '3 mins ago'
    },
    {
      id: 'shop-06', name: 'Ganesh Stores', location: 'Paud Road, Pune', city: 'Pune', region: 'West', region_id: 'reg-west', franchise_id: 'fran-02',
      owner_contact: '+91 98230 45678', manager_name: 'Ganesh Jagtap', status: 'Healthy',
      status_reason: 'Exceptional +14% MoM profit growth and 97% on-time credit recovery', health_score: 96,
      health_reasons: JSON.stringify(['Consistent revenue run rate (+14% MoM)', 'Optimal inventory turnover of 4.2x', 'Zero cash variance for 14 consecutive days']),
      store_size_sqft: 2100, daily_revenue: 64500, monthly_revenue: 516000, daily_profit: 10960, monthly_profit: 87720, profit_margin_pct: 17.0,
      udhaar_outstanding: 46200, stock_alert_count: 0, cash_variance_today: 50, cash_expected_today: 22400, cash_actual_today: 22450, active_cashiers_count: 4, last_active: 'Just now'
    },
    {
      id: 'shop-07', name: 'Omkar Mart', location: 'Dharampeth, Nagpur', city: 'Nagpur', region: 'West', region_id: 'reg-west', franchise_id: 'fran-03',
      owner_contact: '+91 97640 12890', manager_name: 'Omkar Raut', status: 'Healthy',
      status_reason: 'Strong margins in spices & pulses, low credit default rate', health_score: 92,
      health_reasons: JSON.stringify(['Healthy 16.2% margin on groceries', 'Udhaar aging 92% under 15 days']),
      store_size_sqft: 1500, daily_revenue: 38200, monthly_revenue: 305000, daily_profit: 6180, monthly_profit: 49410, profit_margin_pct: 16.2,
      udhaar_outstanding: 38900, stock_alert_count: 0, cash_variance_today: -60, cash_expected_today: 15200, cash_actual_today: 15140, active_cashiers_count: 2, last_active: '8 mins ago'
    },
    {
      id: 'shop-08', name: 'Krishna General Store', location: 'Sector 17, Vashi, Navi Mumbai', city: 'Mumbai', region: 'West', region_id: 'reg-west', franchise_id: 'fran-01',
      owner_contact: '+91 98211 98765', manager_name: 'Krishna Murthy', status: 'Healthy',
      status_reason: 'High UPI digital adoption (84%) and zero customer defaults', health_score: 94,
      health_reasons: JSON.stringify(['84% digital UPI settlement', 'Robust inventory safety stock buffer']),
      store_size_sqft: 1750, daily_revenue: 52400, monthly_revenue: 419000, daily_profit: 8900, monthly_profit: 71230, profit_margin_pct: 17.0,
      udhaar_outstanding: 41500, stock_alert_count: 0, cash_variance_today: 120, cash_expected_today: 11000, cash_actual_today: 11120, active_cashiers_count: 3, last_active: '1 min ago'
    },
    {
      id: 'shop-09', name: 'Laxmi Provision Stores', location: 'Baner, Pune', city: 'Pune', region: 'West', region_id: 'reg-west', franchise_id: 'fran-02',
      owner_contact: '+91 98901 32411', manager_name: 'Nitin Deshmukh', status: 'Watch',
      status_reason: 'Atta & Sugar reorder thresholds breached; 1 low stock warning', health_score: 76,
      health_reasons: JSON.stringify(['2 high velocity items near stockout', 'Modest cash shortage of -₹480']),
      store_size_sqft: 1200, daily_revenue: 37400, monthly_revenue: 299000, daily_profit: 5230, monthly_profit: 41860, profit_margin_pct: 14.0,
      udhaar_outstanding: 62400, stock_alert_count: 1, cash_variance_today: -480, cash_expected_today: 13500, cash_actual_today: 13020, active_cashiers_count: 2, last_active: '6 mins ago'
    },
    {
      id: 'shop-10', name: 'Shivaji Supermarket', location: 'Hadapsar, Pune', city: 'Pune', region: 'West', region_id: 'reg-west', franchise_id: 'fran-02',
      owner_contact: '+91 97632 88201', manager_name: 'Shivaji Kadam', status: 'Healthy',
      status_reason: 'High retail volume, robust local caterer accounts', health_score: 89,
      health_reasons: JSON.stringify(['Steady daily sales volume', 'Solid 15.5% blended margins']),
      store_size_sqft: 1900, daily_revenue: 58900, monthly_revenue: 471000, daily_profit: 9130, monthly_profit: 73000, profit_margin_pct: 15.5,
      udhaar_outstanding: 58200, stock_alert_count: 1, cash_variance_today: -80, cash_expected_today: 20500, cash_actual_today: 20420, active_cashiers_count: 4, last_active: '4 mins ago'
    },
    {
      id: 'shop-11', name: 'Annapoorna Retail Mart', location: '100ft Road, Indiranagar, Bengaluru', city: 'Bengaluru', region: 'South', region_id: 'reg-south', franchise_id: 'fran-03',
      owner_contact: '+91 99801 88320', manager_name: 'Karthik Raman', status: 'Healthy',
      status_reason: 'Top grossing organic items mix, 18.2% margin', health_score: 98,
      health_reasons: JSON.stringify(['Highest margin branch in network (18.2%)', '88% UPI adoption, near-zero cash variance']),
      store_size_sqft: 2200, daily_revenue: 72400, monthly_revenue: 579000, daily_profit: 13170, monthly_profit: 105370, profit_margin_pct: 18.2,
      udhaar_outstanding: 34500, stock_alert_count: 0, cash_variance_today: 40, cash_expected_today: 12000, cash_actual_today: 12040, active_cashiers_count: 4, last_active: 'Just now'
    },
    {
      id: 'shop-12', name: 'Sri Venkateshwara Stores', location: '5th Block, Koramangala, Bengaluru', city: 'Bengaluru', region: 'South', region_id: 'reg-south', franchise_id: 'fran-03',
      owner_contact: '+91 98450 71234', manager_name: 'Gopal Reddy', status: 'Watch',
      status_reason: 'Dairy & fresh bakery runway depleted to 1.2 days', health_score: 75,
      health_reasons: JSON.stringify(['Dairy stockout imminent within 30 hours', 'Reorder PO pending vendor dispatch']),
      store_size_sqft: 1400, daily_revenue: 49500, monthly_revenue: 396000, daily_profit: 7420, monthly_profit: 59400, profit_margin_pct: 15.0,
      udhaar_outstanding: 54000, stock_alert_count: 1, cash_variance_today: -180, cash_expected_today: 14200, cash_actual_today: 14020, active_cashiers_count: 3, last_active: '7 mins ago'
    },
    {
      id: 'shop-13', name: 'Balaji Supermart', location: '4th Block, Jayanagar, Bengaluru', city: 'Bengaluru', region: 'South', region_id: 'reg-south', franchise_id: 'fran-03',
      owner_contact: '+91 98455 66778', manager_name: 'Venkatesh Rao', status: 'Healthy',
      status_reason: 'Consistent grocery turnover, disciplined customer credit book', health_score: 91,
      health_reasons: JSON.stringify(['Zero credit aging over 30 days', 'Optimal inventory safety margins']),
      store_size_sqft: 1650, daily_revenue: 44200, monthly_revenue: 353000, daily_profit: 7070, monthly_profit: 56480, profit_margin_pct: 16.0,
      udhaar_outstanding: 42100, stock_alert_count: 0, cash_variance_today: -90, cash_expected_today: 13800, cash_actual_today: 13710, active_cashiers_count: 3, last_active: '9 mins ago'
    },
    {
      id: 'shop-14', name: 'Aggarwal Departmental Store', location: 'Sector 9, Rohini, Delhi NCR', city: 'Delhi NCR', region: 'North', region_id: 'reg-north', franchise_id: 'fran-03',
      owner_contact: '+91 98110 56789', manager_name: 'Pradeep Aggarwal', status: 'Healthy',
      status_reason: 'High retail footfall, strong FMCG turnover', health_score: 93,
      health_reasons: JSON.stringify(['Strong daily turnover', 'Fast vendor turnaround cycle']),
      store_size_sqft: 1800, daily_revenue: 53800, monthly_revenue: 430000, daily_profit: 8600, monthly_profit: 68800, profit_margin_pct: 16.0,
      udhaar_outstanding: 49800, stock_alert_count: 0, cash_variance_today: 70, cash_expected_today: 16500, cash_actual_today: 16570, active_cashiers_count: 3, last_active: '5 mins ago'
    },
    {
      id: 'shop-15', name: 'Gupta Brothers Mart', location: 'Sector 62, Noida, Delhi NCR', city: 'Delhi NCR', region: 'North', region_id: 'reg-north', franchise_id: 'fran-03',
      owner_contact: '+91 98712 34901', manager_name: 'Ashok Gupta', status: 'Watch',
      status_reason: 'Udhaar collection lagging; 1 critical low stock alert on cooking oil', health_score: 73,
      health_reasons: JSON.stringify(['Customer credit aging bracket 31-60d elevated', 'Cooking oil inventory below reorder point']),
      store_size_sqft: 1550, daily_revenue: 39800, monthly_revenue: 318000, daily_profit: 4770, monthly_profit: 38160, profit_margin_pct: 12.0,
      udhaar_outstanding: 74200, stock_alert_count: 1, cash_variance_today: -650, cash_expected_today: 14500, cash_actual_today: 13850, active_cashiers_count: 2, last_active: '11 mins ago'
    }
  ];

  const insertShop = db.prepare(`
    INSERT OR REPLACE INTO shops (
      id, name, location, city, region, region_id, franchise_id, owner_contact, manager_name,
      status, status_reason, health_score, health_reasons, store_size_sqft, daily_revenue,
      monthly_revenue, daily_profit, monthly_profit, profit_margin_pct, udhaar_outstanding,
      stock_alert_count, cash_variance_today, cash_expected_today, cash_actual_today,
      active_cashiers_count, last_active
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const s of SHOPS_SEED) {
    insertShop.run(
      s.id, s.name, s.location, s.city, s.region, s.region_id, s.franchise_id, s.owner_contact, s.manager_name,
      s.status, s.status_reason, s.health_score, s.health_reasons, s.store_size_sqft, s.daily_revenue,
      s.monthly_revenue, s.daily_profit, s.monthly_profit, s.profit_margin_pct, s.udhaar_outstanding,
      s.stock_alert_count, s.cash_variance_today, s.cash_expected_today, s.cash_actual_today,
      s.active_cashiers_count, s.last_active
    );
  }

  // 5. Seed 30-Day Daily Sales for all 15 shops
  console.log('[Seed] Generating 30 days of sales history...');
  const insertDailySales = db.prepare(`
    INSERT OR REPLACE INTO daily_sales (
      shop_id, date, revenue, profit, transaction_count, cash_sales, digital_sales,
      cash_expected, cash_actual, cash_variance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const baseDate = new Date('2026-09-26');
  const insertSalesTx = db.transaction(() => {
    for (const shop of SHOPS_SEED) {
      for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() - dayOffset);
        const dateStr = d.toISOString().split('T')[0];

        // Anomaly injection for shop-01 (revenue drop in recent 7 days)
        let multiplier = 0.95 + Math.sin(dayOffset * 0.7) * 0.1;
        if (shop.id === 'shop-01' && dayOffset < 7) {
          multiplier = 0.81; // 19% drop
        }

        const revenue = Math.round(shop.daily_revenue * multiplier);
        const profit = Math.round(revenue * (shop.profit_margin_pct / 100));
        const transaction_count = Math.round(revenue / 320);
        const digitalShare = shop.city === 'Bengaluru' ? 0.85 : (shop.region === 'West' ? 0.70 : 0.65);
        const digital_sales = Math.round(revenue * digitalShare);
        const cash_sales = revenue - digital_sales;
        const cash_variance = (dayOffset === 0) ? shop.cash_variance_today : (Math.random() > 0.8 ? -Math.round(Math.random() * 800) : 0);
        const cash_expected = cash_sales;
        const cash_actual = cash_expected + cash_variance;

        insertDailySales.run(
          shop.id, dateStr, revenue, profit, transaction_count, cash_sales, digital_sales,
          cash_expected, cash_actual, cash_variance
        );
      }
    }
  });
  insertSalesTx();

  // 6. Seed Customers & Udhaar
  console.log('[Seed] Seeding customers & udhaar books...');
  const insertCustomer = db.prepare(`
    INSERT OR REPLACE INTO customers (id, shop_id, shop_name, name, phone, total_udhaar, credit_limit, days_outstanding, risk_level, status, last_transaction_date, repayment_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const CUSTOMERS_SEED = [
    { id: 'cust-01', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Mahesh Shirole', phone: '+91 98223 91011', total_udhaar: 18400, credit_limit: 20000, days_outstanding: 47, risk_level: 'High', status: 'overdue', last_transaction_date: '2026-08-10', repayment_score: 42 },
    { id: 'cust-02', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Ramesh Traders (Caterer)', phone: '+91 98220 44211', total_udhaar: 42000, credit_limit: 45000, days_outstanding: 68, risk_level: 'Critical', status: 'blocked', last_transaction_date: '2026-07-20', repayment_score: 28 },
    { id: 'cust-03', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Deepak More', phone: '+91 97630 11920', total_udhaar: 24500, credit_limit: 30000, days_outstanding: 34, risk_level: 'High', status: 'overdue', last_transaction_date: '2026-08-23', repayment_score: 50 },
    { id: 'cust-04', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Dr. G. K. Apte', phone: '+91 94220 88200', total_udhaar: 12500, credit_limit: 25000, days_outstanding: 18, risk_level: 'Medium', status: 'active', last_transaction_date: '2026-09-08', repayment_score: 75 },
    { id: 'cust-05', shop_id: 'shop-01', shop_name: 'Sharma General Store', name: 'Sunita Joshi', phone: '+91 98900 77122', total_udhaar: 8400, credit_limit: 15000, days_outstanding: 6, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-20', repayment_score: 95 },
    { id: 'cust-06', shop_id: 'shop-02', shop_name: 'Patel Mart', name: 'Oasis Film Production Mess', phone: '+91 98201 12345', total_udhaar: 48000, credit_limit: 50000, days_outstanding: 58, risk_level: 'Critical', status: 'blocked', last_transaction_date: '2026-07-30', repayment_score: 35 },
    { id: 'cust-07', shop_id: 'shop-02', shop_name: 'Patel Mart', name: 'Bhavna Parekh', phone: '+91 98205 66710', total_udhaar: 22500, credit_limit: 25000, days_outstanding: 38, risk_level: 'High', status: 'overdue', last_transaction_date: '2026-08-19', repayment_score: 48 },
    { id: 'cust-08', shop_id: 'shop-02', shop_name: 'Patel Mart', name: 'Shabnam Khan', phone: '+91 98209 87654', total_udhaar: 16400, credit_limit: 20000, days_outstanding: 14, risk_level: 'Low', status: 'active', last_transaction_date: '2026-09-12', repayment_score: 88 },
    { id: 'cust-09', shop_id: 'shop-03', shop_name: 'Sai Kirana', name: 'Chaudhary Builders Site Office', phone: '+91 98230 55432', total_udhaar: 58000, credit_limit: 50000, days_outstanding: 74, risk_level: 'Critical', status: 'blocked', last_transaction_date: '2026-07-14', repayment_score: 22 },
    { id: 'cust-10', shop_id: 'shop-03', shop_name: 'Sai Kirana', name: 'Kundan Tea & Canteen', phone: '+91 97621 99011', total_udhaar: 36500, credit_limit: 40000, days_outstanding: 62, risk_level: 'Critical', status: 'overdue', last_transaction_date: '2026-07-26', repayment_score: 38 },
    { id: 'cust-11', shop_id: 'shop-03', shop_name: 'Sai Kirana', name: 'Sanjay Thorat', phone: '+91 94231 66720', total_udhaar: 21400, credit_limit: 25000, days_outstanding: 28, risk_level: 'Medium', status: 'active', last_transaction_date: '2026-08-29', repayment_score: 65 }
  ];

  for (const c of CUSTOMERS_SEED) {
    insertCustomer.run(c.id, c.shop_id, c.shop_name, c.name, c.phone, c.total_udhaar, c.credit_limit, c.days_outstanding, c.risk_level, c.status, c.last_transaction_date, c.repayment_score);
  }

  const insertUdhaar = db.prepare(`
    INSERT OR REPLACE INTO udhaar_records (id, shop_id, customer_id, customer_name, amount, date_given, days_outstanding, phone, credit_limit, last_payment_date, risk_category, risk_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of CUSTOMERS_SEED) {
    const riskCat = c.days_outstanding > 60 ? '60d+' : (c.days_outstanding > 30 ? '31-60d' : (c.days_outstanding > 7 ? '8-30d' : '0-7d'));
    insertUdhaar.run('udh-' + c.id, c.shop_id, c.id, c.name, c.total_udhaar, c.last_transaction_date, c.days_outstanding, c.phone, c.credit_limit, null, riskCat, c.risk_level);
  }

  // 7. Seed Inventory Items
  console.log('[Seed] Seeding predictive inventory with runway metrics...');
  const insertInventory = db.prepare(`
    INSERT OR REPLACE INTO inventory_items (
      id, shop_id, item_name, category, current_stock, reorder_threshold, sales_velocity,
      unit_price, cost_price, unit, supplier, last_restock_date, estimated_stockout_days,
      estimated_stockout_date, suggested_reorder_qty
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const INVENTORY_SEED = [
    { id: 'inv-01', shop_id: 'shop-01', item_name: 'Amul Taaza Milk (1L Tetra)', category: 'Dairy & Fresh', current_stock: 9, reorder_threshold: 25, sales_velocity: 7.2, unit_price: 74, cost_price: 66, unit: 'packs', supplier: 'Amul Dairy Pune Distributor', last_restock_date: '2026-09-21', estimated_stockout_days: 1.3, estimated_stockout_date: 'Tomorrow, 5:00 PM', suggested_reorder_qty: 40 },
    { id: 'inv-02', shop_id: 'shop-01', item_name: 'Fortune Sunlite Sunflower Oil (1L)', category: 'Edible Oils', current_stock: 12, reorder_threshold: 30, sales_velocity: 6.8, unit_price: 155, cost_price: 138, unit: 'pouches', supplier: 'Adani Wilmar West Agency', last_restock_date: '2026-09-18', estimated_stockout_days: 1.8, estimated_stockout_date: 'In 1.8 days', suggested_reorder_qty: 50 },
    { id: 'inv-03', shop_id: 'shop-01', item_name: 'Aashirvaad Shudh Chakki Atta (10kg)', category: 'Staples & Grains', current_stock: 8, reorder_threshold: 20, sales_velocity: 4.5, unit_price: 465, cost_price: 415, unit: 'bags', supplier: 'ITC Limited Pune Depot', last_restock_date: '2026-09-19', estimated_stockout_days: 1.8, estimated_stockout_date: 'In 1.8 days', suggested_reorder_qty: 30 },
    { id: 'inv-04', shop_id: 'shop-02', item_name: 'Amul Butter (500g)', category: 'Dairy & Fresh', current_stock: 5, reorder_threshold: 15, sales_velocity: 4.1, unit_price: 285, cost_price: 258, unit: 'packs', supplier: 'Amul Mumbai Depot', last_restock_date: '2026-09-20', estimated_stockout_days: 1.2, estimated_stockout_date: 'Tomorrow, 3:00 PM', suggested_reorder_qty: 30 },
    { id: 'inv-05', shop_id: 'shop-02', item_name: 'Tata Salt Vacuum Evaporated (1kg)', category: 'Staples & Grains', current_stock: 14, reorder_threshold: 40, sales_velocity: 11.2, unit_price: 28, cost_price: 24, unit: 'packs', supplier: 'Tata Consumer Products West Depot', last_restock_date: '2026-09-19', estimated_stockout_days: 1.25, estimated_stockout_date: 'Tomorrow, 4:00 PM', suggested_reorder_qty: 60 },
    { id: 'inv-06', shop_id: 'shop-03', item_name: 'Fortune Kachi Ghani Mustard Oil (1L)', category: 'Edible Oils', current_stock: 3, reorder_threshold: 20, sales_velocity: 5.5, unit_price: 165, cost_price: 145, unit: 'bottles', supplier: 'Adani Wilmar Thane', last_restock_date: '2026-09-17', estimated_stockout_days: 0.5, estimated_stockout_date: 'Today, 6:00 PM (Critical)', suggested_reorder_qty: 35 },
    { id: 'inv-07', shop_id: 'shop-12', item_name: 'Nandini GoodLife Milk (500ml)', category: 'Dairy & Fresh', current_stock: 8, reorder_threshold: 30, sales_velocity: 18.0, unit_price: 32, cost_price: 28, unit: 'packs', supplier: 'KMF Nandini Dairy Bengaluru', last_restock_date: '2026-09-24', estimated_stockout_days: 0.44, estimated_stockout_date: 'Today, 4:00 PM (Urgent)', suggested_reorder_qty: 80 }
  ];

  for (const item of INVENTORY_SEED) {
    insertInventory.run(
      item.id, item.shop_id, item.item_name, item.category, item.current_stock, item.reorder_threshold,
      item.sales_velocity, item.unit_price, item.cost_price, item.unit, item.supplier, item.last_restock_date,
      item.estimated_stockout_days, item.estimated_stockout_date, item.suggested_reorder_qty
    );
  }

  // 8. Seed Agent Definitions (All 8 Autonomous Retail Agents)
  console.log('[Seed] Seeding 8 AI Agent Definitions...');
  const insertAgentDef = db.prepare(`
    INSERT OR REPLACE INTO agent_definitions (id, name, description, version, cadence, is_autonomous, approval_required, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAgentDef.run('sales', 'Sales Intelligence Agent', 'Analyzes category mix, basket sizes, sales velocity anomalies and margins', '2.4', 'Every 30 mins', 1, 0, 'Active');
  insertAgentDef.run('inventory', 'Autonomous Inventory Agent', 'Monitors burn rate, stockouts, runway days and generates PO drafts', '2.4', 'Every 15 mins', 1, 1, 'Active');
  insertAgentDef.run('udhaar-risk', 'Udhaar Risk & Recovery Agent', 'Tracks aging debt, customer repayment score and credit freeze signals', '2.4', 'Daily at 08:00 AM', 1, 1, 'Active');
  insertAgentDef.run('revenue-anomaly', 'Revenue Anomaly Agent', 'Detects sharp 7-day revenue drops, traffic dips and store deviations', '2.4', 'Hourly', 1, 0, 'Active');
  insertAgentDef.run('cash-risk', 'Cash Reconciliation Agent', 'Detects register shortages, cashier variances and shift discrepancies', '2.4', 'Shift Close / Hourly', 1, 0, 'Active');
  insertAgentDef.run('shop-health', 'Shop Health Index Agent', 'Multi-factor operational health score calculation and classification', '2.4', 'Every 10 mins', 1, 0, 'Active');
  insertAgentDef.run('retention', 'Shop Retention Agent', 'Predicts franchise and branch churn risks, recommending owner interventions', '2.4', 'Daily', 1, 1, 'Active');
  insertAgentDef.run('support', 'Franchise Support & Community Agent', 'Analyzes community posts, matches known bugs, and assists IT triage', '2.4', 'Event Triggered', 1, 0, 'Active');

  // 9. Seed Purchase Orders
  console.log('[Seed] Seeding purchase orders...');
  const insertPO = db.prepare(`
    INSERT OR REPLACE INTO purchase_orders (
      id, task_id, shop_id, shop_name, product_name, sku_id, quantity, unit,
      unit_price, total_amount, supplier, reason, current_stock, sales_velocity,
      days_remaining, created_by, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPO.run(
    'PO-2026-INV-101', 'task-inv-01', 'shop-01', 'Sharma General Store', 'Amul Taaza Milk (1L Tetra)', 'inv-01',
    40, 'packs', 66, 2640, 'Amul Dairy Pune Distributor',
    'Current stock 9 packs is below reorder threshold 25. High velocity 7.2 packs/day indicates stockout in 1.3 days.',
    9, 7.2, 1.3, 'Autonomous Inventory Agent v2.4', 'Awaiting Approval', '2026-09-26 10:42 AM', '2026-09-26 10:42 AM'
  );

  insertPO.run(
    'PO-2026-INV-102', 'task-inv-02', 'shop-01', 'Sharma General Store', 'Fortune Sunlite Sunflower Oil (1L)', 'inv-02',
    50, 'pouches', 138, 6900, 'Adani Wilmar West Agency',
    'Current stock 12 pouches below 30 threshold. 6.8 pouches/day sales velocity creates stockout risk in 1.8 days.',
    12, 6.8, 1.8, 'Autonomous Inventory Agent v2.4', 'Awaiting Approval', '2026-09-26 10:40 AM', '2026-09-26 10:40 AM'
  );

  insertPO.run(
    'PO-2026-INV-103', 'task-inv-03', 'shop-02', 'Patel Mart', 'Tata Salt Vacuum Evaporated (1kg)', 'inv-05',
    60, 'packs', 24, 1440, 'Tata Consumer Products West Depot',
    'Stock down to 14 packs. Daily consumption 11.2 packs/day, stockout predicted in 1.25 days.',
    14, 11.2, 1.25, 'Autonomous Inventory Agent v2.4', 'Awaiting Approval', '2026-09-26 09:15 AM', '2026-09-26 09:15 AM'
  );

  // 10. Seed Known Issues for Support Agent
  console.log('[Seed] Seeding community known issues...');
  const insertKnownIssue = db.prepare(`
    INSERT OR REPLACE INTO known_issues (id, code, title, category, severity, affected_versions, fixed_version, status, workaround, root_cause, verified_by, verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertKnownIssue.run(
    'ki-01', 'BUG-1821', 'Billing terminal freezes after GST rate update in v2.8.1', 'Billing & POS', 'High',
    '2.8.1', '2.8.2', 'Fixed', 'Restart POS service or toggle offline mode cache in Terminal Settings',
    'Thread lock during synchronous GST index rebuild in local SQLite DB', 'Priya Nair (HQ IT Lead)', '2026-09-24 04:30 PM'
  );

  insertKnownIssue.run(
    'ki-02', 'BUG-1904', 'Thermal printer truncates barcode on 58mm paper rolls', 'Hardware & Printers', 'Medium',
    '2.7.0, 2.8.0', '2.8.3', 'Workaround Available', 'Change print density to Compact in Hardware Settings',
    'Fixed width font canvas assuming 80mm roll width', 'Rohan Sen (HQ IT)', '2026-09-22 11:15 AM'
  );

  insertKnownIssue.run(
    'ki-03', 'BUG-1940', 'UPI QR dynamic generation delays on slow 2G/3G fallback', 'Payments & UPI', 'Medium',
    '2.8.0, 2.8.1', '2.8.2', 'Fixed', 'Keep Static Standby Soundbox QR active on cash counter',
    'WebSocket timeout set to 3s without retry fallback', 'Priya Nair (HQ IT)', '2026-09-25 02:00 PM'
  );

  // 11. Seed Community Posts
  console.log('[Seed] Seeding community posts...');
  const insertPost = db.prepare(`
    INSERT OR REPLACE INTO community_posts (
      id, title, content, category, author_id, author_name, author_role,
      shop_id, shop_name, upvotes, status, is_pinned, is_it_announcement,
      tags, similar_issue_id, ai_classification
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run(
    'post-01',
    'POS terminal freezing during bill generation right after recent software update',
    'Our counter terminal in Kothrud experienced total freeze twice during peak evening hours today when generating invoices with 18% GST items. Had to reboot the terminal manually which delayed customer checkout.',
    'Billing & POS',
    'user-05', 'Ramesh Sharma', 'STORE_MANAGER',
    'shop-01', 'Sharma General Store',
    4, 'Answered', 0, 0,
    JSON.stringify(['POS', 'Billing', 'Crash', 'GST']),
    'ki-01',
    JSON.stringify({ category: 'Billing & POS', confidence: 0.94, suggestedSolution: 'Apply patch v2.8.2 or clear local SQLite cache' })
  );

  // 12. Seed Notifications
  console.log('[Seed] Seeding notifications & audit logs...');
  const insertNotif = db.prepare(`
    INSERT OR REPLACE INTO notifications (id, user_id, target_role, shop_id, title, message, category, severity, link, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run('notif-01', null, 'HQ_OWNER', 'shop-01', 'Stock-Out Imminent: Amul Taaza Milk', 'Sharma General Store has only 1.3 days of milk runway left. Purchase Order draft #PO-2026-INV-101 generated.', 'inventory', 'critical', '/purchase-orders', 0);
  insertNotif.run('notif-02', null, 'HQ_OWNER', 'shop-02', 'High Cash Variance Detected (-₹2,450)', 'Patel Mart closed Shift 1 with -₹2,450 cash shortage vs POS billing receipts.', 'sales', 'critical', '/alerts', 0);
  insertNotif.run('notif-03', null, 'STORE_MANAGER', 'shop-01', 'Udhaar Overdue Alert: Ramesh Traders', 'Ramesh Traders credit outstanding of ₹42,000 has crossed 68 days limit.', 'udhaar', 'critical', '/udhaar', 0);

  // 13. Seed Initial Audit Log
  const insertAudit = db.prepare(`
    INSERT OR REPLACE INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-01', 'system', 'Autonomous Retail Engine', 'SYSTEM', 'system.seed', 'database', 'khatacopilot.db', JSON.stringify({ version: '2.4.0', initialShops: 15 }));

  console.log('[Seed] Normalized database seed complete!');
}

if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase().catch(err => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
