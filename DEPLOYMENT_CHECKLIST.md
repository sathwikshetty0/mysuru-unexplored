# 🚀 Deployment Security Checklist

Use this checklist before deploying to production.

---

## ✅ Pre-Deployment Checklist

### 🔐 API Keys & Secrets

- [ ] **OpenAI API Key**
  - [ ] Removed from `.env.example`
  - [ ] Added to Vercel environment variables (not in code)
  - [ ] Regenerated if previously exposed
  - [ ] Set up billing limits in OpenAI dashboard

- [ ] **Supabase Credentials**
  - [ ] `VITE_SUPABASE_URL` set in `.env`
  - [ ] `VITE_SUPABASE_ANON_KEY` set in `.env`
  - [ ] Service role key (if used) stored securely server-side only
  - [ ] RLS enabled on all tables

- [ ] **Environment Files**
  - [ ] `.env` is in `.gitignore`
  - [ ] `.env.example` contains only placeholders
  - [ ] No real secrets committed to Git

---

### 🛡️ Authentication & Authorization

- [ ] **Test Credentials**
  - [ ] Hardcoded test credentials only work in development (`import.meta.env.DEV`)
  - [ ] Production uses only Supabase authentication
  - [ ] No weak passwords like "1" or "password"

- [ ] **Password Security**
  - [ ] Strong password validation (uppercase, lowercase, number, special char)
  - [ ] Minimum 8 characters enforced
  - [ ] Passwords never stored in localStorage
  - [ ] Supabase handles password hashing

- [ ] **Session Management**
  - [ ] Sessions cleared on logout
  - [ ] localStorage cleared on logout
  - [ ] No sensitive data persists after logout

---

### 🔒 Database Security (Supabase)

- [ ] **Row Level Security (RLS)**
  - [ ] RLS enabled on `profiles` table
  - [ ] RLS enabled on `heritage_events` table
  - [ ] RLS enabled on `collaboration_invites` table
  - [ ] RLS enabled on `user_feedback` table
  - [ ] All policies tested with different user roles

- [ ] **Access Control**
  - [ ] Users can only access their own data
  - [ ] Partners can only manage their own content
  - [ ] Admins have appropriate elevated permissions
  - [ ] Anonymous users have read-only access where appropriate

---

### 🌐 API Security

- [ ] **Backend API**
  - [ ] OpenAI calls moved to `/api/chat` serverless function
  - [ ] API key never exposed to client
  - [ ] Input validation on all endpoints
  - [ ] Error messages don't leak sensitive info

- [ ] **Rate Limiting**
  - [ ] Consider implementing rate limiting (e.g., Upstash Redis)
  - [ ] Prevent API abuse
  - [ ] Set OpenAI usage limits in dashboard

---

### 🛡️ XSS & Injection Protection

- [ ] **XSS Prevention**
  - [ ] DOMPurify installed and configured
  - [ ] All user-generated content sanitized
  - [ ] Chat messages sanitized before rendering
  - [ ] Review/feedback content sanitized

- [ ] **Input Validation**
  - [ ] Email validation on all forms
  - [ ] Phone number validation
  - [ ] Form data validated before submission
  - [ ] SQL injection prevented by Supabase (parameterized queries)

---

### 📋 Security Headers

- [ ] **HTTP Security Headers** (in `vercel.json`)
  - [ ] `X-Frame-Options: DENY`
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `Referrer-Policy: strict-origin-when-cross-origin`
  - [ ] `Permissions-Policy` configured
  - [ ] `Strict-Transport-Security` (HSTS) enabled
  - [ ] `X-XSS-Protection: 1; mode=block`

---

### 🔍 Code Review

- [ ] **Sensitive Data**
  - [ ] No API keys in code
  - [ ] No passwords in code
  - [ ] No database credentials in code
  - [ ] No personal data hardcoded

- [ ] **Error Handling**
  - [ ] Errors logged but not exposed to users
  - [ ] Generic error messages for users
  - [ ] Detailed errors only in development

---

### 📦 Dependencies

- [ ] **Security Audit**
  ```bash
  npm audit
  npm audit fix
  ```
  - [ ] No high/critical vulnerabilities
  - [ ] All dependencies up to date
  - [ ] Unused dependencies removed

---

### 🚀 Deployment Platform (Vercel)

- [ ] **Environment Variables**
  - [ ] `OPENAI_API_KEY` added to Vercel project settings
  - [ ] `VITE_SUPABASE_URL` added
  - [ ] `VITE_SUPABASE_ANON_KEY` added
  - [ ] All secrets encrypted at rest

- [ ] **Domain & SSL**
  - [ ] HTTPS enabled (automatic with Vercel)
  - [ ] Custom domain configured (optional)
  - [ ] SSL certificate valid

---

### 📊 Monitoring & Logging

- [ ] **Error Tracking** (Optional but Recommended)
  - [ ] Set up Sentry or similar service
  - [ ] Monitor for security-related errors
  - [ ] Alert on suspicious activity

- [ ] **Analytics** (Optional)
  - [ ] Track failed login attempts
  - [ ] Monitor API usage
  - [ ] Set up alerts for unusual patterns

---

## 🚨 Post-Deployment Verification

After deploying, verify:

1. **Test Authentication**
   - [ ] Sign up works
   - [ ] Login works
   - [ ] Logout clears session
   - [ ] Password reset works (if implemented)

2. **Test Authorization**
   - [ ] Users can't access admin pages
   - [ ] Partners can't access other partners' data
   - [ ] Admins have full access

3. **Test API Security**
   - [ ] ChatBot works without exposing API key
   - [ ] Check browser DevTools → Network tab
   - [ ] Verify no API keys in JavaScript

4. **Test Security Headers**
   ```bash
   curl -I https://your-domain.vercel.app
   ```
   - [ ] Verify all security headers present

5. **Test RLS Policies**
   - [ ] Try accessing other users' data
   - [ ] Verify unauthorized access is blocked

---

## 🆘 Emergency Procedures

### If API Key is Compromised:
1. **Immediately** regenerate the key at https://platform.openai.com/api-keys
2. Update Vercel environment variables
3. Redeploy the application
4. Check OpenAI usage for suspicious activity
5. Set up usage limits and alerts

### If Database is Compromised:
1. Enable RLS on all tables immediately
2. Revoke all public access
3. Audit all data access logs
4. Reset all user passwords
5. Notify affected users

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Security Best Practices](https://vercel.com/docs/security)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

---

## ✅ Final Sign-Off

Before going live:

- [ ] All items in this checklist completed
- [ ] Security assessment reviewed
- [ ] RLS policies applied and tested
- [ ] All secrets secured
- [ ] Team members trained on security practices

**Deployment Date:** _________________

**Deployed By:** _________________

**Security Review By:** _________________

---

**Remember:** Security is an ongoing process, not a one-time task. Schedule regular security audits and keep dependencies updated.
