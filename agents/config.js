/**
 * Configuration for GovVerify Agent
 * Truth Engine & Cyber Watchdog - Message verification and threat reporting
 * Loads environment variables and provides configuration objects
 */

require('dotenv').config();

const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  whatsapp: {
    serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3700}`,
    apiKey: process.env.API_KEY,
  },
  govverify: {
    name: process.env.GOVVERIFY_NAME || "GovVerify",
    country: process.env.GOVVERIFY_COUNTRY || "Sierra Leone",
    trustedSources: [
      // Government domains
      "gov.sl",
      "statehouse.gov.sl",
      "mohs.gov.sl", // Ministry of Health
      "sierraleonepolice.gov.sl",
      
      // International trusted sources
      "who.int",
      "un.org",
      
      // Local news agencies
      "thesierraleonetelegraph.com",
      "awoko.org",
      "standardtimespress.org"
    ],
    escalationContacts: {
      police: process.env.POLICE_CONTACT || "+232-999",
      cybercrime: process.env.CYBERCRIME_CONTACT || "+232-cybercrime",
      emergency: process.env.EMERGENCY_CONTACT || "999"
    },
    retentionDays: {
      metadata: 365,
      sensitivePII: 30,
      incidentReports: 730 // 2 years
    }
  },
};

module.exports = { config };
