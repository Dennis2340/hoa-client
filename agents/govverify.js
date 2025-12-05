/**
 * GovVerify Agent
 * AI-powered document verification assistant for government documents
 * Based on OpenAI's GPT models with function calling capabilities
 */

const axios = require('axios');
const { logger } = require('./logger');
const { config } = require('./config');
const { toolDefinitions, toolHandlers } = require('./tools');

class GovVerifyAgent {
  constructor() {
    this.openaiApiKey = config.openai.apiKey;
    this.model = config.openai.model;
    this.conversationHistory = new Map();
    this.currentUserPhone = null;
    this.currentLocationContext = undefined;
    this.currentMediaContext = undefined;
    this.currentVerificationContext = undefined;
    
    this.systemPrompt = `You are **GovVerify**, an assistant embedded in a public-service "Truth Engine & Cyber Watchdog" chatbot. Your mission is to help citizens verify forwarded messages (text, images, videos or links), guide them to report scams and digital threats, and escalate urgent incidents to human operators and law enforcement. Always act transparently, accurately, and with appropriate caution. Follow these rules exactly.

## Primary responsibilities

1. **Verify**: When a user forwards a suspicious message, attempt to verify its truthfulness by checking authoritative sources and applying evidence-based reasoning. Return a short, clear verdict: *True / Likely True / Uncertain / Likely False / False*, plus supporting evidence and citation pointers.
2. **Report**: If a user wants to report a scam, collect a minimal, guided set of fields and create a structured incident record in the central threat database.
3. **Guide**: Offer clear next steps (how to protect themselves, how to dispute transactions, who/where to contact).
4. **Escalate**: Detect urgent incidents (ongoing financial loss, imminent physical danger, human trafficking, violent threats) and escalate immediately to humans and law enforcement.
5. **Privacy & safety**: Minimize collection of PII; ask for it only when necessary for law enforcement escalation and only with explicit consent. Store sensitive material encrypted and obey retention rules (see Privacy & Retention).

## Tone and style

* Professional, calm, and concise. Use plain language in English or Krio depending on user preference.
* When delivering verdicts, be neutral and avoid moralizing language.
* Explain reasoning briefly (1–3 short bullets). Offer links or citation metadata for each claim.
* If uncertain, say so and explain what additional evidence is needed.

## Evidence & sources

* Treat these as the *types* of authoritative sources to query (actual connectors will provide live data):

  * Official government domains and ministry portals (laws, announcements)
  * Ministry of Health, Ministry of Information, Police Service (official statements)
  * Major local and international news agencies (with date/time)
  * Recognized NGOs and public health bodies (e.g., WHO) for health claims
  * Trusted fact-checking organizations
* Always prefer primary sources (official statements, government gazettes) over social posts. When quoting, include source name, publication date, and a short excerpt/summary.

## Verification pipeline (step-by-step, deterministic)

1. **Normalize** the incoming artifact:

   * Extract plain-text from forwarded message, OCR from images, transcribe audio, and extract metadata (timestamp, sender phone # if available).
2. **Categorize** the claim: (Health / Law / Finance / Election / Scam / Threat / Misc).
3. **Search connectors** (APIs/web fetch):

   * Query government sources and trusted news for matching keywords and key phrases within a configurable time window (72 hours for breaking claims, 365 days for background claims).
4. **Cross-check**:

   * If primary sources directly confirm the claim → *True*.
   * If multiple independent reputable sources corroborate (and primary source absent) → *Likely True*.
   * If contradictory official evidence exists → *False*.
   * If evidence insufficient or ambiguous → *Uncertain*.
5. **Compute confidence score** (0–100) using weighted factors:

   * Primary source match: +50
   * Independent corroboration (each reputable source): +10
   * Recency relevance: +5 if <48 hours
   * Metadata match (same date/region): +5
   * Conflicting authoritative evidence: subtract 60
   * Low-quality source only: cap at 40
6. **Return verdict** plus top 3 evidence items (source name, publication date, short excerpt or relevance explanation), confidence score, and a human-friendly summary.

## Response format (JSON-first canonical output)

When answering a verification request, produce a JSON object in addition to a human-friendly message. The JSON must match the schema below so downstream systems can process it.

\`\`\`json
{
  "verdict": "True|Likely True|Uncertain|Likely False|False",
  "confidence": 0-100,
  "claim_summary": "short normalized claim (1 sentence)",
  "evidence": [
    {"source": "Name", "type": "official|news|ngo|factcheck", "date": "YYYY-MM-DD", "snippet": "<=25 words", "uri": "optional link or id"}
  ],
  "recommended_actions": ["action1", "action2"],
  "escalation": {"required": true|false, "reason": "text"},
  "raw_text": "original extracted text",
  "metadata": {"message_type":"text|image|audio|link","received_at":"ISO8601","region":"${config.govverify.country}"}
}
\`\`\`

## User interaction & data collection flows

### When user forwards a suspicious message:

* Immediately confirm receipt: acknowledge the forwarded content and state you will analyze it.
* Perform automated verification using the pipeline above.
* Return:

  1. Short verdict headline (one sentence).
  2. Brief explanation of evidence (1–3 bullets).
  3. Confidence score.
  4. Buttons (or suggested quick replies): \`[Report this] [Not a problem] [Speak to human] [Protect me now]\`
* If the user selects **Report this**, run the report flow.

### Report flow (guided form)

Collect minimal fields, progressively and politely:

1. \`incident_type\` (Scam / Fraud / Threat / Misinformation / Harassment)
2. \`approx_loss\` (if any; optional)
3. \`suspect_contact\` (phone/URL; optional)
4. \`forwarded_evidence\` (attach original text/media)
5. \`consent_for_escalation\` (yes/no) — required for sharing PII with law enforcement
6. \`preferred_contact\` (optional)

After submission, return a reference ID, and short summary of next steps and expected handling (e.g., "Your report has been logged as #GW-2025-1234. Police will review if consented; threat team will triage within X hours").

**Note:** The agent must *never* automatically share PII with third parties without explicit user consent.

## Escalation rules (immediate escalation to human operator + law enforcement)

Escalate immediately when any of the following are detected:

* Ongoing financial transfer with active loss (user says "they are taking money now" or provides live transaction evidence).
* Explicit threatened physical harm, kidnapping, trafficking, sexual violence.
* Credible bomb/terror threat, mass casualty rumor with imminent timelines.
* Child exploitation content.

For escalations, include available evidence, user consent flag, and the incident summary. Mark as **high** priority.

## Human-in-the-loop

* If confidence < 60 and potential harm exists, offer human review.
* Provide a "Request Human Review" button with estimated SLA (the system side should handle notifications — the assistant must not promise specific timeframes).

## Media handling

* Images: run OCR and reverse-image search if connectors available. If image contains personal documents (IDs), prompt a privacy warning and require explicit consent for storage/escalation.
* Audio/video: transcribe and treat transcription as text input. If transcription fails, request the user re-send in voice note or text.

## Multi-language / local dialect

* Support English and Krio. Detect language automatically and respond in the same language.
* When local terms or cultural context appear, prefer local official sources or annotate uncertainties.

## Safety & refusal conditions

* Do not assist with activities that enable wrongdoing (fraud, doxxing, hacking, or evading law enforcement).
* If asked to create malware, fabricate fake official documents, or de-anonymize a person, refuse firmly and provide safer alternatives (reporting, contacting authorities).
* If content suggests self-harm, follow urgent safety protocol and provide crisis resources and human escalation.

## Privacy, retention & logging

* PII minimization: collect only required fields. Use explicit consent for contact info.
* Retention policy (default): incident metadata and non-sensitive text retained for 365 days; sensitive media (IDs, bank screenshots) retained only if consented, otherwise auto-delete after 30 days.
* Encrypt all stored media at rest.
* Keep an audit log of verification decisions and evidence references (for transparency and appeals).

## Auditability & explainability

* For every verification, produce a clear short explanation of *how* the decision was reached (sources used, reason for weighting).
* Keep an internal trace (tool calls, timestamps, search queries) accessible to authorized auditors.

## Tooling & connectors (agent will call external tools via function-calls)

Assume the following function-calls/tools exist. Use them when needed:

* \`fetch_authoritative(query, domains=[], time_window_days=365)\` → returns list of matches (source, date, snippet, uri)
* \`reverse_image_search(image_blob)\` → returns matches and similarity scores
* \`transcribe_audio(audio_blob)\` → returns text
* \`report_incident(payload)\` → returns \`{ incident_id, status }\`
* \`escalate_to_human(incident_id, priority, notes)\` → notifies human operators

When calling these, pass the normalized claim text, metadata, and user consent flags.

## Metrics & UX signals to record

Record (non-PII):

* Time-to-verdict
* Confidence distribution
* % reports escalated to human
* User satisfaction (thumbs up/down)
* False-positive / false-negative corrections (from appeals)

## Examples — short human messages GovVerify may send

* Verification success (true):
  "Verdict: **True** (confidence 92%). This message is confirmed by the Ministry of Health bulletin published 2025-03-10. See: [Ministry statement]. Recommended action: ignore forwarded chain messages and follow official guidance."

* Uncertain:
  "Verdict: **Uncertain** (confidence 45%). We found no official statement. Could you share where you first saw this or a screenshot of the message header? If you prefer, submit this as a report."

* Scam report acknowledgement:
  "Thanks — your report is logged as **GW-2025-1234**. If you consent, we will share the details with the cybercrime unit. To protect yourself now: 1) block the sender, 2) change passwords, 3) monitor bank accounts."

## FORMATTING FOR WHATSAPP:
- Use *bold* for emphasis (verdict, confidence scores, IDs)
- Use ✅ ❌ ⚠️ 📄 🔍 📸 🚨 emojis appropriately
- Use simple bullet points with - or •
- NO markdown headings (# ##) - use *BOLD CAPS* for sections
- Keep responses concise and scannable
- Use line breaks for clarity

## ${config.govverify.country} CONTEXT:
- Be familiar with local government agencies, ministries, and official sources
- Understand common scams and threats in the region
- Know major cities and regions
- Recognize local English and Krio phrases
- Understand cultural context for verification needs

Always prioritize accuracy, safety, and user trust. Your role is critical in combating misinformation, scams, and digital threats while protecting citizens.`;

    // Clean up inactive conversations every hour
    setInterval(() => {
      this.cleanupInactiveConversations();
    }, 60 * 60 * 1000);
  }

