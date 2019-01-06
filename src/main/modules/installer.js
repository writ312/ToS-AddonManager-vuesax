const fs = require('fs')
const mkdir = require('mkdirp')
const request = require('request')

async function install(addon,treeOfSaviorDirectory){
    var toasts = []
    let settingDir = `${treeOfSaviorDirectory}\\addons\\${addon.file}`
    if(!isExistDirectory(settingDir)){
        let isSuccess = createSettingsDirectory(settingDir)
        toasts.push({
            type:isSuccess?"success":"danger",
            text:isSuccess?`Create ${addon.file} setting directory`:"Creating  ${addon.file} setting directory Faild!!",
        })
    }
    if( addon.isInstalled === true){
        if(addon.isUpdateAvailable){
            return await update(addon,treeOfSaviorDirectory,toasts)
        }else{
            toasts.push({
                type:"warning",
                text:`${addon.Name} is already installed `
            })
            return {toasts:toasts}
       }
    }
    return await downlaodAddon(addon,treeOfSaviorDirectory,toasts)
}

async function uninstall(addon,treeOfSaviorDirectory){
    let toasts = []
    return await deleteAddon(addon,treeOfSaviorDirectory,toasts)
}

async function update(addon,treeOfSaviorDirectory,toasts){
    let isSuccess = deleteAddon(addon,treeOfSaviorDirectory,toasts)
    if(isSuccess === false) return {toasts:toasts}
    return await downlaodAddon(addon,treeOfSaviorDirectory,toasts)
}

function deleteAddon(addon,treeOfSaviorDirectory,toasts){
    return new Promise(resolve=>{
        let fileName = `${treeOfSaviorDirectory}\\data\\_${addon.file}-${addon.unicode}-${addon.installedFileVersion}.${addon.extension}`    
        fs.unlink(fileName,error=>{
            if(error){
                if(error.message.includes('locked')){
                    toasts.push({
                        type:'danger',
                        text:`The specified file is currently open.\nClose the file and try again.`,
                    })
                    resolve({toasts:toasts})
                }else{
                    addon.isDownloading = false
                    addon.isInstalled = false
                    toasts.push({
                        type:'warning',
                        text:`Older version of ${addon.file} not found`,
                    })
                    resolve({toasts:toasts,newAddon:addon})
                }
            }else{
                addon.isDownloading = false
                addon.isInstalled = false
                toasts.push({
                    type:'success',
                    text:`Uninstalled  ${addon.file}-${addon.fileVersion}`,
                })
                resolve({toasts:toasts,newAddon:addon})
            }
        })
    })
}

function downlaodAddon(addon,treeOfSaviorDirectory,toasts){
    return new Promise(resolve=>{
        let fileName = `${treeOfSaviorDirectory}\\data\\_${addon.file}-${addon.unicode}-${addon.fileVersion}.${addon.extension}`
        let fileRequest = request.get(addon.downloadUrl)
        fileRequest.on('response', function(response) {
            if(response.statusCode !== 200) {
                addon.isDownloading = false
                addon.isInstalled = false
                toasts.push({
                    type:'danger',
                    text:` Download failed.status code: ${response.statusCode}`,
                })
                resolve({toasts:toasts,newAddon:addon})
            } else {
                var file = fs.createWriteStream(fileName)

                fileRequest.pipe(file)

                file.on('finish', function() {
                    addon.isDownloading = false
                    addon.isInstalled = true
                    addon.failedInstall = false
                    addon.isUpdateAvailable = false
                    addon.installedFileVersion = addon.fileVersion
                     toasts.push({
                        type:'info',
                        text:`Installed ${addon.file}-${addon.fileVersion}`,
                    })
                    file.close()
                    resolve({toasts:toasts,newAddon:addon})
                })

                file.on('error', function(error) {
                    addon.isDownloading = false
                    addon.isInstalled = false
                    addon.failedInstall = true
                    toasts.push({
                        type:'danger',
                        text:`Writing file error.${error}`,
                    })
                    fs.unlink(fileName)
                    resolve({toasts:toasts,newAddon:addon})
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

async function installDependencies(treeOfSaviorDirectory) {
    let res = await axios.get("https://raw.githubusercontent.com/JTosAddon/Addons/master/managers.json")
    let data = res.data
    data.dependencies.forEach(dependency=>{
        console.log(`Downloading dependency at ${dependency.url}.`);
        let fileRequest = request.get(dependency.url);
        let filename = dependency.url.match(/.*\/(.*)$/)[1];
        let destinationFile = `${treeOfSaviorDirectory}/release/lua/${filename}`;

        fileRequest.on('response', function(response) {
            if(response.statusCode !== 200) {
                return;
            } else {
                let file = fs.createWriteStream(destinationFile);

                fileRequest.on('error', function(error) {
                    console.error(`fileRequest: Could not install dependency from ${dependency.url}: ${error}`);
                    return;
                });

                fileRequest.pipe(file);

                file.on('finish', function() {
                    file.close();
                });

                file.on('error', function(error) {
                    console.error(`file: Could not install dependency from ${dependency.url}: ${error}`);
                    fs.unlink(destinationFile);
                    return;
                });
            }
        });
    })
}


export default{
    install,
    uninstall,
    installDependencies
}