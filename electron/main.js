const { app, BrowserWindow, dialog, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const DocumentGenerator = require('./document-generator');
const AutoUpdater = require('./auto-updater');

let mainWindow;
let phpServer;
let autoUpdater;
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
    icon: path.join(__dirname, 'assets/icon.png'), // Change this to your logo file
    title: 'Generator Documente Minoritați', // Custom title
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

  // Create application menu
  createApplicationMenu();

  // Initialize auto-updater (only in production)
  if (!process.env.ELECTRON_IS_DEV) {
    autoUpdater = new AutoUpdater();
    autoUpdater.checkForUpdatesOnStartup();
  }

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

// Create application menu
function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Document',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.executeJavaScript('window.location.href = "index.html"');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            if (autoUpdater) {
              autoUpdater.checkForUpdates();
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Updates',
                message: 'Update checking is disabled in development mode.',
                detail: 'Updates are only available in the production version of the application.'
              });
            }
          }
        },
        {
          label: 'About',
          click: () => {
            const version = require('../package.json').version;
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Generator Documente Minoritati',
              message: `Generator Documente Minoritati v${version}`,
              detail: 'Generator documente pentru minoritati - aplicatie desktop\n\nPowered by Starquess România'
            });
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'About ' + app.getName(), role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide ' + app.getName(), accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Alt+H', role: 'hideothers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
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

ipcMain.handle('generate-document', async (event, templateType, formData, customOutputPath) => {
  try {
    return await documentGenerator.generateDocument(templateType, formData, customOutputPath);
  } catch (error) {
    console.error('Generation error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
  } catch (error) {
    console.error('Save dialog error:', error);
    return { canceled: true, error: error.message };
  }
});

ipcMain.handle('show-message-box', async (event, options) => {
  try {
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
  } catch (error) {
    console.error('Message box error:', error);
    return { response: 1, error: error.message };
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

// Custom template management IPC handlers
ipcMain.handle('detect-placeholders', async (event, fileBuffer) => {
  try {
    return await documentGenerator.detectPlaceholders(fileBuffer);
  } catch (error) {
    console.error('Detect placeholders error:', error);
    throw error;
  }
});

ipcMain.handle('save-custom-template', async (event, templateData) => {
  try {
    return documentGenerator.saveCustomTemplate(templateData);
  } catch (error) {
    console.error('Save custom template error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-custom-templates', async (event) => {
  try {
    return documentGenerator.getCustomTemplates();
  } catch (error) {
    console.error('Get custom templates error:', error);
    return [];
  }
});

ipcMain.handle('delete-custom-template', async (event, templateId) => {
  try {
    return documentGenerator.deleteCustomTemplate(templateId);
  } catch (error) {
    console.error('Delete custom template error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('generate-custom-document', async (event, templateId, formData) => {
  try {
    return await documentGenerator.generateCustomDocument(templateId, formData);
  } catch (error) {
    console.error('Generate custom document error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-custom-template', async (event, templateId) => {
  try {
    const templates = documentGenerator.getCustomTemplates();
    const template = templates.find(t => t.id === templateId);
    return template || null;
  } catch (error) {
    console.error('Get custom template error:', error);
    return null;
  }
});

ipcMain.handle('generate-custom-preview', async (event, templateId, formData) => {
  try {
    return await documentGenerator.getCustomPreview(templateId, formData);
  } catch (error) {
    console.error('Generate custom preview error:', error);
    return { success: false, error: error.message };
  }
});