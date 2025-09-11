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
            this.showUpdateDownloadedDialog(updateInfo);
        });

        // When there's an error
        autoUpdater.on('error', (error) => {
            log.error('Update error:', error);
            this.showUpdateErrorDialog(error);
        });

        // Download progress
        autoUpdater.on('download-progress', (progressObj) => {
            let message = `Download speed: ${progressObj.bytesPerSecond}`;
            message = `${message} - Downloaded ${progressObj.percent}%`;
            message = `${message} (${progressObj.transferred}/${progressObj.total})`;
            log.info(message);
        });
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
                autoUpdater.downloadUpdate();
                this.showDownloadInProgressDialog();
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

    showDownloadInProgressDialog() {
        const dialogOpts = {
            type: 'info',
            buttons: ['OK'],
            title: 'Descărcare actualizare',
            message: 'Actualizarea se descarcă.',
            detail: 'Vei fi notificat când descărcarea s-a finalizat.'
        };

        dialog.showMessageBox(null, dialogOpts);
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