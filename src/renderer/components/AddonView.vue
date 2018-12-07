<template>
  <div class='addonView'>
    <!-- <div id="container" v-show="getTreeOfSaviorDirectory?true:false"> -->
    
<vs-row>
  <vs-col v-for="(addon,index) in filteredAddons"  :key="addon.author+'-'+addon.file" vs-type="flex" vs-justify="center" vs-align="flex-start" vs-w="4">
        <addon-card :addon="addon" :index="index" @set='openReadme'></addon-card>
  </vs-col>
</vs-row>
<!-- <vs-row vs-justify="center">
      <vs-col type="flex" vs-justify="center" vs-align="center" vs-w="4">    
      </vs-col>
    </vs-row> -->
     <vs-popup class="holamundo"  title="Readme" :active.sync="isReadmeModalActive">
      <p>
        {{$store.state.Addon.readme}}
      </p>
    </vs-popup>
  </div>
</template>

<script>
import AddonCard from '@/components/AddonView/AddonCard'
// import SettingModal from './Addon/Setting'
// import ReadmeModal from './Addon/Readme'
// import { mapGetters, mapActions } from 'vuex'
  export default {
    name: 'addon-view',
    data(){
      return {
          isReadmeModalActive : false
      }
    },
    components: { AddonCard },
    computed:{
      Addons() {
        return this.$store.state.Addon.addons
      },

      filteredAddons(){
        let data = this.$store.state.Addon.addons
        // console.log(data)
        // if(this.isShowOnlyUpdateble)
        //     data = data.filter(addon=>addon.isUpdateAvailable) 
        // if(this.searchQuery){
        //   let searchQuery = this.searchQuery.toUpperCase()
        //   data = data.filter(addon=>{
        //     return addon.name.toUpperCase().includes(searchQuery) || addon.author.toUpperCase().includes(searchQuery) || addon.tags.find(tag=>{tag.toUpperCase().includes(searchQuery)})
        //   })
        // } 
        return data
      },
       getLocaleList(){
        // this.selectLanguage = this.$store.state.Addon.setting.selectLanguage || 'en'
        // return Object.keys(this.$store.state.Locales.locales)
      },
      // getTreeOfSaviorDirectory(){
        // return this.$store.getters('getTreeOfSaviorDirectory')
        
      // }
      // ...mapGetters(['getTreeOfSaviorDirectory'])
    },
    methods: {
      open () {
        // this.$store.commit('getLoacleFiles')
      },
      sortAddons(){
        //   this.$store.state.Addon.addons.sort((a,b)=>{
        //     let isAsc = this.sort.includes('-')
        //     let type = this.sort.replace('-','')
        //     let nameA = a[type].toUpperCase()
        //     let nameB = b[type].toUpperCase()
        //     return (isAsc?-1:1)*((nameA<nameB)?-1:(nameA>nameB)?1:0)
        // })
      },
      reloadAddons(){
        //  this.$store.dispatch('initAddon',this.$translate)
      },
      openReadme(index){
        // this.isReadmeModalActive = true
      },
      changeLanguage(){
        // this.$translate.setLang(this.selectLanguage)
        // this.$store.commit('saveSelectLanguage',{selectLanguage:this.selectLanguage})
      },
      browseForDirectory(){
        // var remote = require('electron').remote;
        // var dialog = remote.dialog;
        // var directories = dialog.showOpenDialog({ properties: ['openDirectory']});
        // if(directories && directories.length > 0) {
        //   let fs = require('fs')
        //   fs.stat(directories[0]+"\\release\\Client_tos.exe",(error,stats)=>{
        //     if(error){
        //       this.$store.dispatch('@@toast/ADD_TOAST_MESSAGE', {text:'Could not save Tree of Savior directory: ' + error, type: 'danger', dismissAfter: 3000})
        //       return 
        //     }
        //     this.$store.commit('changeToSDirectory',{treeOfSaviorDirectory:directories[0]})
        //     const {getCurrentWindow} = require('electron').remote;
        //     getCurrentWindow().reload()
        //   })
        // }
      },
    }
  }

</script>
<style>
  .addonView {
    height: 100vh;
    padding : 1rem;
    padding-left: 270px;
    margin: auto;
    /* display: grid; */
    /* grid-template-rows:150px auto; */
    /* grid-template-columns: 1fr 1fr 2fr; */
    /* /* grid-gap: 10px; */
    /* scroll-behavior: smooth; */  
    
  }
  #container {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 1fr 1fr 1fr;

  }
    #filter{
    background-color: hsl(171, 100%, 41%) ;
    display: grid;
    grid-template-rows:auto;
    grid-gap: 20px;
    padding-top: 10px;
    padding-bottom: 0px;
    height: auto;

  }
  #filter .field{
    display: inline-flex;
  }
  #filter .notField{
    display: inline-flex;
    margin-top: 8px;
    vertical-align: middle;
  }
  #filter .box{
    padding: 6px;
    margin-bottom: 0px;
    margin-top: 6px;  
    vertical-align: middle;
   }
</style>
