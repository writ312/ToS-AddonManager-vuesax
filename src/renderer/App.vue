<template>
  <div id="app">
    <side-bar></side-bar>
    <!-- <landing-page></landing-page> -->
    <addon-view></addon-view>
    <toast position="ne"></toast>
  </div>
</template>

<script>
  // import LandingPage from '@/components/LandingPage'
  import SideBar from '@/components/SideBar'
  import AddonView from '@/components/AddonView'
  import { Toast } from 'vuex-toast'
  import {ipcRenderer} from 'electron'
  export default {
      name: 'tos-addonmanager',
      components: {
        // LandingPage,
        SideBar,
        AddonView,
        Toast
      },
      created:function(){
         ipcRenderer.send('initalize', 'ping')
          ipcRenderer.on('initalize', (event, {list,setting}) => {
            console.log(list)
            this.$store.commit('initalize',{
              list : list,
              setting : setting
            })
          })
        this.$store.dispatch('initLocales',this.$translate)
        // (function isLoading(){
        //   if(addon.isLoading)
        //     setTimeout(isLoading,100);
        //   else{
        //     this.$store.commit('initalize',{
        //       list : addon.list,
        //       setting : addon.setting
        //     })
        //   }
        // }());
      }
    }
</script>

<style>
html, body{
  /* font-family:'JosefinSans','Questrial', Arial, Helvetica,"Noto Sans JP", sans-serif; */
  font-family: Arial, Helvetica,"Noto Sans JP", sans-serif;
}
</style>  
