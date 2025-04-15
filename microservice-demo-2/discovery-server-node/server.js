const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8761;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Store registered services
const services = {};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Register a service
app.post('/eureka/apps/:appId', (req, res) => {
  const { appId } = req.params;
  const { instanceId, hostName, ipAddr, port, status } = req.body;
  
  if (!services[appId]) {
    services[appId] = {};
  }
  
  services[appId][instanceId || uuidv4()] = {
    hostName,
    ipAddr,
    port,
    status: status || 'UP',
    lastUpdated: new Date().toISOString()
  };
  
  console.log(`Service registered: ${appId}`);
  res.status(204).send();
});

// Deregister a service
app.delete('/eureka/apps/:appId/:instanceId', (req, res) => {
  const { appId, instanceId } = req.params;
  
  if (services[appId] && services[appId][instanceId]) {
    delete services[appId][instanceId];
    console.log(`Service deregistered: ${appId}/${instanceId}`);
    
    // Clean up empty app entries
    if (Object.keys(services[appId]).length === 0) {
      delete services[appId];
    }
  }
  
  res.status(200).send();
});

// Send heartbeat
app.put('/eureka/apps/:appId/:instanceId', (req, res) => {
  const { appId, instanceId } = req.params;
  
  if (services[appId] && services[appId][instanceId]) {
    services[appId][instanceId].lastUpdated = new Date().toISOString();
    console.log(`Heartbeat received: ${appId}/${instanceId}`);
  }
  
  res.status(200).send();
});

// Get all instances of a service
app.get('/eureka/apps/:appId', (req, res) => {
  const { appId } = req.params;
  
  if (services[appId]) {
    res.status(200).json({
      application: {
        name: appId,
        instances: Object.entries(services[appId]).map(([id, details]) => ({
          instanceId: id,
          ...details
        }))
      }
    });
  } else {
    res.status(404).json({ error: `Application ${appId} not found` });
  }
});

// Get all services
app.get('/eureka/apps', (req, res) => {
  const applications = Object.entries(services).map(([appId, instances]) => ({
    name: appId,
    instances: Object.entries(instances).map(([id, details]) => ({
      instanceId: id,
      ...details
    }))
  }));
  
  res.status(200).json({ applications });
});

// Dashboard
app.get('/', (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Discovery Server Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .service { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .service h2 { margin-top: 0; }
        .instance { margin-left: 20px; margin-bottom: 10px; }
        .status-UP { color: green; }
        .status-DOWN { color: red; }
        .refresh { margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Discovery Server Dashboard</h1>
      <div class="refresh">
        <button onclick="window.location.reload()">Refresh</button>
      </div>
      <div id="services">
  `;
  
  if (Object.keys(services).length === 0) {
    html += '<p>No services registered</p>';
  } else {
    Object.entries(services).forEach(([appId, instances]) => {
      html += `<div class="service"><h2>${appId}</h2>`;
      
      Object.entries(instances).forEach(([instanceId, details]) => {
        html += `
          <div class="instance">
            <p><strong>Instance ID:</strong> ${instanceId}</p>
            <p><strong>Host:</strong> ${details.hostName}</p>
            <p><strong>IP:</strong> ${details.ipAddr}</p>
            <p><strong>Port:</strong> ${details.port}</p>
            <p><strong>Status:</strong> <span class="status-${details.status}">${details.status}</span></p>
            <p><strong>Last Updated:</strong> ${details.lastUpdated}</p>
          </div>
        `;
      });
      
      html += '</div>';
    });
  }
  
  html += `
      </div>
    </body>
    </html>
  `;
  
  res.send(html);
});

// Start server
app.listen(PORT, () => {
  console.log(`Discovery Server running on port ${PORT}`);
});
