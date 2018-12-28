const fs = require('fs')
const mkdir = require('mkdirp')
const request = require('request')

async function install(addon,treeOfSaviorDirectory){
    let toast = []
    let settingDir = `${treeOfSaviorDirectory}\\addons\\${addon.file}`
    if(!isExistDirectory(settingDir)){
        let isSuccess = createSettingsDirectory(settingDir)
        toast.insert({
            type:isSuccess?"success":"danger",
            text:isSuccess?`Create ${addon.file} setting directory`:"Creating  ${addon.file} setting directory Faild!!",
        })
    }
    if( addon.isInstalled === true){
        if(addon.isUpdateAvailable){
            return await update(addon,treeOfSaviorDirectory,toast)
        }else{
            toast.insert({
                type:"warning",
                text:`${addon.Name} is already installed `
            })
            return {toast:toast}
       }
    }
    return await downlaodAddon(addon,treeOfSaviorDirectory,toast)
}

async function uninstall(addon,treeOfSaviorDirectory){
    let toast = []
    return await deleteAddon(addon,treeOfSaviorDirectory,toast)
}

async function update(addon,treeOfSaviorDirectory,toast){
    let isSuccess = deleteAddon(addon,treeOfSaviorDirectory,toast)
    if(isSuccess === false) return {toast:toast}
    return await downlaodAddon(addon,treeOfSaviorDirectory,toast)
}

function deleteAddon(addon,treeOfSaviorDirectory,toast){
    return new Promise(resolve=>{
        let fileName = `${treeOfSaviorDirectory}\\data\\_${addon.file}-${addon.unicode}-${addon.installedFileVersion}.${addon.extension}`    
        fs.unlink(fileName,error=>{
            if(error){
                if(error.message.includes('locked')){
                    toast.insert({
                        type:'danger',
                        text:`The specified file is currently open.\nClose the file and try again.`,
                    })
                    resolve({toast:toast})
                }else{
                    addon.isDownloading = false
                    addon.isInstalled = false
                    toast.insert({
                        type:'warning',
                        text:`Older version of ${addon.file} not found`,
                    })
                    resolve({toast:toast,addon:addon})
                }
            }else{
                addon.isDownloading = false
                addon.isInstalled = false
                toast.insert({
                    type:'success',
                    text:`Uninstalled  ${addon.file}-${addon.fileVersion}`,
                })
                resolve({toast:toast,addon:addon})
            }
        })
    })
}

function downlaodAddon(addon,treeOfSaviorDirectory,toast){
    return new Promise(resolve=>{
        let fileName = `${treeOfSaviorDirectory}\\data\\_${addon.file}-${addon.unicode}-${addon.fileVersion}.${addon.extension}`
        let fileRequest = request.get(addon.downloadUrl)
        fileRequest.on('response', function(response) {
            console.log(`status code: ${response.statusCode}`)
            if(response.statusCode !== 200) {
                addon.isDownloading = false
                addon.isInstalled = false
                addon.failedInstall = true
                toast.insert({
                    type:'danger',
                    text:` Download failed.status code: ${response.statusCode}`,
                })
                resolve({toast:toast,addon:addon})
            } else {
                var file = fs.createWriteStream(fileName)

                fileRequest.on('error', function(error) {
                    addon.isDownloading = false
                    addon.isInstalled = false
                    addon.failedInstall = true
                    toast.insert({
                        type:'danger',
                        text:`Writing file error.${error}`,
                    })
                    fs.unlink(fileName)
                    resolve({toast:toast,addon:addon})
                })

                fileRequest.pipe(file)

                file.on('finish', function() {
                    addon.isDownloading = false
                    addon.isInstalled = true
                    addon.failedInstall = false
                    addon.isUpdateAvailable = false
                    addon.installedFileVersion = addon.fileVersion
                     toast.insert({
                        type:'info',
                        text:`Installed ${addon.file}-${addon.fileVersion}`,
                    })
                    file.close()
                    resolve({toast:toast,addon:addon})
                })

                file.on('error', function(error) {
                    addon.isDownloading = false
                    addon.isInstalled = false
                    addon.failedInstall = true
                     toast.insert({
                        type:'danger',
                        text:`Writing file error.${error}`,
                    })
                    fs.unlink(fileName)
                    resolve({toast:toast,addon:addon})
                })
            }
        })
    })
}



function createSettingsDirectory(path) {
    try {
        mkdir(path)
        return true
    }catch(error){
        return error
    }
}

function isExistDirectory(path) {
  try {
    fs.statSync(path)
    return true
  } catch(err) {
    if(err.code === 'ENOENT') return false
  }
}

export default{
    install,
    uninstall
}