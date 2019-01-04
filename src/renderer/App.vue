<template>
  <div id="app">
    <side-bar></side-bar>
    <addon-view></addon-view>
    <toast position="ne"></toast>
  </div>
</template>

<script>
  import SideBar from '@/components/SideBar'
  import AddonView from '@/components/AddonView'
  import { Toast } from 'vuex-toast'
  import {ipcRenderer} from 'electron'
  export default {
      name: 'tos-addonmanager',
      components: {
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
      }
    }
</script>

<style>
html, body{
  /* font-family:'JosefinSans','Questrial', Arial, Helvetica,"Noto Sans JP", sans-serif; */
  font-family: Arial, Helvetica,"Noto Sans JP", sans-serif;
}
</style>  
