# GovVerify Agent - Production Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup

- [ ] Copy `.env.example` to `.env`
- [ ] Set `OPENAI_API_KEY` with valid API key
- [ ] Set `OPENAI_MODEL` (recommended: `gpt-4o-mini` for cost efficiency)
- [ ] Configure `SERVER_URL` to production URL
- [ ] Set secure `API_KEY` for authentication
- [ ] Set `CLIENT_PHONE_E164` to your WhatsApp number
- [ ] Configure `GOVVERIFY_NAME` (optional)
- [ ] Configure `GOVVERIFY_COUNTRY` (optional)
- [ ] Set `DEBUG=false` for production

### ✅ Testing

- [ ] Run `node agents/test-govverify.js` - all tests pass?
- [ ] Test basic verification request
- [ ] Test with photo attachment
- [ ] Test with location sharing
- [ ] Test status checking
- [ ] Test fake document reporting
- [ ] Test conversation cleanup (wait 1+ hour)
- [ ] Test error handling (invalid inputs)
- [ ] Test multiple concurrent users

### ✅ Integration

- [ ] Choose integration method (webhook/routes/handler)
- [ ] Implement chosen integration pattern
- [ ] Test with actual WhatsApp messages
- [ ] Verify message sending works
- [ ] Test media download and processing
- [ ] Test location extraction
- [ ] Verify conversation persistence

### ✅ Database Integration

- [ ] Design database schema
  - [ ] `verifications` table
  - [ ] `fake_reports` table
  - [ ] `users` table (optional)
  - [ ] Indexes on phone numbers and verification IDs

- [ ] Implement database functions
  - [ ] Replace mock data in `submitVerificationRequest`
  - [ ] Replace mock data in `checkVerificationStatus`
  - [ ] Replace mock data in `listUserVerifications`
  - [ ] Replace mock data in `reportFakeDocument`
  - [ ] Replace mock data in `updateVerificationPhoto`
  - [ ] Replace mock data in `getVerificationStatistics`

- [ ] Add database connection pooling
- [ ] Add database error handling
- [ ] Add database migrations
- [ ] Test database queries under load

### ✅ Media Storage

- [ ] Choose storage solution (S3, Cloudinary, local, etc.)
- [ ] Implement media upload in handlers
- [ ] Store media URLs in database
- [ ] Implement media retrieval
- [ ] Add media validation (size, type)
- [ ] Add media security (access control)

### ✅ Security

- [ ] Validate phone numbers (E.164 format)
- [ ] Implement rate limiting per user
- [ ] Add API key validation on endpoints
- [ ] Sanitize user inputs
- [ ] Validate tool arguments
- [ ] Add CORS configuration if needed
- [ ] Use HTTPS for all external APIs
- [ ] Secure OpenAI API key (environment variable)
- [ ] Add request logging for audit
- [ ] Implement user data privacy controls

### ✅ Performance

- [ ] Monitor OpenAI API latency
- [ ] Implement caching where appropriate
- [ ] Optimize database queries
- [ ] Add database indexes
- [ ] Monitor memory usage (conversation history)
- [ ] Configure conversation cleanup interval
- [ ] Add request timeout handling
- [ ] Test under concurrent load
- [ ] Monitor active conversation count

### ✅ Monitoring & Logging

- [ ] Set up structured logging
- [ ] Log all tool executions
- [ ] Log API errors
- [ ] Monitor OpenAI API usage
- [ ] Track verification request counts
- [ ] Track fake document reports
- [ ] Set up error alerting
- [ ] Monitor conversation cleanup
- [ ] Track response times

### ✅ Error Handling

- [ ] Test OpenAI API timeout
- [ ] Test OpenAI API rate limits
- [ ] Test database connection failure
- [ ] Test WhatsApp sending failure
- [ ] Test invalid tool arguments
- [ ] Test malformed messages
- [ ] Test concurrent request handling
- [ ] Verify graceful degradation

### ✅ Documentation

- [ ] Document API endpoints
- [ ] Document database schema
- [ ] Document environment variables
- [ ] Create deployment guide
- [ ] Create troubleshooting guide
- [ ] Document tool functions
- [ ] Add inline code comments
- [ ] Create API documentation

### ✅ Compliance & Legal

- [ ] Add privacy policy for user data
- [ ] Document data retention policy
- [ ] Add terms of service
- [ ] Comply with data protection laws
- [ ] Add user consent mechanisms
- [ ] Document verification process
- [ ] Add disclaimers for verification accuracy

---

## 🚀 Deployment Steps

### 1. Pre-Deployment

