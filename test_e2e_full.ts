// Comprehensive End-to-End Enterprise Acceptance Test

const BASE_URL = 'http://localhost:3001';

async function runTests() {
  console.log('====================================================');
  console.log('KHATACOPILOT HQ — END-TO-END ACCEPTANCE SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extra?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, extra || '');
      failed++;
    }
  }

  // 1. Health Endpoint
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200 && healthData.status === 'healthy', '1. Server Health Check');

  // 2. Auth - HQ Owner Login
  const hqOwnerRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hq.owner@demo.khatacopilot.com', password: 'DemoPass2026!' })
  });
  const hqOwnerData = await hqOwnerRes.json();
  assert(hqOwnerRes.status === 200 && hqOwnerData.user.role === 'HQ_OWNER' && !!hqOwnerData.token, '2. HQ Owner Authenticated Login');
  const hqToken = hqOwnerData.token;

  // 3. Auth - Invalid Password Rejection
  const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hq.owner@demo.khatacopilot.com', password: 'WrongPassword!' })
  });
  assert(badLoginRes.status === 401, '3. Invalid Password Returns 401 Unauthorized');

  // 4. Role Scope - HQ Owner sees all 15 shops
  const hqShopsRes = await fetch(`${BASE_URL}/api/shops`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const hqShops = await hqShopsRes.json();
  assert(hqShops.length >= 15, '4. HQ Owner Receives All Stores Across Territories');

  // 5. Auth & Scope - Store Manager Login & Territorial Scoping
  const smRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'store.manager@demo.khatacopilot.com', password: 'DemoPass2026!' })
  });
  const smData = await smRes.json();
  const smToken = smData.token;

  const smShopsRes = await fetch(`${BASE_URL}/api/shops`, {
    headers: { 'Authorization': `Bearer ${smToken}` }
  });
  const smShops = await smShopsRes.json();
  assert(smShops.length === 1 && smShops[0].id === 'shop-01', '5. Store Manager Scoped Strictly to Assigned Shop (shop-01)');

  // 6. Security - Store Manager cannot access unauthorized store (shop-02)
  const smForbiddenRes = await fetch(`${BASE_URL}/api/shops/shop-02`, {
    headers: { 'Authorization': `Bearer ${smToken}` }
  });
  assert(smForbiddenRes.status === 403, '6. Store Manager Direct Access to Other Stores Blocked (403 Forbidden)');

  // 7. Area Manager Scope - West Region Only
  const amRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'area.manager@demo.khatacopilot.com', password: 'DemoPass2026!' })
  });
  const amData = await amRes.json();
  const amShopsRes = await fetch(`${BASE_URL}/api/shops`, {
    headers: { 'Authorization': `Bearer ${amData.token}` }
  });
  const amShops = await amShopsRes.json();
  const allWest = amShops.every((s: any) => s.region === 'West');
  assert(amShops.length >= 10 && allWest, '7. Area Manager Scoped Exclusively to West Maharashtra Territory');

  // 8. Franchise Owner Scope - Assigned Franchise Only
  const foRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'franchise.owner@demo.khatacopilot.com', password: 'DemoPass2026!' })
  });
  const foData = await foRes.json();
  const foShopsRes = await fetch(`${BASE_URL}/api/shops`, {
    headers: { 'Authorization': `Bearer ${foData.token}` }
  });
  const foShops = await foShopsRes.json();
  assert(foShops.length > 0 && foShops.every((s: any) => s.franchise_id === 'fran-01'), '8. Franchise Owner Scoped Exclusively to Patel Retail Franchise Stores');

  // 9. HQ IT Scope - Support & Diagnostic Scope
  const itRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hq.it@demo.khatacopilot.com', password: 'DemoPass2026!' })
  });
  const itData = await itRes.json();
  assert(itRes.status === 200 && itData.user.role === 'HQ_IT', '9. HQ IT Lead Authenticated Login');

  // 10. Autonomous Agent Execution - Inventory Agent
  const invRunRes = await fetch(`${BASE_URL}/api/agents/inventory/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const invRunData = await invRunRes.json();
  assert(invRunRes.status === 200 && invRunData.status === 'Completed' && invRunData.critical_findings > 0, '10. Server-Side Autonomous Inventory Agent Run (Detected Stockouts & Generated POs)');

  // 11. Autonomous Agent Execution - Revenue Anomaly Agent
  const revRunRes = await fetch(`${BASE_URL}/api/agents/revenue-anomaly/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const revRunData = await revRunRes.json();
  assert(revRunRes.status === 200 && revRunData.status === 'Completed', '11. Server-Side Revenue Anomaly Agent Run');

  // 12. Autonomous Agent Execution - Cash Risk Agent
  const cshRunRes = await fetch(`${BASE_URL}/api/agents/cash-risk/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const cshRunData = await cshRunRes.json();
  assert(cshRunRes.status === 200 && cshRunData.status === 'Completed', '12. Server-Side Cash Risk Agent Run');

  // 13. Autonomous Agent Execution - Udhaar Risk Agent
  const udhRunRes = await fetch(`${BASE_URL}/api/agents/udhaar-risk/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const udhRunData = await udhRunRes.json();
  assert(udhRunRes.status === 200 && udhRunData.status === 'Completed', '13. Server-Side Udhaar Risk Agent Run');

  // 14. Autonomous Agent Execution - Shop Health Agent
  const hltRunRes = await fetch(`${BASE_URL}/api/agents/shop-health/run`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const hltRunData = await hltRunRes.json();
  assert(hltRunRes.status === 200 && hltRunData.status === 'Completed', '14. Server-Side Shop Health Agent Run');

  // 15. Purchase Order Human Approval Flow
  const poListRes = await fetch(`${BASE_URL}/api/purchase-orders`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const pos = await poListRes.json();
  const pendingPO = pos.find((p: any) => p.status === 'Awaiting Approval');
  assert(!!pendingPO, '15. Found Purchase Order Awaiting Approval', pendingPO?.id);

  if (pendingPO) {
    const approveRes = await fetch(`${BASE_URL}/api/purchase-orders/${pendingPO.id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hqToken}` }
    });
    const approveData = await approveRes.json();
    assert(approveRes.status === 200 && approveData.po.status === 'Approved', '16. Purchase Order Approved and Committed to DB');
  }

  // 17. Community Support Agent Integration
  const postCreateRes = await fetch(`${BASE_URL}/api/community/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hqToken}`
    },
    body: JSON.stringify({
      title: 'POS counter terminal freezing after recent GST update',
      content: 'Our checkout system locks up when applying 18% GST items on billing terminal.',
      category: 'Billing & POS'
    })
  });
  const postData = await postCreateRes.json();
  assert(postCreateRes.status === 201 && !!postData.id, '17. Community Technical Discussion Created');

  // Wait 1.5s for autonomous Support Agent triage
  await new Promise(r => setTimeout(r, 1500));
  const repliesRes = await fetch(`${BASE_URL}/api/community/posts/${postData.id}/replies`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const replies = await repliesRes.json();
  const aiReply = replies.find((r: any) => r.is_solution === 1);
  assert(!!aiReply && aiReply.content.includes('BUG-1821'), '18. Autonomous Support Agent Detected Similar Bug (BUG-1821) & Posted Verified Workaround');

  // 19. GST Draft Report Generation
  const gstRes = await fetch(`${BASE_URL}/api/reports/gst-draft`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const gstData = await gstRes.json();
  assert(gstRes.status === 200 && gstData.totals.totalTaxable > 0 && gstData.disclaimer.includes('DRAFT / DEMO'), '19. Computed GST Draft Report with Required Regulatory Disclaimer');

  // 20. Reports CSV Export
  const exportRes = await fetch(`${BASE_URL}/api/reports/export?type=sales`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const csvText = await exportRes.text();
  assert(exportRes.status === 200 && csvText.startsWith('Date,Shop Name,Revenue'), '20. Generated Real Downloadable CSV Sales Report');

  // 21. Immutable Enterprise Audit Trail
  const auditRes = await fetch(`${BASE_URL}/api/audit-logs`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const audits = await auditRes.json();
  assert(audits.length > 5 && audits.some((a: any) => a.action === 'purchase_order.approved'), '21. Immutable Audit Trail Contains Verified Operational Events');

  // 22. Global Scoped Search
  const searchRes = await fetch(`${BASE_URL}/api/search?q=Sharma`, {
    headers: { 'Authorization': `Bearer ${hqToken}` }
  });
  const searchData = await searchRes.json();
  assert(searchData.shops.length > 0 && searchData.shops[0].name.includes('Sharma'), '22. Global Search Resolves Database Records Within Scope');

  console.log('\n====================================================');
  console.log(`TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('[Test Error]', err);
  process.exit(1);
});
