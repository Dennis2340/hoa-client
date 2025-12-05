# GovVerify Agent - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Environment Variables

```bash
# Copy the example file
cp agents/.env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-key-here
OPENAI_MODEL=gpt-4o-mini
```

### Step 2: Test the Agent

```bash
# Run the test suite
node agents/test-govverify.js
```

You should see output like:
```
🚀 GovVerify Agent Test Suite
📦 Initializing GovVerify Agent...
✅ Agent initialized successfully!
🧪 Test 1: Basic Greeting
...
✨ All tests completed successfully!
```

### Step 3: Basic Integration

Create a simple test file `test-integration.js`:

```javascript
const { GovVerifyAgent } = require('./agents');

async function quickTest() {
  // Initialize
  const agent = new GovVerifyAgent();
  await agent.initialize();
  
  // Test message
  const response = await agent.processMessage(
    "I want to verify my National ID NID-12345678, John Doe",
    "+1234567890"
  );
  
  console.log('Agent Response:', response);
}

quickTest();
```

Run it:
```bash
node test-integration.js
```

### Step 4: Integrate with Your WhatsApp Server

Choose your integration method from `agents/integration-example.js`.

**Option A: Add to existing webhook handler**

```javascript
const { GovVerifyAgent } = require('./agents');

// Initialize once at server startup
const govverifyAgent = new GovVerifyAgent();
govverifyAgent.initialize();

// In your message handler
client.on('message', async msg => {
  // Check if message should go to GovVerify
  if (shouldUseGovVerify(msg)) {
    const response = await govverifyAgent.processMessage(
      msg.body,
      msg.from
    );
    await msg.reply(response);
  }
});
```

**Option B: Add as Express route**

```javascript
const { createGovVerifyRoutes } = require('./agents/integration-example');

// Add to your Express app
app.use('/api/govverify', createGovVerifyRoutes());
```

## 📚 Common Use Cases

### Verify a Document

**User**: "I want to verify my National ID"

**Agent**: Asks for details → Creates verification → Returns VER-xxxxx

### Check Status

**User**: "VER-123456" or "Check my verification"

**Agent**: Shows current status (pending/verified/rejected)

### With Photo

**User**: Sends photo + "Verify my driver's license DL-98765432, Mohamed Kamara"

**Agent**: Acknowledges photo → Creates verification with photo

### Report Fake Document

**User**: "I saw a fake ID at the bank"

**Agent**: Asks for details → Creates report → Returns RPT-xxxxx

## 🔧 Customization

### Change System Prompt

Edit `agents/govverify.js` around line 25:

```javascript
this.systemPrompt = `You are GovVerify...`
```

### Add New Document Type

1. Edit `agents/config.js`:
```javascript
supportedDocuments: [
  "National ID",
  "Voter Registration Card",
  "Your New Document Type"  // Add here
]
```

2. Update `agents/tools/definitions.js`:
```javascript
documentType: {
  type: "string",
  enum: ["National ID", "Your New Document Type", ...],
  ...
}
```

### Add Database Integration

Edit `agents/tools/handlers.js` functions to use your database:

```javascript
async function submitVerificationRequest(args, context) {
  // Replace this:
  // const verification = { ... mock data ... };
  
  // With this:
  const verification = await db.verifications.create({
    documentType: args.documentType,
    documentNumber: args.documentNumber,
    fullName: args.fullName,
    phoneNumber: context.currentUserPhone,
    status: 'pending'
  });
  
  return {
    success: true,
    verification,
    message: `Verification ${verification.id} created!`
  };
}
```

## 🐛 Troubleshooting

### "OpenAI API error"
- Check your `OPENAI_API_KEY` in `.env`
- Verify you have API credits
- Check network connectivity

### "Unable to send WhatsApp message"
- Verify `SERVER_URL` and `API_KEY` in `.env`
- Make sure your WhatsApp server is running
- Check the `/send-whatsapp` endpoint exists

### "Conversation not found"
- This is normal - conversations are created on first message
- They auto-clear after 1 hour of inactivity

### Agent not responding
- Check logs with `DEBUG=true` in `.env`
- Verify OpenAI model name is correct
- Check tool function execution logs

## 📞 Testing with Real WhatsApp

1. Make sure your WhatsApp server is running
2. Get the webhook URL
3. Send messages from WhatsApp
4. Check logs to see agent processing

## 🎯 Next Steps

1. ✅ Test basic functionality
2. ✅ Choose integration method
3. ✅ Add database integration
4. ✅ Customize for your needs
5. ✅ Deploy to production

## 📖 More Resources

- Full documentation: `agents/README.md`
- Integration examples: `agents/integration-example.js`
- Implementation details: `agents/IMPLEMENTATION_SUMMARY.md`
- Tool definitions: `agents/tools/definitions.js`
- Tool handlers: `agents/tools/handlers.js`

## 💡 Pro Tips

1. **Start simple**: Test with the test suite first
2. **Use logging**: Enable `DEBUG=true` during development
3. **Mock first**: Use mock data before adding database
4. **Test tools**: Test each tool function individually
5. **Monitor**: Watch active conversation count

## 🆘 Need Help?

Check the implementation files:
- `agents/govverify.js` - Main agent logic
- `agents/tools/handlers.js` - Tool implementations
- `agents/integration-example.js` - Integration patterns
- `agents/test-govverify.js` - Working examples

Happy coding! 🎉
