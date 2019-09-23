const electron = require('electron');
const url = require('url');
const path = require = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';


let mainWindow;
let addWindow;


// listen for app to be ready
app.on('ready', function(){
    //create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            // add to integrate require function in window from node
            nodeIntegration: true
        }
    });

    // load html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app when closed
    mainWindow.on('close', function(){
        app.quit();
    })

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    // insert menu
    Menu.setApplicationMenu(mainMenu);
});


// handle create add window
function createAddWindow(){
    //create new window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }
    });

    // load html file into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on('close', function(){
       addWindow = null; 
    });
}

// catch item:add
ipcMain.on('item:add', function(e, item){
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});


// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform =='win32' ? 'Ctrl+D' : 'Command+D',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                accelerator: process.platform =='win32' ? 'Ctrl+C' : 'Command+C',
                click(){
                    // do not need to send item here
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                // short cut
                accelerator: process.platform == 'win32' ? 'Ctrl+Q' : 'Command+Q', 
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// if mac, add empty object to menu
if (process.platform == "darwin"){
    mainMenuTemplate.unshift({});
}

// add developer tools item if not in production
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'win32' ? 'Ctrl+I' : 'Command+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}