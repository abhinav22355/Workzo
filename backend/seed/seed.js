const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const ServiceCategory = require('../models/ServiceCategory');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { connectDB } = require('../config/db');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  console.log('[Seed] Clearing existing collections...');

  await Promise.all([
    User.deleteMany({}),
    WorkerProfile.deleteMany({}),
    ServiceCategory.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[Seed] Inserting Service Categories...');
  const categoriesData = [
    {
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Professional plumbers for leak repair, pipe fittings, drain unclogging and sanitary installations.',
      icon: 'Wrench',
      startingPrice: 249,
      isActive: true,
    },
    {
      name: 'Electrical',
      slug: 'electrical',
      description: 'Certified electricians for wiring, circuit breakers, light fixtures, switchboards, and fan repairs.',
      icon: 'Zap',
      startingPrice: 199,
      isActive: true,
    },
    {
      name: 'Cleaning',
      slug: 'cleaning',
      description: 'Deep house cleaning, kitchen scrubbing, bathroom sanitization, and sofa shampooing.',
      icon: 'Sparkles',
      startingPrice: 399,
      isActive: true,
    },
    {
      name: 'Carpentry',
      slug: 'carpentry',
      description: 'Expert woodwork, modular kitchen repair, furniture assembly, hinges, and lock replacement.',
      icon: 'Hammer',
      startingPrice: 299,
      isActive: true,
    },
    {
      name: 'Painting',
      slug: 'painting',
      description: 'Interior & exterior wall painting, waterproof waterproofing, texture walls, and whitewashing.',
      icon: 'Paintbrush',
      startingPrice: 799,
      isActive: true,
    },
    {
      name: 'AC Repair',
      slug: 'ac-repair',
      description: 'Comprehensive AC servicing, coolant gas refilling, coil cleaning, and compressor repair.',
      icon: 'Wind',
      startingPrice: 349,
      isActive: true,
    },
    {
      name: 'Appliance Repair',
      slug: 'appliance-repair',
      description: 'Troubleshooting and repair for refrigerators, washing machines, microwaves, and chimneys.',
      icon: 'Tv',
      startingPrice: 299,
      isActive: true,
    },
    {
      name: 'Gardening',
      slug: 'gardening',
      description: 'Lawn trimming, hedge pruning, plant potting, weed cleanup, and seasonal garden maintenance.',
      icon: 'Flower2',
      startingPrice: 249,
      isActive: true,
    },
    {
      name: 'Moving & Shifting',
      slug: 'moving-shifting',
      description: 'Padded packing, hassle-free loading, safe relocation, and door-to-door shifting service.',
      icon: 'Truck',
      startingPrice: 1299,
      isActive: true,
    },
    {
      name: 'Pest Control',
      slug: 'pest-control',
      description: 'Eco-friendly odorless sprays for termites, bed bugs, cockroaches, and rodent elimination.',
      icon: 'Bug',
      startingPrice: 499,
      isActive: true,
    },
  ];

  const insertedCategories = await ServiceCategory.insertMany(categoriesData);
  const catMap = {};
  insertedCategories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  console.log('[Seed] Creating Admin and Customer Users...');
  const adminUser = await User.create({
    name: 'Workzo Admin',
    email: 'admin@workzo.com',
    phone: '+91 98765 00000',
    password: 'Admin@12345',
    role: 'admin',
    address: 'Workzo Tech Park, Level 4',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  });

  const customer1 = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@workzo.com',
    phone: '+91 98111 22334',
    password: 'customer123',
    role: 'customer',
    address: 'Flat 402, Sunshine Apartments, Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  });

  const customer2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@workzo.com',
    phone: '+91 98222 33445',
    password: 'customer123',
    role: 'customer',
    address: 'Villa 14, Palm Meadows, Whitefield',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  });

  const customer3 = await User.create({
    name: 'Amit Verma',
    email: 'amit@workzo.com',
    phone: '+91 98333 44556',
    password: 'customer123',
    role: 'customer',
    address: 'House 88, 5th Main, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560034',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  });

  console.log('[Seed] Creating 16 Service Workers...');
  const workerSeedSpecs = [
    {
      name: 'Raj Kumar',
      email: 'raj.plumber@workzo.com',
      phone: '+91 97111 01001',
      catSlug: 'plumbing',
      profession: 'Senior Master Plumber',
      skills: ['Pipe Fitting', 'Bathroom Leakage', 'Drain Unclogging', 'Geyser Installation'],
      experience: 8,
      description: 'Certified master plumber with 8+ years experience handling residential leaks, pipeline installations, and sanitary maintenance with guaranteed satisfaction.',
      serviceArea: 'Indiranagar, Koramangala, Domlur, HSR Layout',
      city: 'Bangalore',
      pricing: { startingRate: 249, hourlyRate: 349, visitingCharge: 99 },
      rating: 4.9,
      totalReviews: 24,
      completedJobs: 82,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Ramesh Sharma',
      email: 'ramesh.electrician@workzo.com',
      phone: '+91 97111 01002',
      catSlug: 'electrical',
      profession: 'Licensed Electrician',
      skills: ['Short Circuit Repair', 'MCB Wiring', 'Ceiling Fan Installation', 'Inverter Setup'],
      experience: 6,
      description: 'Government certified wireman. Specializes in rapid home emergency power tripping, switchboards, decorative light hanging, and heavy appliances wiring.',
      serviceArea: 'Koramangala, BTM Layout, HSR Layout, JP Nagar',
      city: 'Bangalore',
      pricing: { startingRate: 199, hourlyRate: 299, visitingCharge: 99 },
      rating: 4.8,
      totalReviews: 31,
      completedJobs: 114,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Sunita Devi',
      email: 'sunita.cleaner@workzo.com',
      phone: '+91 97111 01003',
      catSlug: 'cleaning',
      profession: 'Deep Cleaning Specialist',
      skills: ['Deep Villa Cleaning', 'Kitchen Degreasing', 'Bathroom Scrubbing', 'Sofa Shampoo'],
      experience: 5,
      description: 'Professional hygiene and deep sanitization specialist. Uses eco-friendly non-toxic supplies for immaculate home spotless deep cleans.',
      serviceArea: 'Whitefield, Marathahalli, Bellandur, Sarjapur',
      city: 'Bangalore',
      pricing: { startingRate: 399, hourlyRate: 499, visitingCharge: 149 },
      rating: 4.9,
      totalReviews: 19,
      completedJobs: 65,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.carpenter@workzo.com',
      phone: '+91 97111 01004',
      catSlug: 'carpentry',
      profession: 'Master Woodcraft & Carpenter',
      skills: ['Custom Shelving', 'Door Lock Installation', 'Bed & Wardrobe Assembly', 'Cabinet Hinges'],
      experience: 10,
      description: 'Over 10 years of woodworking craft. Expert in IKEA/custom furniture assembly, hydraulic hinge repairs, and wooden door realignment.',
      serviceArea: 'Indiranagar, Ulsoor, MG Road, Frazer Town',
      city: 'Bangalore',
      pricing: { startingRate: 299, hourlyRate: 399, visitingCharge: 99 },
      rating: 4.7,
      totalReviews: 15,
      completedJobs: 48,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Manoj Verma',
      email: 'manoj.painter@workzo.com',
      phone: '+91 97111 01005',
      catSlug: 'painting',
      profession: 'Professional Wall Painter',
      skills: ['Interior Emulsion', 'Waterproofing', 'Accent Walls', 'Putty Finishing'],
      experience: 7,
      description: 'Expert residential painting contractor. Accurate color matching, clean masking tape prep, zero mess clean up, and moisture protection.',
      serviceArea: 'Jayanagar, JP Nagar, Banashankari, Basavanagudi',
      city: 'Bangalore',
      pricing: { startingRate: 799, hourlyRate: 600, visitingCharge: 199 },
      rating: 4.8,
      totalReviews: 12,
      completedJobs: 39,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Anil Mehta',
      email: 'anil.ac@workzo.com',
      phone: '+91 97111 01006',
      catSlug: 'ac-repair',
      profession: 'HVAC & AC Technician',
      skills: ['Split AC Servicing', 'Gas Leak Detection', 'Cooling Coil Flush', 'Inverter PCB Check'],
      experience: 9,
      description: 'Certified Daikin & Voltas technician. Fast cooling restoration, jet foam servicing, and genuine parts replacement with 60-day warranty.',
      serviceArea: 'Electronic City, HSR Layout, Bommanahalli, Kudlu',
      city: 'Bangalore',
      pricing: { startingRate: 349, hourlyRate: 449, visitingCharge: 149 },
      rating: 4.9,
      totalReviews: 42,
      completedJobs: 130,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Dinesh Gupta',
      email: 'dinesh.appliances@workzo.com',
      phone: '+91 97111 01007',
      catSlug: 'appliance-repair',
      profession: 'Senior Appliance Technician',
      skills: ['Front Load Washing Machine', 'Double Door Fridge', 'Microwave Oven', 'Kitchen Chimney'],
      experience: 8,
      description: 'Specialist in multi-brand home appliance diagnosis. Accurate fault isolation and on-the-spot component repair.',
      serviceArea: 'Whitefield, Kadugodi, Hoodi, KR Puram',
      city: 'Bangalore',
      pricing: { startingRate: 299, hourlyRate: 399, visitingCharge: 99 },
      rating: 4.7,
      totalReviews: 22,
      completedJobs: 73,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Suresh Yadav',
      email: 'suresh.gardener@workzo.com',
      phone: '+91 97111 01008',
      catSlug: 'gardening',
      profession: 'Landscape & Garden Horticulturist',
      skills: ['Lawn Trimming', 'Fertilizer Application', 'Balcony Garden Setup', 'Bonsai & Plant Care'],
      experience: 6,
      description: 'Dedicated landscape gardener with love for lush green flora. Balcony transformations, seasonal soil rejuvenation, and healthy organic care.',
      serviceArea: 'Koramangala, Indiranagar, Richmond Town, Lavelle Road',
      city: 'Bangalore',
      pricing: { startingRate: 249, hourlyRate: 349, visitingCharge: 99 },
      rating: 4.9,
      totalReviews: 18,
      completedJobs: 56,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Deepak Malhotra',
      email: 'deepak.movers@workzo.com',
      phone: '+91 97111 01009',
      catSlug: 'moving-shifting',
      profession: 'Relocation & Logistics Specialist',
      skills: ['Padded Bubble Wrap', 'Heavy Furniture Loading', 'Fragile Item Transport', 'Unpacking Service'],
      experience: 7,
      description: 'Zero damage relocation service. Experienced team with specialized padded trolleys, blankets, and safe transit trucks.',
      serviceArea: 'All Bangalore (Indiranagar, Whitefield, Electronic City, Yelahanka)',
      city: 'Bangalore',
      pricing: { startingRate: 1299, hourlyRate: 999, visitingCharge: 299 },
      rating: 4.8,
      totalReviews: 27,
      completedJobs: 88,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Sanjay Joshi',
      email: 'sanjay.pest@workzo.com',
      phone: '+91 97111 01010',
      catSlug: 'pest-control',
      profession: 'Certified Pest Control Specialist',
      skills: ['Herbal Termite Drill', 'Cockroach Gel Treatment', 'Bed Bug Heat Extermination', 'Mosquito Fogging'],
      experience: 9,
      description: 'Safe government approved chemical treatments. Safe for pets, children, and seniors. Comes with 90-day re-service warranty.',
      serviceArea: 'Malleshwaram, Rajajinagar, Yeshwanthpur, Hebbal',
      city: 'Bangalore',
      pricing: { startingRate: 499, hourlyRate: 599, visitingCharge: 149 },
      rating: 4.9,
      totalReviews: 33,
      completedJobs: 104,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Arvind Kumar',
      email: 'arvind.plumber@workzo.com',
      phone: '+91 97111 01011',
      catSlug: 'plumbing',
      profession: 'Sanitary & Pipeline Technician',
      skills: ['Water Tank Cleaning', 'Shower Mixer Repair', 'Kitchen Sink Clog', 'RO Water Filter Line'],
      experience: 4,
      description: 'Prompt plumbing professional providing neat plumbing work, fast emergency response, and fair upfront estimates.',
      serviceArea: 'Hebbal, Sahakar Nagar, Yelahanka, Hennur',
      city: 'Bangalore',
      pricing: { startingRate: 229, hourlyRate: 319, visitingCharge: 99 },
      rating: 4.6,
      totalReviews: 14,
      completedJobs: 41,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Preeti Nair',
      email: 'preeti.cleaner@workzo.com',
      phone: '+91 97111 01012',
      catSlug: 'cleaning',
      profession: 'Sanitization & Home Organizer',
      skills: ['Appliance Detailing', 'Window Glass Cleaning', 'Floor Buffing', 'Move-in Move-out Cleaning'],
      experience: 6,
      description: 'Detail-oriented deep cleaning professional with high ratings for speed, thoroughness, and courteous service.',
      serviceArea: 'HSR Layout, Bellandur, Sarjapur Road, Haralur',
      city: 'Bangalore',
      pricing: { startingRate: 349, hourlyRate: 450, visitingCharge: 129 },
      rating: 4.9,
      totalReviews: 28,
      completedJobs: 79,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Rohit Bansal',
      email: 'rohit.tech@workzo.com',
      phone: '+91 97111 01013',
      catSlug: 'electrical',
      profession: 'Smart Home & Electrical Tech',
      skills: ['Smart Switches', 'Home Automation', 'Chandelier Hanging', 'UPS & Battery Setup'],
      experience: 5,
      description: 'Tech-savvy electrician comfortable with modern smart switches, Wi-Fi relays, smart plugs, and traditional electrical circuitry.',
      serviceArea: 'Whitefield, Brookfield, Mahadevapura, Bellandur',
      city: 'Bangalore',
      pricing: { startingRate: 249, hourlyRate: 349, visitingCharge: 99 },
      rating: 4.8,
      totalReviews: 16,
      completedJobs: 52,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Karan Thakur',
      email: 'karan.carpenter@workzo.com',
      phone: '+91 97111 01014',
      catSlug: 'carpentry',
      profession: 'Furniture Restorer & Carpenter',
      skills: ['Wood Polishing', 'Sofa Frame Repair', 'Sliding Wardrobe Tracks', 'Window Latch Fix'],
      experience: 8,
      description: 'Specialist in solid wood furniture rejuvenation, antique restoration, polyurethane polish, and precise carpentry repairs.',
      serviceArea: 'BTM Layout, Bannerghatta Road, JP Nagar, Jayanagar',
      city: 'Bangalore',
      pricing: { startingRate: 279, hourlyRate: 379, visitingCharge: 99 },
      rating: 4.7,
      totalReviews: 21,
      completedJobs: 67,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Ajay Rawat',
      email: 'ajay.painter@workzo.com',
      phone: '+91 97111 01015',
      catSlug: 'painting',
      profession: 'Creative Finishes & House Painter',
      skills: ['Stencil Designs', 'Waterproof Damp Proofing', 'Wood Varnish', 'Exterior Weather Protection'],
      experience: 6,
      description: 'Fast, tidy, and reliable wall painting with expert color consulting and damp-wall anti-fungal treatment.',
      serviceArea: 'Koramangala, Indiranagar, Domlur, Victoria Layout',
      city: 'Bangalore',
      pricing: { startingRate: 699, hourlyRate: 550, visitingCharge: 199 },
      rating: 4.8,
      totalReviews: 14,
      completedJobs: 43,
      verificationStatus: 'verified',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Pankaj Tiwari',
      email: 'pankaj.worker@workzo.com',
      phone: '+91 97111 01016',
      catSlug: 'plumbing',
      profession: 'Apprentice Plumber',
      skills: ['General Pipe Repairs', 'Tap Replacement'],
      experience: 2,
      description: 'Newly registered technician awaiting admin background verification review.',
      serviceArea: 'Indiranagar, Bangalore',
      city: 'Bangalore',
      pricing: { startingRate: 199, hourlyRate: 250, visitingCharge: 99 },
      rating: 5.0,
      totalReviews: 0,
      completedJobs: 0,
      verificationStatus: 'pending', // FOR TESTING ADMIN VERIFICATION FLOW!
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
  ];

  const createdWorkers = [];
  for (const spec of workerSeedSpecs) {
    const user = await User.create({
      name: spec.name,
      email: spec.email,
      phone: spec.phone,
      password: 'worker123',
      role: 'worker',
      city: spec.city,
      state: 'Karnataka',
      address: `${spec.serviceArea.split(',')[0]}, ${spec.city}`,
      pincode: '560001',
      profileImage: spec.image,
    });

    const profile = await WorkerProfile.create({
      userId: user._id,
      profession: spec.profession,
      skills: spec.skills,
      experience: spec.experience,
      description: spec.description,
      serviceCategories: [catMap[spec.catSlug]],
      serviceArea: spec.serviceArea,
      pricing: spec.pricing,
      rating: spec.rating,
      totalReviews: spec.totalReviews,
      completedJobs: spec.completedJobs,
      verificationStatus: spec.verificationStatus,
      profileImage: spec.image,
      badges: spec.verificationStatus === 'verified' ? ['Identity Verified', 'Skill Tested', 'Background Checked'] : ['Pending Review'],
    });

    createdWorkers.push({ user, profile, catSlug: spec.catSlug });
  }

  console.log('[Seed] Creating Sample Bookings and Timeline Records...');
  const rajWorker = createdWorkers.find((w) => w.user.email === 'raj.plumber@workzo.com');
  const rameshWorker = createdWorkers.find((w) => w.user.email === 'ramesh.electrician@workzo.com');
  const sunitaWorker = createdWorkers.find((w) => w.user.email === 'sunita.cleaner@workzo.com');
  const anilWorker = createdWorkers.find((w) => w.user.email === 'anil.ac@workzo.com');

  // 1. Completed Booking with Review
  const booking1 = await Booking.create({
    customerId: customer1._id,
    workerId: rajWorker.user._id,
    serviceId: catMap['plumbing'],
    description: 'Major leak underneath kitchen sink and low water pressure in bathroom faucet.',
    date: '2026-10-02',
    time: '10:30 AM',
    address: customer1.address,
    city: customer1.city,
    pincode: customer1.pincode,
    serviceCharge: 349,
    bookingFee: 50,
    price: 399,
    paymentMethod: 'CASH_AFTER_SERVICE',
    paymentStatus: 'PAID',
    bookingStatus: 'COMPLETED',
    customerNotes: 'Please ring the doorbell twice.',
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 4 * 86400000), note: 'Booking requested by customer' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 3.9 * 86400000), note: 'Worker confirmed appointment' },
      { status: 'ON_THE_WAY', timestamp: new Date(Date.now() - 3.8 * 86400000), note: 'Worker departed towards customer' },
      { status: 'STARTED', timestamp: new Date(Date.now() - 3.7 * 86400000), note: 'Service started on site' },
      { status: 'COMPLETED', timestamp: new Date(Date.now() - 3.5 * 86400000), note: 'Service completed successfully' },
      { status: 'PAID', timestamp: new Date(Date.now() - 3.5 * 86400000), note: 'Cash payment confirmed by customer' },
    ],
  });

  await Review.create({
    bookingId: booking1._id,
    customerId: customer1._id,
    workerId: rajWorker.user._id,
    rating: 5,
    comment: 'Raj arrived right on time and fixed the sink leak in 25 minutes flat! Very clean and professional. Highly recommended!',
  });

  await Payment.create({
    bookingId: booking1._id,
    customerId: customer1._id,
    workerId: rajWorker.user._id,
    amount: 399,
    paymentMethod: 'CASH_AFTER_SERVICE',
    status: 'PAID',
    transactionId: 'TXN_CASH_' + Date.now().toString().slice(-6),
  });

  // 2. Another Completed Booking with Review for Ramesh
  const booking2 = await Booking.create({
    customerId: customer2._id,
    workerId: rameshWorker.user._id,
    serviceId: catMap['electrical'],
    description: 'Living room main switchboard sparking and inverter cut off tripped.',
    date: '2026-10-03',
    time: '02:00 PM',
    address: customer2.address,
    city: customer2.city,
    pincode: customer2.pincode,
    serviceCharge: 299,
    bookingFee: 50,
    price: 349,
    paymentMethod: 'CASH_AFTER_SERVICE',
    paymentStatus: 'PAID',
    bookingStatus: 'COMPLETED',
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 3 * 86400000), note: 'Booking requested' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 2.9 * 86400000), note: 'Accepted' },
      { status: 'ON_THE_WAY', timestamp: new Date(Date.now() - 2.8 * 86400000), note: 'Dispatched' },
      { status: 'STARTED', timestamp: new Date(Date.now() - 2.7 * 86400000), note: 'In progress' },
      { status: 'COMPLETED', timestamp: new Date(Date.now() - 2.5 * 86400000), note: 'Repaired successfully' },
    ],
  });

  await Review.create({
    bookingId: booking2._id,
    customerId: customer2._id,
    workerId: rameshWorker.user._id,
    rating: 5,
    comment: 'Extremely polite and skilled electrician. Solved the short circuit quickly and checked all appliances for safety!',
  });

  await Payment.create({
    bookingId: booking2._id,
    customerId: customer2._id,
    workerId: rameshWorker.user._id,
    amount: 349,
    paymentMethod: 'CASH_AFTER_SERVICE',
    status: 'PAID',
  });

  // 3. In Progress Booking (STARTED) for Anil (AC)
  const booking3 = await Booking.create({
    customerId: customer1._id,
    workerId: anilWorker.user._id,
    serviceId: catMap['ac-repair'],
    description: 'Master bedroom split AC not cooling and making rattling vibration.',
    date: '2026-10-06',
    time: '11:00 AM',
    address: customer1.address,
    city: customer1.city,
    pincode: customer1.pincode,
    serviceCharge: 449,
    bookingFee: 50,
    price: 499,
    paymentMethod: 'CASH_AFTER_SERVICE',
    paymentStatus: 'PENDING',
    bookingStatus: 'STARTED',
    timeline: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 2 * 3600000), note: 'Booking requested' },
      { status: 'ACCEPTED', timestamp: new Date(Date.now() - 1.8 * 3600000), note: 'Accepted by Anil' },
      { status: 'ON_THE_WAY', timestamp: new Date(Date.now() - 1 * 3600000), note: 'On the way' },
      { status: 'STARTED', timestamp: new Date(Date.now() - 0.5 * 3600000), note: 'Cooling diagnostic in progress' },
    ],
  });

  // 4. Pending Booking for Sunita (Cleaning) - Ready for Worker acceptance
  const booking4 = await Booking.create({
    customerId: customer1._id,
    workerId: sunitaWorker.user._id,
    serviceId: catMap['cleaning'],
    description: 'Complete 3BHK deep sanitization before family arrives for festive weekend.',
    date: '2026-10-08',
    time: '09:00 AM',
    address: customer1.address,
    city: customer1.city,
    pincode: customer1.pincode,
    serviceCharge: 499,
    bookingFee: 50,
    price: 549,
    paymentMethod: 'CASH_AFTER_SERVICE',
    paymentStatus: 'PENDING',
    bookingStatus: 'PENDING',
    timeline: [
      { status: 'PENDING', timestamp: new Date(), note: 'Booking request sent to specialist' },
    ],
  });

  // Notifications
  await Notification.create([
    {
      userId: customer1._id,
      title: 'AC Service Started',
      message: 'Anil Mehta has started your AC repair job at your Indiranagar residence.',
      type: 'BOOKING_UPDATE',
      link: `/bookings/${booking3._id}`,
    },
    {
      userId: sunitaWorker.user._id,
      title: 'New Service Request',
      message: 'Rahul Sharma requested 3BHK deep sanitization on 08 October at 09:00 AM.',
      type: 'BOOKING_UPDATE',
      link: `/worker/bookings/${booking4._id}`,
    },
    {
      userId: adminUser._id,
      title: 'Pending Worker Verification',
      message: 'Pankaj Tiwari submitted registration documents for Plumbing verification.',
      type: 'WORKER_VERIFICATION',
      link: '/admin/workers',
    },
  ]);

  console.log('[Seed] Database seeded successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS:');
  console.log('Admin:    admin@workzo.com       | password: Admin@12345');
  console.log('Worker:   raj.plumber@workzo.com | password: worker123');
  console.log('Worker:   ramesh.electrician@workzo.com | password: worker123');
  console.log('Worker:   sunita.cleaner@workzo.com | password: worker123');
  console.log('Worker:   pankaj.worker@workzo.com (Pending) | password: worker123');
  console.log('Customer: rahul@workzo.com       | password: customer123');
  console.log('Customer: priya@workzo.com       | password: customer123');
  console.log('----------------------------------------------------');
};

// Standalone execution
if (require.main === module) {
  connectDB()
    .then(seedData)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

module.exports = { seedData };
