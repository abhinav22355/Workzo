const API = 'http://127.0.0.1:5001/api';

async function req(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Request failed with ${res.status}`);
  }
  return data;
}

async function testAcceptBookingFlow() {
  console.log('--- STARTING WORKER ACCEPT BOOKING FLOW TEST ---');

  // 1. Login Customer
  const customerLogin = await req(`${API}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'rahul@workzo.com',
      password: 'customer123',
    }),
  });
  const customerToken = customerLogin.token;
  const customerId = customerLogin.user.id || customerLogin.user._id;
  console.log('1. Customer logged in:', customerLogin.user.name, customerId);

  // 2. Login Worker
  const workerLogin = await req(`${API}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'raj.plumber@workzo.com',
      password: 'worker123',
    }),
  });
  const workerToken = workerLogin.token;
  const workerId = workerLogin.user.id || workerLogin.user._id;
  console.log('2. Worker logged in:', workerLogin.user.name, workerId);

  // 3. Find Plumber category and Raj's profile
  const categoriesRes = await req(`${API}/services`);
  const plumbingCat = categoriesRes.data.find(c => c.slug === 'plumbing' || c.name.toLowerCase().includes('plumb'));
  console.log('3. Found Service Category:', plumbingCat.name, plumbingCat._id);

  const workersRes = await req(`${API}/workers?service=${plumbingCat.slug}`);
  const rajProfile = workersRes.data.find(w => (w.userId?._id === workerId || w.userId === workerId || w.name === 'Rajesh Kumar'));
  console.log('4. Found Worker Profile:', rajProfile._id);

  // 4. Customer creates a new booking
  const randomSlot = `${10 + Math.floor(Math.random() * 8)}:00 AM`;
  const randomDay = 10 + Math.floor(Math.random() * 15);
  const bookingData = {
    workerId: rajProfile._id,
    serviceId: plumbingCat._id,
    description: 'Leaking pipe under kitchen sink needs repair and gasket replacement',
    date: `2026-10-${randomDay}`,
    time: randomSlot,
    address: '402, Green Valley Apartments, MG Road',
    city: 'Bengaluru',
    pincode: '560001',
    customerNotes: 'Please bring sealant tape and wrench',
    paymentMethod: 'CASH_AFTER_SERVICE',
  };

  const createRes = await req(`${API}/bookings`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify(bookingData),
  });
  const booking = createRes.data;
  console.log('5. Booking created! ID:', booking._id, 'Initial status:', booking.bookingStatus);
  if (booking.bookingStatus !== 'PENDING') {
    throw new Error(`Expected PENDING status, got ${booking.bookingStatus}`);
  }

  // 5. Worker checks their incoming requests
  const workerBookingsRes = await req(`${API}/bookings`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const foundInWorkerList = workerBookingsRes.data.find(b => b._id === booking._id);
  console.log('6. Worker found booking in incoming list:', !!foundInWorkerList);
  if (!foundInWorkerList) {
    throw new Error('Booking not found in worker bookings list');
  }

  // 6. Worker accepts the booking from worker interface
  console.log('7. Worker accepting the booking...');
  const acceptRes = await req(`${API}/bookings/${booking._id}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${workerToken}` },
    body: JSON.stringify({ status: 'ACCEPTED', note: 'I have accepted this job and will arrive on time.' }),
  });
  console.log('8. Worker accepted successfully:', acceptRes.message);
  console.log('   New booking status:', acceptRes.data.bookingStatus);
  if (acceptRes.data.bookingStatus !== 'ACCEPTED') {
    throw new Error(`Expected ACCEPTED status, got ${acceptRes.data.bookingStatus}`);
  }

  // 7. Verify Customer interface view
  console.log('9. Checking customer reflection...');
  const customerViewRes = await req(`${API}/bookings/${booking._id}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const updatedBooking = customerViewRes.data;
  console.log('   Customer sees status:', updatedBooking.bookingStatus);
  console.log('   Timeline length:', updatedBooking.timeline.length);
  const acceptedTimelineItem = updatedBooking.timeline.find(t => t.status === 'ACCEPTED');
  console.log('   Timeline acceptance note:', acceptedTimelineItem ? acceptedTimelineItem.note : 'NONE');

  if (updatedBooking.bookingStatus !== 'ACCEPTED') {
    throw new Error('Customer view does not reflect ACCEPTED status!');
  }
  if (!acceptedTimelineItem) {
    throw new Error('Accepted event not recorded in timeline!');
  }

  // 8. Verify Customer received notification
  const notificationsRes = await req(`${API}/notifications`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const latestNotification = notificationsRes.data[0];
  console.log('10. Customer notification title:', latestNotification?.title);
  console.log('    Customer notification message:', latestNotification?.message);

  // 9. Worker advances booking to ON_THE_WAY
  console.log('11. Worker dispatches (ON_THE_WAY)...');
  const onTheWayRes = await req(`${API}/bookings/${booking._id}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${workerToken}` },
    body: JSON.stringify({ status: 'ON_THE_WAY' }),
  });
  console.log('    Status updated to:', onTheWayRes.data.bookingStatus);

  console.log('--- ALL ACCEPTANCE & REFLECTION TESTS PASSED PERFECTLY ---');
}

testAcceptBookingFlow().catch((err) => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
