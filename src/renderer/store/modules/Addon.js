import semver from 'semver'
import fs from 'fs';
import { cpus } from 'os';
const addonRetiriver = require('../src/addonRetiriver')
const installer = require('../src/Installer')
const state = {
  addons: [],
  setting: {},
  isLoading:true,
  detailAddon : {}
}
const mutations = {
    setAddonList(state,addons){
        state.addons = addons.sort((a,b)=>{
            return (a.name.toUpperCase()<b.name.toUpperCase())?-1:(a.name.toUpperCase()>b.name.toUpperCase())?1:0
        })
    },
    setSettingData(state,settings){
        state.setting = settings
    },
    setInstalledAddonList(state,installedAddons){
        state.installedAddons = installedAddons
    },

    install(state,{addon,newAddon}){
        addon = newAddon
        addonRetiriver.setInstalledAddons(state)
    },
    update(state,{addon,newAddon}){
        if (newAddon === false){
            addon.isDownloading = false
            return
        }
        addon = newAddon
        addonRetiriver.setInstalledAddons(state)
    },
    
    uninstall(state,{addon,newAddon}){
        if (newAddon === false){
            addon.isDownloading = false
            return
        }
        addon = newAddon
        addonRetiriver.setInstalledAddons(state)
    },
    downloading(state,{addon}){
        addon.isDownloading = true;
    },
    setReadme(state,{addon,readme}){
        addon.readme = readme
        state.detailAddon = addon
    },
    changeToSDirectory(state,{treeOfSaviorDirectory}){
        state.setting.treeOfSaviorDirectory = treeOfSaviorDirectory
        addonRetiriver.setInstalledAddons(state)
    },
    saveSelectLanguage(state,{selectLanguage}){
        state.setting.selectLanguage = selectLanguage
        addonRetiriver.setInstalledAddons(state)
    },
    changeAddonVersion(state,{index,version}){
        state.addons[index].installedFileVersion = version
        state.addons[index].isInstalled = true
    }
    
    
}

const actions = {
    async initAddon({dispatch,state,commit}){
        let storageData = await  addonRetiriver.getInstalledAddons()
        let installedAddons = storageData.installedAddons || storageData.addons || {}
        commit('setSettingData',(storageData.setting && storageData.setting.saveDataType === 'vue')?storageData.setting: await addonRetiriver.getSettingFile())
        commit('setInstalledAddonList',installedAddons )
        commit('setAddonList',await addonRetiriver.getAddonList(installedAddons))
        state.isLoading = false
        if(state.setting.treeOfSaviorDirectory){
            addonRetiriver.installDependencies(state.setting.treeOfSaviorDirectory)
        }
    },
    setTranslatePlugin({state}){
        translate.setLang(state.setting.selectLanguage||'en')
    },
    checkRestoreAddonList({dispatch,state,commit}){
        // const fs = require('fs')
        let TosDir = state.setting.treeOfSaviorDirectory+"\\data"
        fs.readdir(TosDir,(error,files)=>{
            if(error) throw error
            let fileList = files.filter(file=>{
                return fs.statSync(TosDir+'\\' +file).isFile && (/^_.*\.ipf/).test(file)
            })
            state.addons.forEach((addon,index)=>{

                let findAddon = fileList.find(fileName=>{
                    return fileName.match('_'+addon.file+'-')
                })
                if(findAddon){
                    commit('changeAddonVersion',{index:index,version:findAddon.match(/-(v.*)\.ipf/)[1]})
                    
                    try {
                        if(semver.gt(addon.fileVersion, addon.installedFileVersion)) {
                            addon.isUpdateAvailable = true;
                        } else {
                            addon.isUpdateAvailable = false;
                        }
                    }catch(err) {
                        addon.isUpdateAvailable = false;
                    }
                    
                }
            })
            addonRetiriver.setInstalledAddons(state)  
        })
    },
    testToast({dispatch}){
        // dispatch('@@toast/ADD_TOAST_MESSAGE', {text:'foo', type: 'success', dismissAfter: 10000})
    },
    async install({dispatch,state,commit},{addon}){
        commit('downloading',{addon:addon})
        commit('install',{addon:addon,newAddon:await installer.install(addon,state.setting.treeOfSaviorDirectory,toast=>{dispatch('@@toast/ADD_TOAST_MESSAGE', toast)})})
    },
    async update({dispatch,state,commit},{addon}){
        commit('downloading',{addon:addon})
        commit('update',{addon:addon,newAddon:await installer.update(addon,state.setting.treeOfSaviorDirectory,toast=>{dispatch('@@toast/ADD_TOAST_MESSAGE', toast)})})
    },
    async uninstall({dispatch,state,commit},{addon}){
        commit('downloading',{addon:addon})
        commit('uninstall',{addon:addon,newAddon:await installer.uninstall(addon,state.setting.treeOfSaviorDirectory,toast=>{dispatch('@@toast/ADD_TOAST_MESSAGE', toast)})})
    },
    async getReadme({commit},{addon}){
        commit('setReadme',{addon:addon,readme:await addonRetiriver.getReadme(addon)})
    },
    async installAddonFromList({state,commit},installAddonList){
      
    },
    changeToSDirectory({stdispatch},{treeOfSaviorDirectory}){
        //tosのインストールフォルダかチェックする
        fs.stat(treeOfSaviorDirectory+"\\release\\Client_tos.exe",(error,stats)=>{
            if(error){
                dispatch('@@toast/ADD_TOAST_MESSAGE', {text:'Could not save Tree of Savior directory: ' + error, type: 'danger', dismissAfter: 3000})
                return 
            }
        })
    },
    saveSelectLanguage({commit},{selectLanguage}){
        commit('saveSelectLanguage',{selectLanguage:selectLanguage})
    }
}

const getters = {
    getTreeOfSaviorDirectory : state=>state.setting.treeOfSaviorDirectory
}

export default {
  state,
  mutations,
  actions,
//   getters
 }
 