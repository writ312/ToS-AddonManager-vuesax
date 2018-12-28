import { app, BrowserWindow, ipcMain } from 'electron'
import ADDON from './modules/addon'
// import store from '../renderer/store'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
const addon = new ADDON()
addon.init()

ipcMain.on('initalize', (event,arg) => {
  const loop = function(){
    if(addon.isloading?true:false){
      return
    }
    event.sender.send('initalize', {
      list : addon.list,
      setting : addon.setting
    });
    clearInterval(timer)
  }
  let timer = setInterval(loop,500)
})

ipcMain.on('reinitalize', (event) => {
  addon.init()
  const loop = function(){
    if(addon.isloading?true:false){
      return
    }
    event.sender.send('reinitalize', {
      list : addon.list,
      setting : addon.setting
    });
    clearInterval(timer)
  }
  let timer = setInterval(loop,500)
})
ipcMain.on('installer', (event, {type,addon}) => {
  event.returnValue = addon.reqInstaller(type,addon)
})

ipcMain.on('updateSettingFile',(event,{setting,list})=>{
  addon.writeSettingFile(setting,list)
})
