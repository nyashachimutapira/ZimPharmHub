# PostgreSQL Database Setup Scripts

This folder contains SQL scripts to set up the ZimPharmHub database in PostgreSQL.

## Files

1. **create_database.sql** - Creates the database and user
2. **create_tables.sql** - Creates all tables, indexes, and triggers
3. **insert_sample_data.sql** - Inserts sample data for testing

## Quick Setup

### Option 1: Using psql Command Line

1. **Create database:**
```bash
psql -U postgres -f create_database.sql
```

2. **Connect to database:**
```bash
psql -U zimpharmuser -d zimpharmhub
```

3. **Create tables:**
```bash
psql -U zimpharmuser -d zimpharmhub -f create_tables.sql
```

4. **Insert sample data (optional):**
```bash
psql -U zimpharmuser -d zimpharmhub -f insert_sample_data.sql
```

### Option 2: Using pgAdmin (GUI)

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → Create → Database
4. Name it `zimpharmhub`
5. Right-click on the database → Query Tool
6. Open and run `create_database.sql` (if needed)
7. Open and run `create_tables.sql`
8. (Optional) Open and run `insert_sample_data.sql`

### Option 3: Single Command Setup

```bash
# From the database folder
psql -U postgres << EOF
\i create_database.sql
\c zimpharmhub
\i create_tables.sql
\i insert_sample_data.sql
EOF
```

## Database Structure

The database includes these main tables:

- **users** - User accounts (job seekers, pharmacies, admins)
- **pharmacies** - Pharmacy business profiles
- **jobs** - Job listings
- **job_applications** - Job applications (separate table)
- **saved_jobs** - Many-to-many relationship for saved jobs
- **products** - Product listings
- **product_reviews** - Product reviews
- **articles** - Educational articles
- **article_likes** - Article likes
- **events** - Events and conferences
- **event_registrations** - Event registrations
- **forum_posts** - Forum discussion posts
- **forum_comments** - Forum comments
- **forum_post_likes** - Post likes
- **comment_likes** - Comment likes
- **notifications** - User notifications
- **conversations** - Message conversations
- **conversation_participants** - Conversation participants
- **messages** - Individual messages
- **newsletters** - Newsletter subscriptions
- **saved_searches** - Saved search queries

## Sample Data

The `insert_sample_data.sql` file includes:

- 1 Admin user
- 2 Job Seeker users
- 2 Pharmacy users with pharmacy profiles
- 3 Job listings
- 1 Job application
- 3 Product listings
- 2 Articles
- 2 Events
- 2 Forum posts

**Default password for all users:** `password123`

**Note:** The password hash in the sample data is a placeholder. In production, use proper bcrypt hashing.

## Important Notes

1. **UUID Extension:** The scripts enable the `uuid-ossp` extension for generating UUIDs
2. **UpdatedAt Trigger:** Automatic `updatedAt` timestamp updates via triggers
3. **Indexes:** Created for commonly queried fields
4. **Foreign Keys:** All relationships have proper foreign key constraints
5. **Check Constraints:** Enum-like values enforced at database level

## Troubleshooting

### Error: "permission denied for database"
- Run `create_database.sql` as postgres superuser
- Then run other scripts as zimpharmuser

### Error: "extension uuid-ossp does not exist"
- Install the extension: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Error: "relation already exists"
- Tables already created. Drop them first:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO zimpharmuser;
```

### Verify Installation

```sql
-- Check tables
\dt

-- Check if sample data exists
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM jobs;
SELECT COUNT(*) FROM products;
```

## Next Steps

After creating the database:

1. Update your `.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zimpharmhub
DB_USER=zimpharmuser
DB_PASSWORD=password123
DB_DIALECT=postgres
```

2. Connect using Sequelize (see `POSTGRESQL_MIGRATION.md`)

3. Test connection:
```bash
node -e "const sequelize = require('./config/database'); sequelize.authenticate().then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e));"
```

## Password Security

⚠️ **Important:** The sample password hashes are placeholders. For production:

1. Generate proper bcrypt hashes
2. Update user passwords in the database
3. Use the registration endpoint to create users with proper password hashing

