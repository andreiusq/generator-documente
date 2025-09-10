const { autoUpdater } = require('electron-updater');
const { dialog, BrowserWindow } = require('electron');
const log = require('electron-log');

class AutoUpdater {
    constructor() {
        // Configure electron-log
        log.transports.file.level = 'info';
        autoUpdater.logger = log;

        // Set update configuration
        autoUpdater.checkForUpdatesAndNotify();
        autoUpdater.autoDownload = false; // Don't auto-download, ask user first
        
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
            buttons: ['Download Update', 'Later'],
            title: 'Application Update Available',
            message: `A new version (${updateInfo.version}) is available!`,
            detail: `Current version: ${require('../package.json').version}\nNew version: ${updateInfo.version}\n\nWould you like to download the update now?`
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
            buttons: ['Restart Now', 'Restart Later'],
            title: 'Update Downloaded',
            message: `Update version ${updateInfo.version} has been downloaded.`,
            detail: 'The application will restart to apply the update.'
        };

        dialog.showMessageBox(null, dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) {
                // User clicked "Restart Now"
                autoUpdater.quitAndInstall();
            }
        });
    }

    showUpdateErrorDialog(error) {
        const dialogOpts = {
            type: 'error',
            buttons: ['OK'],
            title: 'Update Error',
            message: 'There was an error while checking for updates.',
            detail: error ? error.toString() : 'Unknown error occurred'
        };

        dialog.showMessageBox(null, dialogOpts);
    }

    showDownloadInProgressDialog() {
        const dialogOpts = {
            type: 'info',
            buttons: ['OK'],
            title: 'Downloading Update',
            message: 'Update is being downloaded in the background.',
            detail: 'You will be notified when the download is complete.'
        };

        dialog.showMessageBox(null, dialogOpts);
    }

    // Manual check for updates
    checkForUpdates() {
        autoUpdater.checkForUpdatesAndNotify();
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