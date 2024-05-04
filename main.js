const { app, BrowserWindow, ipcMain } = require('electron');
const usbDetect = require('usb-detection');
const HID = require('node-hid');

usbDetect.startMonitoring();

let mainWindow;
const connectedControllers = {};

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

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    usbDetect.on('add', (device) => {
        if (device.vendorId === 0x0E8F && device.productId === 0x1118) {
            console.log('Device added', device);
            const controllerId = `vendor-${device.vendorId}_product-${device.productId}`;
            const controllerName = 'F2 eAcloud';
            connectedControllers[controllerId] = controllerName;
            mainWindow.webContents.send('controller-status', { status: 'connected', name: controllerName });
        }
    });

    usbDetect.on('remove', (device) => {
        if (device.vendorId === 0x0E8F && device.productId === 0x1118) {
            console.log('Device removed', device);
            const controllerId = `vendor-${device.vendorId}_product-${device.productId}`;
            const name = connectedControllers[controllerId];
            if (name) {
                mainWindow.webContents.send('controller-status', { status: 'disconnected', name: name });
                delete connectedControllers[controllerId];
            }
        }
    });

    ipcMain.on('close-app', () => {
        app.quit();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    usbDetect.stopMonitoring(); // Stop monitoring when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('update-device-config', (event, { config }) => {
    console.log('Received config update:', config);
    const data = convertConfigToHIDData(config);
    console.log('Converted HID data:', data);
    sendDataToDevice(data);
});

function convertConfigToHIDData(config) {
    const keyMap = {
        'A': 0x04, 'B': 0x05, 'C': 0x06, 'D': 0x07, 'E': 0x08, 'F': 0x09, 'G': 0x0A, 'H': 0x0B, 'I': 0x0C, 'J': 0x0D, 'K': 0x0E, 'L': 0x0F,
        'M': 0x10, 'N': 0x11, 'O': 0x12, 'P': 0x13, 'Q': 0x14, 'R': 0x15, 'S': 0x16, 'T': 0x17, 'U': 0x18, 'V': 0x19, 'W': 0x1A, 'X': 0x1B,
        'Y': 0x1C, 'Z': 0x1D, 'ENTER': 0x28, 'SPACE': 0x2C
    };
    let data = [0x01]; // Start of Packet indicator
    Object.keys(config).forEach(key => {
        let keyCode = keyMap[config[key].toUpperCase()] || 0x00; // Use 0x00 as a fallback for unknown keys
        data.push(keyCode);
    });
    data.push(0xFF); // End of Packet indicator
    return data;
}

function sendDataToDevice(data) {
    const devices = HID.devices();
    console.log("Available HID devices:", devices);

    // Adjusting the search criteria based on the provided information
    const deviceInfo = devices.find(d => d.vendorId === 0x0E8F && d.productId === 0x1118 && d.serialNumber === '854303438373519121A0' && d.usagePage === 1 && d.usage === 6);
    if (deviceInfo) {
        console.log(`Attempting to open device at path: ${deviceInfo.path}`);
        try {
            const device = new HID.HID(deviceInfo.path);
            device.write(data);
            console.log('Data successfully sent to device:', data);
            device.close();
        } catch (error) {
            console.error(`Failed to send data to device at path: ${deviceInfo.path}`, error);
        }
    } else {
        console.error('No matching HID device found.');
    }
}