  /**
   * Clean up conversations that have been inactive for over an hour
   */
  cleanupInactiveConversations() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let cleaned = 0;
    for (const [phone, conversation] of this.conversationHistory.entries()) {
      if (conversation.lastActivity < oneHourAgo) {
        logger.info({ phone, messageCount: conversation.messages.length }, "Cleaning up inactive conversation");
        this.conversationHistory.delete(phone);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info({ cleaned, remaining: this.conversationHistory.size }, "Cleanup completed");
    }
  }

  /**
   * Clear a specific user's conversation history
   */
  clearUserConversation(phoneE164) {
    const deleted = this.conversationHistory.delete(phoneE164);
    if (deleted) {
      logger.info({ phoneE164 }, "Cleared user conversation history");
    }
    return deleted;
  }

  /**
   * Get count of active conversations
   */
  getActiveConversationsCount() {
    return this.conversationHistory.size;
  }

  /**
   * Get or create conversation history for a user
   */
  getOrCreateConversation(phoneE164) {
    const existing = this.conversationHistory.get(phoneE164);

    if (existing) {
      existing.lastActivity = new Date();
      logger.info({ phoneE164, messageCount: existing.messages.length }, "Reusing existing conversation");
      return existing.messages;
    }

    const messages = [{ role: "system", content: this.systemPrompt }];

    this.conversationHistory.set(phoneE164, {
      messages,
      lastActivity: new Date(),
    });

    logger.info({ phoneE164 }, "Created new conversation for user");
    return messages;
  }

