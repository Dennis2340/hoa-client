# WhatsApp Server with Message Queue

A production-grade WhatsApp Web API server with built-in message queuing system for reliable message delivery.

## Features

### Core Features
- WhatsApp Web API integration
- QR code authentication
- Session persistence with MongoDB using CLIENT_PHONE_E164
- Queue persistence with MongoDB for multiple sessions
- Health monitoring and auto-reconnection
- Message deduplication
- Media file support (images, documents, audio, video)

### Message Queue System
- **Automatic Queuing**: Messages are queued when WhatsApp client is not ready
- **Retry Logic**: Exponential backoff retry mechanism (up to 5 attempts)
- **Priority Support**: High priority messages are processed first
- **Real-time Processing**: Queue processor runs every 2 seconds when client is ready
- **Queue Management**: REST endpoints for monitoring and managing the queue

## API Endpoints

### Message Sending
- `POST /send-whatsapp` - Send WhatsApp message with queuing support
- `POST /send-media` - Send media files via WhatsApp
- `POST /send-message` - Send direct message (legacy endpoint)

### Queue Management
- `GET /queue/status` - Get detailed queue status and statistics
- `POST /queue/clear` - Clear all messages from the queue
- `GET /queue/isolation` - Verify client isolation and queue separation

### Client Management
- `POST /init` - Initialize WhatsApp client
- `GET /qr` - Get QR code for authentication
- `GET /status` - Get client connection status
- `GET /health` - Detailed health check
- `POST /logout` - Logout and clear session

## Message Queue Behavior

### When Client is Ready
1. Messages are sent immediately
2. Returns HTTP 200 with `"queued": false`

### When Client is Not Ready
1. Messages are added to the queue
2. Returns HTTP 202 with queue information
3. Queue processor automatically sends messages when client becomes ready

### Queue Processing
- **Interval**: Every 2 seconds
- **Retry Attempts**: Up to 5 attempts per message
- **Backoff**: 1s, 2s, 4s, 8s, 16s between retries
- **Priority**: High priority messages are processed first
- **Rate Limiting**: 200ms delay between messages

## Request Examples

### Send Message with Queue Support
```bash
curl -X POST http://localhost:3700/send-whatsapp \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "phoneE164": "+1234567890",
    "message": "Hello from queue system!",
    "priority": "high"
  }'
```

**Response when sent immediately:**
```json
{
  "status": "sent",
  "to": "+1234567890",
  "queued": false
}
```

**Response when queued:**
```json
{
  "status": "queued",
  "to": "+1234567890",
  "messageId": "msg_1696680000000_abc123",
  "queuePosition": 3,
  "queued": true
}
```

### Check Queue Status
```bash
curl -X GET http://localhost:3700/queue/status \
  -H "x-api-key: your-api-key"
```

**Response:**
```json
{
  "size": 5,
  "processing": false,
  "processorActive": true,
  "messages": [
    {
      "id": "msg_1696680000000_abc123",
      "phoneE164": "+1234567890",
      "message": "Hello from queue system!",
      "priority": "normal",
      "attempts": 0,
      "maxAttempts": 5,
      "nextRetry": 1696680000000,
      "waitingMs": 0,
      "age": 5000
    }
  ],
  "stats": {
    "pending": 3,
    "waiting": 2,
    "highPriority": 1,
    "failed": 0
  }
}
```

## Environment Variables

```env
# Required
CLIENT_PHONE_E164=+1234567890
API_KEY=your-secure-api-key
MONGODB_URI=mongodb://localhost:27017/whatsapp

# Multiple Sessions Support
# Each CLIENT_PHONE_E164 creates separate session and queue in MongoDB

# Optional Queue Configuration
QUEUE_PROCESS_INTERVAL=2000    # Queue processing interval in ms
MAX_QUEUE_SIZE=1000           # Maximum messages in queue
MAX_RETRY_ATTEMPTS=5          # Maximum retry attempts per message
RETRY_BACKOFF_BASE=1000       # Base retry delay in ms
```

## Queue Statistics

The queue system provides detailed statistics:

- **Size**: Total messages in queue
- **Pending**: Messages ready to be sent
- **Waiting**: Messages waiting for retry
- **High Priority**: Messages with high priority
- **Failed**: Messages that have failed at least once

## Error Handling

### Client Not Ready
- No manual intervention required
- Queue processor handles delivery when client reconnects

### Send Failures
- Automatic retry with exponential backoff
- Messages removed after 5 failed attempts
- Detailed error logging for troubleshooting

### Queue Overflow
- Oldest messages are removed when queue exceeds `MAX_QUEUE_SIZE`
- Warning logged when messages are dropped

## Production Considerations

### Queue Persistence
- MongoDB-based queue persistence implemented
- Messages persist across server restarts
- Multiple sessions supported using CLIENT_PHONE_E164 identifier
- Automatic queue restoration on client ready

### Monitoring
- Use `/queue/status` endpoint for monitoring
- Set up alerts for queue size thresholds
- Monitor failed message rates

### Performance
- Queue processor runs every 2 seconds by default
- 200ms delay between messages to avoid rate limiting
- Adjust `QUEUE_PROCESS_INTERVAL` based on your needs

{{ ... }}

### Messages Not Being Sent
1. Check client status: `GET /status`
2. Check queue status: `GET /queue/status`
3. Verify client health: `GET /health`
4. Check server logs for errors

### Queue Growing Too Large
1. Check if client is connected
2. Verify WhatsApp Web session is active
3. Consider clearing queue: `POST /queue/clear`
4. Restart server if necessary

### High Retry Rates
1. Check network connectivity
2. Verify phone numbers are valid WhatsApp numbers
3. Monitor WhatsApp Web rate limits
4. Check for authentication issues
