const { app, BrowserWindow, ipcMain } = require('electron');
const usbDetect = require('usb-detection');

usbDetect.startMonitoring();

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 650,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    const connectedControllers = {};

    usbDetect.on('add', (device) => {
        const controllerName = 'FaCloud'; // Assuming a method to determine this
        connectedControllers[device.serialNumber] = controllerName;
        mainWindow.webContents.send('controller-status', { status: 'connected', name: controllerName });
    });

    usbDetect.on('remove', (device) => {
        const name = connectedControllers[device.serialNumber];
        if (name) {
            mainWindow.webContents.send('controller-status', { status: 'disconnected', name: name });
            delete connectedControllers[device.serialNumber];
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});
