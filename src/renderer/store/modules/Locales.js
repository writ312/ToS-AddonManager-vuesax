import axios from 'axios'

async function fetchLoacleFiles(){
    console.log('Fetch locales files')
    let locales = {}
    let localesList = await axios.get('https://raw.githubusercontent.com/JTosAddon/Tree-of-Savior-Addon-Manager/master/locales/locales.json' + "?" + new Date().toString())
    console.log(localesList)
    for (let lang of localesList.data){
        let res = await axios.get(`https://raw.githubusercontent.com/JTosAddon/Tree-of-Savior-Addon-Manager/master/locales/${lang}.json` + "?" + new Date().toString())
        locales[lang] = res.data
    }
    return locales
}

const state = {
  locales: {},
  selectLanguage : 'en'
}

const mutations = {
    async initLocales(state,{translater,locales}){
        state.locales = locales
        translater.setLocales(state.locales)
    }
}

const actions = {
    async initLocales({commit},translater){
        commit('initLocales',{translater:translater,locales:await fetchLoacleFiles()})
    },
}

const getters = {
}
export default {
  state,
  mutations,
  actions,
  getters
}
