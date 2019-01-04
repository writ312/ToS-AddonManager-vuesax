<template>
    <vs-card class="cardx">
    <div slot="header">
      <span class="title" >{{addon.name}}
        <span style="padding-top:8px;font-size:15px"> by {{addon.author}}</span>
      <vs-chip class="versionTag" :color="status">
          <vs-avatar :v-if="addon.isInstalled" :color="status" :icon="statusIcon"/>
          {{addon.fileVersion}}
          </vs-chip>
      </span>
    </div>
    <div slot="media">
      <!-- 誰もTagとか使ってないでしょ -->
        <!-- <vs-chip v-for="tag in addon.tags" type='is-white' :key="tag">{{tag}} </vs-chip> -->
        <vs-tabs vs-alignment="fixed" v-model="activeTab">
        <vs-tab vs-label="Discription">
            <span>{{addon.description.replace(/[^\.]{20}[\.．。][\]\)]*/g,"$&\n").replace(/[^\n]$/,"$&\n  ")}}</span>
        </vs-tab>
        <vs-tab vs-label="UpdateInfomation" :disabled="!addon.updateInfo">
            <span v-show="addon.updateInfo" > {{addon.updateInfo}}</span>
        </vs-tab>
        <vs-tab vs-label="README">
        </vs-tab>
        </vs-tabs>
       <!-- <a class="button is-info is-small" @click="openTwitter">
          <b-icon icon="twitter"></b-icon>
          <span>Twitter</span>
        </a>
        <a class="button is-dark is-small" @click="openGithub">
          <b-icon icon="github-circle"></b-icon>
          <span>GitHub</span>
        </a>
      -->
      <vs-row vs-justify="flex-end">
      <vs-button  size="large" type="border" v-show="!addon.isDownloading && !addon.isInstalled" color="success"  :class="{'is-loading':addon.isDownloading}" @click="install">Install</vs-button >
    
      <vs-button  size="large" type="border" v-show="addon.isUpdateAvailable" color="primary"  :class="{'is-loading':addon.isDownloading}" @click="update">Update</vs-button>
    
      <vs-button  size="large" type="border" v-show="addon.isInstalled" color="danger" :class="{'is-loading':addon.isDownloading}"  @click="uninstall">Uninstall</vs-button>
      </vs-row>
    </div>  
    </vs-card>
</template>

<script>
export default {
  name: 'addon-card',
  data() {
    return {
      twitter: "./asset/twitter.png",
      activeTab:0,
      beforeActiveTab:0
    }
  },
  props: ["addon","index"],
  computed: {
    status:function(){
      let isInstalled = this.addon.isInstalled
      let isUpdateAvailable = this.addon.isUpdateAvailable
      if(isUpdateAvailable){
        return 'primary'
      }else if(isInstalled){
        return 'success'
      }else{
        return ''
      }
    },
    statusIcon:function(){
      if(this.status === 'primary'){
        return 'new_releases'
      }else{
        return 'done'
      }
    }
  },
  watch:{
    activeTab:function(val){
      if(val == 2){
        this.$store.dispatch('getReadme',{addon:this.addon})
        this.$parent.isReadmeModalActive = true
        this.$nextTick(()=>{
          this.activeTab = this.beforeActiveTab
        })
        return
      }
      this.beforeActiveTab = this.activeTab
    }
  },
  created:function(){
    
  },
  methods: {
    openTwitter() {
        console.log("https://twitter.com/" + this.addon.twitterAccount)
        require('electron').shell.openExternal("https://twitter.com/" + this.addon.twitterAccount)
    },
    openGithub(){
        require('electron').shell.openExternal(`https://github.com/${this.addon.author}/${this.addon.repo}`);
    },
    install(){
        // this.addon.isDownloading = true
        this.$store.dispatch('installer',{type:'install',addon:this.addon})
    },
    uninstall(){
      this.addon.isDownloading = true
      this.$store.dispatch('installer',{type:'uninstall',addon:this.addon})
    },
    update(){
      this.addon.isDownloading = true
      this.$store.dispatch('installer',{type:'update',addon:this.addon})
      
    },
    openDetail(){
      this.$store.dispatch('getReadme',{addon:this.addon})
    },
    changeTab(val){
      this.activeTab = val
    }
  }
}

</script>

<style> 
.cardx {
  margin: 10px
}
.con-vs-chip.versionTag {
  float: right;
}
.con-tab span{
  white-space: pre-line;
}
  .section{
    padding: 0px;
  }
  .box{
    /* background:rgba(229, 229, 229, .3);  */
    margin-bottom: 0.5em;
  }
  .title{
    font-size: 26px;
    padding-right: 12px;
  }
  .taglist{
    padding: 3px;
    margin-bottom:0;
  }
  .taglist .is-white{
    border: solid thin gray
  }
  .fotter{
    float: right;    
    margin-bottom: 10px;
  }
  i{
   font-size: 2em;
   /*padding : 5px*/
  }
  .img-icon{
    float:left;
    width:40px;
    padding: 5px
  }


  /* .addonCard{
    display: grid;
    grid-template-rows: 120px auto 50px;
    grid-template-columns: auto 150px;
    grid-gap: 10px
    grid-template-areas: 
    "title date"
    "title version";
  } */
  .headerSection{
    grid-row: 1;
    /* grid-column: 1; */
  }
  .tagSection{
    grid-row: 1;
    grid-column: 1;
  }
  .tagSection .tags{
    min-width: 100px;
  }
  .descSection{
    grid-row: 2;
    /* grid-column: 1; */
  }
  .descSection *{
	white-space: pre-line;
  }
  .installerSection{
    grid-row: 3;
    /* grid-column: 2; */
  }
  .installerSection a{
    content: “\A”;
    margin: 5px;
    width:90px;
    height: 40px;
  }
  .installerSection .icon{
    padding-right: 5px;
    padding-bottom: 5px;
  }
  .installerSection 
   [disabled]{
    background-color: gray !important;
    }
 
  
  .panel-tabs{
    background-color: ghostwhite;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }
  .panel-block{
    background-color: white;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }

  /* .addonTitle{ */
    /* grid */
  /* } */
  
</style>
