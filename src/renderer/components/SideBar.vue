<template>
 <div id="parentx">

    <vs-sidebar parent="body" color="primary" class="sidebarx" spacer v-model="active">

    <vs-divider position="left" >
        Filter
    </vs-divider>

    <vs-sidebar-item >
        <vs-input icon="search" placeholder="Search" v-model="value1"/>
    </vs-sidebar-item>

    <vs-sidebar-item>
        <ul class="ul con-s">
            <li>
                <label for="">Installed</label>
                <vs-switch  color="success" v-model="checkBox1"/>
            </li>    
        <li>
            <label for="">Updatable</label>
                <vs-switch  color="primary" v-model="checkBox2"/>
            </li>    
        <li>
            <label color="dark" for="">Not Installed</label>
                <vs-switch color="dark" v-model="checkBox3"/>
            </li>    
        </ul>
        
    </vs-sidebar-item> 
    
    <vs-divider position="left" >
        Sort
    </vs-divider>

    <vs-sidebar-item>
        <vs-select class="selectExample" label="Figuras" v-model="select1">
            <vs-select-item :key="item.value" :value="item.value" :text="item.text" v-for="item of options1" />
        </vs-select>
    </vs-sidebar-item>
    
    <vs-sidebar-item>
        <vs-radio v-model="radios1" vs-value="asc">Asc</vs-radio>
        <vs-radio v-model="radios1" vs-value="desc">Desc</vs-radio>
    </vs-sidebar-item>
    
    <vs-divider position="left" >
        Other
    </vs-divider>
    
    <vs-sidebar-item>
        <vs-button >Update Installed Addons</vs-button>
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
        <vs-button icon="reply" color="danger" type="flat">log out</vs-button>
        <vs-button icon="settings" color="primary" type="border"></vs-button>
    </div>

    </vs-sidebar>
  </div>

</template>

<script>
export default {
  data:()=>({
    active:true,
    select1:2,
      options1:[
        {text:'Name',value:0},
        {text:'Author',value:2},
      ]

  })
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
</style>
