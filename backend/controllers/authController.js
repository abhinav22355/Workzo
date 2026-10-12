const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const ServiceCategory = require('../models/ServiceCategory');
const Notification = require('../models/Notification');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user (Customer or Worker)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'customer',
      address,
      city,
      state,
      pincode,
      // Worker-specific fields
      profession,
      skills,
      experience,
      description,
      serviceArea,
      startingRate,
      hourlyRate,
      serviceCategoryId,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    let workerProfile = null;

    // If registering as worker, create WorkerProfile
    if (role === 'worker') {
      let categories = [];
      if (serviceCategoryId) {
        categories.push(serviceCategoryId);
      } else if (profession) {
        const allCats = await ServiceCategory.find({ isActive: true });
        const matchedCat = allCats.find((c) =>
          profession.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(profession.toLowerCase()) ||
          profession.toLowerCase().includes(c.slug.toLowerCase())
        );
        if (matchedCat) {
          categories.push(matchedCat._id);
        } else if (allCats.length > 0) {
          categories.push(allCats[0]._id);
        }
      }

      workerProfile = await WorkerProfile.create({
        userId: user._id,
        profession: profession || 'Professional Specialist',
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : ['General Repairs']),
        experience: Number(experience) || 1,
        description: description || `Experienced ${profession || 'specialist'} providing high quality service.`,
        serviceCategories: categories,
        serviceArea: serviceArea || city || 'Metropolitan Area',
        pricing: {
          startingRate: Number(startingRate) || 199,
          hourlyRate: Number(hourlyRate) || 299,
          visitingCharge: 99,
        },
        verificationStatus: 'pending', // Starts pending admin approval
        profileImage: user.profileImage,
      });

      // Admin notification for verification
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          title: 'New Worker Registration',
          message: `${user.name} applied for verification as ${workerProfile.profession}.`,
          type: 'WORKER_VERIFICATION',
          link: '/admin/workers',
        });
      }
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isActive: user.isActive,
      },
      workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact Workzo support.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await WorkerProfile.findOne({ userId: user._id }).populate('serviceCategories', 'name slug');
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isActive: user.isActive,
      },
      workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let workerProfile = null;

    if (user.role === 'worker') {
      workerProfile = await WorkerProfile.findOne({ userId: user._id }).populate('serviceCategories', 'name slug');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isActive: user.isActive,
      },
      workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      profileImage,
      // Worker fields if worker
      profession,
      skills,
      experience,
      description,
      serviceArea,
      pricing,
      availability,
    } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    let workerProfile = null;
    if (user.role === 'worker') {
      workerProfile = await WorkerProfile.findOne({ userId: user._id });
      if (workerProfile) {
        if (profession) workerProfile.profession = profession;
        if (skills) workerProfile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
        if (experience !== undefined) workerProfile.experience = Number(experience);
        if (description) workerProfile.description = description;
        if (serviceArea) workerProfile.serviceArea = serviceArea;
        if (pricing) workerProfile.pricing = { ...workerProfile.pricing, ...pricing };
        if (availability) workerProfile.availability = { ...workerProfile.availability, ...availability };
        if (profileImage) workerProfile.profileImage = profileImage;
        await workerProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isActive: user.isActive,
      },
      workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade existing customer to worker
// @route   POST /api/auth/become-worker
// @access  Private (Customer)
const becomeWorker = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'worker') {
      return res.status(400).json({ success: false, message: 'You are already registered as a worker.' });
    }

    const {
      profession = 'Professional Specialist',
      skills = 'General Repairs',
      experience = 1,
      description = '',
      serviceArea = user.city || 'Bangalore',
      startingRate = 299,
      hourlyRate = 399,
      serviceCategoryId,
    } = req.body;

    let categories = [];
    if (serviceCategoryId) {
      categories.push(serviceCategoryId);
    } else {
      const allCats = await ServiceCategory.find({ isActive: true });
      const matchedCat = allCats.find((c) =>
        profession.toLowerCase().includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().includes(profession.toLowerCase())
      );
      if (matchedCat) {
        categories.push(matchedCat._id);
      } else if (allCats.length > 0) {
        categories.push(allCats[0]._id);
      }
    }

    // Check if worker profile already exists
    let workerProfile = await WorkerProfile.findOne({ userId });
    if (workerProfile) {
      workerProfile.profession = profession;
      workerProfile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim());
      workerProfile.experience = Number(experience);
      workerProfile.description = description || `Experienced ${profession} providing high quality service.`;
      workerProfile.serviceArea = serviceArea;
      workerProfile.pricing = { startingRate: Number(startingRate), hourlyRate: Number(hourlyRate), visitingCharge: 99 };
      workerProfile.serviceCategories = categories;
      workerProfile.verificationStatus = 'pending';
      await workerProfile.save();
    } else {
      workerProfile = await WorkerProfile.create({
        userId,
        profession,
        skills: Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()),
        experience: Number(experience),
        description: description || `Experienced ${profession} providing high quality service.`,
        serviceCategories: categories,
        serviceArea,
        pricing: {
          startingRate: Number(startingRate),
          hourlyRate: Number(hourlyRate),
          visitingCharge: 99,
        },
        verificationStatus: 'pending',
        profileImage: user.profileImage,
      });
    }

    user.role = 'worker';
    await user.save();

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: 'New Worker Application',
        message: `${user.name} applied to become a worker as ${workerProfile.profession}.`,
        type: 'WORKER_VERIFICATION',
        link: '/admin/workers',
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Worker application submitted successfully! Pending verification.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        isActive: user.isActive,
      },
      workerProfile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  becomeWorker,
};
