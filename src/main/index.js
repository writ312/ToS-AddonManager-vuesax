import { app, BrowserWindow, ipcMain } from 'electron'
import ADDON from './modules/addon'
import installer from '/modules/installer'
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
    const loop = function(){
      if(addonManager.isLoading?true:false){
        return
      }
      createWindow()
      clearInterval(timer)
    }
    let timer = setInterval(loop,500)
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

ipcMain.on('initalize', (event,arg) => {
  const loop = function(){
    if(addonManager.isLoading?true:false){
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

ipcMain.on('updateToSDirectroy',(event,path)=>{
  console.log(path)
  addonManager.treeOfSaviorDirectory = path
  if(path){
    installer.installDependencies(path)
  }
  addonManager.writeSettingFile
})

ipcMain.on('updateSettingFile',(event,{setting,list})=>{
  addonManager.list = list
  addonManager.setting = setting
  addonManager.writeSettingFile()
})
