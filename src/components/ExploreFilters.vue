<template>
  <div class="explore-filters">
    <ExploreMenu/>
    <div id="explore-filters-view">
      <div class="adv">
          <button v-if="showAdvanced == true" class="closebtn" @click="closeSearch">x</button>
          <div class="button" v-if="!showAdvanced" @click="advSearch"><div class="button-label">Advanced search</div><div class="advanced-icon"></div></div>
      </div>

      <div v-show="showAdvanced"><AdvancedSearch/></div>
      <div v-show="!showAdvanced">
        <slot />
      </div>
      
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import ExploreMenu from '@/components/ExploreMenu.vue'
import AdvancedSearch from '@/components/AdvancedSearch.vue'
import { useSaintsStore } from '@/stores/mode'

const store = useSaintsStore()
const showAdvanced = ref(false)
</script>

<style scoped>
#explore-filters-view {
  margin: 1rem 2rem;
}

.adv {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* make a round smaller close button */
.closebtn {
  background-color: #F6B335;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: middle;
}
.closebtn:hover {
 background-color: #F6B335;
}

.button{
    border-radius:8px;
    padding:4px;
    background-color:#e8e8e8;
    display:flex;
    flex-direction: row;
    align-items: center;
    vertical-align: middle;
    width:fit-content;
    cursor:pointer;
}
.button-label{
    font-family:sans-serif;
    font-weight:200;
    font-size: 14px;
   margin-right:10px;
}
.advanced-icon{
    border-radius:50%;
    background:url(./assets/control.png);
    background-size: 60%;
    background-position:center;
    background-repeat: no-repeat;
    width:20px;
    height:20px;
    border-color:black;
    border-width:1px;
    border-style:solid;
}

@media screen and (max-width: 900px) {
  .button-label{
    font-size: 12px;
  }
  .advanced-icon{
    display: none;
  }
  .button {
    display: block;
    margin-bottom: 15px;
  }
  #explore-filters-view {
    margin: 0.5rem;
  }
}
</style>