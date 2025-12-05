# GovVerify Agent - Truth Engine & Cyber Watchdog

## 🛡️ System Overview

**GovVerify** is now a comprehensive **Truth Engine & Cyber Watchdog** - an AI-powered assistant that helps citizens verify forwarded messages, report scams and digital threats, and escalate urgent incidents to authorities.

## 🔄 Transformation Summary

The system has been transformed from a document verification service to a complete misinformation and threat detection platform:

### Previous Focus: Document Verification
- ❌ Verify government documents (IDs, passports, licenses)
- ❌ Report fake documents
- ❌ Track verification status

### New Focus: Truth Engine & Cyber Watchdog
- ✅ **Verify forwarded messages** (text, images, videos, links)
- ✅ **Report scams, threats, and misinformation**
- ✅ **Escalate urgent incidents** to human operators and law enforcement
- ✅ **Provide protection guidance** and safety recommendations
- ✅ **Track incident reports** and investigation status

## 🎯 Core Capabilities

### 1. Message Verification
Verify any forwarded message using authoritative sources:
- Government ministry statements
- Official news agencies
- Trusted fact-checking organizations
- International bodies (WHO, UN, etc.)

**Verdict System:**
- **True** (90-100 confidence)
- **Likely True** (70-89 confidence)
- **Uncertain** (40-69 confidence)
- **Likely False** (20-39 confidence)
- **False** (0-19 confidence)

### 2. Incident Reporting
Report digital threats with structured data collection:
- **Scam**: Financial fraud, fake payment requests
- **Fraud**: Identity theft, document forgery
- **Threat**: Physical harm, extortion, blackmail
- **Misinformation**: False health/election claims
- **Harassment**: Cyberbullying, stalking
- **Phishing**: Credential theft, fake websites
- **Identity Theft**: Stolen credentials, impersonation

### 3. Urgent Escalation
Automatic escalation for critical threats:
- Ongoing financial loss ("they're taking money NOW")
- Physical threats (kidnapping, violence, trafficking)
- Child exploitation
- Terrorism/mass casualty threats
- Self-harm indicators

### 4. Protection Guidance
Immediate action steps for:
- Financial scams
- Phishing attempts
- Identity theft
- Data breaches
- Malware/ransomware
- Online harassment

## 🔧 Updated Tool Functions

| Tool | Purpose | Key Parameters |
|------|---------|----------------|
| `fetch_authoritative` | Query government/news sources | query, domains, time_window_days |
| `reverse_image_search` | Find image origins, detect manipulation | image_description |
| `transcribe_audio` | Convert voice/video to text | audio_description |
| `report_incident` | Create formal incident report | incident_type, claim_summary, consent |
| `escalate_to_human` | Alert operators for urgent threats | priority, threat_type, notes |
| `get_incident_status` | Check report status | incident_id |
| `list_user_reports` | View user's reports | status, limit |
| `get_protection_guidance` | Get safety recommendations | threat_type |

## 📊 Verification Pipeline

```
1. NORMALIZE
   ↓ Extract text, OCR images, transcribe audio
   
2. CATEGORIZE
   ↓ Health / Law / Finance / Election / Scam / Threat / Misc
   
3. SEARCH CONNECTORS
   ↓ Query authoritative sources (72h-365d window)
   
4. CROSS-CHECK
   ↓ Primary sources → True
   ↓ Multiple corroboration → Likely True
   ↓ Conflicting evidence → False
   ↓ Insufficient data → Uncertain
   
5. CONFIDENCE SCORE
   ↓ Primary source: +50
   ↓ Each corroboration: +10
   ↓ Recency bonus: +5
   ↓ Conflicting evidence: -60
   
6. RETURN VERDICT
   ↓ JSON + human-friendly message
```

## 🎨 Response Format

### Structured JSON Output
Every verification includes canonical JSON:

```json
{
  "verdict": "True|Likely True|Uncertain|Likely False|False",
  "confidence": 85,
  "claim_summary": "Government announces new health measures",
  "evidence": [
    {
      "source": "Ministry of Health",
      "type": "official",
      "date": "2025-12-01",
      "snippet": "Official statement confirms health policy",
      "uri": "https://health.gov.sl/..."
    }
  ],
  "recommended_actions": [
    "Follow official guidance",
    "Ignore forwarded chain messages"
  ],
  "escalation": {
    "required": false,
    "reason": ""
  },
  "metadata": {
    "message_type": "text",
    "received_at": "2025-12-05T10:30:00Z",
    "region": "Sierra Leone"
  }
}
```

### Human-Friendly Message
```
Verdict: **True** (confidence 92%)

This message is confirmed by the Ministry of Health 
bulletin published 2025-03-10.

🔍 Evidence:
• Ministry of Health (Official) - 2025-03-10
• WHO Statement (NGO) - 2025-03-11
• Sierra Leone Telegraph (News) - 2025-03-12

✅ Recommended: Follow official guidance

[Report this] [Speak to human] [Protect me now]
```

## 🚨 Escalation Rules

**Immediate escalation triggers:**

1. **Financial Emergency**
   - "they are taking money now"
   - "transfer is happening"
   - Active transaction evidence

2. **Physical Threat**
   - Explicit violence threats
   - Kidnapping mentions
   - Trafficking indicators
   - Sexual assault threats

3. **Mass Casualty**
   - Bomb threats
   - Terror plots
   - Biological threats
   - Mass casualty rumors

