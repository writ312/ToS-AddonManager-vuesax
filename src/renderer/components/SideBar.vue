<template>
 <div id="parentx">
    <vs-sidebar parent="body" color="primary" class="sidebarx" hidden-background spacer v-model="active">

    <div class="header-sidebar" slot="header">
        <h4>
          ToS-AddonManager
        </h4>
        
    </div>
    <vs-divider position="left" >
        Install Directory
    </vs-divider>
    <vs-sidebar-item >
        <p>{{getTreeOfSaviorDirectory || "None "}}</p>
    </vs-sidebar-item>
    <vs-sidebar-item>
        <vs-button type="border" @click="openDialog">Browes</vs-button>
    </vs-sidebar-item>    
    <vs-divider position="left" >
        Language
    </vs-divider>
    <vs-sidebar-item >
    <vs-dropdown >
        <a class="a-icon" href="#">
            {{selectLanguage}}
            <i class="material-icons">expand_more</i>
        </a>
        <vs-dropdown-menu>
            <vs-dropdown-item v-for="lang of getLocaleList" :key='lang' @click="changeLanguage(lang)">
                {{lang}}
            </vs-dropdown-item>
        </vs-dropdown-menu>
    </vs-dropdown>
    </vs-sidebar-item>

    <vs-divider position="left" >
        Filters
    </vs-divider>

    <vs-sidebar-item >
        <vs-input icon="search" placeholder="Search" v-model="searchQuery"/>
    </vs-sidebar-item>
    <ul  class="leftx">
        <li>    
            <vs-checkbox  color="primary" v-model="filters.updatable">Updatable<div class="badge" v-show="$store.getters.getUpdatableAddonListLength>0"><span class='badgeNumber'>{{$store.getters.getUpdatableAddonListLength}}</span></div></vs-checkbox>
        </li>    
        <li>
            <vs-checkbox  color="success" v-model="filters.installed">Installed</vs-checkbox>   
        </li>    
        <li>
            <vs-checkbox color="dark" v-model="filters.notinstalled">Not Installed</vs-checkbox>
        </li>    
    </ul>
    <vs-divider position="left" >
        Sort
    </vs-divider>
    <vs-sidebar-item >
        <vs-dropdown >
        <a class="a-icon">
            {{orderOption}}
            <i class="material-icons">expand_more</i>
        </a>

        <vs-dropdown-menu>
            <vs-dropdown-item @click="changeSortType(item)" :key="item.value" v-for="item of orderOptionList">
            {{item.text}}
            </vs-dropdown-item>
        </vs-dropdown-menu>
        </vs-dropdown>
    </vs-sidebar-item >
    <!-- <vs-sidebar-item>
        <vs-select class="selectExample" label="Figuras" v-model="orderOption">
            <vs-select-item :key="item.value" :value="item.value" :text="item.text" v-for="item of orderOption" />
        </vs-select>
    </vs-sidebar-item> -->
    
    <!-- <vs-sidebar-item>
        <vs-radio v-model="order" vs-value="asc">Asc</vs-radio>
        <vs-radio v-model="order" vs-value="desc">Desc</vs-radio>
    </vs-sidebar-item> -->
    
    <!-- <vs-divider position="left" >
        Other
    </vs-divider>
        
    <vs-sidebar-item>
        <vs-button @click="updateInstalledAddons">Update Installed Addons</vs-button>
    </vs-sidebar-item>
    <vs-sidebar-item>
        <vs-button >Install Addons by Installed Addon History</vs-button>
    </vs-sidebar-item>
    <vs-sidebar-item>
        <vs-button >Fix Install History by Client/data Directory</vs-button>
    </vs-sidebar-item>
    <vs-sidebar-item>
        <vs-button >Show Installed Addon List</vs-button>
    </vs-sidebar-item>
      <vs-sidebar-item>
        <vs-button >Install Addons by List</vs-button>
    </vs-sidebar-item>   -->

    <div class="footer-sidebar" slot="footer">
        <!-- <vs-button icon="notifications" color="primary" type="border"></vs-button>
        <vs-button icon="settings" color="primary" type="border"></vs-button>
        <vs-button icon="cached" color="primary" type="border"></vs-button> -->
    </div>

    </vs-sidebar>
  </div>

</template>

