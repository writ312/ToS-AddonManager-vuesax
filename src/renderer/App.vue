<template>
  <div id="app">
    <side-bar></side-bar>
    <!-- <landing-page></landing-page> -->
    <addon-view></addon-view>
    <!-- <toast position="ne"></toast> -->
  </div>
</template>

<script>
  // import LandingPage from '@/components/LandingPage'
  import SideBar from '@/components/SideBar'
  import { Toast } from 'vuex-toast'
  import AddonView from '@/components/AddonView'


export default {
    name: 'tos-addonmanager',
    components: {
      // LandingPage,
      SideBar,
      AddonView,
      Toast
    },
     created:function(){
      this.$store.dispatch('getLocales',this.$translate)
      this.$store.dispatch('initAddon')
     }
  }
</script>

<style>
html, body{
  /* font-family:'JosefinSans','Questrial', Arial, Helvetica,"Noto Sans JP", sans-serif; */
  font-family: Arial, Helvetica,"Noto Sans JP", sans-serif;
}
</style>  
