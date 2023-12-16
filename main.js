const {app, globalShortcut, BrowserWindow} = require('electron');
const HID = require('node-hid');
const path = require('path');
const isDev = require('electron-is-dev');


let mainWindow;
let azeronDevice;

async function createWindow() {

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, 'react-app/build/index.html')}`
    );

    // if (isDev) {
    //     mainWindow.webContents.openDevTools();
    // }

    // let devices = HID.devices();
    async function ConnectToAzeronCyborg() {
        // Initialize Azeron device
        try {
            //await FindAzeronCyborg();
            azeronDevice = await HID.HIDAsync.open('\\\\?\\HID#VID_16D0&PID_113C&MI_04#7&1ce4584&0&0000#{4d1e55b2-f16f-11cf-88cb-001111000030}');

            if (azeronDevice) {
                console.log('Azeron Connected!', JSON.stringify(azeronDevice));

                azeronDevice.on('data', (data) => {
                    let eventData = processData(data)
                    if (eventData !== null) {
                        mainWindow.webContents.send('azeron-data', eventData);
                    }
                });

                azeronDevice.on('error', (error) => {
                    console.error('Azeron Error:', error);
                });

                azeronDevice.on('end', (error) => {
                    console.error('Azeron Ended:', error);
                    azeronDevice.close();
                });

            } else {

                await ConnectToAzeronCyborg();
            }

        } catch (error) {
            console.error('Failed to connect to Azeron device:', error);
        }
    }

    async function FindAzeronCyborg() {
        // {
        //     hidProductId: 4412,
        //     hidVendorId: 5840,
        //     hidUsage: 257,
        //     hidUsagePage: 65281,
        //     name: "Cyborg",
        //     keypadType: Ut.CyborgTansy
        // }

        //CyborgTansy
        const vendorId = 5840;
        const productId = 4412;
        const hidUsage = 257;
        const hidUsagePage = 65281;

        let isAzeronDevice = function (d) {
            let found = d.vendorId === vendorId && d.productId === productId && d.usage === hidUsage && d.usagePage === hidUsagePage;
            if (found)
                console.log('Found Device', JSON.stringify(d));
            return found;
        }


        let azeronDeviceInfo = devices.find(function (d) {
            return isAzeronDevice(d);
        });

        if (azeronDeviceInfo) {
            console.log('azeronDeviceInfo:', azeronDeviceInfo.path)
            azeronDevice = new HID.HID(azeronDeviceInfo.path);
        }

        azeronDevice = await HID.HIDAsync.open(vendorId, productId);
    }

    function processData(data) {

        let hexData = data.toString('hex').trim();
        const resetSignal = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000".toLowerCase();
        const idleSignal = "01001200010101013f276c0d070b1bf000000000000000000000000000000000000000000000000000000000000000000000000000000000f401c8000000603a";
        if (hexData.toLowerCase() !== resetSignal && hexData.toLowerCase() !== idleSignal) {

            const asciiValue = hexToAscii(hexData)
            const dataParts = asciiValue.split('_');

            // BP: button press
            // BR: button release
            // JOY: thumbstick
            const switchType = dataParts[0];
            const switchId = parseInt(dataParts[1]);

            let joystickX = switchType === "JOY" ? dataParts[2] : 0;
            let joystickY = switchType === "JOY" ? dataParts[3] : 0;

            let eventType = 'unknown';

            switch (switchType) {
                case 'BP':
                    eventType = 'Key Down'
                    break;
                case 'BR':
                    eventType = 'Key Up'
                    break;
                case 'JOY':
                    eventType = 'Thumbstick Movements'
                    break;
            }

            //console.log(`Azeron Key #${switchId} Pressed: ${eventType} ${switchType === "JOY" ? `X:${joystickX} Y:${joystickY}` : ''}` );

         return {
             id: switchId,
             type: eventType,
             controllerType: switchType,
             x: joystickX,
             y: joystickY,
         }
        }
        return null;
    }

    function hexToAscii(hex) {
        let ascii = '';
        for (let i = 0; i < hex.length; i += 2) {
            const hexByte = hex.substring(i, i + 2);
            const decimalValue = parseInt(hexByte, 16);
            ascii += String.fromCharCode(decimalValue);
        }
        return ascii;
    }

    await ConnectToAzeronCyborg();
}

app.whenReady().then(()=>
    globalShortcut.unregisterAll()
).then(createWindow);

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
