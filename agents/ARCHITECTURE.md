# GovVerify Agent Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        WhatsApp User                             │
│                     (Phone: +23276123456)                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ WhatsApp Message
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   WhatsApp Server Integration                    │
│                    (Your Existing Server)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Message Handler / Webhook                                │  │
│  │  - Receives WhatsApp messages                             │  │
│  │  - Extracts text, media, location                         │  │
│  │  - Routes to GovVerify Agent                              │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
└───────────────┼──────────────────────────────────────────────────┘
                │
                │ processMessage()
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GovVerify Agent                             │
│                    (agents/govverify.js)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Conversation Manager                                     │  │
│  │  - Stores history per user                                │  │
│  │  - Auto-cleanup (1 hour)                                  │  │
│  │  - System prompt injection                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ messages[]                           │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  OpenAI Chat Completions API                             │  │
│  │  - Model: gpt-4o-mini                                     │  │
│  │  - Function calling enabled                               │  │
│  │  - Tool definitions attached                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           │ tool_calls?                          │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tool Executor                                            │  │
│  │  - Parses tool arguments                                  │  │
│  │  - Calls tool handlers                                    │  │
│  │  - Returns results to OpenAI                              │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
└───────────────┼──────────────────────────────────────────────────┘
                │
                │ executeFunction()
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Tool System                                │
│                    (agents/tools/)                               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Tool Definitions (definitions.js)                      │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │ submit_verification_request                       │  │    │
│  │  │ check_verification_status                         │  │    │
│  │  │ list_user_verifications                           │  │    │
│  │  │ report_fake_document                              │  │    │
│  │  │ update_verification_photo                         │  │    │
│  │  │ get_verification_statistics                       │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           │ maps to                              │
│                           ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Tool Handlers (handlers.js)                           │    │
│  │  - Implementation logic                                 │    │
│  │  - Data access (currently mocked)                       │    │
│  │  - Error handling                                       │    │
│  │  - Returns structured results                           │    │
│  └──────────────────┬──────────────────────────────────────┘    │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
                      │ (Future: Database Integration)
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database (Optional)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables:                                                  │  │
│  │  - verifications (id, documentType, status, ...)         │  │
│  │  - fake_reports (id, documentType, description, ...)     │  │
│  │  - users (phone, name, ...)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Example: User Submits Verification Request

```
1. User → WhatsApp
   "I want to verify my National ID NID-12345678, Mohamed Kamara"

2. WhatsApp → Your Server
   POST /webhook/message
   { message: "...", from: "+23276123456" }

3. Your Server → GovVerify Agent
   agent.processMessage(message, phone)

4. GovVerify Agent → Conversation Manager
   - Check if user has existing conversation
   - Add user message to history

5. Conversation Manager → OpenAI API
   POST https://api.openai.com/v1/chat/completions
   {
     model: "gpt-4o-mini",
     messages: [...history],
     tools: [tool_definitions]
   }

6. OpenAI API → Tool Call Decision
   "I should call submit_verification_request with..."
   {
     finish_reason: "tool_calls",
     tool_calls: [{
       function: {
         name: "submit_verification_request",
         arguments: {
           documentType: "National ID",
           documentNumber: "NID-12345678",
           fullName: "Mohamed Kamara"
         }
       }
     }]
   }

7. GovVerify Agent → Tool Executor
   executeFunction("submit_verification_request", args)

8. Tool Executor → Tool Handler
   handlers.submitVerificationRequest(args, context)

9. Tool Handler → Database (Future)
   // Currently returns mock data
   // Future: INSERT INTO verifications ...
   
   Returns:
   {
     success: true,
     verification: {
       id: "VER-123456789",
       status: "pending",
       ...
     }
   }

10. Tool Handler → OpenAI API
    Add tool result to conversation
    Call OpenAI again to generate response

11. OpenAI API → Final Response
    {
      finish_reason: "stop",
      message: {
        content: "✅ Verification request submitted! ..."
      }
    }

12. GovVerify Agent → Your Server
    return "✅ Verification request submitted! ..."

13. Your Server → WhatsApp
    Send formatted message back to user

14. WhatsApp → User
    Display message in chat
```

## Component Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     GovVerify Agent                          │
│                                                               │
│  Dependencies:                                                │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────────┐       │
│  │   config    │  │  logger  │  │  tools (6 fns)   │       │
│  │             │  │          │  │                  │       │
│  │ - OpenAI    │  │ - info() │  │ - definitions    │       │
│  │ - WhatsApp  │  │ - error()│  │ - handlers       │       │
│  │ - GovVerify │  │ - warn() │  │ - types          │       │
│  └─────────────┘  └──────────┘  └──────────────────┘       │
│                                                               │
│  External APIs:                                               │
│  ┌──────────────────────────┐  ┌────────────────────────┐  │
│  │   OpenAI Chat API        │  │  WhatsApp Server       │  │
│  │                          │  │                        │  │
│  │ - gpt-4o-mini            │  │ - send-whatsapp        │  │
│  │ - Function calling       │  │ - POST with message    │  │
│  └──────────────────────────┘  └────────────────────────┘  │
│                                                               │
│  State Management:                                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  conversationHistory: Map<phone, ConversationData>   │   │
│  │                                                       │   │
│  │  ConversationData:                                    │   │
│  │  - messages: Array<ChatMessage>                       │   │
│  │  - lastActivity: Date                                 │   │
│  │  - Auto-cleanup after 1 hour                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## File Structure & Responsibilities

