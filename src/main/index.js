import { app, BrowserWindow, ipcMain } from 'electron'
import ADDON from './modules/addon'
import installer from './modules/installer'
// import store from '../renderer/store'
const addonManager = new ADDON()
addonManager.init()

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

  let splashWindow
  const splashWindowURL =  process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/static/splashWindow.html`
  : `file://${global.__static}/splashWindow.html`

  function createWindow () {
  /**
   * Initial window options
   */
  splashWindow = new BrowserWindow({
    show : false,
    frame : false,
    height : 240,
    width : 240,
    resizable : false,
  })
  splashWindow.once('ready-to-show', () => { splashWindow.show();})
  splashWindow.loadURL(splashWindowURL)
  splashWindow.on('closed', () => {
    splashWindow = null
  })
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    show:false
  })
  mainWindow.once('ready-to-show', () => {
      const loop = function(){
        if(addonManager.isLoading?true:false || addonManager.list.length == 0){
          return
        }
        mainWindow.show()
        splashWindow.close()
        clearInterval(timer)
      }
      let timer = setInterval(loop,500)
  })
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  createWindow()
  // if (process.env.NODE_ENV === 'production') 
    autoUpdater.checkForUpdates()
})

ipcMain.on('initalize', (event,arg) => {
  const loop = function(){
    if(addonManager.isLoading?true:false || addonManager.list.length == 0){
      return
    }
    event.sender.send('initalize', {
      list : addonManager.list,
      setting : addonManager.setting
    });
    clearInterval(timer)
  }
  let timer = setInterval(loop,500)
})

ipcMain.on('reinitalize', (event) => {
  addonManager.init()
  const loop = function(){
    if(addonManager.isLoading?true:false){
      return
    }
    if(addonManager.treeOfSaviorDirectory){
      installer.installDependencies(addonManager.treeOfSaviorDirectory)
    }
    event.sender.send('reinitalize', {
      list : addonManager.list,
      setting : addonManager.setting
    });
    clearInterval(timer)
  }
  let timer = setInterval(loop,500)
})
ipcMain.on('installer', async (event, {type,addon}) =>  {
  let treeOfSaviorDirectory = addonManager.treeOfSaviorDirectory
  switch(type){
    case 'install' :
    case 'update' :
      event.sender.send('installer',await installer.install(addon,treeOfSaviorDirectory)) 
      break;
    
    case 'uninstall' :
      event.sender.send('installer',await installer.uninstall(addon,treeOfSaviorDirectory))
        break    
  } 

})

ipcMain.on('updateSettingFile',(event,{setting,list})=>{
  addonManager.setting = setting
  addonManager.list = list
  addonManager.writeSettingFile()
})
