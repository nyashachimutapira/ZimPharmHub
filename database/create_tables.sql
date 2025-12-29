-- ZimPharmHub PostgreSQL Tables Creation
-- Connect to zimpharmhub database before running this script
-- psql -U zimpharmuser -d zimpharmhub -f create_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    "userType" VARCHAR(20) NOT NULL CHECK ("userType" IN ('job_seeker', 'pharmacy', 'admin')),
    phone VARCHAR(50),
    "profilePicture" VARCHAR(500),
    bio TEXT,
    location VARCHAR(255),
    certifications TEXT[] DEFAULT '{}',
    resume VARCHAR(500),
    "isVerified" BOOLEAN DEFAULT false,
    "subscriptionStatus" VARCHAR(20) DEFAULT 'free' CHECK ("subscriptionStatus" IN ('free', 'premium', 'enterprise')),
    "subscriptionEndDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users("userType");

-- ============================================
-- PHARMACIES TABLE
-- ============================================
CREATE TABLE pharmacies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    "registrationNumber" VARCHAR(100) UNIQUE,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    "zipCode" VARCHAR(20),
    operating_hours JSONB,
    services TEXT[] DEFAULT '{}',
    logo VARCHAR(500),
    "backgroundImage" VARCHAR(500),
    description TEXT,
    licenses TEXT[] DEFAULT '{}',
    staff JSONB DEFAULT '[]',
    "subscriptionPlan" VARCHAR(20) DEFAULT 'free' CHECK ("subscriptionPlan" IN ('free', 'premium', 'enterprise')),
    "subscriptionEndDate" TIMESTAMP,
    ratings DECIMAL(3,2) DEFAULT 0 CHECK (ratings >= 0 AND ratings <= 5),
    "totalReviews" INTEGER DEFAULT 0,
    "isVerified" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pharmacies_user_id ON pharmacies(user_id);
CREATE INDEX idx_pharmacies_city ON pharmacies(city);

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    position VARCHAR(50) NOT NULL CHECK (position IN ('Pharmacist', 'Dispensary Assistant', 'Pharmacy Manager', 'Other')),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'ZWL',
    pharmacy_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_city VARCHAR(100),
    location_province VARCHAR(100),
    location_address TEXT,
    requirements TEXT[] DEFAULT '{}',
    responsibilities TEXT[] DEFAULT '{}',
    employment_type VARCHAR(20) DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Temporary')),
    application_deadline TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'filled')),
    featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP,
    views INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_pharmacy_id ON jobs(pharmacy_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_position ON jobs(position);
CREATE INDEX idx_jobs_location_city ON jobs(location_city);

-- ============================================
-- JOB APPLICATIONS TABLE
-- ============================================
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected')),
    notes TEXT,
    resume VARCHAR(500),
    cover_letter TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- ============================================
-- SAVED JOBS TABLE (Many-to-Many)
-- ============================================
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);

CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_id ON saved_jobs(job_id);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Medications', 'Supplements', 'Medical Devices', 'Personal Care', 'OTC')),
    pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
    price_amount DECIMAL(10,2),
    price_currency VARCHAR(10) DEFAULT 'ZWL',
    stock INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    manufacturer VARCHAR(255),
    dosage VARCHAR(255),
    side_effects TEXT,
    warnings TEXT,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_pharmacy_id ON products(pharmacy_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(available);

-- ============================================
-- PRODUCT REVIEWS TABLE
-- ============================================
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);

-- ============================================
-- ARTICLES TABLE
-- ============================================
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) DEFAULT 'Educational' CHECK (category IN ('News', 'Practice Tips', 'Product Guide', 'Industry Updates', 'Educational')),
    tags TEXT[] DEFAULT '{}',
    featured_image VARCHAR(500),
    published BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_slug ON articles(slug);

-- ============================================
-- ARTICLE LIKES TABLE (Many-to-Many)
-- ============================================
CREATE TABLE article_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('Workshop', 'Conference', 'Training', 'Webinar', 'Networking')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    venue VARCHAR(255),
    organizer VARCHAR(255),
    registration_link VARCHAR(500),
    image VARCHAR(500),
    tags TEXT[] DEFAULT '{}',
    capacity INTEGER,
    featured BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_event_type ON events(event_type);

-- ============================================
-- EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);

-- ============================================
-- FORUM POSTS TABLE
-- ============================================
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'General Discussion' CHECK (category IN ('General Discussion', 'Job Tips', 'Product Discussion', 'Practice Management', 'News')),
    tags TEXT[] DEFAULT '{}',
    views INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);

-- ============================================
-- FORUM POST LIKES TABLE
-- ============================================
CREATE TABLE forum_post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, post_id)
);

-- ============================================
-- FORUM COMMENTS TABLE
-- ============================================
CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_author_id ON forum_comments(author_id);

-- ============================================
-- COMMENT LIKES TABLE
-- ============================================
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, comment_id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('job_application', 'job_alert', 'message', 'forum_reply', 'event_reminder', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    related_id UUID,
    is_read BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    last_message_id UUID,
    last_message_at TIMESTAMP,
    related_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- ============================================
-- CONVERSATION PARTICIPANTS TABLE
-- ============================================
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);

-- ============================================
-- NEWSLETTER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    "firstName" VARCHAR(255),
    "lastName" VARCHAR(255),
    categories JSONB DEFAULT '{"jobs": true, "products": true, "news": true, "events": true}',
    is_active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletters_email ON newsletters(email);
CREATE INDEX idx_newsletters_is_active ON newsletters(is_active);

-- ============================================
-- SAVED SEARCHES TABLE
-- ============================================
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    search_params JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- ============================================
-- CREATE UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON pharmacies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at BEFORE UPDATE ON newsletters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETE!
-- ============================================
-- All tables created successfully!

