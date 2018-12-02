const fs = require('fs')
const mkdir = require('mkdirp')
const request = require('request')

export async function install(addon,treeOfSaviorDirectory,toast){
    if( addon.isInstalled === true){
        if(addon.isUpdateAvailable){
            return await update(addon,treeOfSaviorDirectory,toast)
        }else{
            toast({
                type:"warning",
                text:`${addon.Name} is already installed `
            })
            return false
       }
    }
    let settingDir = `${treeOfSaviorDirectory}\\addons\\${addon.file}`

    if(!isExistDirectory(settingDir)){
        let text = createSettingsDirectory(settingDir)
        toast({
            type:text?"success":"danger",
            text:text?`Create ${addon.file} setting directory`:"Creating  ${addon.file} setting directory Faild!!",
        })
    }
    return await downlaodAddon(addon,treeOfSaviorDirectory,toast)
}

export async function update(addon,treeOfSaviorDirectory,toast){
    let isSuccess = deleteAddon(addon,treeOfSaviorDirectory,toast)
    if(isSuccess === false) return false
    return await downlaodAddon(addon,treeOfSaviorDirectory,toast)
}

export async function uninstall(addon,treeOfSaviorDirectory,toast){
    return await deleteAddon(addon,treeOfSaviorDirectory,toast)
}

function deleteAddon(addon,treeOfSaviorDirectory,toast){
    return new Promise(resolve=>{
        let fileName = `${treeOfSaviorDirectory}\\data\\_${addon.file}-${addon.unicode}-${addon.installedFileVersion}.${addon.extension}`    
        fs.unlink(fileName,error=>{
            if(error){
                if(error.message.includes('locked')){
                    toast({
                        type:'danger',
                        text:`The specified file is currently open.\nClose the file and try again.`,
                    })
                    resolve(false)
                }else{
                    addon.isDownloading = false
                    addon.isInstalled = false
                    toast({
                        type:'warning',
                        text:`Older version of ${addon.file} not found`,
                    })
                    resolve(addon)
                }
            }else{
                addon.isDownloading = false
                addon.isInstalled = false
                toast({
                    type:'success',
                    text:`Uninstalled  ${addon.file}-${addon.fileVersion}`,
                })
                resolve(addon)
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
                toast({
                    type:'danger',
                    text:` Download failed.status code: ${response.statusCode}`,
                })
                resolve(addon)
            } else {
                var file = fs.createWriteStream(fileName)

                fileRequest.on('error', function(error) {
                    addon.isDownloading = false
                    addon.isInstalled = false
                    addon.failedInstall = true
                    toast({
                        type:'danger',
                        text:`Writing file error.${error}`,
                    })
                    fs.unlink(fileName)
                    resolve(addon)
                })

                fileRequest.pipe(file)

                file.on('finish', function() {
                    addon.isDownloading = false
                    addon.isInstalled = true
                    addon.failedInstall = false
                    addon.isUpdateAvailable = false
                    addon.installedFileVersion = addon.fileVersion
                     toast({
                        type:'info',
                        text:`Installed ${addon.file}-${addon.fileVersion}`,
                    })
                    file.close()
                    resolve(addon)
                })

                file.on('error', function(error) {
                    addon.isDownloading = false
                    addon.isInstalled = false
                    addon.failedInstall = true
                     toast({
                        type:'danger',
                        text:`Writing file error.${error}`,
                    })
                    fs.unlink(fileName)
                    resolve(addon)
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

