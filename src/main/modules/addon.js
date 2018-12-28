import axios from 'axios'
import semver from 'semver'
import storage from 'electron-json-storage'
import path from 'path'
import fs from 'fs'
import request from 'request'
import installer from '../modules/installer'

storage.setDataPath(path.join(process.env.APPDATA ,'/tree-of-savior-addon-manager'))

let urls ={
    'jtos':"https://raw.githubusercontent.com/JTosAddon/Addons/master/managers.json",
    'itos': "https://raw.githubusercontent.com/JTosAddon/Addons/itos/managers.json",
    // 'test':'https://raw.githubusercontent.com/writ312/Addons/master/addons.json'

}

export default class {
    constructor(){
        this.loading = true
    }
    async init(){
        this.loading = false
        console.log('initalize')
        let data = await readSettingFile()
        // console.log(data)
        this.setting = (data.setting && data.setting.saveDataType === 'vue') ? data.setting : await readOldSettingFile()
        console.log('load setting files')
        this.list = await fetchAddonList(this.setting.installedAddons || this.setting.addons || {})
        this.loading = false
    }
    get isloading(){
        return this.loading
    }
    writeSettingFile() {
        let settingFile = {}
        settingFile.setting = this.setting
        settingFile.setting.saveDataType = 'vue'
        settingFile.installedAddons = this.list.filter(addon=>{return addon.isInstalled}).reduce(
            (o,c) =>Object.assign(o,{[c.file]:{isInstalled:c.isInstalled,installedFileVersion:installedFileVersion}},{})
        )
        storage.set('addons',settingFile,function(error){
            if(error) throw error
        })
    }
    
    async  fetchReadme(addon){
        let urls = [`https://raw.githubusercontent.com/${addon.author}/${addon.repo}/master/${addon.file}/README.md`,
                    `https://raw.githubusercontent.com/${addon.author}/${addon.repo}/master/${addon.name.replace(' ','')}/README.md`,
                    `https://raw.githubusercontent.com/${addon.author}/${addon.repo}/master/README.md`
        ]
        for(let url of urls){
            try{ 
                let res = await axios.get(url)
                return res.data
            }catch(e){
                continue
            }
        }
        return '# Readme Not Found'
    }

    async reqInstaller(type,addon){
        let treeOfSaviorDirectory = setting.treeOfSaviorDirectory
        if(!treeOfSaviorDirectory) return {toast:[{type:'error',text:'Not Found TreeOfSavior Directroy'}]}
        if(type === 'install' || type === 'update'){
            return await installer.install(addon,treeOfSaviorDirectory)
        }else if(type === 'uninstall'){
            return await installer.uninstall(addon,treeOfSaviorDirectory)
        }
        installDependencies()
    }
}

async function fetchAddonList(installedAddons){
    console.log('Start Fetching Addons List')
    let addons = []
    let repoList = []
    let addonList = []
    for(let type in urls){
        let response = await axios.get(urls[type])
        // console.log(response.data)
        for(let source of response.data.sources){
            // console.log(source)
            if(!source.repo || repoList.indexOf(source.repo) +1){
                continue
            }
            repoList.push(source.repo)
            let res = await axios.get(`https://raw.githubusercontent.com/${source.repo}/master/addons.json`)
            if(typeof res.data === 'string'){
                // Fuck Bom!!!
                let string = res.data
                if (string.charCodeAt(0) === 0xFEFF) {
                    string = string.slice(1)
                }
                res.data = JSON.parse(string)
            }
            for(let addon of res.data){
                if(addonList.indexOf(source.repo+addon.file)+1){
                    continue                        
                }
                addons.push(parseAddonData(source,addon,installedAddons))
                addonList.push(source.repo+addon.file)
            }
        }
    }
    // console.log(addons)
    console.log('load addon list')
    // isLoading = false
    return addons
}

function parseAddonData(source,addon,installedAddons){

    let repoValues = source.repo.split('/');

    addon.author = repoValues[0];
    addon.repo = repoValues[1];

    // console.log("Loading addon " + addon.name + " by " + addon.author);

    addon.shortname = (addon.name.length > 25)?(addon.name.substring(0,24)+"..."):addon.name;
    // if(addon.shortname.length > 25) {
        // addon.shortname = addon.shortname.substring(0,24)+"...";
    // }

    addon.twitterAccount = source.twitter
    addon.existTwitterAccount = addon.twitterAccount?true:false
    // console.log(source.twitter);

    addon.downloadUrl = `https://github.com/${source.repo}/releases/download/${addon.releaseTag}/${addon.file}-${addon.fileVersion}.${addon.extension}`
    addon.isDownloading = false;

    addon.updateInfo = addon.updateInfo || ''
    let installedAddon = installedAddons[addon.file];
    if(installedAddon &&  installedAddon.isInstalled) {
        addon.isInstalled = true;
        addon.installedFileVersion = installedAddon.installedFileVersion;
        try {

            // console.log("Update available for " + addon.name + "? " + semver.gt(addon.fileVersion, installedAddon.fileVersion));
            if(semver.gt(addon.fileVersion, addon.installedFileVersion)) {
                addon.isUpdateAvailable = true;
            } else {
                addon.isUpdateAvailable = false;
            }
        }catch(err) {
            // console.log("semver version error");
            addon.isUpdateAvailable = false;
        }
    } else {
        addon.isInstalled = false;
        addon.isUpdateAvailable = false;
    }
    // console.log(addon)
    return addon
 }

function readSettingFile() {
    return new Promise((resolve,reject)=>{
        storage.get('addons', (error, data) =>{
            if(error) resolve({})
            //なんかわからんけど文字列で保存されてらぁ
            if((typeof data) === 'string')
                data = JSON.parse(data)
            // console.log(data)
            resolve(data)
        })
    })
}

// For First load of Vue verson 
function readOldSettingFile() {
    return new Promise(resolve=>{
        storage.get('settings', (error, data)=>{
            if(error) resolve({})
            resolve(data)
        })    
    })
}

async function installDependencies() {
    let treeOfSaviorDirectory = setting.treeOfSaviorDirectory
    let res = await axios.get(urls['jtos'] || urls['test'])
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

async function reqInstaller(type,addon){
    let treeOfSaviorDirectory = setting.treeOfSaviorDirectory
    if(!treeOfSaviorDirectory) return {toast:[{type:'error',text:'Not Found TreeOfSavior Directroy'}]}
    if(type === 'install' || type === 'update'){
        return await installer.install(addon,treeOfSaviorDirectory)
    }else if(type === 'uninstall'){
        return await installer.uninstall(addon,treeOfSaviorDirectory)
    }
    installDependencies()
}
