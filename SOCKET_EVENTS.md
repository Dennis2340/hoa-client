# Socket.IO Real-Time Events Documentation

## Overview
Your WhatsApp server emits real-time events via Socket.IO that your frontend can listen to for instant status updates.

## Server Configuration
```javascript
Server URL: process.env.NEXT_PUBLIC_ABSOLUTE_URL || 'http://localhost:3700'
Socket Path: '/socket.io'
```

## Events Emitted by Server

### 1. **QR Code Generation** - `qr:${chatbotId}`
Emitted when a new QR code is generated and needs to be scanned.

**Payload:**
```javascript
base64String // e.g., "data:image/png;base64,iVBORw0KGgo..."
```

**When:** 
- Initial connection
- After logout when reinitializing
- QR code refresh

---

### 2. **Connection Success** - `connected:${chatbotId}`
Emitted when user successfully scans QR code and WhatsApp connects.

**Payload:**
```javascript
{
  phoneNumber: "23231353914" // The connected WhatsApp number
}
```

**When:** 
- After QR code scan
- Client is ready to send/receive messages

---

### 3. **Disconnection** - `disconnected:${chatbotId}`
Emitted when WhatsApp disconnects (logout or connection failure).

**Payload:**
```javascript
{
  reason: "logout" | "reconnection_failed"
}
```

**When:** 
- User clicks logout in WhatsApp
- Connection fails after multiple reconnection attempts

---

### 4. **Status Updates** - `status:${chatbotId}`
Emitted for various status changes throughout the connection lifecycle.

**Payload:**
```javascript
{
  status: string,       // Current status
  message?: string,     // Human-readable message
  phoneNumber?: string, // When connected
  percent?: number,     // Loading progress
  state?: string        // WhatsApp state
}
```

**Status Values:**
- `qr_generated` - QR code ready to scan
- `authenticating` - User scanned QR, authenticating
- `loading` - WhatsApp Web is loading (includes percent)
- `state_change` - WhatsApp state changed (includes state)
- `connected` - Fully connected and ready

---

## Frontend Implementation Examples

### React/Next.js Example

