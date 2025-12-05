/**
 * Test File for GovVerify Agent
 * Truth Engine & Cyber Watchdog - Message verification and threat reporting
 * 
 * Usage: node agents/test-govverify.js
 */

require('dotenv').config();
const { GovVerifyAgent } = require('./index');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  log('\n' + '='.repeat(80), 'cyan');
}

async function testAgent() {
  separator();
  log('🚀 GovVerify Agent Test Suite - Truth Engine & Cyber Watchdog', 'bright');
  separator();

  try {
    // Initialize agent
    log('\n📦 Initializing GovVerify Agent...', 'blue');
    const agent = new GovVerifyAgent();
    await agent.initialize();
    log('✅ Agent initialized successfully!', 'green');

    const testPhone = '+23276123456';

    // Test 1: Basic greeting
    separator();
    log('\n🧪 Test 1: Basic Greeting', 'yellow');
    log('User: Hello, what can you do?', 'cyan');
    const response1 = await agent.processMessage('Hello, what can you do?', testPhone);
    log('Agent: ' + response1, 'green');

    // Test 2: Verify a forwarded message
    separator();
    log('\n🧪 Test 2: Verify Forwarded Message', 'yellow');
    const message2 = "I received this message: 'Government is giving out Le 500,000 to all citizens. Click this link to register.' Is this true?";
    log('User: ' + message2, 'cyan');
    const response2 = await agent.processMessage(message2, testPhone);
    log('Agent: ' + response2, 'green');

    // Test 3: Report a scam
    separator();
    log('\n🧪 Test 3: Report Scam', 'yellow');
    const message3 = "I want to report a scam. Someone called saying they're from my bank and asked for my PIN.";
    log('User: ' + message3, 'cyan');
    const response3 = await agent.processMessage(message3, testPhone);
    log('Agent: ' + response3, 'green');

    // Test 4: Check incident status
    separator();
    log('\n🧪 Test 4: Check Incident Status', 'yellow');
    const message4 = "What is the status of GW-2025-123456?";
    log('User: ' + message4, 'cyan');
    const response4 = await agent.processMessage(message4, testPhone);
    log('Agent: ' + response4, 'green');

    // Test 5: Get protection guidance
    separator();
    log('\n🧪 Test 5: Get Protection Guidance', 'yellow');
    const message5 = "How do I protect myself from phishing scams?";
    log('User: ' + message5, 'cyan');
    const response5 = await agent.processMessage(message5, testPhone);
    log('Agent: ' + response5, 'green');

    // Test 6: With media context (image verification)
    separator();
    log('\n🧪 Test 6: With Image (Reverse Image Search)', 'yellow');
    const message6 = "Is this image real? It shows flooding in Freetown";
    const mediaContext = {
      hasMedia: true,
      mediaType: 'image',
      mediaUrl: 'https://example.com/flood-image.jpg',
      caption: "Flooding in Freetown"
    };
    log('User: ' + message6 + ' [with photo]', 'cyan');
    const response6 = await agent.processMessage(message6, testPhone, null, mediaContext);
    log('Agent: ' + response6, 'green');

    // Test 7: Urgent escalation scenario
    separator();
    log('\n🧪 Test 7: Urgent Escalation (Financial Threat)', 'yellow');
    const message7 = "Someone is threatening me and demanding I transfer money RIGHT NOW or they'll hurt my family!";
    log('User: ' + message7, 'cyan');
    const response7 = await agent.processMessage(message7, testPhone);
    log('Agent: ' + response7, 'green');

    // Test 8: List user's reports
    separator();
    log('\n🧪 Test 8: List My Reports', 'yellow');
    const message8 = "Show me all my previous reports";
    log('User: ' + message8, 'cyan');
    const response8 = await agent.processMessage(message8, testPhone);
    log('Agent: ' + response8, 'green');

    // Agent statistics
    separator();
    log('\n📊 Agent Statistics:', 'blue');
    log(`Active Conversations: ${agent.getActiveConversationsCount()}`, 'yellow');

    // Clear conversation
    log('\n🧹 Clearing test conversation...', 'blue');
    const cleared = agent.clearUserConversation(testPhone);
    log(cleared ? '✅ Conversation cleared' : '❌ No conversation to clear', 'green');

    separator();
    log('\n✨ All tests completed successfully!', 'green');
    log('🛡️  GovVerify Truth Engine & Cyber Watchdog is ready!', 'bright');
    separator();

  } catch (error) {
    log('\n❌ Test failed with error:', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  testAgent().then(() => {
    log('\n👋 Test suite finished. Exiting...', 'blue');
    process.exit(0);
  }).catch(error => {
    log('\n💥 Fatal error:', 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { testAgent };
