import {ipcRenderer} from 'electron'
import axios from 'axios'
import _ from 'lodash'
const updateSettingFile = function(state){
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
  searchQuery:'',
  installedAddons : [],
  updatableAddons : [],
  notinstalledAddons : []
}
const mutations = {
    initalize(state,{list,setting}){
        state.addons = list.sort((a,b)=>{
            return (a.name.toUpperCase()<b.name.toUpperCase())?-1:(a.name.toUpperCase()>b.name.toUpperCase())?1:0
        })
        state.setting = setting
    },
    setReadme(state,{addon,readme}){
        addon.readme = readme
        state.detailAddon = addon
    },
    updateToSDirectroy(state,treeOfSaviorDirectory){
        state.setting.treeOfSaviorDirectory = treeOfSaviorDirectory
        ipcRenderer.send('updateToSDirectroy',treeOfSaviorDirectory)
        updateSettingFile(state)
    },
    updateSelectLanguage(state,{selectLanguage}){
        state.setting.selectLanguage = selectLanguage
        updateSettingFile(state)
    },
    updateAddonStatus(state,{addon,newAddon,index}){
        let key =   state.addons.findIndex(o=>o.name === addon.name)
        if(key !== -1){
            state.addons[key].isInstalled = newAddon.isInstalled
            state.addons[key].isUpdateAvailable = newAddon.isUpdateAvailable
            state.addons[key].installedFileVersion = newAddon.installedFileVersion
        }
        updateSettingFile(state)
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
    updateSettingFile({state}){
        ipcRenderer.send('updateSettingFile',{setting:state.setting,list:state.addons})
    },

    async installer({dispatch,commit},{type,addon,index}){
        console.log('request installer')
        ipcRenderer.send('installer', {type:type,addon:addon})
        ipcRenderer.once('installer', (event, {toasts,newAddon}) => {
            toasts.forEach(toast=>{
                dispatch('@@toast/ADD_TOAST_MESSAGE', toast)
            })
            commit('updateAddonStatus',{addon:addon,newAddon:newAddon,index:index})
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
    getInstalledAddons : (state)=>{
        return _.filter(state.addons, addon => addon.isInstalled && !addon.isUpdateAvailable  );
    },    
    getUpdatableAddons : (state)=>{
        return _.filter(state.addons, addon => addon.isUpdateAvailable );
    },
    getNotinstalledAddons : (state)=>{
        return _.filter(state.addons, addon => !addon.isInstalled );
    },    
    getUpdatableAddonsLength:(state,getters)=>{
        return getters.getUpdatableAddons.length
    },
    getFilterdAddonList:(state,getters)=>{
        let filters = state.filters
        let searchQuery = state.searchQuery
        let list = _.compact(_.concat(filters.updatable?getters.getUpdatableAddons:[],
            filters.installed?getters.getInstalledAddons:[],
            filters.notinstalled?getters.getNotinstalledAddons:[]
        ))
        return _.filter(list,addon=>{
            return searchQuery === '' || addon.name.toUpperCase().includes(searchQuery) || addon.author.toUpperCase().includes(searchQuery)
        })
        // let filters = state.filters,
        //     isInstalled = filters.installed,
        //     isUpdatable = filters.updatable,
        //     isNotInstalled = filters.notinstalled,
        //     searchQuery = state.searchQuery
        //     return state.addons.filter(addon=>{
        //     if(addon.isInstalled === isInstalled || addon.isUpdateAvailable === isUpdatable || !addon.isInstalled === isNotInstalled){
        //         return searchQuery === '' || addon.name.toUpperCase().includes(searchQuery) || addon.author.toUpperCase().includes(searchQuery)            }else{
        //         return false
        //     }
        // })
    },
}

export default {
  state,
  mutations,
  actions,
  getters
 }
 