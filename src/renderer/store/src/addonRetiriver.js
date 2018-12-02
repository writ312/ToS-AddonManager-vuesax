import axios from 'axios'
import semver from 'semver'
const storage = require('electron-json-storage');
const path = require('path')
storage.setDataPath(path.join(process.env.APPDATA ,'/tree-of-savior-addon-manager'))

let urls ={
    // 'itos':"https://raw.githubusercontent.com/JTosAddon/Addons/master/managers.json",
    // 'jtos': "https://raw.githubusercontent.com/JTosAddon/Addons/itos/managers.json",
    'test':'https://raw.githubusercontent.com/writ312/Addons/master/addons.json'

}
export var setting
export async function getAddonList(installedAddons){
    let addons = []
    let repoList = []
    let addonList = []
    for(let type in urls){
        let response = await axios.get(urls[type])
        let data = response.data,
        sources = data.sources
        for(let source of sources){
            console.log(source)
            if(repoList.indexOf(source.repo) +1)
                break;
            repoList.push(source.repo)
            let res = await axios.get(`https://raw.githubusercontent.com/${source.repo}/master/addons.json`)
            console.log(res)
            // addMaxCount(res.data.length)
            for(let addon of res.data){
                // console.log(addon)
                if(addonList.indexOf(source.repo+addon.file)+1)
                    break                        
                addons.push(parseAddonData(source,addon,installedAddons))
                addonList.push(source.repo+addon.file)
            }
        }
    }
    // console.log(addons)
    console.log('load addon list')
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
    // console.log(source.twitter);

    // if (addon.twitterAccount) 
        addon.existTwitterAccount = addon.twitterAccount?true:false

    addon.downloadUrl = `https://github.com/${source.repo}/releases/download/${addon.releaseTag}/${addon.file}-${addon.fileVersion}.${addon.extension}`
    addon.isDownloading = false;

    addon.updateInfo = addon.updateInfo || ''
    let installedAddon = installedAddons[addon.file];
    if(installedAddon &&  installedAddon.isInstalled) {
        // addon.installedAddon = installedAddon;
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
    return addon
 }

export async function getReadme(addon){
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

export function getInstalledAddons() {
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

export function setInstalledAddons(state) {
    state.setting.saveDataType = 'vue'
    state.installedAddons = state.addons.filter(addon=>{return addon.isInstalled}).reduce(
        (o, c) => Object.assign(o, {[c.file]: c}),
        {}
      )
    storage.set('addons',state,function(error){
        if(error) throw error
    })
}

// For First load of Vue verson 
export function getSettingFile() {
    return new Promise(resolve=>{
        storage.get('settings', (error, data)=>{
            if(error) resolve(error)
            resolve(data)
        })    
    })
}

export async function installDependencies(treeOfSaviorDirectory) {
    // console.log(urls['jtos'])
    let res = await axios.get(urls['jtos'] || urls['test'])
    let data = res.data
    // console.log(res)
    data.dependencies.forEach(dependency=>{
        console.log(`Downloading dependency at ${dependency.url}.`);
        var request = require('request');
        var fileRequest = request.get(dependency.url);
        var filename = dependency.url.match(/.*\/(.*)$/)[1];
        var destinationFile = `${treeOfSaviorDirectory}/release/lua/${filename}`;

        fileRequest.on('response', function(response) {
            if(response.statusCode !== 200) {
                return;
            } else {
                var fs = require('fs');
                var file = fs.createWriteStream(destinationFile);

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