const API_BASE = 'http://127.0.0.1:5001/api';

async function runAdminVerificationSuite() {
  console.log('\n======================================================');
  console.log('   WORKZO ADMIN FLOW & SECURITY VERIFICATION SUITE    ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // --- Step 1: Admin Login Credentials ---
  console.log('--- Step 1: Admin Authentication ---');
  let adminToken = '';
  let adminUser = null;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@workzo.com',
        password: 'Admin@12345',
      }),
    });
    const data = await res.json();

    assert(res.status === 200, 'POST /api/auth/login returns status 200');
    assert(!!data.token, 'Response contains valid JWT token');
    assert(data.user.role === 'admin', 'Authenticated user role is "admin"');
    assert(data.user.email === 'admin@workzo.com', 'Authenticated email is "admin@workzo.com"');
    assert(data.user.name === 'Workzo Admin', 'Authenticated name is "Workzo Admin"');
    assert(data.user.password === undefined, 'Password is omitted from login response');

    adminToken = data.token;
    adminUser = data.user;
  } catch (err) {
    assert(false, `Admin login failed: ${err.message}`);
  }

  // --- Step 2: Role Protection Checks ---
  console.log('\n--- Step 2: Route Protection & Security Guards ---');
  // Customer Login
  let customerToken = '';
  try {
    const custRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'rahul@workzo.com',
        password: 'customer123',
      }),
    });
    const custData = await custRes.json();
    customerToken = custData.token;
  } catch (err) {
    console.error('Customer login failed');
  }

  // Worker Login
  let workerToken = '';
  try {
    const workerRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'raj.plumber@workzo.com',
        password: 'worker123',
      }),
    });
    const workerData = await workerRes.json();
    workerToken = workerData.token;
  } catch (err) {
    console.error('Worker login failed');
  }

  // 2a. Unauthenticated access to admin dashboard
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    assert(res.status === 401, 'Unauthenticated request correctly returns 401 Unauthorized');
  } catch (err) {
    assert(false, `Request failed: ${err.message}`);
  }

  // 2b. Customer access to admin dashboard
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res.status === 403, 'Customer request correctly returns 403 Forbidden');
  } catch (err) {
    assert(false, `Customer guard check failed: ${err.message}`);
  }

  // 2c. Worker access to admin dashboard
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    assert(res.status === 403, 'Worker request correctly returns 403 Forbidden');
  } catch (err) {
    assert(false, `Worker guard check failed: ${err.message}`);
  }

  // 2d. Admin access to admin dashboard
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, 'Admin token successfully accesses /admin/dashboard');
  } catch (err) {
    assert(false, `Admin dashboard request failed: ${err.message}`);
  }

  // --- Step 3: Admin Dashboard KPI Metrics ---
  console.log('\n--- Step 3: Dashboard Analytics & 8 KPI Metrics ---');
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    const stats = data.stats;
    assert(stats.totalUsers !== undefined, `1. Total Users: ${stats.totalUsers}`);
    assert(stats.totalWorkers !== undefined, `2. Total Workers: ${stats.totalWorkers}`);
    assert(stats.pendingWorkers !== undefined, `3. Pending Worker Verification: ${stats.pendingWorkers}`);
    assert(stats.verifiedWorkers !== undefined, `4. Verified Workers: ${stats.verifiedWorkers}`);
    assert(stats.totalBookings !== undefined, `5. Total Bookings: ${stats.totalBookings}`);
    assert(stats.completedBookings !== undefined, `6. Completed Bookings: ${stats.completedBookings}`);
    assert(stats.cancelledBookings !== undefined, `7. Cancelled Bookings: ${stats.cancelledBookings}`);
    assert(stats.totalRevenue !== undefined, `8. Revenue: ₹${stats.totalRevenue}`);
  } catch (err) {
    assert(false, `Dashboard KPI validation failed: ${err.message}`);
  }

  // --- Step 4: Worker Verification Flow ---
  console.log('\n--- Step 4: Worker Verification & Marketplace Visibility Flow ---');
  try {
    // 4a. Fetch pending worker list
    const workersRes = await fetch(`${API_BASE}/admin/workers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const workersData = await workersRes.json();
    assert(workersRes.status === 200, `Admin successfully retrieves worker registry (${workersData.count} workers)`);

    // Find Pankaj Tiwari
    const pankaj = workersData.data.find(
      (w) => w.userId?.email === 'pankaj.worker@workzo.com' || w.profession?.includes('Apprentice')
    );
    assert(!!pankaj, 'Target worker (Pankaj Tiwari) found in worker registry');

    if (pankaj) {
      // First, ensure Pankaj is set to pending for the test
      await fetch(`${API_BASE}/admin/workers/${pankaj._id}/verify`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'pending' }),
      });

      // Verify that customer cannot see pending worker
      const searchResBefore = await fetch(`${API_BASE}/workers?search=Pankaj`);
      const searchDataBefore = await searchResBefore.json();
      assert(
        searchDataBefore.count === 0,
        'Pending worker is NOT visible in public customer search (count: 0)'
      );

      // Admin approves worker: verificationStatus = "verified"
      const verifyRes = await fetch(`${API_BASE}/admin/workers/${pankaj._id}/verify`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'verified' }),
      });
      const verifyData = await verifyRes.json();
      assert(
        verifyData.data.verificationStatus === 'verified',
        'Admin verifies worker: status updated to "verified"'
      );

      // Verify that customer can now see verified worker
      const searchResAfter = await fetch(`${API_BASE}/workers?search=Pankaj`);
      const searchDataAfter = await searchResAfter.json();
      assert(
        searchDataAfter.count === 1 && searchDataAfter.data[0].userId.name === 'Pankaj Tiwari',
        'Verified worker is NOW visible in customer search (count: 1, Name: "Pankaj Tiwari")'
      );

      // Verify customer can also see worker when filtering by plumbing category
      const plumbingRes = await fetch(`${API_BASE}/workers?search=Plumbing`);
      const plumbingData = await plumbingRes.json();
      const hasPankajInPlumbing = plumbingData.data.some((w) => w._id === pankaj._id);
      assert(
        hasPankajInPlumbing,
        'Verified worker appears in Plumbing category service search'
      );
    }
  } catch (err) {
    assert(false, `Worker verification test failed: ${err.message}`);
  }

  // --- Step 5: Frontend Server Availability ---
  console.log('\n--- Step 5: Frontend Client Availability ---');
  try {
    const frontendRes = await fetch('http://127.0.0.1:5173');
    assert(frontendRes.status === 200, 'Frontend Vite dev server is running on http://127.0.0.1:5173');
  } catch (err) {
    assert(false, `Frontend check failed: ${err.message}`);
  }

  // --- Summary ---
  console.log('\n======================================================');
  console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminVerificationSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
