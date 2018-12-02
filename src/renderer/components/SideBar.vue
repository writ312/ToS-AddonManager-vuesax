<template>
 <div id="parentx">
    <vs-sidebar parent="body" color="primary" class="sidebarx" hidden-background spacer v-model="active">

    <div class="header-sidebar" slot="header">
        <h4>
          ToS-AddonManager
        </h4>
        
    </div>
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
        Filter
    </vs-divider>

    <vs-sidebar-item >
        <vs-input icon="search" placeholder="Search" v-model="searchQuery"/>
    </vs-sidebar-item>
    <ul  class="leftx">
            <li>
            <vs-checkbox  color="success" v-model="filter.installed">Installed</vs-checkbox>   
            </li>    
            <li>
                <vs-checkbox  color="primary" v-model="filter.updatable">
                    Updatable
                    <div class="badge">
                        <span class='badgeNumber'>
                        </span>
                    </div>
                </vs-checkbox>
            </li>    
            <li>
                <vs-checkbox color="dark" v-model="filter.notintalled">Not Installed</vs-checkbox>
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
    
    <vs-divider position="left" >
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
    </vs-sidebar-item>  

    <div class="footer-sidebar" slot="footer">
        <!-- <vs-button icon="reply" color="danger" type="flat">log out</vs-button> -->
        <!-- <vs-button icon="settings" color="primary" type="border"></vs-button> -->
    </div>

    </vs-sidebar>
  </div>

</template>

<script>
import { mapGetters, mapActions } from 'Vuex'
export default {
  data:()=>({
    version:'3.2',
    active:true,
    selectLanguage:'en',
    searchQuery:'',
    filter:{
        installed:true,
        updatable:true,
        notintalled:true
    },
    orderOption:'Name-Asc',
    orderOptionList:[
        {text:'Name-Asc',value:'name-'},
        {text:'Name-Desc',value:'name'},
        {text:'Author-Asc',value:'author-'},
        {text:'Author-Desc',value:'author'},
    ]

  }),
  computed:{
    getLocaleList(){
        this.selectLanguage = this.$store.state.Addon.setting.selectLanguage || 'en'
        return Object.keys(this.$store.state.Locales.locales)
    },
    // ...mapGetters(['getUpdatableAddon'])
  },
  methods:{
    changeLanguage(lang){
        this.selectLanguage = lang
        this.$translate.setLang(this.selectLanguage)
        this.$store.dispatch('saveSelectLanguage',{selectLanguage:this.selectLanguage})
    },
    changeSortType(item){
        this.orderOption = item.text
        // this.$store.dispatch
    },
    updateInstalledAddons(){

    }
  }
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
	display: flex;
	align-items: center;
	justify-content: space-between;
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
    margin-left: 12px;
    justify-content: left;
}
.badge {
  position: absolute;
  display: inline-block;
  top: -8px;
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
span.vs-checkbox--check{
    width: 25px;
    height:25px;
}
</style>
