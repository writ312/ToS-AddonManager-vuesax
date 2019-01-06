import axios from 'axios'
import semver from 'semver'
import storage from 'electron-json-storage'
import path from 'path'

storage.setDataPath(path.join(process.env.APPDATA ,'/tree-of-savior-addon-manager'))

let urls ={
    'jtos':"https://raw.githubusercontent.com/JTosAddon/Addons/master/managers.json",
    'itos': "https://raw.githubusercontent.com/JTosAddon/Addons/itos/managers.json",
    // 'test':'https://raw.githubusercontent.com/writ312/Addons/master/addons.json'

}

export default class {
    constructor(){
        this.loading = true,
        this.setting = [],
        this.list = []
    }
    async init(){
        this.loading = true
        console.log('initalize')
        let data = await readSettingFile()
        console.log(data)
        this.setting = (data.setting && data.setting.saveDataType === 'vue') ? data.setting : await readOldSettingFile()
        console.log('load setting files')
        this.list = await fetchAddonList(this.setting.installedAddons || this.setting.addons || {})
        this.loading = false
    }
    writeSettingFile(){
        let settingFile = {}
        settingFile.setting = this.setting
        settingFile.setting.saveDataType = 'vue'
        let installedList  = (this.list.filter(addon=>{
            return addon.isInstalled
        }))
        if(installedList.length > 0)
            settingFile.installedAddons = installedList.reduce(
                (o,c) =>{
                    o[c.file] = {isInstalled:c.isInstalled,
                        installedFileVersion:c.installedFileVersion}
                    return o
                    }
                ,[]
           )
        else
            settingFile.installedAddons = []
        storage.set('addons',settingFile,function(error){
            if(error) throw error
        })
    }
    // set isLoading(status){
    //     this.isLoading = status
    // }
    // get isLoading(){
    //     return this.loading
    // }
    set treeOfSaviorDirectory(path){
        this.setting.treeOfSaviorDirectory = path
    }
    get treeOfSaviorDirectory(){
        return this.setting.treeOfSaviorDirectory
    }
    // set list(list){
    //     this.list = list
    // }
    // get list(){
    //     return this.list
    // }
    // set setting(setting){
    //     this.setting = setting
    // }
    // get setting(){
    //     return this.setting
    // }
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
                // Fuckin Bom!!!
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

