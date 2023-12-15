const {app, BrowserWindow} = require('electron');
const HID = require('node-hid');
const path = require('path');
const isDev = require('electron-is-dev');
const os = require('os');

let mainWindow;
let azeronDevice;
// let azeronDeviceInfo;

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

    //let devices = HID.devices();

    async function ConnectToAzeronCyborg() {
        // Initialize Azeron device
        try {

            // {
            //     hidProductId: 4412,
            //     hidVendorId: 5840,
            //     hidUsage: 257,
            //     hidUsagePage: 65281,
            //     name: "Cyborg",
            //     keypadType: Ut.CyborgTansy
            // }

            //CyborgTansy
            const vendorId = 5840; // Replace with the actual vendor ID
            const productId = 4412; // Replace with the actual product ID

            // let isAzeronDevice = function (d) {
            //     let found = d.vendorId === vendorId && d.productId === productId && d.manufacturer === 'Azeron LTD';
            //     if(found)
            //         console.log('Found Device', JSON.stringify(d));
            //     return found;
            // }

            azeronDevice = await HID.HIDAsync.open(vendorId, productId);

            if (azeronDevice) {
                console.log('Azeron Connected!', JSON.stringify(azeronDevice));

                azeronDevice.on('data', (data) => {
                    interpretKeyboardData(data);
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
        }
    }

    function interpretKeyboardData(data) {
        let hexData = data.toString('hex').trim();
        const expectedHexString = "000000000f20800002080000".toLowerCase();

        if(hexData.toLowerCase() !== expectedHexString) {
            console.log('Data of type from Azeron:', typeof hexData);
        }
    }

    await ConnectToAzeronCyborg();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    azeronDevice.close();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
