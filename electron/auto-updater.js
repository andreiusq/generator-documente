const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const log = require('electron-log');

class AutoUpdater {
    constructor() {
        // Configure electron-log
        log.transports.file.level = 'info';
        autoUpdater.logger = log;

        // Set update configuration
        autoUpdater.autoDownload = false; // Don't auto-download, ask user first
        
        // electron-updater will use the publish config from package.json automatically
        
        this.progressWindow = null;
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // When update is available
        autoUpdater.on('update-available', (updateInfo) => {
            log.info('Update available:', updateInfo.version);
            this.showUpdateAvailableDialog(updateInfo);
        });

        // When update is not available
        autoUpdater.on('update-not-available', (updateInfo) => {
            log.info('Update not available. Current version:', updateInfo.version);
        });

        // When update is downloaded
        autoUpdater.on('update-downloaded', (updateInfo) => {
            log.info('Update downloaded:', updateInfo.version);
            this.closeProgressWindow();
            this.showUpdateDownloadedDialog(updateInfo);
        });

        // When there's an error
        autoUpdater.on('error', (error) => {
            log.error('Update error:', error);
            this.closeProgressWindow();
            this.showUpdateErrorDialog(error);
        });

        // Download progress
        autoUpdater.on('download-progress', (progressObj) => {
            let message = `Download speed: ${progressObj.bytesPerSecond}`;
            message = `${message} - Downloaded ${progressObj.percent}%`;
            message = `${message} (${progressObj.transferred}/${progressObj.total})`;
            log.info(message);
            
            // Update progress window
            this.updateDownloadProgress(progressObj);
        });
    }

    createProgressWindow(version) {
        // Close any existing progress window
        if (this.progressWindow) {
            this.progressWindow.close();
        }

        this.progressWindow = new BrowserWindow({
            width: 450,
            height: 200,
            resizable: false,
            minimizable: false,
            maximizable: false,
            alwaysOnTop: true,
            center: true,
            frame: true,
            title: 'Descărcare actualizare',
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        // Create HTML content for progress window
        const progressHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Descărcare actualizare</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: #f5f5f5;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 160px;
                }
                .container {
                    text-align: center;
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 10px;
                }
                .version {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 20px;
                }
                .progress-container {
                    width: 100%;
                    height: 8px;
                    background: #e0e0e0;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    overflow: hidden;
                }
                .progress-bar {
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50, #45a049);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                .progress-text {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .speed-text {
                    font-size: 11px;
                    color: #999;
                }
                .spinner {
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #4CAF50;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-right: 8px;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="title">
                    <div class="spinner"></div>
                    Se descarcă actualizarea
                </div>
                <div class="version">Versiunea ${version}</div>
                <div class="progress-text" id="progressText">Pregătire descărcare...</div>
                <div class="progress-container">
                    <div class="progress-bar" id="progressBar"></div>
                </div>
                <div class="speed-text" id="speedText">Conectare la GitHub...</div>
                <button onclick="window.close()" style="
                    margin-top: 15px;
                    padding: 6px 12px;
                    background: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                ">Anulează</button>
            </div>
        </body>
        </html>
        `;

        this.progressWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(progressHTML)}`);
        
        this.progressWindow.on('closed', () => {
            this.progressWindow = null;
        });
    }

    updateDownloadProgress(progressObj) {
        if (!this.progressWindow) return;

        const percent = Math.round(progressObj.percent);
        const transferred = this.formatBytes(progressObj.transferred);
        const total = this.formatBytes(progressObj.total);
        const speed = this.formatBytes(progressObj.bytesPerSecond);

        this.progressWindow.webContents.executeJavaScript(`
            document.getElementById('progressBar').style.width = '${percent}%';
            document.getElementById('progressText').textContent = '${percent}% (${transferred} / ${total})';
            document.getElementById('speedText').textContent = 'Viteză: ${speed}/s';
        `);
    }

    closeProgressWindow() {
        if (this.progressWindow) {
            this.progressWindow.close();
            this.progressWindow = null;
        }
    }

    formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    showUpdateAvailableDialog(updateInfo) {
        const dialogOpts = {
            type: 'info',
            buttons: ['Descarcă actualizare', 'Mai târziu'],
            title: 'Aplicația necesită actualizare',
            message: `Versiunea (${updateInfo.version}) este disponibilă!`,
            detail: `Versiunea curentă: ${require('../package.json').version}\nVersiune nouă: ${updateInfo.version}\n\nDorești să descarci versiunea nouă acum?`
        };

        dialog.showMessageBox(null, dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                // User clicked "Download Update"
                this.createProgressWindow(updateInfo.version);
                autoUpdater.downloadUpdate();
            }
        });
    }

    showUpdateDownloadedDialog(updateInfo) {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart acum', 'Restart mai târziu'],
            title: 'Actualizare descărcată',
            message: `Actualizarea ${updateInfo.version} a fost descărcată.`,
            detail: 'Aplicația are nevoie de un restart.'
        };

        dialog.showMessageBox(null, dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                // User clicked "Restart Now"
                autoUpdater.quitAndInstall();
            }
        });
    }

    showUpdateErrorDialog(error) {
        const isNetworkError = error && (
            error.toString().includes('404') || 
            error.toString().includes('ENOTFOUND') ||
            error.toString().includes('net::ERR')
        );
        
        let dialogOpts;
        
        if (isNetworkError) {
            dialogOpts = {
                type: 'warning',
                buttons: ['Deschide GitHub Releases', 'OK'],
                title: 'Actualizare disponibilă',
                message: 'Nu s-a putut descărca actualizarea automat.',
                detail: `Poți descărca manual ultima versiune de pe GitHub.\n\nEroare: ${error ? error.toString() : 'Eroare de rețea'}`
            };
            
            dialog.showMessageBox(null, dialogOpts).then((returnValue) => {
                if (returnValue.response === 0) {
                    // Open GitHub releases page
                    require('electron').shell.openExternal('https://github.com/andreiusq/generator-documente/releases/latest');
                }
            });
        } else {
            dialogOpts = {
                type: 'error',
                buttons: ['OK'],
                title: 'Eroare actualizare',
                message: 'S-a întâmplat o eroare la verificarea actualizărilor.',
                detail: error ? error.toString() : 'Eroare necunoscută'
            };
            
            dialog.showMessageBox(null, dialogOpts);
        }
    }


    // Manual check for updates
    async checkForUpdates() {
        try {
            log.info('Checking for updates manually...');
            log.info('Current version:', this.getCurrentVersion());
            log.info('Update feed URL:', 'https://github.com/andreiusq/generator-documente');
            
            await autoUpdater.checkForUpdatesAndNotify();
        } catch (error) {
            log.error('Manual update check failed:', error);
            this.showUpdateErrorDialog(error);
        }
    }

    // Check for updates when app starts (with delay)
    checkForUpdatesOnStartup() {
        // Wait 3 seconds after app start to check for updates
        setTimeout(() => {
            this.checkForUpdates();
        }, 3000);
    }

    // Get current version
    getCurrentVersion() {
        return require('../package.json').version;
    }

    // Check if running in development
    isDevelopment() {
        return process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV;
    }
}

module.exports = AutoUpdater;