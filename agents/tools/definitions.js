/**
 * Tool Definitions for GovVerify Agent
 * Truth Engine & Cyber Watchdog - Message verification and scam reporting
 */

const toolDefinitions = [
  {
    type: "function",
    function: {
      name: "fetch_authoritative",
      description: "Query authoritative sources (government, ministry, trusted news) to verify claims. Returns matching evidence from official sources within specified time window.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The claim or message text to verify"
          },
          domains: {
            type: "array",
            items: { type: "string" },
            description: "Specific domains to search (e.g., ['gov.sl', 'who.int']). Leave empty to search all trusted sources."
          },
          time_window_days: {
            type: "number",
            description: "How many days back to search (72 for breaking news, 365 for background). Default is 365.",
            default: 365
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reverse_image_search",
      description: "Perform reverse image search to find the original source and context of an image. Helps detect manipulated or misleading images.",
      parameters: {
        type: "object",
        properties: {
          image_description: {
            type: "string",
            description: "Description of the image content for search"
          }
        },
        required: ["image_description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "transcribe_audio",
      description: "Transcribe audio or video content to text for verification. Use when user sends voice notes or video messages.",
      parameters: {
        type: "object",
        properties: {
          audio_description: {
            type: "string",
            description: "Brief description of the audio content"
          }
        },
        required: ["audio_description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "report_incident",
      description: "Create a formal incident report for scams, threats, misinformation, or harassment. Collects structured data for law enforcement and threat database.",
      parameters: {
        type: "object",
        properties: {
          incident_type: {
            type: "string",
            enum: ["Scam", "Fraud", "Threat", "Misinformation", "Harassment", "Phishing", "Identity Theft"],
            description: "Type of incident being reported"
          },
          claim_summary: {
            type: "string",
            description: "Short summary of the claim or incident (1 sentence)"
          },
          approx_loss: {
            type: "string",
            description: "Approximate financial loss if any (e.g., 'Le 500,000', 'Unknown')"
          },
          suspect_contact: {
            type: "string",
            description: "Phone number, URL, or contact info of suspect (if available)"
          },
          forwarded_evidence: {
            type: "string",
            description: "Original text or description of evidence"
          },
          consent_for_escalation: {
            type: "boolean",
            description: "User consents to sharing PII with law enforcement"
          },
          preferred_contact: {
            type: "string",
            description: "User's preferred contact method for follow-up"
          }
        },
        required: ["incident_type", "claim_summary", "consent_for_escalation"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "escalate_to_human",
      description: "Escalate urgent incidents to human operators and law enforcement. Use for ongoing financial loss, physical danger, trafficking, violent threats, or child exploitation.",
      parameters: {
        type: "object",
        properties: {
          incident_id: {
            type: "string",
            description: "Reference ID from report_incident or generated ID"
          },
          priority: {
            type: "string",
            enum: ["high", "critical", "emergency"],
            description: "Urgency level: high (review within hours), critical (within hour), emergency (immediate)"
          },
          notes: {
            type: "string",
            description: "Additional context for human operators and law enforcement"
          },
          threat_type: {
            type: "string",
            enum: ["financial_loss", "physical_harm", "trafficking", "child_exploitation", "terrorism", "self_harm"],
            description: "Specific type of threat detected"
          }
        },
        required: ["incident_id", "priority", "notes", "threat_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_incident_status",
      description: "Check the status of a previously reported incident by incident ID",
      parameters: {
        type: "object",
        properties: {
          incident_id: {
            type: "string",
            description: "The incident ID (format: GW-YYYY-####)"
          }
        },
        required: ["incident_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_user_reports",
      description: "List all incident reports submitted by the current user",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["all", "pending", "investigating", "resolved", "escalated"],
            description: "Filter by status. Default is 'all'"
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return. Default is 10"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_protection_guidance",
      description: "Get immediate protection steps and guidance for specific threat types (scams, phishing, identity theft, etc.)",
      parameters: {
        type: "object",
        properties: {
          threat_type: {
            type: "string",
            enum: ["financial_scam", "phishing", "identity_theft", "online_harassment", "data_breach", "malware"],
            description: "Type of threat to get protection guidance for"
          }
        },
        required: ["threat_type"]
      }
    }
  }
];

module.exports = { toolDefinitions };
