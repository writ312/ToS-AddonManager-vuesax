<template>
    <vs-card class="cardx">
    <div slot="header">
      <span class="title" > {{addon.name}}
        <span style="padding-top:8px;font-size:15px"> by {{addon.author}}</span>

      <vs-chip class="vs-card--header-tag" :color="status">
          <vs-avatar :v-if="addon.isInstalled" :color="status" :icon="statusIcon"/>
          {{addon.fileVersion}}
          </vs-chip>
      </span>
      <vs-chip class="vs-card--header-tag" color="primary" v-if="addon.twitterAccount" @click="openTwitter">
        Twitter
      </vs-chip>
      <vs-chip class="vs-card--header-tag" color="dark" @click="openGithub">
        Github
      </vs-chip>

    </div>
    <div slot="media">
      <!-- 誰もTagとか使ってないでしょ -->
        <!-- <vs-chip v-for="tag in addon.tags" type='is-white' :key="tag">{{tag}} </vs-chip> -->
      <vs-tabs alignment="fixed" v-model="activeTab" v-on:click-tag="changeTab">

        <vs-tab label="Discription">
          <span>{{addon.description.replace(/[^\.]{20}[\.．。][\]\)]*/g,"$&\n").replace(/[^\n]$/,"$&\n  ")}}</span>
        </vs-tab>

        <vs-tab label="UpdateInfomation" :disabled="!addon.updateInfo">
          <span v-show="addon.updateInfo" > {{addon.updateInfo}}</span>
        </vs-tab>

        <vs-tab label="README">
          <span  />
        </vs-tab>

      </vs-tabs>
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
      console.log(val)
      console.log(this.addon.readme)
      if(val == 2){
        this.$store.dispatch('getReadme',{addon:this.addon})
        this.$nextTick(()=>{
        this.$emit('set')
          this.beforeActiveTab = this.activeTab
          this.activeTab = this.beforeActiveTab
        })
        return
      }
    }
  },
  created:function(){
    
  },
  methods: {
    openTwitter() {
        require('electron').shell.openExternal("https://twitter.com/" + this.addon.twitterAccount)
    },
    openGithub(){
        require('electron').shell.openExternal(`https://github.com/${this.addon.author}/${this.addon.repo}`);
    },
    install(){
        this.$store.dispatch('installer',{type:'install',addon:this.addon,index:this.index})
    },
    uninstall(){
      this.$store.dispatch('installer',{type:'uninstall',addon:this.addon,index:this.index})
    },
    update(){
      this.$store.dispatch('installer',{type:'update',addon:this.addon,index:this.index})
      
    },
    openDetail(){
      this.$store.dispatch('getReadme',{addon:this.addon})
    },
    changeTab(val){
      console.log(val)
      this.activeTab = val
    }
  }
}

</script>

<style> 
.cardx {
  margin: 10px
}
.vs-card--header-tag {
  float: right !important;
}
.con-slot-tabs{
  padding-top: .5rem;
}
.con-tab span{
  white-space: pre-line;
}
.section{
  padding: 0px;
}
.box{
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

</style>