<script>
import { mapGetters, mapActions } from 'Vuex'
import { PerformanceObserver } from 'perf_hooks';
import {remote} from 'electron'
import fs from  "fs"
import _ from 'lodash'
export default {
  data:()=>({
    version:'3.2',
    active:true,
    selectLanguage:'en',
    searchQuery:'',
    filters:{
        installed:true,
        updatable:true,
        notinstalled:true
    },
    orderOption:'Name-Asc',
    orderOptionList:[
        {text:'Name-Asc',value:'name'},
        {text:'Name-Desc',value:'name-'},
        {text:'Author-Asc',value:'author'},
        {text:'Author-Desc',value:'author-'},
    ]

  }),
  computed:{
    getLocaleList(){
        this.selectLanguage = this.$store.state.Addon.setting.selectLanguage || 'en'
        return Object.keys(this.$store.state.Locales.locales)
    },
    ...mapGetters(['getTreeOfSaviorDirectory','getUpdatableAddonList','getUpdatableAddonListLength','getFilterdAddonList'])
  },
  methods:{
    changeLanguage(lang){
        this.selectLanguage = lang
        this.$translate.setLang(this.selectLanguage)
        this.$store.commit('updateSelectLanguage',{selectLanguage:this.selectLanguage})
    },
    changeSortType(item){
        this.orderOption = item.text
        this.$store.commit('updateOrder',item.value)
    },
    updateInstalledAddons(){
        console.log(this.$store.getters.getFilterdAddonList)
    },
    openDialog(){
        let self = this
        let dialog = remote.dialog;
        let directories = dialog.showOpenDialog({ properties: ['openDirectory']});
        if(directories && directories.length > 0) {
            let treeOfSaviorDirectory = directories[0];
			let exe = treeOfSaviorDirectory + "/release/Client_tos.exe";
			fs.stat(exe, function(error, stat) {
				if(error) {
                    // トーストを出して、もう一度
                    self.$store.dispatch('@@toast/ADD_TOAST_MESSAGE', {text:'Could not save Tree of Savior directory.Please Select TreeOfSavior intalled directroy. \nToS Installed Directroy is parent directroy of data・release・patch', type: 'danger', dismissAfter: 10000})
                    } else {
                    // 設定を保存
                    self.$store.dispatch('@@toast/ADD_TOAST_MESSAGE', {text:'Update ToS Installed Directory to : ' + treeOfSaviorDirectory , type: 'success', dismissAfter: 3000})
                    self.$store.commit('updateToSDirectroy',treeOfSaviorDirectory)
                }
            });
        }        
    },
    updateSearchQuery(){
        this.$store.commit('updateSearchQuery',this.searchQuery)
    }
},
created: function () {
    this.debouncedSearchQuery = _.debounce(this.updateSearchQuery,500)
},
watch:{
    filters:{
        handler:function(val){
            console.log(val)
            this.$store.commit('updateFilters',val)
        },
        deep:true
    },
    searchQuery:function(word){
        this.debouncedSearchQuery()
    }
},
}
</script>


<style>
.parentx-static {
	overflow: hidden;
	height: 100%;
	position: relative;
}

.header-sidebar {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	width: 100%;
}

.header-sidebar h4 {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
}

.header-sidebar h4 > button {
	margin-left: 10px;
}

.footer-sidebar {
	/* display: flex; */
	align-items: right;
	/* justify-content: space-between; */
	width: 100%;
}

.footer-sidebar > button {
	border: 0px solid rgba(0,0,0,0) !important;
	border-left: 1px solid rgba(0,0,0,0.07) !important;
	border-radius: 0px !important;
}
/* .ul {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
} */
div.con-vs-checkbox {
    margin-left: 1.2rem;
    justify-content: left;
    padding-top:0.2rem;
    padding-bottom: 0.2rem;
}
span.vs-checkbox--check{
    width: 25px;
    height:25px;
}
.badge {
  position: absolute;
  display: inline-block;
  top: 0px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  z-index: 100;
  background: rgb(31, 116, 255);
}
.badgeNumber {
  width: auto;
  height: auto;
  position: absolute;
  border-radius: 4px;
  padding-top: 2px;
  padding-left: 5px;
  font-size: 0.625em;
  color: white;
}
button.vs-con-dropdown{
    border: 1px solid lightgray;
    border-radius: 6px;
}

</style>
