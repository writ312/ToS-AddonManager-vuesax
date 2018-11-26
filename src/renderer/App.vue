<template>
  <div id="app">
    <side-bar></side-bar>
    <!-- <landing-page></landing-page> -->
  </div>
</template>

<script>
  import LandingPage from '@/components/LandingPage'
  import SideBar from '@/components/SideBar'
  export default {
    name: 'tos-addonmanager',
    components: {
      LandingPage,
      SideBar
    }
  }
</script>

<style>
  /* CSS */
</style>