```javascript
'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function WhatsAppConnection() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [qrCode, setQrCode] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  
  const chatbotId = 'cmiounofx0003jj043l87laro';
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3700';

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io(serverUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Listen for QR code
    socketInstance.on(`qr:${chatbotId}`, (qrCodeBase64) => {
      console.log('📱 QR Code received');
      setQrCode(qrCodeBase64);
      setStatus('awaiting_scan');
    });

    // Listen for connection success
    socketInstance.on(`connected:${chatbotId}`, (data) => {
      console.log('✅ WhatsApp connected!', data.phoneNumber);
      setPhoneNumber(data.phoneNumber);
      setStatus('connected');
      setQrCode(null);
      // Cache in localStorage
      localStorage.setItem('whatsapp_phone', data.phoneNumber);
      localStorage.setItem('whatsapp_status', 'connected');
    });

    // Listen for disconnection
    socketInstance.on(`disconnected:${chatbotId}`, (data) => {
      console.log('❌ WhatsApp disconnected:', data.reason);
      setStatus('disconnected');
      setPhoneNumber(null);
      setQrCode(null);
      
      if (data.reason === 'logout') {
        setStatusMessage('Logged out. Click reconnect to get new QR code.');
      } else if (data.reason === 'reconnection_failed') {
        setStatusMessage('Connection lost. Please reconnect.');
      }
      
      // Clear cache
      localStorage.removeItem('whatsapp_phone');
      localStorage.setItem('whatsapp_status', 'disconnected');
    });

    // Listen for status updates
    socketInstance.on(`status:${chatbotId}`, (data) => {
      console.log('📊 Status update:', data);
      setStatusMessage(data.message || '');
      
      if (data.status === 'authenticating') {
        setStatus('authenticating');
      } else if (data.status === 'loading') {
        setStatus('loading');
        setStatusMessage(`Loading... ${data.percent}%`);
      }
    });

    // Handle Socket.IO connection events
    socketInstance.on('connect', () => {
      console.log('🔌 Socket.IO connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [chatbotId, serverUrl]);

  const handleInitialize = async () => {
    try {
      setStatus('initializing');
      setStatusMessage('Initializing WhatsApp connection...');
      
      const response = await fetch(`${serverUrl}/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
        },
        body: JSON.stringify({ chatbotId }),
      });

      const data = await response.json();
      
      if (data.status === 'connected') {
        setPhoneNumber(data.phoneNumber);
        setStatus('connected');
        setStatusMessage('Already connected!');
      } else if (data.status === 'awaiting_qr') {
        setQrCode(data.qr);
        setStatus('awaiting_scan');
        setStatusMessage('Scan QR code with WhatsApp');
      }
    } catch (error) {
      console.error('Failed to initialize:', error);
      setStatusMessage('Failed to initialize. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${serverUrl}/logout`, {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
        },
      });
      setStatus('disconnected');
      setPhoneNumber(null);
      setQrCode(null);
      setStatusMessage('Logged out successfully');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">WhatsApp Connection</h2>
      
      {/* Status Display */}
      <div className="mb-4">
        <div className={`p-4 rounded-lg ${
          status === 'connected' ? 'bg-green-100 text-green-800' :
          status === 'awaiting_scan' ? 'bg-blue-100 text-blue-800' :
          status === 'loading' || status === 'authenticating' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          <div className="font-semibold">Status: {status}</div>
          {statusMessage && <div className="text-sm mt-1">{statusMessage}</div>}
          {phoneNumber && (
            <div className="text-sm mt-1">📱 Connected: {phoneNumber}</div>
          )}
        </div>
      </div>

      {/* QR Code Display */}
      {qrCode && status === 'awaiting_scan' && (
        <div className="mb-4 text-center">
          <p className="mb-2 text-sm text-gray-600">Scan this QR code with WhatsApp:</p>
          <img 
            src={qrCode} 
            alt="WhatsApp QR Code" 
            className="mx-auto border-4 border-gray-300 rounded-lg"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {status === 'disconnected' && (
          <button
            onClick={handleInitialize}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            Connect WhatsApp
          </button>
        )}
        
        {status === 'connected' && (
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            Disconnect
          </button>
        )}

        {status === 'awaiting_scan' && (
          <button
            onClick={handleInitialize}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Refresh QR Code
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>WhatsApp Connection</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <div id="status">Disconnected</div>
  <div id="qr-container"></div>
  <button id="connect-btn">Connect</button>
  <button id="disconnect-btn" style="display:none;">Disconnect</button>

  <script>
    const chatbotId = 'cmiounofx0003jj043l87laro';
    const serverUrl = 'http://localhost:3700';
    const apiKey = 'your-api-key';

    // Initialize Socket.IO
    const socket = io(serverUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    const statusDiv = document.getElementById('status');
    const qrContainer = document.getElementById('qr-container');
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');

    // Listen for QR code
    socket.on(`qr:${chatbotId}`, (qrCode) => {
      qrContainer.innerHTML = `<img src="${qrCode}" alt="QR Code" style="max-width: 300px;">`;
      statusDiv.textContent = 'Status: Scan QR Code';
      statusDiv.style.color = 'blue';
    });

    // Listen for connection
    socket.on(`connected:${chatbotId}`, (data) => {
      statusDiv.textContent = `Status: Connected (${data.phoneNumber})`;
      statusDiv.style.color = 'green';
      qrContainer.innerHTML = '';
      connectBtn.style.display = 'none';
      disconnectBtn.style.display = 'block';
      localStorage.setItem('whatsapp_phone', data.phoneNumber);
    });

    // Listen for disconnection
    socket.on(`disconnected:${chatbotId}`, (data) => {
      statusDiv.textContent = `Status: Disconnected (${data.reason})`;
      statusDiv.style.color = 'red';
      qrContainer.innerHTML = '';
      connectBtn.style.display = 'block';
      disconnectBtn.style.display = 'none';
      localStorage.removeItem('whatsapp_phone');
    });

    // Listen for status updates
    socket.on(`status:${chatbotId}`, (data) => {
      if (data.message) {
        statusDiv.textContent = `Status: ${data.message}`;
      }
    });

    // Connect button
    connectBtn.addEventListener('click', async () => {
      statusDiv.textContent = 'Status: Initializing...';
      try {
        const response = await fetch(`${serverUrl}/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          },
          body: JSON.stringify({ chatbotId })
        });
        const data = await response.json();
        console.log('Init response:', data);
      } catch (error) {
        statusDiv.textContent = 'Status: Error - ' + error.message;
        statusDiv.style.color = 'red';
      }
    });

    // Disconnect button
    disconnectBtn.addEventListener('click', async () => {
      try {
        await fetch(`${serverUrl}/logout`, {
          method: 'POST',
          headers: { 'X-API-Key': apiKey }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  </script>
</body>
</html>
```

---

## Benefits of Real-Time Events

✅ **Instant Updates** - No polling required  
✅ **Better UX** - Show loading states, progress bars  
✅ **Automatic QR Display** - QR code appears automatically  
✅ **Connection Awareness** - Know immediately when disconnected  
✅ **State Management** - Easy to cache connection status  
✅ **Error Handling** - Get notified of connection failures  

---

## Summary of All Events

| Event | When | Data |
|-------|------|------|
| `qr:${chatbotId}` | QR code generated | Base64 QR image |
| `connected:${chatbotId}` | WhatsApp connected | `{ phoneNumber }` |
| `disconnected:${chatbotId}` | WhatsApp disconnected | `{ reason }` |
| `status:${chatbotId}` | Status change | `{ status, message?, ... }` |

Replace `${chatbotId}` with your actual chatbot ID (e.g., `cmiounofx0003jj043l87laro`).
