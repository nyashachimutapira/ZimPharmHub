const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');
const Job = require('./models/Job');
const Product = require('./models/Product');
const Pharmacy = require('./models/Pharmacy');
const Article = require('./models/Article');
const Event = require('./models/Event');
const ForumPost = require('./models/ForumPost');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zimpharmhub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function seedDatabase() {
  try {
    // Clear existing data (optional - remove if you want to keep existing data)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Product.deleteMany({});
    await Pharmacy.deleteMany({});
    await Article.deleteMany({});
    await Event.deleteMany({});
    await ForumPost.deleteMany({});

    // Create Users
    console.log('Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@zimpharmhub.com',
      password: hashedPassword,
      userType: 'admin',
      phone: '+263 123 456 789',
      isVerified: true,
      subscriptionStatus: 'enterprise',
    });

    const jobSeeker1 = await User.create({
      firstName: 'John',
      lastName: 'Moyo',
      email: 'john.moyo@example.com',
      password: hashedPassword,
      userType: 'job_seeker',
      phone: '+263 123 456 790',
      location: 'Harare',
      bio: 'Experienced pharmacist with 5 years in the industry. Specialized in clinical pharmacy.',
      certifications: ['BPharm', 'MPharm Clinical Pharmacy', 'Zimbabwe Pharmacy Council License'],
      isVerified: true,
    });

    const jobSeeker2 = await User.create({
      firstName: 'Sarah',
      lastName: 'Dube',
      email: 'sarah.dube@example.com',
      password: hashedPassword,
      userType: 'job_seeker',
      phone: '+263 123 456 791',
      location: 'Bulawayo',
      bio: 'Recent pharmacy graduate seeking opportunities to grow in the field.',
      certifications: ['BPharm', 'Zimbabwe Pharmacy Council License'],
    });

    const pharmacyUser1 = await User.create({
      firstName: 'Michael',
      lastName: 'Ndlovu',
      email: 'michael@healthplus.co.zw',
      password: hashedPassword,
      userType: 'pharmacy',
      phone: '+263 123 456 792',
      location: 'Harare',
      isVerified: true,
      subscriptionStatus: 'premium',
    });

    const pharmacyUser2 = await User.create({
      firstName: 'Grace',
      lastName: 'Chidziva',
      email: 'grace@medicpharm.co.zw',
      password: hashedPassword,
      userType: 'pharmacy',
      phone: '+263 123 456 793',
      location: 'Bulawayo',
      isVerified: true,
    });

    // Create Pharmacies
    console.log('Creating pharmacies...');
    const pharmacy1 = await Pharmacy.create({
      user: pharmacyUser1._id,
      name: 'HealthPlus Pharmacy',
      registrationNumber: 'PHM-2024-001',
      phone: '+263 123 456 792',
      email: 'info@healthplus.co.zw',
      address: '123 Samora Machel Avenue',
      city: 'Harare',
      province: 'Harare',
      zipCode: '263',
      operatingHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '14:00' },
        sunday: { open: 'Closed', close: 'Closed' },
      },
      services: ['Prescription Dispensing', 'Health Consultations', 'Vaccination Services', 'Blood Pressure Monitoring'],
      description: 'A trusted pharmacy serving the Harare community for over 10 years.',
      licenses: ['Zimbabwe Pharmacy Council License #12345'],
      isVerified: true,
      ratings: 4.5,
      totalReviews: 25,
    });

    const pharmacy2 = await Pharmacy.create({
      user: pharmacyUser2._id,
      name: 'MedicPharm Pharmacy',
      registrationNumber: 'PHM-2024-002',
      phone: '+263 123 456 793',
      email: 'info@medicpharm.co.zw',
      address: '456 Fife Avenue',
      city: 'Bulawayo',
      province: 'Bulawayo',
      operatingHours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '17:00' },
        saturday: { open: '09:00', close: '13:00' },
        sunday: { open: 'Closed', close: 'Closed' },
      },
      services: ['Prescription Dispensing', 'Over-the-Counter Sales'],
      description: 'Community pharmacy providing quality healthcare services.',
      isVerified: true,
      ratings: 4.2,
      totalReviews: 15,
    });

    // Create Jobs
    console.log('Creating jobs...');
    const job1 = await Job.create({
      title: 'Senior Pharmacist',
      description: 'We are looking for an experienced pharmacist to join our team. The ideal candidate will have strong clinical knowledge and excellent customer service skills.',
      position: 'Pharmacist',
      salary: { min: 80000, max: 120000, currency: 'ZWL' },
      pharmacy: pharmacyUser1._id,
      location: {
        city: 'Harare',
        province: 'Harare',
        address: '123 Samora Machel Avenue',
      },
      requirements: [
        'Bachelor of Pharmacy degree',
        'Valid Zimbabwe Pharmacy Council license',
        'Minimum 3 years experience',
        'Excellent communication skills',
      ],
      responsibilities: [
        'Dispense prescription medications',
        'Provide patient counseling',
        'Manage inventory',
        'Supervise pharmacy staff',
      ],
      employmentType: 'Full-time',
      status: 'active',
      featured: true,
      applicants: [
        {
          userId: jobSeeker1._id,
          appliedAt: new Date(),
          status: 'reviewing',
        },
      ],
    });

    const job2 = await Job.create({
      title: 'Dispensary Assistant',
      description: 'Entry-level position for a dispensary assistant. Training will be provided.',
      position: 'Dispensary Assistant',
      salary: { min: 35000, max: 45000, currency: 'ZWL' },
      pharmacy: pharmacyUser2._id,
      location: {
        city: 'Bulawayo',
        province: 'Bulawayo',
        address: '456 Fife Avenue',
      },
      requirements: [
        'High school certificate',
        'Willingness to learn',
        'Good customer service skills',
      ],
      responsibilities: [
        'Assist with dispensing',
        'Stock management',
        'Customer service',
      ],
      employmentType: 'Full-time',
      status: 'active',
    });

    const job3 = await Job.create({
      title: 'Pharmacy Manager',
      description: 'Seeking an experienced pharmacy manager to oversee daily operations.',
      position: 'Pharmacy Manager',
      salary: { min: 100000, max: 150000, currency: 'ZWL' },
      pharmacy: pharmacyUser1._id,
      location: {
        city: 'Harare',
        province: 'Harare',
      },
      requirements: [
        'Bachelor of Pharmacy degree',
        'Management experience preferred',
        '5+ years pharmacy experience',
      ],
      responsibilities: [
        'Manage pharmacy operations',
        'Staff supervision',
        'Inventory management',
        'Compliance and regulatory matters',
      ],
      employmentType: 'Full-time',
      status: 'active',
      featured: true,
    });

    // Create Products
    console.log('Creating products...');
    await Product.create({
      name: 'Panadol 500mg Tablets',
      description: 'Paracetamol tablets for pain relief and fever reduction. 100 tablets per pack.',
      category: 'Medications',
      pharmacy: pharmacy1._id,
      price: { amount: 15.50, currency: 'ZWL' },
      stock: 150,
      manufacturer: 'GlaxoSmithKline',
      dosage: '1-2 tablets every 4-6 hours',
      available: true,
      rating: 4.5,
    });

    await Product.create({
      name: 'Vitamin D3 Supplements',
      description: 'High-strength vitamin D3 supplements for bone health. 60 capsules.',
      category: 'Supplements',
      pharmacy: pharmacy1._id,
      price: { amount: 45.00, currency: 'ZWL' },
      stock: 80,
      manufacturer: 'Nature\'s Best',
      dosage: '1 capsule daily',
      available: true,
      rating: 4.3,
    });

    await Product.create({
      name: 'Blood Pressure Monitor',
      description: 'Digital automatic blood pressure monitor with large display.',
      category: 'Medical Devices',
      pharmacy: pharmacy2._id,
      price: { amount: 250.00, currency: 'ZWL' },
      stock: 25,
      manufacturer: 'Omron',
      available: true,
      rating: 4.7,
    });

    // Create Articles
    console.log('Creating articles...');
    await Article.create({
      title: 'Understanding Prescription Medications',
      slug: 'understanding-prescription-medications',
      content: 'A comprehensive guide to understanding prescription medications, their uses, and important safety information. This article covers the basics of prescription drugs, how they work, and safety considerations for patients and healthcare providers.',
      excerpt: 'Learn the fundamentals of prescription medications and safety guidelines.',
      author: adminUser._id,
      category: 'Educational',
      tags: ['medications', 'safety', 'prescription'],
      published: true,
      publishedAt: new Date(),
      views: 150,
    });

    await Article.create({
      title: 'Continuing Education for Pharmacy Professionals',
      slug: 'continuing-education-pharmacy-professionals',
      content: 'Important information about continuing education requirements and opportunities for pharmacy professionals in Zimbabwe. Learn about certification programs, training opportunities, and staying current with industry best practices.',
      excerpt: 'Stay updated with continuing education requirements and opportunities.',
      author: adminUser._id,
      category: 'Educational',
      tags: ['education', 'certification', 'professional development'],
      published: true,
      publishedAt: new Date(),
      views: 89,
    });

    // Create Events
    console.log('Creating events...');
    await Event.create({
      title: 'Zimbabwe Pharmacy Conference 2024',
      description: 'Annual conference for pharmacy professionals. Topics include new regulations, best practices, and networking opportunities.',
      eventType: 'Conference',
      organizer: 'Zimbabwe Pharmacy Council',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-17'),
      location: 'Harare',
      venue: 'Harare International Conference Centre',
      capacity: 200,
      featured: true,
      tags: ['conference', 'networking', 'professional development'],
    });

    await Event.create({
      title: 'Pharmacy Management Workshop',
      description: 'Workshop on effective pharmacy management and inventory control.',
      eventType: 'Workshop',
      organizer: 'Pharmacy Management Institute',
      startDate: new Date('2024-04-20'),
      endDate: new Date('2024-04-20'),
      location: 'Bulawayo',
      venue: 'Bulawayo Polytechnic',
      capacity: 50,
      tags: ['workshop', 'management', 'training'],
    });

    // Create Forum Posts
    console.log('Creating forum posts...');
    await ForumPost.create({
      title: 'Best practices for inventory management?',
      content: 'What are your best practices for managing pharmacy inventory? Looking for tips and strategies.',
      author: pharmacyUser1._id,
      category: 'Discussion',
      tags: ['inventory', 'management'],
      likes: 5,
    });

    await ForumPost.create({
      title: 'New regulations for 2024',
      content: 'Discussion about the new pharmacy regulations that came into effect this year.',
      author: jobSeeker1._id,
      category: 'News',
      tags: ['regulations', '2024'],
      likes: 8,
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Sample Accounts Created:');
    console.log('Admin: admin@zimpharmhub.com / password123');
    console.log('Job Seeker: john.moyo@example.com / password123');
    console.log('Job Seeker: sarah.dube@example.com / password123');
    console.log('Pharmacy: michael@healthplus.co.zw / password123');
    console.log('Pharmacy: grace@medicpharm.co.zw / password123');
    console.log('\n✨ All sample data has been created!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

