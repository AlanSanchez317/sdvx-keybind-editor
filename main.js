const { app, BrowserWindow, ipcMain } = require('electron');
const usbDetect = require('usb-detection');

usbDetect.startMonitoring();

let mainWindow;
let controller; // Assume this is the gamepad controller object from a suitable library

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on('closed', () => mainWindow = null);

    usbDetect.on('add', (device) => {
        if (device.vendorId === 0x0E8F && device.productId === 0x1118 && device.serialNumber === '854303438373519121A0') {
            console.log('Gamepad connected:', device);
            // Initialize your gamepad library here
            setupGamepadListeners(); // This function needs to be defined to listen to gamepad events
        }
    });

    usbDetect.on('remove', (device) => {
        if (device.vendorId === 0x0E8F && device.productId === 0x1118 && device.serialNumber === '854303438373519121A0') {
            console.log('Gamepad disconnected:', device);
            if (controller) {
                controller.disconnect();
                controller = null;
            }
        }
    });

    ipcMain.on('close-app', () => app.quit());
}

function setupGamepadListeners() {
    // Example setup, replace with actual gamepad library usage
    controller = {
        on: (event, callback) => {
            console.log(`Listening for ${event}`);
            setInterval(() => {
                callback(Math.floor(Math.random() * 10), Math.random()); // Simulating button press
            }, 1000);
        },
        disconnect: () => {
            console.log('Controller disconnected');
        }
    };

    controller.on('button-press', (button, value) => {
        console.log(`Button ${button} pressed with value ${value}`);
    });
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    usbDetect.stopMonitoring();
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (!mainWindow) createWindow();
});
