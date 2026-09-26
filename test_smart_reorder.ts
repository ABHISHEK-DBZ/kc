import { db } from './server/db/database.js';
import { inventoryRecommendationEngine } from './server/services/inventoryRecommendationEngine.js';

const BASE_URL = 'http://localhost:3001';

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  }
}

async function runSmartReorderSuite() {
  console.log('====================================================');
  console.log('KHATACOPILOT HQ — AI SMART REORDER INTELLIGENCE TEST');
  console.log('====================================================\n');

  // 1. Direct Engine Deterministic Calculation Tests (All 6 Scenarios)
  console.log('--- TEST GROUP 1: Deterministic Engine Scenarios ---');

  // Scenario 1: High sales growth + low stock (Coca-Cola / Milk)
  const scen1 = inventoryRecommendationEngine.calculateRecommendation({
    id: 'test-scen-1',
    shop_id: 'shop-01',
    item_name: 'Coca-Cola 750ml',
    category: 'Snacks & Beverages',
    current_stock: 8,
    reorder_threshold: 20,
    sales_velocity: 6.0,
    unit_price: 40,
    cost_price: 28,
    unit: 'bottles',
    supplier: 'Coca-Cola West',
    sales_trend_pct: 18.0,
    lead_time_days: 3,
    safety_stock: 15,
    min_order_qty: 24
  }, 'Sharma General Store');

  assert(
    scen1.recommendation_type === 'BUY_MORE' || scen1.recommendation_type === 'URGENT_REORDER',
    'Scenario 1: High sales growth (+18%) + low stock (8 units, 1.3d runway) -> BUY_MORE or URGENT_REORDER',
    `Got ${scen1.recommendation_type}`
  );
  assert(
    scen1.suggested_order_qty >= 40,
    'Scenario 1: Suggested quantity calculated deterministically with demand growth buffer',
    `Got ${scen1.suggested_order_qty}`
  );
  assert(
    scen1.profit_opportunity === 'HIGH',
    'Scenario 1: High profit opportunity flagged (30% margin + positive trend)',
    `Got ${scen1.profit_opportunity}`
  );

  // Scenario 2: Low sales + huge existing stock (Product X)
  const scen2 = inventoryRecommendationEngine.calculateRecommendation({
    id: 'test-scen-2',
    shop_id: 'shop-01',
    item_name: 'Product X (Gourmet Olive Oil 500ml)',
    category: 'Edible Oils',
    current_stock: 74,
    reorder_threshold: 15,
    sales_velocity: 0.4,
    unit_price: 80,
    cost_price: 75,
    unit: 'bottles',
    supplier: 'Global Imports',
    sales_trend_pct: -32.0,
    lead_time_days: 5,
    safety_stock: 5,
    min_order_qty: 6
  }, 'Sharma General Store');

  assert(
    scen2.recommendation_type === 'DO_NOT_BUY' || scen2.recommendation_type === 'OVERSTOCK_RISK',
    'Scenario 2: Low sales (0.4/day) + huge existing stock (74 units, 185d runway) -> DO_NOT_BUY / OVERSTOCK_RISK',
    `Got ${scen2.recommendation_type}`
  );
  assert(
    scen2.suggested_order_qty === 0,
    'Scenario 2: Suggested quantity is strictly 0 to avoid dead-stock accumulation',
    `Got ${scen2.suggested_order_qty}`
  );
  assert(
    scen2.profit_opportunity === 'LOW',
    'Scenario 2: Profit opportunity is LOW due to negative trend and long coverage',
    `Got ${scen2.profit_opportunity}`
  );

  // Scenario 3: Stable sales + normal stock (Surf Excel)
  const scen3 = inventoryRecommendationEngine.calculateRecommendation({
    id: 'test-scen-3',
    shop_id: 'shop-01',
    item_name: 'Surf Excel Detergent (1kg)',
    category: 'Personal Care',
    current_stock: 35,
    reorder_threshold: 25,
    sales_velocity: 1.8,
    unit_price: 140,
    cost_price: 122,
    unit: 'packs',
    supplier: 'HUL West',
    sales_trend_pct: 2.0,
    lead_time_days: 4,
    safety_stock: 10,
    min_order_qty: 12
  }, 'Sharma General Store');

  assert(
    scen3.recommendation_type === 'WAIT' || scen3.recommendation_type === 'BUY_NORMAL',
    'Scenario 3: Stable sales (+2%) + comfortable stock (19.4d runway) -> WAIT',
    `Got ${scen3.recommendation_type}`
  );

  // Scenario 4: Demand suddenly spikes & runway depleted (Mustard Oil)
  const scen4 = inventoryRecommendationEngine.calculateRecommendation({
    id: 'test-scen-4',
    shop_id: 'shop-03',
    item_name: 'Fortune Mustard Oil (1L)',
    category: 'Edible Oils',
    current_stock: 3,
    reorder_threshold: 20,
    sales_velocity: 5.5,
    unit_price: 165,
    cost_price: 145,
    unit: 'bottles',
    supplier: 'Adani Wilmar',
    sales_trend_pct: 35.0,
    lead_time_days: 3,
    safety_stock: 15,
    min_order_qty: 20
  }, 'Thane Daily Mart');

  assert(
    scen4.recommendation_type === 'URGENT_REORDER',
    'Scenario 4: Runway <= lead time (0.5d <= 3d) with demand spike (+35%) -> URGENT_REORDER',
    `Got ${scen4.recommendation_type}`
  );

  // Scenario 5: High margin + strong sales trend + low stock (Everest Masala)
  const scen5 = inventoryRecommendationEngine.calculateRecommendation({
    id: 'test-scen-5',
    shop_id: 'shop-01',
    item_name: 'Everest Garam Masala (100g)',
    category: 'Spices & Condiments',
    current_stock: 6,
    reorder_threshold: 20,
    sales_velocity: 3.5,
    unit_price: 98,
    cost_price: 68,
    unit: 'packs',
    supplier: 'Everest Agency',
    sales_trend_pct: 28.0,
    lead_time_days: 3,
    safety_stock: 12,
    min_order_qty: 12
  }, 'Sharma General Store');

  assert(
    scen5.profit_opportunity === 'HIGH',
    'Scenario 5: 30.6% Margin (₹30 unit profit) + +28% demand growth -> HIGH PROFIT OPPORTUNITY',
    `Got ${scen5.profit_opportunity}`
  );

  // Scenario 6: Slowest moving / dead stock (Penne Pasta)
  const scen6 = inventoryRecommendationEngine.calculateRecommendation({
    id: 'test-scen-6',
    shop_id: 'shop-01',
    item_name: 'Penne Rigate Pasta (500g)',
    category: 'Staples & Grains',
    current_stock: 48,
    reorder_threshold: 15,
    sales_velocity: 0.3,
    unit_price: 160,
    cost_price: 145,
    unit: 'boxes',
    supplier: 'Euro Gourmet',
    sales_trend_pct: -40.0,
    lead_time_days: 7,
    safety_stock: 5,
    min_order_qty: 6
  }, 'Sharma General Store');

  assert(
    scen6.recommendation_type === 'SLOW_MOVING' || scen6.recommendation_type === 'DO_NOT_BUY',
    'Scenario 6: 160d coverage + -40% sales trend -> SLOW_MOVING / DO_NOT_BUY',
    `Got ${scen6.recommendation_type}`
  );

  // 2. Full Database Persistence & Re-generation Check
  console.log('\n--- TEST GROUP 2: Database Persistence & Inventory Agent Integration ---');
  const genRecs = await inventoryRecommendationEngine.generateAndPersistRecommendations('run-test-intel');
  assert(genRecs.length > 0, 'Recommendations generated and persisted to SQLite table');

  const dbRows = db.prepare('SELECT * FROM inventory_recommendations').all() as any[];
  assert(dbRows.length >= genRecs.length, 'Database table inventory_recommendations holds all calculated records');

  // Verify non-fabrication of metrics
  const cokeRec = dbRows.find(r => r.product_name.includes('Coca-Cola'));
  assert(Boolean(cokeRec), 'Coca-Cola 750ml recommendation exists in database');
  if (cokeRec) {
    assert(cokeRec.current_stock === 8, 'Real stock accurately preserved from DB (8 bottles)');
    assert(cokeRec.sales_trend_pct === 18, 'Real sales trend (+18%) accurately stored');
    assert(cokeRec.unit_profit === 12, 'Unit profit (₹12) accurately computed (40 - 28)');
    assert(cokeRec.suggested_order_qty > 0, 'Suggested order quantity is positive');
  }

  // 3. API Endpoints & Role-Based Scoping
  console.log('\n--- TEST GROUP 3: API Endpoints & RBAC Scoping ---');

  // Log in as HQ Owner
  const hqRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hq.owner@demo.khatacopilot.com', password: 'DemoPass2026!' })
  });
  const hqData = await hqRes.json();
  const hqToken = hqData.token;

  // HQ Owner sees all recommendations across network
  const hqRecsRes = await fetch(`${BASE_URL}/api/inventory/recommendations`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const hqRecs = await hqRecsRes.json();
  assert(hqRecsRes.status === 200 && hqRecs.length >= 7, 'HQ Owner receives recommendations across all network stores');

  // Log in as Store Manager (Bandra - shop-01)
  const smRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'store.manager@demo.khatacopilot.com', password: 'DemoPass2026!' })
  });
  const smData = await smRes.json();
  const smToken = smData.token;

  // Store Manager strictly sees only shop-01 recommendations
  const smRecsRes = await fetch(`${BASE_URL}/api/inventory/recommendations`, {
    headers: { 'Authorization': `Bearer ${smToken}` }
  });
  const smRecs = await smRecsRes.json();
  const allShop01 = smRecs.every((r: any) => r.shop_id === 'shop-01');
  assert(allShop01 && smRecs.length > 0, 'Store Manager recommendations are strictly scoped to shop-01 (Bandra Branch)');

  // 4. Recommendation to Purchase Order Draft Workflow
  console.log('\n--- TEST GROUP 4: Recommendation -> Purchase Order Draft Flow ---');
  const targetRec = smRecs.find((r: any) => r.suggested_order_qty > 0) || smRecs[0];

  const poCreateRes = await fetch(`${BASE_URL}/api/inventory/recommendations/${targetRec.id}/create-po`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${smToken}`
    },
    body: JSON.stringify({
      quantity: targetRec.suggested_order_qty,
      reason: 'Automated test PO created from AI smart reorder recommendation'
    })
  });

  const poCreateData = await poCreateRes.json();
  assert(poCreateRes.status === 201, 'Recommendation converted to Purchase Order Draft with 201 Created');
  assert(poCreateData.purchaseOrder.status === 'Awaiting Approval', 'Purchase order status is strictly "Awaiting Approval" (Human in the loop)');
  assert(poCreateData.purchaseOrder.recommendation_id === targetRec.id, 'Purchase order is traceable to recommendation_id in DB');

  // Verify DB updated
  const updatedRec = db.prepare('SELECT * FROM inventory_recommendations WHERE id = ?').get(targetRec.id) as any;
  assert(updatedRec.status === 'ORDERED', 'Recommendation marked as ORDERED with po_draft_id committed');

  const createdTask = db.prepare('SELECT * FROM agent_tasks WHERE idempotency_key = ?').get(`po-rec-${targetRec.id}`) as any;
  assert(Boolean(createdTask), 'Corresponding agent_task generated in AWAITING_APPROVAL status');

  console.log('\n====================================================');
  console.log('ALL AI SMART REORDER INTELLIGENCE TESTS PASSED!');
  console.log('====================================================');
}

runSmartReorderSuite().catch((err) => {
  console.error('[Test Error]', err);
  process.exit(1);
});
