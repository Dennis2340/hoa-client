/**
 * Example Integration: GovVerify Agent with WhatsApp Server
 * 
 * This file demonstrates how to integrate the GovVerify agent
 * with the existing WhatsApp server infrastructure.
 */

const { GovVerifyAgent } = require('./agents');
const express = require('express');

/**
 * Example 1: Basic Integration in Webhook Handler
 */
async function exampleBasicIntegration() {
  const app = express();
  const agent = new GovVerifyAgent();
  
  // Initialize agent on server startup
  await agent.initialize();
  
  // Webhook to receive WhatsApp messages
  app.post('/webhook/govverify', async (req, res) => {
    try {
      const { message, from, location, media } = req.body;
      
      // Prepare location context if available
      const locationContext = location ? {
        hasLocation: true,
        latitude: location.latitude,
        longitude: location.longitude,
        locationDescription: location.description
      } : undefined;
      
      // Prepare media context if available
      const mediaContext = media ? {
        hasMedia: true,
        mediaType: media.type,
        mediaUrl: media.url,
        caption: media.caption
      } : undefined;
      
      // Process message with agent
      const response = await agent.processMessage(
        message,
        from,
        locationContext,
        mediaContext
      );
      
      res.json({
        success: true,
        response: response
      });
      
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  return app;
}

/**
 * Example 2: Integration with Existing Message Handler
 */
class GovVerifyMessageHandler {
  constructor() {
    this.agent = null;
    this.initialized = false;
  }
  
  async initialize() {
    if (!this.initialized) {
      this.agent = new GovVerifyAgent();
      await this.agent.initialize();
      this.initialized = true;
      console.log('GovVerify agent initialized');
    }
  }
  
  async handleMessage(whatsappMessage) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Extract message text
      const messageText = whatsappMessage.body || '';
      
      // Extract sender phone
      const phoneE164 = whatsappMessage.from; // Should be in E.164 format
      
      // Check if message has location
      let locationContext;
      if (whatsappMessage.location) {
        locationContext = {
          hasLocation: true,
          latitude: whatsappMessage.location.latitude,
          longitude: whatsappMessage.location.longitude,
          locationDescription: whatsappMessage.location.description
        };
      }
      
      // Check if message has media
      let mediaContext;
      if (whatsappMessage.hasMedia) {
        const media = await whatsappMessage.downloadMedia();
        mediaContext = {
          hasMedia: true,
          mediaType: media.mimetype.startsWith('image') ? 'image' : 
                     media.mimetype.startsWith('video') ? 'video' : 'document',
          mediaUrl: `data:${media.mimetype};base64,${media.data}`,
          caption: whatsappMessage.body || ''
        };
      }
      
      // Process with agent
      const response = await this.agent.processMessage(
        messageText,
        phoneE164,
        locationContext,
        mediaContext
      );
      
      return response;
      
    } catch (error) {
      console.error('Error handling message with GovVerify:', error);
      return 'Sorry, I encountered an error processing your request. Please try again later.';
    }
  }
  
  clearUserHistory(phoneE164) {
    if (this.agent) {
      return this.agent.clearUserConversation(phoneE164);
    }
    return false;
  }
  
  getActiveConversations() {
    if (this.agent) {
      return this.agent.getActiveConversationsCount();
    }
    return 0;
  }
}

/**
 * Example 3: Integration with Socket.IO for Real-time Updates
 */
class GovVerifySocketHandler {
  constructor(io) {
    this.io = io;
    this.agent = null;
  }
  
  async initialize() {
    this.agent = new GovVerifyAgent();
    await this.agent.initialize();
    
    // Override the sendWhatsAppMessage to also emit via socket
    const originalSend = this.agent.sendWhatsAppMessage.bind(this.agent);
    this.agent.sendWhatsAppMessage = async (phoneE164, message) => {
      // Send via WhatsApp
      await originalSend(phoneE164, message);
      
      // Also emit via socket for real-time UI updates
      this.io.to(phoneE164).emit('govverify:response', {
        message,
        timestamp: new Date().toISOString()
      });
    };
  }
  
  async handleSocketMessage(socket, data) {
    const { message, phoneE164, location, media } = data;
    
    const response = await this.agent.processMessage(
      message,
      phoneE164,
      location,
      media
    );
    
    // Emit response back to client
    socket.emit('govverify:response', {
      message: response,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Example 4: Integration as Express Route
 */
function createGovVerifyRoutes() {
  const router = express.Router();
  const agent = new GovVerifyAgent();
  let initialized = false;
  
  // Initialize agent middleware
  router.use(async (req, res, next) => {
    if (!initialized) {
      await agent.initialize();
      initialized = true;
    }
    req.govverifyAgent = agent;
    next();
  });
  
  // Process message endpoint
  router.post('/message', async (req, res) => {
    try {
      const { message, phoneE164, location, media } = req.body;
      
      if (!message || !phoneE164) {
        return res.status(400).json({
          error: 'Missing required fields: message, phoneE164'
        });
      }
      
      const response = await req.govverifyAgent.processMessage(
        message,
        phoneE164,
        location,
        media
      );
      
      res.json({
        success: true,
        response
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  // Clear conversation endpoint
  router.post('/clear/:phoneE164', async (req, res) => {
    const { phoneE164 } = req.params;
    const cleared = req.govverifyAgent.clearUserConversation(phoneE164);
    
    res.json({
      success: true,
      cleared
    });
  });
  
  // Get statistics endpoint
  router.get('/stats', (req, res) => {
    const activeConversations = req.govverifyAgent.getActiveConversationsCount();
    
    res.json({
      success: true,
      activeConversations,
      timestamp: new Date().toISOString()
    });
  });
  
  return router;
}

/**
 * Example 5: Full Server Integration
 */
async function startGovVerifyServer() {
  const app = express();
  const port = process.env.PORT || 3700;
  
  app.use(express.json());
  
  // Initialize GovVerify agent
  const agent = new GovVerifyAgent();
  await agent.initialize();
  console.log('GovVerify Agent initialized');
  
  // Add routes
  app.use('/api/govverify', createGovVerifyRoutes());
  
  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'GovVerify',
      activeConversations: agent.getActiveConversationsCount(),
      timestamp: new Date().toISOString()
    });
  });
  
  app.listen(port, () => {
    console.log(`GovVerify server listening on port ${port}`);
  });
}

// Export examples
module.exports = {
  exampleBasicIntegration,
  GovVerifyMessageHandler,
  GovVerifySocketHandler,
  createGovVerifyRoutes,
  startGovVerifyServer
};

/**
 * Usage Examples:
 * 
 * 1. Basic usage:
 *    const { GovVerifyAgent } = require('./agents');
 *    const agent = new GovVerifyAgent();
 *    await agent.initialize();
 *    const response = await agent.processMessage("Verify my ID", "+1234567890");
 * 
 * 2. With message handler:
 *    const handler = new GovVerifyMessageHandler();
 *    await handler.initialize();
 *    const response = await handler.handleMessage(whatsappMessage);
 * 
 * 3. As Express routes:
 *    const govverifyRoutes = createGovVerifyRoutes();
 *    app.use('/api/govverify', govverifyRoutes);
 * 
 * 4. Full server:
 *    await startGovVerifyServer();
 */
