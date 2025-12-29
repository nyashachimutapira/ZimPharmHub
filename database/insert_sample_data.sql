-- ZimPharmHub Sample Data
-- Run this AFTER creating tables (create_tables.sql)
-- psql -U zimpharmuser -d zimpharmhub -f insert_sample_data.sql

-- Note: Passwords are hashed with bcrypt (10 rounds)
-- Default password for all users: password123

-- ============================================
-- INSERT USERS
-- ============================================
INSERT INTO users ("firstName", "lastName", email, password, "userType", phone, location, bio, certifications, "isVerified", "subscriptionStatus") VALUES
('Admin', 'User', 'admin@zimpharmhub.com', '$2a$10$rOzJqPKzXpZzXpZzXpZzX.abcdefghijklmnopqrstuvwxyz123456', 'admin', '+263 123 456 789', 'Harare', 'System Administrator', ARRAY[]::TEXT[], true, 'enterprise'),
('John', 'Moyo', 'john.moyo@example.com', '$2a$10$rOzJqPKzXpZzXpZzXpZzX.abcdefghijklmnopqrstuvwxyz123456', 'job_seeker', '+263 123 456 790', 'Harare', 'Experienced pharmacist with 5 years in the industry', ARRAY['BPharm', 'MPharm Clinical Pharmacy', 'Zimbabwe Pharmacy Council License'], true, 'free'),
('Sarah', 'Dube', 'sarah.dube@example.com', '$2a$10$rOzJqPKzXpZzXpZzXpZzX.abcdefghijklmnopqrstuvwxyz123456', 'job_seeker', '+263 123 456 791', 'Bulawayo', 'Recent pharmacy graduate', ARRAY['BPharm', 'Zimbabwe Pharmacy Council License'], false, 'free'),
('Michael', 'Ndlovu', 'michael@healthplus.co.zw', '$2a$10$rOzJqPKzXpZzXpZzXpZzX.abcdefghijklmnopqrstuvwxyz123456', 'pharmacy', '+263 123 456 792', 'Harare', NULL, ARRAY[]::TEXT[], true, 'premium'),
('Grace', 'Chidziva', 'grace@medicpharm.co.zw', '$2a$10$rOzJqPKzXpZzXpZzXpZzX.abcdefghijklmnopqrstuvwxyz123456', 'pharmacy', '+263 123 456 793', 'Bulawayo', NULL, ARRAY[]::TEXT[], true, 'free')
RETURNING id;