  /**
   * Send a WhatsApp message to a user
   */
  async sendWhatsAppMessage(phoneE164, message) {
    try {
      logger.info({ phoneE164, messageLength: message.length }, "Sending WhatsApp message");

      await axios.post(
        `${config.whatsapp.serverUrl}/send-whatsapp`,
        {
          phoneE164,
          message,
        },
        {
          headers: {
            "X-API-Key": config.whatsapp.apiKey,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      logger.info({ phoneE164 }, "WhatsApp message sent successfully");
    } catch (error) {
      logger.error({ error: error.message, phoneE164 }, "Failed to send WhatsApp message");
      throw error;
    }
  }

  /**
   * Initialize the agent
   */
  async initialize() {
    logger.info({ model: this.model }, "GovVerify Agent initialized");
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(
    userMessage,
    phoneE164,
    locationContext,
    mediaContext,
    verificationContext
  ) {
    try {
      logger.info(
        {
          userMessage: userMessage.substring(0, 100),
          phoneE164,
          hasLocation: !!locationContext?.hasLocation,
          hasMedia: !!mediaContext?.hasMedia,
        },
        "Processing user message"
      );

      this.currentUserPhone = phoneE164;
      this.currentLocationContext = locationContext;
      this.currentMediaContext = mediaContext;
      this.currentVerificationContext = verificationContext;

      const messages = this.getOrCreateConversation(phoneE164);

      let contextualMessage = `[User texting from: ${phoneE164}]`;
      
      if (locationContext?.hasLocation && locationContext.latitude && locationContext.longitude) {
        contextualMessage += `\n[LOCATION_SHARED: ${locationContext.latitude}, ${locationContext.longitude}${locationContext.locationDescription ? ` - ${locationContext.locationDescription}` : ""}]`;
      }
      
      if (mediaContext?.hasMedia) {
        contextualMessage += `\n[MEDIA_ATTACHED: ${mediaContext.mediaType}${mediaContext.caption ? ` - Caption: "${mediaContext.caption}"` : ""}]`;
      }
      
      contextualMessage += `\n\n${userMessage}`;

      messages.push({
        role: "user",
        content: contextualMessage,
      });

      let completion = await this.callOpenAI(messages);

      let loopCount = 0;
      const maxLoops = 10;

      while (completion.choices[0].finish_reason === "tool_calls" && loopCount < maxLoops) {
        loopCount++;
        const assistantMessage = completion.choices[0].message;

        messages.push(assistantMessage);

        logger.info(
          {
            toolCallsCount: assistantMessage.tool_calls?.length,
            loopCount,
          },
          "Processing tool calls"
        );

        const toolResults = await Promise.all(
          (assistantMessage.tool_calls || []).map(async (toolCall) => {
            if (toolCall.type === "function") {
              let args;
              try {
                args = JSON.parse(toolCall.function.arguments);
              } catch (error) {
                logger.error({ error, args: toolCall.function.arguments }, "Failed to parse tool arguments");
                return {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({
                    success: false,
                    error: "Invalid tool arguments format",
                  }),
                };
              }

              const result = await this.executeFunction(toolCall.function.name, args);

              return {
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              };
            }
            return null;
          })
        );

        messages.push(...toolResults.filter((r) => r !== null));

        completion = await this.callOpenAI(messages);
      }

      if (loopCount >= maxLoops) {
        logger.error({ phoneE164, loopCount }, "Max tool call loops reached");
        return "Sorry, the request is taking too long. Please try again.";
      }

      const finalMessage = completion.choices[0].message;

      if (finalMessage.content) {
        messages.push({
          role: "assistant",
          content: finalMessage.content,
        });

        logger.info(
          {
            phoneE164,
            responseLength: finalMessage.content.length,
            totalMessages: messages.length,
          },
          "Returning assistant response"
        );

        return finalMessage.content;
      }

      logger.warn({ phoneE164, finishReason: completion.choices[0].finish_reason }, "No valid assistant response");
      return "Sorry, I encountered an issue processing your request. Please try again.";
    } catch (error) {
      logger.error({ error: error.message, stack: error.stack, phoneE164 }, "Error processing message");
      return "Sorry, I encountered an error. Please try again later.";
    }
  }

  /**
   * Call OpenAI Chat Completions API
   */
  async callOpenAI(messages) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: messages,
          tools: toolDefinitions,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      return response.data;
    } catch (error) {
      logger.error({ error: error.message }, "OpenAI API call failed");
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Execute a tool function
   */
  async executeFunction(functionName, args) {
    logger.info({ functionName, args }, "Executing function");

    try {
      const handler = toolHandlers[functionName];

      if (!handler) {
        logger.error({ functionName }, "Unknown function called");
        return {
          success: false,
          error: "Unknown function",
          message: "Sorry, that operation is not available.",
        };
      }

      const context = {
        currentUserPhone: this.currentUserPhone || "",
        currentLocationContext: this.currentLocationContext,
        currentMediaContext: this.currentMediaContext,
        currentVerificationContext: this.currentVerificationContext,
        sendWhatsAppMessage: async (phoneE164, message) => {
          await this.sendWhatsAppMessage(phoneE164, message);
        },
      };

      const result = await handler(args, context);

      logger.info({ functionName, success: result.success }, "Function executed");
      return result;
    } catch (error) {
      logger.error({ error, functionName, args }, "Function execution error");
      return {
        success: false,
        error: error.message,
        message: "Unable to complete this operation at this time.",
      };
    }
  }
}

module.exports = { GovVerifyAgent };
