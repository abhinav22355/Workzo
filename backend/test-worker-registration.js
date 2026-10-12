const API_BASE = 'http://127.0.0.1:5001/api';

async function testWorkerJoiningFlows() {
  console.log('\n======================================================');
  console.log('   WORKZO WORKER JOINING & UPGRADE TEST SUITE        ');
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

  // --- Step 1: New Worker Registration ---
  console.log('--- Step 1: Brand New Worker Registration ---');
  const timestamp = Date.now();
  const newWorkerEmail = `electrician.${timestamp}@example.com`;

  try {
    const servicesRes = await fetch(`${API_BASE}/services`);
    const servicesData = await servicesRes.json();
    const electricalCat = servicesData.data.find((s) => s.slug === 'electrical');

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Gaurav Sharma',
        email: newWorkerEmail,
        phone: '+91 98888 77777',
        password: 'password123',
        role: 'worker',
        city: 'Bangalore',
        address: 'HSR Layout Sector 2',
        pincode: '560102',
        profession: 'Licensed Master Electrician',
        skills: 'MCB Tripping, Inverter Setup, Three Phase Wiring',
        experience: 7,
        serviceArea: 'HSR Layout, BTM, Koramangala',
        startingRate: 249,
        hourlyRate: 349,
        serviceCategoryId: electricalCat?._id,
        description: 'Over 7 years of industrial and domestic electrical wiring craft.',
      }),
    });

    const data = await res.json();
    assert(res.status === 201 || res.status === 200, `Worker registration succeeded with status ${res.status}`);
    assert(!!data.token, 'Response contains valid JWT auth token');
    assert(data.user?.role === 'worker', 'User role is "worker"');
    assert(data.user?.email === newWorkerEmail, `Worker email matches: ${newWorkerEmail}`);
    assert(!!data.workerProfile, 'WorkerProfile created');
    assert(data.workerProfile?.profession === 'Licensed Master Electrician', 'Worker profession matches');
    assert(data.workerProfile?.verificationStatus === 'pending', 'Worker starts with verificationStatus: "pending"');
    assert(
      data.workerProfile?.serviceCategories?.length > 0,
      `Worker assigned to service category (${data.workerProfile?.serviceCategories?.[0]})`
    );
  } catch (err) {
    assert(false, `Worker registration failed: ${err.message}`);
  }

  // --- Step 2: Existing Email Conflict Handling ---
  console.log('\n--- Step 2: Duplicate Email Validation ---');
  try {
    const dupRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Worker',
        email: newWorkerEmail, // Already registered in step 1
        phone: '+91 99999 00000',
        password: 'password123',
        role: 'worker',
      }),
    });
    const dupData = await dupRes.json();
    assert(
      dupRes.status === 400 && dupData.message.includes('already exists'),
      `Duplicate email correctly rejected with 400: "${dupData.message}"`
    );
  } catch (err) {
    assert(false, `Duplicate email check failed: ${err.message}`);
  }

  // --- Step 3: Existing Customer Upgrading to Worker ---
  console.log('\n--- Step 3: Customer Upgrading to Worker (/api/auth/become-worker) ---');
  try {
    // Login as existing customer (priya@workzo.com)
    const custLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya@workzo.com', password: 'customer123' }),
    });
    const custLoginData = await custLoginRes.json();
    assert(!!custLoginData.token, 'Logged in as existing customer (priya@workzo.com)');

    // Apply to become a worker with existing account
    const becomeRes = await fetch(`${API_BASE}/auth/become-worker`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${custLoginData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profession: 'Sanitization & Deep Cleaning Specialist',
        skills: 'Villa Sanitization, Kitchen Deep Degreasing',
        experience: 4,
        serviceArea: 'Whitefield, Bangalore',
        startingRate: 399,
        hourlyRate: 499,
        description: 'Certified home hygiene specialist using non-toxic supplies.',
      }),
    });

    const becomeData = await becomeRes.json();
    assert(becomeRes.status === 200, `POST /api/auth/become-worker returned 200 OK`);
    assert(becomeData.user?.role === 'worker', 'User role upgraded to "worker"');
    assert(becomeData.workerProfile?.verificationStatus === 'pending', 'Worker profile set to "pending" verification');
    assert(
      becomeData.workerProfile?.profession === 'Sanitization & Deep Cleaning Specialist',
      'Worker profile profession saved'
    );
  } catch (err) {
    assert(false, `Customer upgrade test failed: ${err.message}`);
  }

  // --- Summary ---
  console.log('\n======================================================');
  console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testWorkerJoiningFlows().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
