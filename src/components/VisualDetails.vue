<template>
  <aside v-if="visualObj">
    <RecordVisual
      :tb="visualObj.tb"
      :id="visualObj.id"
      :record="visualObj"
      :groupObjects="groupObjects"
      @select="showGroupObject"
    />

    <span v-if="visualObj.tb === 'iconographic' && visualObj.motif2">
      {{ visualObj.motif2 }}
    </span>

    <span v-if="visualObj.tb === 'shm_art' && visualObj.samsoek?.name">
      {{ visualObj.samsoek.name }}
    </span>

    <br />

    <span v-if="visualObj.tb === 'shm_art'">
      Photo from Medeltidens bildvärld
    </span>

    <span v-if="visualObj.tb === 'iconographic'">
      Register card from Ikonografiska arkivet
    </span>

    <br />

    <span v-if="visualObj.tb === 'shm_art'" class="quote">
      Medeltidens bildvärld. Upphov: Karlsson, Lennart, Historiska museet/SHM
      <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">
        (CC BY 4.0)
      </a>
    </span>

    <span v-if="visualObj.tb === 'iconographic'" class="quote">
      Ikonografiska registret, Riksantikvarieämbetet. Licens:
      <a href="https://creativecommons.org/publicdomain/mark/1.0/" target="_blank">
        PD - Ingen upphovsrätt
      </a>
    </span>

    <br />

    <a
      v-if="visualObj.tb === 'iconographic'"
      :href="visualObj.uri"
      target="_blank"
      class="links"
    >
      Persistent link to resource
    </a>

    <a
      v-if="visualObj.tb === 'shm_art'"
      :href="visualObj.resource_uri"
      target="_blank"
      class="links"
    >
      Persistent link to resource
    </a>
  </aside>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useSaintsStore } from "@/stores/mode";
import RecordVisual from "@/components/RecordVisual.vue";

const store = useSaintsStore();
const { visualObj } = storeToRefs(store);

const groupObjects = ref(null);

function showGroupObject(record) {
  store.setVisualObj(record);
}
</script>