```bash
# Test everything
node agents/test-govverify.js

# Check environment
cat .env | grep -v "^#"

# Verify dependencies
npm list
```

### 2. Database Setup

```sql
-- Example schema (adjust for your needs)

CREATE TABLE verifications (
  id VARCHAR(50) PRIMARY KEY,
  phone_e164 VARCHAR(20) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  additional_info TEXT,
  location_lat DECIMAL(10, 8),
  location_lon DECIMAL(11, 8),
  location_description TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  verified_by VARCHAR(200),
  notes TEXT,
  INDEX idx_phone (phone_e164),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
);

CREATE TABLE fake_reports (
  id VARCHAR(50) PRIMARY KEY,
  phone_e164 VARCHAR(20) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(100),
  description TEXT NOT NULL,
  location TEXT,
  evidence_url TEXT,
  status VARCHAR(20) DEFAULT 'under_investigation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone_e164),
  INDEX idx_status (status)
);
```

### 3. Deployment

```bash
# Build (if needed)
npm run build

# Start production server
NODE_ENV=production npm start

# Or with PM2
pm2 start index.js --name govverify-agent

# Monitor
pm2 logs govverify-agent
```

### 4. Post-Deployment

```bash
# Health check
curl http://your-server/health

# Test message processing
curl -X POST http://your-server/api/govverify/message \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "message": "Hello",
    "phoneE164": "+1234567890"
  }'

# Check active conversations
curl http://your-server/api/govverify/stats \
  -H "X-API-Key: your-api-key"
```

---

## 🔍 Monitoring Checklist

### Daily

- [ ] Check error logs
- [ ] Monitor API usage (OpenAI)
- [ ] Check active conversation count
- [ ] Review fake document reports

### Weekly

- [ ] Analyze verification statistics
- [ ] Review user feedback
- [ ] Check database size
- [ ] Review response times
- [ ] Update documentation as needed

### Monthly

- [ ] Review and optimize costs (OpenAI API)
- [ ] Analyze verification success rates
- [ ] Update system prompts if needed
- [ ] Review and update tool functions
- [ ] Security audit

---

## 🐛 Troubleshooting Guide

### Issue: High OpenAI API costs

**Solution:**
- Switch to `gpt-4o-mini` instead of `gpt-4`
- Implement response caching
- Limit conversation history length
- Reduce system prompt verbosity

### Issue: Slow responses

**Solution:**
- Check OpenAI API latency
- Optimize database queries
- Add database indexes
- Reduce tool call complexity
- Implement request timeouts

### Issue: Memory issues

**Solution:**
- Reduce conversation cleanup interval (default: 1 hour)
- Limit message history per conversation
- Monitor active conversation count
- Add memory limits

### Issue: Verification accuracy

**Solution:**
- Improve system prompt instructions
- Add validation in tool handlers
- Integrate with real government APIs
- Add manual review process

---

## 📊 Success Metrics

Track these metrics post-deployment:

- **Verification Requests**: Total, per day, per document type
- **Success Rate**: Verified / Total requests
- **Response Time**: Average, p50, p95, p99
- **User Engagement**: Active users, repeat users
- **Error Rate**: Failed requests / Total requests
- **API Costs**: OpenAI API usage, cost per request
- **Fake Reports**: Total reports, resolution rate

---

## 🎯 Post-Deployment Enhancements

### Phase 1: Core Features
- [ ] Real government API integration
- [ ] SMS notifications for status updates
- [ ] Email notifications
- [ ] Multi-language support

### Phase 2: Advanced Features
- [ ] Voice message support
- [ ] Batch verification
- [ ] Verification history export
- [ ] Admin dashboard

### Phase 3: Scale & Optimize
- [ ] Auto-scaling
- [ ] Load balancing
- [ ] CDN for media
- [ ] Advanced analytics

---

## ✅ Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Database integrated
- [ ] Security audit complete
- [ ] Documentation complete
- [ ] Monitoring set up

### Launch Day
- [ ] Deploy to production
- [ ] Smoke tests
- [ ] Monitor for first hour
- [ ] Have rollback plan ready

### Post-Launch (First Week)
- [ ] Daily monitoring
- [ ] User feedback collection
- [ ] Bug fixes as needed
- [ ] Performance tuning

---

## 📞 Support Contacts

**Technical Issues:**
- Check logs: `DEBUG=true npm start`
- Review error messages
- Check OpenAI API status

**Emergency Contacts:**
- OpenAI Support: https://help.openai.com
- Your team lead: [Contact info]

---

**Last Updated:** December 5, 2025

**Version:** 1.0.0