```
agents/
│
├── govverify.js                  ★ MAIN AGENT CLASS
│   ├── Class: GovVerifyAgent
│   ├── Constructor: Setup OpenAI, state
│   ├── initialize(): Start agent
│   ├── processMessage(): Main entry point
│   ├── callOpenAI(): API communication
│   ├── executeFunction(): Tool execution
│   ├── sendWhatsAppMessage(): Message sending
│   ├── getOrCreateConversation(): State mgmt
│   └── cleanupInactiveConversations(): Cleanup
│
├── config.js                     ★ CONFIGURATION
│   └── config object:
│       ├── openai: { apiKey, model }
│       ├── whatsapp: { serverUrl, apiKey }
│       └── govverify: { name, country, documents }
│
├── logger.js                     ★ LOGGING
│   └── logger object:
│       ├── info(context, message)
│       ├── error(context, message)
│       ├── warn(context, message)
│       └── debug(context, message)
│
├── tools/
│   │
│   ├── index.js                  ★ EXPORTS
│   │   └── Exports: { toolDefinitions, toolHandlers }
│   │
│   ├── types.js                  ★ TYPE DEFINITIONS
│   │   └── JSDoc type definitions
│   │
│   ├── definitions.js            ★ OPENAI FUNCTION SCHEMAS
│   │   └── Array of 6 function definitions
│   │       (OpenAI function calling format)
│   │
│   └── handlers.js               ★ IMPLEMENTATION LOGIC
│       └── 6 async functions:
│           ├── submitVerificationRequest()
│           ├── checkVerificationStatus()
│           ├── listUserVerifications()
│           ├── reportFakeDocument()
│           ├── updateVerificationPhoto()
│           └── getVerificationStatistics()
│
├── integration-example.js        ★ INTEGRATION PATTERNS
│   ├── exampleBasicIntegration()
│   ├── GovVerifyMessageHandler class
│   ├── GovVerifySocketHandler class
│   ├── createGovVerifyRoutes()
│   └── startGovVerifyServer()
│
├── test-govverify.js            ★ TEST SUITE
│   └── testAgent(): 8 test cases
│
├── .env.example                 ★ CONFIG TEMPLATE
├── README.md                    ★ FULL DOCS
├── IMPLEMENTATION_SUMMARY.md    ★ OVERVIEW
└── QUICK_START.md              ★ GETTING STARTED
```

## Context Flow

```
User Message + Contexts
         │
         ├─ phoneE164: "+23276123456"
         │
         ├─ locationContext?: {
         │    hasLocation: true,
         │    latitude: 8.4657,
         │    longitude: -13.2317,
         │    locationDescription: "Freetown"
         │  }
         │
         ├─ mediaContext?: {
         │    hasMedia: true,
         │    mediaType: "image",
         │    mediaUrl: "data:image/jpeg;base64,...",
         │    caption: "My ID card"
         │  }
         │
         └─ verificationContext?: {
              verificationId: "VER-123456",
              documentType: "National ID",
              status: "pending"
            }
                 │
                 ▼
         ToolContext (passed to handlers)
                 │
                 ├─ currentUserPhone
                 ├─ currentLocationContext
                 ├─ currentMediaContext
                 ├─ currentVerificationContext
                 └─ sendWhatsAppMessage()
                        │
                        ▼
                   Tool Handler
                        │
                        └─ Uses context to:
                           - Identify user
                           - Access location/media
                           - Send follow-up messages
                           - Track verification state
```

## Message Loop

```
User sends message
      │
      ▼
┌─────────────────┐
│ Add to history  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     YES    ┌──────────────────┐
│ Call OpenAI API │─────────────▶│ Execute tool(s) │
└────────┬────────┘             └────────┬─────────┘
         │                               │
         │ finish_reason                 │
         │ = "tool_calls"?               │
         │                               │
         │◀──────────────────────────────┘
         │ Add tool results to history
         │ Call OpenAI again
         │
         │ NO (finish_reason = "stop")
         │
         ▼
┌─────────────────┐
│ Return response │
└─────────────────┘
         │
         ▼
   Send to user

(Max 10 loops to prevent infinite recursion)
```

## Security Model

```
┌────────────────────────────────────────────────────┐
│                  User Identity                      │
│                                                     │
│  Phone Number (E.164 format)                       │
│  ├─ Unique identifier                              │
│  ├─ Provided by WhatsApp                           │
│  ├─ No password needed                             │
│  └─ Trusted by platform                            │
└─────────────────┬──────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────────────┐
│              Data Isolation                         │
│                                                     │
│  Each tool handler receives:                        │
│  - currentUserPhone                                 │
│                                                     │
│  Queries filtered by phone:                         │
│  - SELECT * FROM verifications                      │
│    WHERE phoneNumber = currentUserPhone             │
│                                                     │
│  Users can ONLY access their own data               │
└─────────────────────────────────────────────────────┘
```

This architecture follows the same pattern as the CrowdsourceAgent but adapted for document verification! 🚀
