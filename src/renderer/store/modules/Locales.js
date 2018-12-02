import axios from 'axios'

async function getLoacleFiles(){
    console.log('get locales files')
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
    async getLocales(state,translater){
        state.locales = await getLoacleFiles()
        translater.setLocales(state.locales)
    }
}

const actions = {
    getLocales({commit},translater){
        console.log('call actions')
        commit('getLocales',translater)
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
