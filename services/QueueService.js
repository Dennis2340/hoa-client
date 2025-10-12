const QueueMessage = require('../models/QueueMessage');

class QueueService {
  constructor(clientPhoneE164) {
    this.clientPhoneE164 = clientPhoneE164;
  }

  async addMessage(phoneE164, message, priority = 'normal') {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queueMessage = new QueueMessage({
      messageId,
      clientPhoneE164: this.clientPhoneE164,
      phoneE164,
      message,
      priority,
      nextRetry: new Date(),
      status: 'pending'
    });

    await queueMessage.save();
    return queueMessage;
  }

  async getNextMessages(limit = 10) {
    const now = new Date();
    return await QueueMessage.find({
      clientPhoneE164: this.clientPhoneE164,
      status: 'pending',
      nextRetry: { $lte: now }
    })
    .sort({ priority: -1, nextRetry: 1 })
    .limit(limit);
  }

  async markAsSent(messageId) {
    return await QueueMessage.findOneAndUpdate(
      { messageId, clientPhoneE164: this.clientPhoneE164 },
      { status: 'sent' },
      { new: true }
    );
  }

  async markAsFailed(messageId, error) {
    const message = await QueueMessage.findOne({ 
      messageId, 
      clientPhoneE164: this.clientPhoneE164 
    });
    
    if (!message) return null;

    message.attempts += 1;
    message.lastError = error;

    if (message.attempts >= message.maxAttempts) {
      message.status = 'failed';
    } else {
      const backoffMs = 1000 * Math.pow(2, message.attempts - 1);
      message.nextRetry = new Date(Date.now() + backoffMs);
    }

    return await message.save();
  }

  async getQueueStats() {
    const pipeline = [
      { $match: { clientPhoneE164: this.clientPhoneE164 } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const stats = await QueueMessage.aggregate(pipeline);
    const result = { pending: 0, processing: 0, sent: 0, failed: 0 };
    
    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    const now = new Date();
    const waiting = await QueueMessage.countDocuments({
      clientPhoneE164: this.clientPhoneE164,
      status: 'pending',
      nextRetry: { $gt: now }
    });

    const highPriority = await QueueMessage.countDocuments({
      clientPhoneE164: this.clientPhoneE164,
      status: 'pending',
      priority: 'high'
    });

    return {
      ...result,
      waiting,
      highPriority,
      total: result.pending + result.processing + result.sent + result.failed
    };
  }

  async getQueueMessages(limit = 50) {
    return await QueueMessage.find({
      clientPhoneE164: this.clientPhoneE164,
      status: { $in: ['pending', 'processing'] }
    })
    .sort({ priority: -1, nextRetry: 1 })
    .limit(limit);
  }

  async clearQueue() {
    const result = await QueueMessage.deleteMany({
      clientPhoneE164: this.clientPhoneE164,
      status: { $in: ['pending', 'processing'] }
    });
    return result.deletedCount;
  }

  async loadQueueFromMemory(memoryQueue) {
    if (!memoryQueue || memoryQueue.length === 0) return;

    const queueMessages = memoryQueue.map(msg => ({
      messageId: msg.id,
      clientPhoneE164: this.clientPhoneE164,
      phoneE164: msg.phoneE164,
      message: msg.message,
      priority: msg.priority || 'normal',
      attempts: msg.attempts || 0,
      maxAttempts: msg.maxAttempts || 5,
      nextRetry: new Date(msg.nextRetry || Date.now()),
      timestamp: new Date(msg.timestamp || Date.now()),
      status: 'pending'
    }));

    try {
      await QueueMessage.insertMany(queueMessages, { ordered: false });
      console.log(`Migrated ${queueMessages.length} messages from memory to MongoDB`);
    } catch (error) {
      if (error.code === 11000) {
        console.log('Some messages already exist in MongoDB, skipping duplicates');
      } else {
        throw error;
      }
    }
  }

  async restoreQueueToMemory() {
    const messages = await QueueMessage.find({
      clientPhoneE164: this.clientPhoneE164,
      status: { $in: ['pending', 'processing'] }
    }).sort({ priority: -1, nextRetry: 1 });

    return messages.map(msg => ({
      id: msg.messageId,
      phoneE164: msg.phoneE164,
      message: msg.message,
      priority: msg.priority,
      attempts: msg.attempts,
      maxAttempts: msg.maxAttempts,
      nextRetry: msg.nextRetry.getTime(),
      timestamp: msg.timestamp.getTime()
    }));
  }

  async verifyClientIsolation() {
    const allMessages = await QueueMessage.find({ clientPhoneE164: this.clientPhoneE164 });
    const otherClientMessages = await QueueMessage.find({ 
      clientPhoneE164: { $ne: this.clientPhoneE164 } 
    }).limit(5);
    
    return {
      thisClientMessages: allMessages.length,
      otherClientsExist: otherClientMessages.length > 0,
      clientPhoneE164: this.clientPhoneE164,
      sampleOtherClients: otherClientMessages.map(msg => msg.clientPhoneE164)
    };
  }
}

module.exports = QueueService;
