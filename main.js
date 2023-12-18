const {app, globalShortcut, BrowserWindow, ipcMain, screen} = require('electron');
const HID = require('node-hid');
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let gamingWindow; // Store the topmost frameless window

let inGamingMode = false;

let azeronDevice;
//
// let cyborgButtonConfig = {
//     buttonCodes: [
//         1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
//         20, 22, 23, 24, 28, 29, 30, 31, 36, 37, 38,
//     ],
//     unbindCodes: [
//         1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
//         20, 22, 23, 28, 29, 30, 31, 36, 37, 38,
//     ],
//     allButtonCodes: [
//         1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
//         20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37,
//         38,
//     ],
//     profileSwitchCode: 21,
//     isAnalogInput: (e) => 24 === e,
//     isMouseWheel: (e) => !1,
//     analogConfig: {
//         [fn.LEFT]: {
//             [gn.UP]: 24,
//             [gn.RIGHT]: 25,
//             [gn.DOWN]: 26,
//             [gn.LEFT]: 27,
//         },
//         [fn.RIGHT]: {
//             [gn.UP]: 32,
//             [gn.RIGHT]: 33,
//             [gn.DOWN]: 34,
//             [gn.LEFT]: 35,
//         },
//     },
//     directionTypeInputType: {
//         [gn.UP]: Do.AnalogJoystickWithKeys,
//         [gn.RIGHT]: Do.AnalogJoystickWithKeys,
//         [gn.DOWN]: Do.AnalogJoystickWithKeys,
//         [gn.LEFT]: Do.AnalogJoystickWithKeys,
//     },
// };

async function createWindow() {

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hiddenInset',
        autoHideMenuBar: true,
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

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (!azeronDevice) {
        await ConnectToAzeronCyborg();
    }

}

async function createTopmostFramelessWindow() {
    gamingWindow = new BrowserWindow({
        width: 1200,
        height: 800, // Set your desired height
        frame: false, // Set frame to false to make it frameless
        alwaysOnTop: true, // Ensure it's the topmost window
        opacity: 0.5, // Set opacity as needed
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });


    gamingWindow.loadURL(
        gamingWindow
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, 'react-app/build/index.html')}`
    );

    if (!azeronDevice) {
        await ConnectToAzeronCyborg();
    }

    // Handle window closed
    gamingWindow.on('closed', () => {
        gamingWindow = null;
    });
}


ipcMain.on('exit-app', () => {

    if (azeronDevice) {
        azeronDevice.close();
    }
    // Exit the app
    app.quit();
});
ipcMain.on('toggle-app', async () => {

    if (!inGamingMode) {
        if (!gamingWindow) {
            mainWindow.hide();
            await createTopmostFramelessWindow();
        } else {
            mainWindow.hide();
            gamingWindow.show();
        }

        const {screen} = require('electron');
        const mainScreen = screen.getPrimaryDisplay();
        const {width} = mainScreen.workAreaSize;
        gamingWindow.setPosition(width - mainWindow.getSize()[0], 0);
        inGamingMode = true;
    } else {
        if (!mainWindow) {
            gamingWindow.hide();
            await createWindow();
        } else {
            gamingWindow.hide();
            mainWindow.show();
        }
        inGamingMode = false;

    }
});


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
                    if (mainWindow)
                        mainWindow.webContents.send('azeron-data', eventData);
                    if (gamingWindow)
                        gamingWindow.webContents.send('azeron-data', eventData);
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

        // BP: buttonjs press
        // BR: buttonjs release
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


app.whenReady().then(() =>
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
