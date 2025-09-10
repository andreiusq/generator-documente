const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const DocumentGenerator = require('./document-generator');

let mainWindow;
let phpServer;
const PORT = 3000;

// Express server to serve PHP files
function startExpressServer() {
  const server = express();
  
  // Serve static files (CSS, JS, images)
  server.use(express.static(__dirname + '/../'));
  
  // Handle PHP files by proxying to PHP built-in server
  server.get('*', (req, res) => {
    // For now, just serve the HTML files directly
    // In production, we'd need a PHP interpreter
    if (req.path === '/' || req.path === '/index.php') {
      res.sendFile(path.join(__dirname, '../index.html'));
    } else if (req.path.endsWith('.php')) {
      // For development, serve converted HTML versions
      const htmlFile = req.path.replace('.php', '.html');
      res.sendFile(path.join(__dirname, '..' + htmlFile));
    } else {
      res.sendFile(path.join(__dirname, '..' + req.path));
    }
  });
  
  server.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
  
  return server;
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
      webSecurity: false // Allow local file access
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false,
    titleBarStyle: 'default'
  });

  // Start the express server
  startExpressServer();

  // Load the app
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (process.env.ELECTRON_IS_DEV) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (phpServer) {
    phpServer.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (phpServer) {
    phpServer.kill();
  }
});

// Handle app certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('http://localhost')) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// IPC handlers
const documentGenerator = new DocumentGenerator();

ipcMain.handle('get-preview', async (event, templateType, formData) => {
  try {
    return await documentGenerator.getPreview(templateType, formData);
  } catch (error) {
    console.error('Preview error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('generate-document', async (event, templateType, formData) => {
  try {
    return await documentGenerator.generateDocument(templateType, formData);
  } catch (error) {
    console.error('Generation error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-file', async (event, filePath) => {
  try {
    await shell.openPath(filePath);
    return { success: true };
  } catch (error) {
    console.error('Open file error:', error);
    return { success: false, error: error.message };
  }
});