const {app, BrowserWindow} = require('electron');
const HID = require('node-hid');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let azeronDevice;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Required for IPC
        },
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, 'react-app/build/index.html')}`
    );

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    async function ConnectToAzeronCyborg() {
        // Initialize Azeron device
        try {
            const vendorID = 0x16d0; // Replace with the actual vendor ID
            const productID = 0x113c; // Replace with the actual product ID
            azeronDevice = await HID.HIDAsync.open(vendorID, productID);

            if (azeronDevice) {
                console.log('Azeron Connected!');
                console.log(azeronDevice.getDeviceInfo());

                azeronDevice.on('data', (data) => {
                    console.log('Data from Azeron:', data);
                    // Send data to React app (renderer process)
                    mainWindow.webContents.send('azeron-data', data);
                });

                azeronDevice.on('error', (error) => {
                    console.error('Azeron Error:', error);
                });

                console.log(JSON.stringify(azeronDevice));
                console.log(JSON.stringify(azeronDevice.eventNames()));
            } else {

                await ConnectToAzeronCyborg();
            }

        } catch (error) {
            console.error('Failed to connect to Azeron device:', error);
            await ConnectToAzeronCyborg();
        }
    }

    await ConnectToAzeronCyborg();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
