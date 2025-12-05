# 🚀 GovVerify Quick Reference Card

## 📁 Project Structure
```
agents/
├── govverify.js              # Main agent (300+ line system prompt)
├── config.js                 # Configuration & trusted sources
├── logger.js                 # Logging utility
├── index.js                  # Exports
├── test-govverify.js        # Test suite (8 scenarios)
├── integration-example.js   # 5 integration patterns
├── .env.example             # Environment config template
├── tools/
│   ├── definitions.js       # 8 OpenAI function definitions
│   ├── handlers.js          # 8 function implementations
│   ├── types.js             # Type definitions
│   └── index.js             # Exports
└── Documentation:
    ├── FINAL_SUMMARY.md          ⭐ Complete transformation guide
    ├── TRUTH_ENGINE_OVERVIEW.md  📖 Feature overview & examples
    ├── README.md                  📚 Full API documentation
    ├── QUICK_START.md            🚀 5-minute setup
    ├── IMPLEMENTATION_SUMMARY.md 📊 Technical details
    ├── ARCHITECTURE.md           🏗️  System diagrams
    └── DEPLOYMENT_CHECKLIST.md   ✅ Production checklist
```

## 🎯 Core Features

### 1️⃣ Message Verification
- Query authoritative sources (gov, news, fact-checkers)
- Compute confidence score (0-100)
- Return verdict: True / Likely True / Uncertain / Likely False / False
- Provide evidence + citations

### 2️⃣ Incident Reporting
- Scam / Fraud / Threat / Misinformation / Harassment
- Collect: type, loss, suspect, evidence, consent
- Generate ID: GW-YYYY-######
- Track status: pending → investigating → resolved

### 3️⃣ Urgent Escalation
- Auto-detect: financial loss, physical threats, trafficking, child exploitation
- Priority: High (2h) / Critical (30m) / Emergency (immediate)
- Notify: operators + law enforcement (with consent)

### 4️⃣ Protection Guidance
- Immediate action steps
- Reporting procedures
- Prevention tips
- Emergency contacts

## 🔧 Tool Functions

| Tool | Use When |
|------|----------|
| `fetch_authoritative` | User asks "Is this true?" |
| `reverse_image_search` | User sends suspicious image |
| `transcribe_audio` | User sends voice note |
| `report_incident` | User says "I want to report..." |
| `escalate_to_human` | Urgent threat detected |
| `get_incident_status` | User asks "Status of GW-..." |
| `list_user_reports` | User asks "Show my reports" |
| `get_protection_guidance` | User asks "How to protect..." |

## 🧪 Testing

```bash
# Quick test
node agents/test-govverify.js

# With debug
DEBUG=true node agents/test-govverify.js
```

## 💻 Usage

```javascript
const { GovVerifyAgent } = require('./agents');

// Initialize
const agent = new GovVerifyAgent();
await agent.initialize();

// Process message
const response = await agent.processMessage(
  "Is this message real?",
  "+23276123456"
);

// With media
const response = await agent.processMessage(
  "Verify this image",
  "+23276123456",
  null,  // locationContext
  { hasMedia: true, mediaType: 'image', mediaUrl: '...' }
);

// Clear conversation
agent.clearUserConversation("+23276123456");

// Get stats
const count = agent.getActiveConversationsCount();
```

## ⚙️ Configuration (.env)

```bash
# Required
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# WhatsApp
SERVER_URL=http://localhost:3700
API_KEY=your-api-key

# GovVerify
GOVVERIFY_NAME=GovVerify
GOVVERIFY_COUNTRY=Sierra Leone

# Emergency
POLICE_CONTACT=+232-999
CYBERCRIME_CONTACT=+232-cybercrime
```

## 📊 Response Format

```json
{
  "verdict": "True|Likely True|Uncertain|Likely False|False",
  "confidence": 85,
  "claim_summary": "...",
  "evidence": [
    {"source": "...", "type": "official|news|ngo", "date": "...", "snippet": "..."}
  ],
  "recommended_actions": ["...", "..."],
  "escalation": {"required": false, "reason": ""},
  "metadata": {"message_type": "text", "received_at": "...", "region": "..."}
}
```

## 🚨 Escalation Triggers

**Keywords that trigger automatic escalation:**
- "taking money now" / "transfer happening"
- "threatening me" / "going to hurt"
- "kidnap" / "trafficking"
- "child" + exploitation
- "bomb" / "kill"
- "suicide" / "harm myself"

## 🔐 Privacy Rules

- **PII**: Explicit consent required
- **Retention**: Metadata (365d), Sensitive PII (30d), Incidents (730d)
- **Encryption**: All media at rest
- **Audit**: All decisions logged

## 🌍 Trusted Sources

**Government:**
- gov.sl, statehouse.gov.sl, mohs.gov.sl, sierraleonepolice.gov.sl

**News:**
- thesierraleonetelegraph.com, awoko.org, standardtimespress.org

**International:**
- who.int, un.org

## 📚 Documentation Map

| File | Use For |
|------|---------|
| **FINAL_SUMMARY.md** | Complete overview of changes |
| **TRUTH_ENGINE_OVERVIEW.md** | Feature deep-dive + examples |
| **README.md** | Full API documentation |
| **QUICK_START.md** | Get running in 5 minutes |
| **IMPLEMENTATION_SUMMARY.md** | Original implementation guide |
| **ARCHITECTURE.md** | System architecture diagrams |
| **DEPLOYMENT_CHECKLIST.md** | Production deployment steps |

## 🎓 Example Interactions

### Verify Health Claim
```
User: "Government giving free medicine?"
Agent: 
  Verdict: True (92%)
  Evidence: Ministry of Health (2025-03-10)
  Action: Visit nearest clinic
```

### Report Scam
```
User: "Bank called for my PIN"
Agent:
  This is a SCAM! Banks never ask for PINs.
  Would you like to report?
  [Report] [Protection tips] [Human]
```

### Urgent Threat
```
User: "They're threatening my family NOW!"
Agent:
  🚨 ESCALATED - Emergency
  Operators notified
  ID: GW-2025-123456
  Call 999 immediately
```

## 🔍 Debugging

```bash
# Check environment
cat .env | grep OPENAI_API_KEY

# View logs
DEBUG=true node agents/test-govverify.js

# Test specific feature
node -e "
const agent = require('./agents');
// test code here
"
```

## ✅ Production Checklist

- [ ] Configure OPENAI_API_KEY
- [ ] Set trusted sources
- [ ] Configure emergency contacts
- [ ] Test all 8 tools
- [ ] Set up database
- [ ] Connect government APIs
- [ ] Add reverse image search
- [ ] Add audio transcription
- [ ] Set up operator notifications
- [ ] Configure law enforcement webhooks

## 📞 Support

1. Check **FINAL_SUMMARY.md** for complete overview
2. Review **TRUTH_ENGINE_OVERVIEW.md** for features
3. Run tests: `node agents/test-govverify.js`
4. Enable debug: `DEBUG=true`
5. Check logs for errors

---

**GovVerify Truth Engine & Cyber Watchdog** 🛡️  
*Protecting citizens through AI-powered verification*

Version: 1.0.0 | Last Updated: December 5, 2025
