# GovVerify Agent

An AI-powered document verification assistant for government documents, built with OpenAI's GPT models and function calling capabilities.

## Overview

The GovVerify Agent helps citizens verify government documents, report fake documents, and check verification statuses through WhatsApp. It's designed to work in Sierra Leone but can be adapted to other countries.

## Architecture

The implementation follows the same pattern as the CrowdsourceAgent:

```
agents/
├── govverify.js          # Main agent class
├── config.js             # Configuration management
├── logger.js             # Logging utility
├── index.js              # Exports
└── tools/
    ├── index.js          # Tool exports
    ├── types.js          # TypeScript-like type definitions
    ├── definitions.js    # OpenAI function definitions
    └── handlers.js       # Function implementation logic
```

## Features

### Document Verification
- **Supported Documents**: National ID, Voter Registration Card, Driver's License, Passport, Business Registration, Tax Clearance
- Submit verification requests with document details
- Attach photos for faster processing
- Track verification status in real-time

### Fake Document Reporting
- Report suspected fake documents
- Provide evidence (photos, location, description)
- Track investigation status

### User Management
- Conversation history per phone number
- Automatic cleanup of inactive conversations
- Phone-based authentication (no passwords needed)

### Multimedia Support
- **Photos**: Users can send document photos
- **Location**: GPS coordinates for business verifications
- **Captions**: Support for image captions

## Tool Functions

1. **submit_verification_request**: Create a new verification request
2. **check_verification_status**: Check status of a verification by ID
3. **list_user_verifications**: List all user's verification requests
4. **report_fake_document**: Report suspected fake documents
5. **update_verification_photo**: Add/update photo for existing verification
6. **get_verification_statistics**: Get platform statistics

## Usage

### Initialize the Agent

```javascript
const { GovVerifyAgent } = require('./agents');

const agent = new GovVerifyAgent();
await agent.initialize();
```

### Process Messages

```javascript
const response = await agent.processMessage(
  "I want to verify my National ID NID-12345678, Mohamed Kamara",
  "+23276123456",  // User's phone number (E.164 format)
  null,            // Location context (optional)
  null,            // Media context (optional)
  null             // Verification context (optional)
);

console.log(response); // AI-generated response
```

### With Media Context

```javascript
const mediaContext = {
  hasMedia: true,
  mediaType: 'image',
  mediaUrl: 'https://example.com/document.jpg',
  caption: 'My National ID'
};

const response = await agent.processMessage(
  "Verify this document",
  "+23276123456",
  null,
  mediaContext
);
```

### With Location Context

```javascript
const locationContext = {
  hasLocation: true,
  latitude: 8.4657,
  longitude: -13.2317,
  locationDescription: "Freetown, Sierra Leone"
};

const response = await agent.processMessage(
  "Register my business",
  "+23276123456",
  locationContext
);
```

## Configuration

Set these environment variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini  # or gpt-4, gpt-3.5-turbo

# WhatsApp Server Configuration
SERVER_URL=http://localhost:3700
API_KEY=your-api-key

# GovVerify Configuration (optional)
GOVVERIFY_NAME=GovVerify
GOVVERIFY_COUNTRY=Sierra Leone

# Debug Mode
DEBUG=true  # Enable debug logging
```

## Conversation Management

The agent automatically manages conversation history:

- **Session Creation**: New conversations start with system prompt
- **Context Preservation**: Messages and tool calls are stored
- **Auto Cleanup**: Inactive conversations (>1 hour) are automatically removed
- **Manual Clear**: Use `agent.clearUserConversation(phoneE164)` to clear specific user

## Integration with WhatsApp Server

The agent integrates with the existing WhatsApp server:

```javascript
// In your webhook handler
const { GovVerifyAgent } = require('./agents');
const agent = new GovVerifyAgent();
await agent.initialize();

// When message is received
app.post('/webhook/message', async (req, res) => {
  const { message, from, location, media } = req.body;
  
  const response = await agent.processMessage(
    message,
    from,
    location,
    media
  );
  
  // Send response back via WhatsApp
  // ... existing WhatsApp sending logic
});
```

## Extending the Agent

### Add New Tool Functions

1. **Define the tool** in `tools/definitions.js`:

```javascript
{
  type: "function",
  function: {
    name: "new_function_name",
    description: "What this function does",
    parameters: {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "Parameter description"
        }
      },
      required: ["param1"]
    }
  }
}
```

2. **Implement the handler** in `tools/handlers.js`:

```javascript
async function newFunctionName(args, context) {
  try {
    const { param1 } = args;
    
    // Your logic here
    
    return {
      success: true,
      message: "Success message"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Error message"
    };
  }
}

// Add to exports
toolHandlers.new_function_name = newFunctionName;
```

3. **Update system prompt** in `govverify.js` to explain when to use the new function

### Customize System Prompt

Edit the `systemPrompt` in `govverify.js` to:
- Change tone and style
- Add country-specific context
- Modify supported document types
- Update response formats

## Error Handling

The agent includes comprehensive error handling:

- **API Errors**: Retries and fallback messages
- **Invalid Arguments**: Graceful error messages to user
- **Tool Execution Errors**: Logged and reported safely
- **Timeout Protection**: Max 10 tool call loops per message

## Logging

Structured logging with context:

```javascript
logger.info({ phoneE164, messageCount }, "Message processed");
logger.error({ error, functionName }, "Function failed");
```

Enable debug logging:
```bash
DEBUG=true npm start
```

## Security Considerations

1. **Phone Authentication**: Users identified by phone number
2. **No Passwords**: Leverages WhatsApp security
3. **Privacy**: Users can only access their own verifications
4. **API Keys**: Secure OpenAI API key in environment variables
5. **Verification IDs**: Unique, shareable verification identifiers

## Performance

- **Conversation Cleanup**: Hourly cleanup of inactive sessions
- **Efficient Context**: Only relevant messages kept in history
- **Async Operations**: Non-blocking tool execution
- **Timeout Handling**: 60s timeout for OpenAI API calls

## Testing

Test the agent manually:

```javascript
const { GovVerifyAgent } = require('./agents');

async function test() {
  const agent = new GovVerifyAgent();
  await agent.initialize();
  
  // Test verification request
  const response = await agent.processMessage(
    "I want to verify my National ID NID-12345678, John Doe",
    "+1234567890"
  );
  
  console.log(response);
}

test();
```

## Future Enhancements

- Database integration (currently returns mock data)
- Real government API integration
- Webhook notifications for status updates
- Multi-language support
- Voice message processing
- Batch verification support
- Admin dashboard integration

## Support

For issues or questions:
- Check logs with `DEBUG=true`
- Review OpenAI API status
- Verify environment variables
- Check conversation history size with `agent.getActiveConversationsCount()`

## License

ISC License - See main project LICENSE file