4. **Vulnerable Victims**
   - Child exploitation
   - Elderly exploitation
   - Self-harm indicators

**Escalation Priority Levels:**
- **High**: Review within 2 hours
- **Critical**: Review within 30 minutes
- **Emergency**: Immediate response + law enforcement

## 🔐 Privacy & Security

### PII Minimization
- Collect only required fields
- Explicit consent before sharing with authorities
- Phone number as primary identifier

### Data Retention
- **Incident metadata**: 365 days
- **Sensitive media** (IDs, bank screenshots): 30 days (with consent only)
- **Incident reports**: 730 days (2 years)
- **Auto-delete**: Non-consented PII after 30 days

### Encryption
- All stored media encrypted at rest
- Secure transmission (HTTPS/TLS)
- Audit logs for transparency

## 🌍 Sierra Leone Context

### Trusted Sources
**Government Domains:**
- gov.sl
- statehouse.gov.sl
- mohs.gov.sl (Ministry of Health)
- sierraleonepolice.gov.sl

**News Agencies:**
- thesierraleonetelegraph.com
- awoko.org
- standardtimespress.org

**International:**
- who.int (WHO)
- un.org (UN)

### Emergency Contacts
- **Police**: 999 or +232-999
- **Cybercrime Unit**: [To be configured]
- **General Emergency**: 999

## 💬 Example Interactions

### Verify Health Claim
**User:** "Is it true the government is giving out free medicine at clinics?"

**Agent:**
```
Verdict: **True** (confidence 92%)

Confirmed by Ministry of Health bulletin published 2025-03-10.

🔍 Evidence:
• Ministry of Health - Official statement
• WHO Sierra Leone - Corroboration
• Local news coverage

✅ Action: Visit nearest registered clinic

[Report issue] [More info] [Find clinic]
```

### Report Scam
**User:** "Someone called from 'my bank' asking for my PIN!"

**Agent:**
```
🚨 This is a SCAM! Banks never ask for PINs.

Would you like to report this incident?

📋 I'll collect:
• Type of scam
• Suspect contact (if known)
• Your consent to share with police

Your report will help protect others.

[Report this] [Protection tips] [Speak to human]
```

### Urgent Escalation
**User:** "They're threatening to hurt my family if I don't transfer money NOW!"

**Agent:**
```
🚨 **URGENT ESCALATION**

Your safety is priority. I'm immediately:
✅ Notifying human operators
✅ Alerting law enforcement (with your consent)

🛡️  IMMEDIATE ACTIONS:
1. Do NOT transfer money
2. Stay in safe location
3. Call police: 999
4. Block the contact

Your incident ID: GW-2025-123456
Priority: EMERGENCY

Human operator will contact you within minutes.

[I'm safe now] [Still in danger] [Call me]
```

## 🧪 Testing

Run the test suite:

```bash
node agents/test-govverify.js
```

**Test scenarios:**
1. Basic greeting and capability explanation
2. Verify forwarded message (health claim)
3. Report financial scam
4. Check incident status
5. Get protection guidance
6. Image verification (reverse search)
7. Urgent escalation (financial threat)
8. List user's previous reports

## 📚 Documentation Files

- **README.md**: Complete API documentation
- **QUICK_START.md**: 5-minute setup guide
- **IMPLEMENTATION_SUMMARY.md**: Feature overview
- **ARCHITECTURE.md**: System architecture diagrams
- **DEPLOYMENT_CHECKLIST.md**: Production deployment guide
- **THIS FILE**: Truth Engine transformation summary

## 🚀 Quick Start

```bash
# 1. Configure environment
cp agents/.env.example .env
# Add OPENAI_API_KEY

# 2. Test the system
node agents/test-govverify.js

# 3. Integrate with WhatsApp
const { GovVerifyAgent } = require('./agents');
const agent = new GovVerifyAgent();
await agent.initialize();

const response = await agent.processMessage(
  "Is this message true?",
  "+23276123456"
);
```

## 🎯 Production Readiness

### ✅ Ready Now
- Complete verification pipeline
- 8 tool functions implemented
- Privacy & security rules
- Escalation framework
- Testing suite

### 🔄 Needs Integration
- Connect to real government APIs
- Integrate fact-checking databases
- Set up operator notification system
- Configure law enforcement webhooks
- Add database for incident tracking

### 📈 Future Enhancements
- ML-based scam detection
- Real-time threat intelligence feeds
- Multi-language support (Krio, Temne, Mende)
- Voice call verification
- Community reporting network
- Analytics dashboard for authorities

## 🌟 Key Improvements

1. **Comprehensive System Prompt**: 300+ lines with detailed workflows
2. **Evidence-Based Verification**: Confidence scoring algorithm
3. **Structured JSON Output**: Machine-readable + human-friendly
4. **Urgent Escalation**: Automatic detection of critical threats
5. **Privacy First**: Explicit consent, minimal PII, encrypted storage
6. **Sierra Leone Context**: Local sources, contacts, and understanding
7. **Multi-Modal**: Text, images, audio, video, and links
8. **Protection Guidance**: Immediate action steps for threats

## 📞 Support

For questions or issues:
- Check logs: `DEBUG=true node agents/test-govverify.js`
- Review system prompt in `agents/govverify.js`
- Consult tool handlers in `agents/tools/handlers.js`

---

**GovVerify Truth Engine & Cyber Watchdog** - Protecting citizens through AI-powered verification and threat detection. 🛡️🇸🇱
