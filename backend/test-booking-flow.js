const API_BASE = 'http://127.0.0.1:5001/api';

async function testBookingFlow() {
  console.log('\n======================================================');
  console.log('   WORKZO BOOKING SERVICEID & LIFECYCLE TEST SUITE    ');
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

  // --- 1. Customer & Worker Logins ---
  console.log('--- Step 1: Authentication ---');
  let customerToken = '';
  let customerUser = null;
  let workerToken = '';
  let workerUser = null;

  try {
    const custRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@workzo.com', password: 'customer123' }),
    });
    const custData = await custRes.json();
    customerToken = custData.token;
    customerUser = custData.user;
    assert(!!customerToken, 'Customer (rahul@workzo.com) authenticated successfully');

    const workerRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'raj.plumber@workzo.com', password: 'worker123' }),
    });
    const workerData = await workerRes.json();
    workerToken = workerData.token;
    workerUser = workerData.user;
    assert(!!workerToken, 'Worker (raj.plumber@workzo.com) authenticated successfully');
  } catch (err) {
    assert(false, `Authentication failed: ${err.message}`);
  }

  // --- 2. Locate Services & Plumber Worker ---
  console.log('\n--- Step 2: Fetch Services and Target Worker ---');
  let plumbingCategory = null;
  let electricalCategory = null;
  let rajWorkerProfile = null;

  try {
    const servicesRes = await fetch(`${API_BASE}/services`);
    const servicesData = await servicesRes.json();
    plumbingCategory = servicesData.data.find((s) => s.slug === 'plumbing' || s.name === 'Plumbing');
    electricalCategory = servicesData.data.find((s) => s.slug === 'electrical' || s.name === 'Electrical');

    assert(!!plumbingCategory, `Plumbing ServiceCategory found (_id: ${plumbingCategory?._id})`);
    assert(!!electricalCategory, `Electrical ServiceCategory found (_id: ${electricalCategory?._id})`);

    const workersRes = await fetch(`${API_BASE}/workers?serviceId=${plumbingCategory._id}`);
    const workersData = await workersRes.json();
    rajWorkerProfile = workersData.data.find((w) => w.userId.email === 'raj.plumber@workzo.com');
    assert(!!rajWorkerProfile, `Verified plumber (Raj Kumar) found (_id: ${rajWorkerProfile?._id})`);
  } catch (err) {
    assert(false, `Fetch services/worker failed: ${err.message}`);
  }

  // --- 3. Test Negative Validations ---
  console.log('\n--- Step 3: Backend Validation Checks ---');

  // 3a. Missing serviceId
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workerId: rajWorkerProfile._id,
        // serviceId intentionally omitted
        date: '2026-11-15',
        time: '02:00 PM',
        description: 'Test pipe leakage without serviceId',
        address: 'Flat 402, Sunshine Apartments',
        city: 'Bangalore',
        pincode: '560038',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 400 && data.message === 'Service is required for this booking.',
      `Missing serviceId correctly rejected with 400: "${data.message}"`
    );
  } catch (err) {
    assert(false, `Validation check 3a failed: ${err.message}`);
  }

  // 3b. Non-existent serviceId
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workerId: rajWorkerProfile._id,
        serviceId: '600000000000000000000000', // Non-existent ObjectId
        date: '2026-11-15',
        time: '02:00 PM',
        description: 'Test pipe leakage with non-existent serviceId',
        address: 'Flat 402, Sunshine Apartments',
        city: 'Bangalore',
        pincode: '560038',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 400 && data.message === 'Selected service does not exist.',
      `Non-existent serviceId correctly rejected with 400: "${data.message}"`
    );
  } catch (err) {
    assert(false, `Validation check 3b failed: ${err.message}`);
  }

  // 3c. Mismatched worker-service combination (e.g. Electrical for a Plumber)
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workerId: rajWorkerProfile._id,
        serviceId: electricalCategory._id, // Electrical for Plumber Raj Kumar
        date: '2026-11-15',
        time: '02:00 PM',
        description: 'Test electrical work for plumber',
        address: 'Flat 402, Sunshine Apartments',
        city: 'Bangalore',
        pincode: '560038',
      }),
    });
    const data = await res.json();
    assert(
      res.status === 400 && data.message.includes('does not provide'),
      `Mismatched worker-service combination rejected with 400: "${data.message}"`
    );
  } catch (err) {
    assert(false, `Validation check 3c failed: ${err.message}`);
  }

  // --- 4. Test Successful Booking Creation ---
  console.log('\n--- Step 4: Successful Booking Creation ---');
  let createdBooking = null;

  try {
    const bookingPayload = {
      workerId: rajWorkerProfile._id,
      serviceId: plumbingCategory._id,
      date: '2026-11-20',
      time: '10:00 AM',
      description: 'Severe bathroom pipe leakage underneath washbasin requiring gasket replacement.',
      address: 'Flat 402, Sunshine Apartments, Indiranagar',
      city: 'Bangalore',
      pincode: '560038',
      customerNotes: 'Please ring bell twice upon arrival',
      paymentMethod: 'CASH_AFTER_SERVICE',
    };

    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingPayload),
    });
    const data = await res.json();

    assert(res.status === 201, `POST /api/bookings returns 201 Created`);
    assert(!!data.data?._id, `Booking ID generated: ${data.data?._id}`);
    assert(
      data.data?.serviceId?._id === plumbingCategory._id || data.data?.serviceId === plumbingCategory._id,
      `serviceId correctly stored as Plumbing Category ObjectId (${plumbingCategory._id})`
    );
    assert(data.data?.serviceId?.name === 'Plumbing', `serviceId is populated with category name "Plumbing"`);
    assert(data.data?.bookingStatus === 'PENDING', `Initial bookingStatus is "PENDING"`);
    assert(data.data?.price === rajWorkerProfile.pricing.startingRate + 50, `Price calculated correctly: ₹${data.data?.price}`);

    createdBooking = data.data;
  } catch (err) {
    assert(false, `Booking creation failed: ${err.message}`);
  }

  // --- 5. Verify Booking in Customer Bookings ---
  console.log('\n--- Step 5: Customer My Bookings Verification ---');
  try {
    const custBookingsRes = await fetch(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const custBookingsData = await custBookingsRes.json();
    const foundCustBooking = custBookingsData.data.find((b) => b._id === createdBooking?._id);

    assert(!!foundCustBooking, `Created booking found in Customer "My Bookings"`);
    assert(
      foundCustBooking?.serviceId?.name === 'Plumbing',
      `Customer booking displays service name: "${foundCustBooking?.serviceId?.name}"`
    );
    assert(
      foundCustBooking?.workerId?.name === 'Raj Kumar',
      `Customer booking displays worker name: "${foundCustBooking?.workerId?.name}"`
    );
  } catch (err) {
    assert(false, `Customer bookings verification failed: ${err.message}`);
  }

  // --- 6. Verify Booking in Worker Dashboard ---
  console.log('\n--- Step 6: Worker Dashboard Bookings Verification ---');
  try {
    const workerBookingsRes = await fetch(`${API_BASE}/bookings`, {
      headers: { Authorization: `Bearer ${workerToken}` },
    });
    const workerBookingsData = await workerBookingsRes.json();
    const foundWorkerBooking = workerBookingsData.data.find((b) => b._id === createdBooking?._id);

    assert(!!foundWorkerBooking, `Created booking found in Worker Dashboard → Bookings`);
    assert(
      foundWorkerBooking?.serviceId?.name === 'Plumbing',
      `Worker booking displays service category: "${foundWorkerBooking?.serviceId?.name}"`
    );
    assert(
      foundWorkerBooking?.customerId?.name === 'Rahul Sharma',
      `Worker booking displays customer name: "${foundWorkerBooking?.customerId?.name}"`
    );
  } catch (err) {
    assert(false, `Worker bookings verification failed: ${err.message}`);
  }

  // --- Summary ---
  console.log('\n======================================================');
  console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

testBookingFlow().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
