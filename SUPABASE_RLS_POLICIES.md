# Supabase Row Level Security (RLS) Policies

## ⚠️ CRITICAL: Enable RLS on All Tables

Row Level Security MUST be enabled on all Supabase tables to prevent unauthorized access.

---

## 1. Profiles Table

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 2. Heritage Events Table

```sql
-- Enable RLS
ALTER TABLE heritage_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published events
CREATE POLICY "Anyone can view published events"
ON heritage_events FOR SELECT
USING (status = 'published');

-- Policy: Partners can create events
CREATE POLICY "Partners can create events"
ON heritage_events FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'partner'
  )
);

-- Policy: Partners can update their own events
CREATE POLICY "Partners can update own events"
ON heritage_events FOR UPDATE
USING (
  partner_id = auth.uid()
);

-- Policy: Admins can manage all events
CREATE POLICY "Admins can manage all events"
ON heritage_events FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 3. Collaboration Invites Table (if using Supabase)

```sql
-- Enable RLS
ALTER TABLE collaboration_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Partners can create invites
CREATE POLICY "Partners can create invites"
ON collaboration_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'partner'
  )
);

-- Policy: Admins can view all invites
CREATE POLICY "Admins can view all invites"
ON collaboration_invites FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Admins can update invites
CREATE POLICY "Admins can update invites"
ON collaboration_invites FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 4. User Feedback Table (if using Supabase)

```sql
-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can create feedback
CREATE POLICY "Users can create feedback"
ON user_feedback FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback"
ON user_feedback FOR SELECT
USING (user_id = auth.uid());

-- Policy: Partners can view feedback for their places
CREATE POLICY "Partners can view relevant feedback"
ON user_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'partner'
  )
);

-- Policy: Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
ON user_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## How to Apply These Policies

### Option 1: Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Policies**
4. Click **New Policy** for each table
5. Copy and paste the SQL from above

### Option 2: SQL Editor
1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and paste all the SQL above
4. Click **Run**

---

## Testing RLS Policies

After applying policies, test them:

```sql
-- Test as a regular user
SELECT * FROM profiles WHERE id = 'some-user-id';

-- Test as admin
SELECT * FROM profiles; -- Should return all profiles if you're admin

-- Test unauthorized access
SELECT * FROM profiles WHERE id != auth.uid(); -- Should fail for non-admins
```

---

## Important Notes

1. **Always enable RLS** before deploying to production
2. **Test policies thoroughly** with different user roles
3. **Never bypass RLS** in your application code
4. **Audit policies regularly** as your app evolves
5. **Use service role key** only in secure backend environments

---

## Verification Checklist

- [ ] RLS enabled on `profiles` table
- [ ] RLS enabled on `heritage_events` table
- [ ] RLS enabled on `collaboration_invites` table
- [ ] RLS enabled on `user_feedback` table
- [ ] Tested policies with user role
- [ ] Tested policies with partner role
- [ ] Tested policies with admin role
- [ ] Verified unauthorized access is blocked

---

## Emergency: Disable Public Access

If you need to temporarily lock down your database:

```sql
-- Revoke all public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Then re-enable with proper RLS policies
```

---

**Remember:** RLS is your last line of defense. Even if your frontend has bugs, RLS will protect your data at the database level.
