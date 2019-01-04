import semver from 'semver'
import fs from 'fs';
import {ipcRenderer} from 'electron'
import axios from 'axios'

const updateSettingFile = function(){
    ipcRenderer.send('updateSettingFile',{setting:state.setting,list:state.addons})
}

const state = {
  addons: [],
  setting: {},
  isLoading:true,
  detailAddon : {},
  filters:{
    installed:true,
    updatable:true,
    notinstalled:true
  },
  searchQuery:''
}
const mutations = {
    initalize(state,{list,setting}){
        state.addons = list.sort((a,b)=>{
            return (a.name.toUpperCase()<b.name.toUpperCase())?-1:(a.name.toUpperCase()>b.name.toUpperCase())?1:0
        })
        state.setting = setting
        updateSettingFile()
    },
    setAddonList(state,addons){
        state.addons = addons.sort((a,b)=>{
            return (a.name.toUpperCase()<b.name.toUpperCase())?-1:(a.name.toUpperCase()>b.name.toUpperCase())?1:0
        })
    },
    setReadme(state,{addon,readme}){
        addon.readme = readme
        state.detailAddon = addon
    },
    updateToSDirectroy(state,treeOfSaviorDirectory){
        state.setting.treeOfSaviorDirectory = treeOfSaviorDirectory
        ipcRenderer.send('updateToSDirectroy',treeOfSaviorDirectory)
        updateSettingFile()
    },
    updateSelectLanguage(state,{selectLanguage}){
        state.setting.selectLanguage = selectLanguage
        updateSettingFile()
    },
    updateAddonStatus(state,{addon,newAddon}){
        if (!newAddon)
            addon.isDownloading = false
        else
            addon = newAddon
        updateSettingFile()
    },
    updateSearchQuery(state,word){
        state.searchQuery = word.toUpperCase()
    },
    updateFilters(state,{installed,updatable,notinstalled}){
        state.filters = {
            installed:installed,
            updatable:updatable,
            notinstalled:notinstalled
        }
    },
    updateOrder(state,order){
        let isAsc = order.includes('-')
        let key = order.replace('-','')
        state.addons.sort((a,b)=>{
            let obj_A = a[key].toUpperCase()
            let obj_B = b[key].toUpperCase()
            return (isAsc?-1:1)*((obj_A<obj_B)?-1:(obj_A>obj_B)?1:0)
       })
    }
}

const actions = {
    async installer({dispatch,state,commit},{type,addon}){
        console.log(type)
        console.log(addon)
        ipcRenderer.send('installer', {type:type,addon:addon})
        ipcRenderer.on('installer', (event, {toasts,newAddon}) => {
            toasts.forEach(toast=>{
                dispatch('@@toast/ADD_TOAST_MESSAGE', toast)
            })
            commit('updatAddonStatus',{addon:addon,newAddon:newAddon})
        })
    },
    async getReadme({commit},{addon}){
        let urls = [`https://raw.githubusercontent.com/${addon.author}/${addon.repo}/master/${addon.file}/README.md`,
                    `https://raw.githubusercontent.com/${addon.author}/${addon.repo}/master/${addon.name.replace(' ','')}/README.md`,
                    `https://raw.githubusercontent.com/${addon.author}/${addon.repo}/master/README.md`]
        for(let url of urls){
            try{ 
                let res = await axios.get(url)
                commit('setReadme',{addon:addon,readme:res.data})
                return 
            }catch(e){
                continue
            }
        }
        commit('setReadme',{addon:addon,readme:"# Readme Not Found"})
        return         
    },
}

const getters = {
    getTreeOfSaviorDirectory : state=>state.setting.treeOfSaviorDirectory,
    getUpdatableAddonList : (state)=>{
        return state.addons.filter(addon=>addon.isUpdateAvailable)
    },    
    getUpdatableAddonListLength:(state,getters)=>{
        return getters.getUpdatableAddonList.length
    },
    getFilterdAddonList:state=>{
        let filters = state.filters,
            isInstalled = filters.installed,
            isUpdatable = filters.updatable,
            isNotInstalled = filters.notinstalled,
            searchQuery = state.searchQuery
            console.log(isInstalled,isUpdatable,isNotInstalled)
            return state.addons.filter(addon=>{
                console.log(addon.name,addon.isInstalled,addon.isUpdateAvailable,isInstalled)
            if(addon.isInstalled === isInstalled || addon.isUpdateAvailable === isUpdatable || !addon.isInstalled === isNotInstalled){
                return searchQuery === '' || addon.name.toUpperCase().includes(searchQuery) || addon.author.toUpperCase().includes(searchQuery) || addon.tags.find(tag=>{tag.toUpperCase().includes(searchQuery)})
            }else{
                return false
            }
        })
    }
}

export default {
  state,
  mutations,
  actions,
  getters
 }
 