-- Get user IDs (you'll need to note these or query them)
-- SELECT id, email FROM users;

-- ============================================
-- INSERT PHARMACIES
-- ============================================
-- Note: Replace the user_id values with actual UUIDs from users table
INSERT INTO pharmacies (user_id, name, "registrationNumber", phone, email, address, city, province, operating_hours, services, description, "isVerified", ratings, "totalReviews")
SELECT 
    u.id,
    'HealthPlus Pharmacy',
    'PHM-2024-001',
    '+263 123 456 792',
    'info@healthplus.co.zw',
    '123 Samora Machel Avenue',
    'Harare',
    'Harare',
    '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "14:00"}, "sunday": {"open": "Closed", "close": "Closed"}}'::jsonb,
    ARRAY['Prescription Dispensing', 'Health Consultations', 'Vaccination Services'],
    'A trusted pharmacy serving the Harare community',
    true,
    4.5,
    25
FROM users u WHERE u.email = 'michael@healthplus.co.zw';

INSERT INTO pharmacies (user_id, name, "registrationNumber", phone, email, address, city, province, operating_hours, services, description, "isVerified", ratings, "totalReviews")
SELECT 
    u.id,
    'MedicPharm Pharmacy',
    'PHM-2024-002',
    '+263 123 456 793',
    'info@medicpharm.co.zw',
    '456 Fife Avenue',
    'Bulawayo',
    'Bulawayo',
    '{"monday": {"open": "08:00", "close": "17:00"}, "tuesday": {"open": "08:00", "close": "17:00"}, "wednesday": {"open": "08:00", "close": "17:00"}, "thursday": {"open": "08:00", "close": "17:00"}, "friday": {"open": "08:00", "close": "17:00"}, "saturday": {"open": "09:00", "close": "13:00"}, "sunday": {"open": "Closed", "close": "Closed"}}'::jsonb,
    ARRAY['Prescription Dispensing', 'Over-the-Counter Sales'],
    'Community pharmacy providing quality healthcare services',
    true,
    4.2,
    15
FROM users u WHERE u.email = 'grace@medicpharm.co.zw';

-- ============================================
-- INSERT JOBS
-- ============================================
INSERT INTO jobs (title, description, position, salary_min, salary_max, salary_currency, pharmacy_id, location_city, location_province, location_address, requirements, responsibilities, employment_type, status, featured)
SELECT 
    'Senior Pharmacist',
    'We are looking for an experienced pharmacist to join our team. The ideal candidate will have strong clinical knowledge and excellent customer service skills.',
    'Pharmacist',
    80000,
    120000,
    'ZWL',
    u.id,
    'Harare',
    'Harare',
    '123 Samora Machel Avenue',
    ARRAY['Bachelor of Pharmacy degree', 'Valid Zimbabwe Pharmacy Council license', 'Minimum 3 years experience', 'Excellent communication skills'],
    ARRAY['Dispense prescription medications', 'Provide patient counseling', 'Manage inventory', 'Supervise pharmacy staff'],
    'Full-time',
    'active',
    true
FROM users u WHERE u.email = 'michael@healthplus.co.zw';

INSERT INTO jobs (title, description, position, salary_min, salary_max, salary_currency, pharmacy_id, location_city, location_province, location_address, requirements, responsibilities, employment_type, status)
SELECT 
    'Dispensary Assistant',
    'Entry-level position for a dispensary assistant. Training will be provided.',
    'Dispensary Assistant',
    35000,
    45000,
    'ZWL',
    u.id,
    'Bulawayo',
    'Bulawayo',
    '456 Fife Avenue',
    ARRAY['High school certificate', 'Willingness to learn', 'Good customer service skills'],
    ARRAY['Assist with dispensing', 'Stock management', 'Customer service'],
    'Full-time',
    'active'
FROM users u WHERE u.email = 'grace@medicpharm.co.zw';

INSERT INTO jobs (title, description, position, salary_min, salary_max, salary_currency, pharmacy_id, location_city, location_province, requirements, responsibilities, employment_type, status, featured)
SELECT 
    'Pharmacy Manager',
    'Seeking an experienced pharmacy manager to oversee daily operations.',
    'Pharmacy Manager',
    100000,
    150000,
    'ZWL',
    u.id,
    'Harare',
    'Harare',
    ARRAY['Bachelor of Pharmacy degree', 'Management experience preferred', '5+ years pharmacy experience'],
    ARRAY['Manage pharmacy operations', 'Staff supervision', 'Inventory management', 'Compliance and regulatory matters'],
    'Full-time',
    'active',
    true
FROM users u WHERE u.email = 'michael@healthplus.co.zw';

-- ============================================
-- INSERT JOB APPLICATIONS
-- ============================================
INSERT INTO job_applications (user_id, job_id, status, applied_at)
SELECT 
    u1.id,
    j.id,
    'reviewing',
    CURRENT_TIMESTAMP
FROM users u1, jobs j, users u2
WHERE u1.email = 'john.moyo@example.com'
AND u2.email = 'michael@healthplus.co.zw'
AND j.pharmacy_id = u2.id
AND j.position = 'Pharmacist'
LIMIT 1;

-- ============================================
-- INSERT PRODUCTS
-- ============================================
INSERT INTO products (name, description, category, pharmacy_id, price_amount, price_currency, stock, manufacturer, dosage, available, rating)
SELECT 
    'Panadol 500mg Tablets',
    'Paracetamol tablets for pain relief and fever reduction. 100 tablets per pack.',
    'Medications',
    p.id,
    15.50,
    'ZWL',
    150,
    'GlaxoSmithKline',
    '1-2 tablets every 4-6 hours',
    true,
    4.5
FROM pharmacies p, users u
WHERE u.email = 'michael@healthplus.co.zw' AND p.user_id = u.id
LIMIT 1;

INSERT INTO products (name, description, category, pharmacy_id, price_amount, price_currency, stock, manufacturer, dosage, available, rating)
SELECT 
    'Vitamin D3 Supplements',
    'High-strength vitamin D3 supplements for bone health. 60 capsules.',
    'Supplements',
    p.id,
    45.00,
    'ZWL',
    80,
    'Nature''s Best',
    '1 capsule daily',
    true,
    4.3
FROM pharmacies p, users u
WHERE u.email = 'michael@healthplus.co.zw' AND p.user_id = u.id
LIMIT 1;

INSERT INTO products (name, description, category, pharmacy_id, price_amount, price_currency, stock, manufacturer, available, rating)
SELECT 
    'Blood Pressure Monitor',
    'Digital automatic blood pressure monitor with large display.',
    'Medical Devices',
    p.id,
    250.00,
    'ZWL',
    25,
    'Omron',
    true,
    4.7
FROM pharmacies p, users u
WHERE u.email = 'grace@medicpharm.co.zw' AND p.user_id = u.id
LIMIT 1;

-- ============================================
-- INSERT ARTICLES
-- ============================================
INSERT INTO articles (title, slug, content, excerpt, author_id, category, tags, published, published_at, views)
SELECT 
    'Understanding Prescription Medications',
    'understanding-prescription-medications',
    'A comprehensive guide to understanding prescription medications, their uses, and important safety information. This article covers the basics of prescription drugs, how they work, and safety considerations for patients and healthcare providers.',
    'Learn the fundamentals of prescription medications and safety guidelines.',
    u.id,
    'Educational',
    ARRAY['medications', 'safety', 'prescription'],
    true,
    CURRENT_TIMESTAMP,
    150
FROM users u WHERE u.email = 'admin@zimpharmhub.com';

INSERT INTO articles (title, slug, content, excerpt, author_id, category, tags, published, published_at, views)
SELECT 
    'Continuing Education for Pharmacy Professionals',
    'continuing-education-pharmacy-professionals',
    'Important information about continuing education requirements and opportunities for pharmacy professionals in Zimbabwe. Learn about certification programs, training opportunities, and staying current with industry best practices.',
    'Stay updated with continuing education requirements and opportunities.',
    u.id,
    'Educational',
    ARRAY['education', 'certification', 'professional development'],
    true,
    CURRENT_TIMESTAMP,
    89
FROM users u WHERE u.email = 'admin@zimpharmhub.com';

-- ============================================
-- INSERT EVENTS
-- ============================================
INSERT INTO events (title, description, event_type, start_date, end_date, location, venue, organizer, capacity, featured, tags)
VALUES
('Zimbabwe Pharmacy Conference 2024', 'Annual conference for pharmacy professionals. Topics include new regulations, best practices, and networking opportunities.', 'Conference', '2024-06-15 09:00:00', '2024-06-17 17:00:00', 'Harare', 'Harare International Conference Centre', 'Zimbabwe Pharmacy Council', 200, true, ARRAY['conference', 'networking', 'professional development']),
('Pharmacy Management Workshop', 'Workshop on effective pharmacy management and inventory control.', 'Workshop', '2024-04-20 09:00:00', '2024-04-20 17:00:00', 'Bulawayo', 'Bulawayo Polytechnic', 'Pharmacy Management Institute', 50, false, ARRAY['workshop', 'management', 'training']);

-- ============================================
-- INSERT FORUM POSTS
-- ============================================
INSERT INTO forum_posts (title, content, author_id, category, tags, views)
SELECT 
    'Best practices for inventory management?',
    'What are your best practices for managing pharmacy inventory? Looking for tips and strategies.',
    u.id,
    'General Discussion',
    ARRAY['inventory', 'management'],
    45
FROM users u WHERE u.email = 'michael@healthplus.co.zw';

INSERT INTO forum_posts (title, content, author_id, category, tags, views)
SELECT 
    'New regulations for 2024',
    'Discussion about the new pharmacy regulations that came into effect this year.',
    u.id,
    'News',
    ARRAY['regulations', '2024'],
    78
FROM users u WHERE u.email = 'john.moyo@example.com';

-- ============================================
-- COMPLETE!
-- ============================================
-- Sample data inserted successfully!
-- Default password for all users: password123

