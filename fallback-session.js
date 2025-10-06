const fs = require('fs');
const path = require('path');

/**
 * Fallback session storage when MongoDB is unavailable
 * Stores session data locally as backup
 */
class FallbackSessionStore {
  constructor() {
    this.sessionDir = path.join(__dirname, '.wwebjs_auth');
    this.ensureSessionDir();
  }

  ensureSessionDir() {
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
      console.log('Created fallback session directory:', this.sessionDir);
    }
  }

  async save(clientId, sessionData) {
    try {
      const sessionPath = path.join(this.sessionDir, `${clientId}.json`);
      fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
      console.log(`Fallback session saved for ${clientId}`);
      return true;
    } catch (error) {
      console.error(`Failed to save fallback session for ${clientId}:`, error.message);
      return false;
    }
  }

  async load(clientId) {
    try {
      const sessionPath = path.join(this.sessionDir, `${clientId}.json`);
      if (fs.existsSync(sessionPath)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        console.log(`Fallback session loaded for ${clientId}`);
        return sessionData;
      }
      return null;
    } catch (error) {
      console.error(`Failed to load fallback session for ${clientId}:`, error.message);
      return null;
    }
  }

  async delete(clientId) {
    try {
      const sessionPath = path.join(this.sessionDir, `${clientId}.json`);
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
        console.log(`Fallback session deleted for ${clientId}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete fallback session for ${clientId}:`, error.message);
      return false;
    }
  }

  async exists(clientId) {
    const sessionPath = path.join(this.sessionDir, `${clientId}.json`);
    return fs.existsSync(sessionPath);
  }
}

module.exports = FallbackSessionStore;
