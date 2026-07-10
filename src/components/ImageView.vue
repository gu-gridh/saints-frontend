<template>
  <div>
    <div
      v-if="tbl !== 'shm_art'"
      class="grid"
      :class="{ 'select-enabled': selected }"
    >
      <em v-if="!records.length">--</em>

      <div
        v-for="record in recordsSorted"
        :key="record.id"
        class="item"
        :class="{
          selected: isSelected(record.id),
          disabled: isDisabled(record.id),
        }"
        @click="toggle(record.id)"
      >
        <figure>
          <img
            v-if="record.filename"
            :src="thumbnailUrl(record.filename)"
            class="thumb"
            @click.stop="showIconographic(record)"
          />

          <figcaption>
            <div class="caption">
              <input
                v-if="selected && !isDisabled(record.id)"
                type="checkbox"
                :checked="isSelected(record.id)"
              />

              {{ record.motif2 }}
            </div>
          </figcaption>
        </figure>
      </div>
    </div>

    <div v-else>
      <div
        v-for="record in records"
        :key="record.resource_uri"
        class="item"
        @click="toggle(record)"
      >
        <figure>
          <img
            v-if="record.samsoek?.main_thumb"
            :src="record.samsoek.main_thumb"
            :alt="record.samsoek.name"
            class="thumb-medeltid"
            @click.stop="showMedeltid(record)"
          />

          <figcaption>
            <div class="caption">
              {{ record.samsoek?.name }}
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useSaintsStore } from "@/stores/mode";

const props = defineProps({
  tbl: {
    type: String,
    default: "",
  },
  records: {
    type: Array,
    default: () => [],
  },
  selected: {
    type: Array,
    default: null,
  },
  disabled: {
    type: Array,
    default: null,
  },
  tb: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["select", "deselect"]);

const store = useSaintsStore();

const recordsSorted = computed(() => {
  return [...props.records].sort((a, b) => a.id - b.id);
});

function thumbnailUrl(imageId) {
  return `https://data.dh.gu.se/iconographic/thumbs/${imageId}`;
}

function isSelected(id) {
  return props.selected?.includes(id);
}

function isDisabled(id) {
  return props.disabled?.includes(id);
}

function toggle(id) {
  if (!props.selected || isDisabled(id)) return;

  if (isSelected(id)) {
    emit("deselect", id);
  } else {
    emit("select", id);
  }
}

function scrollToShow() {
  document.getElementById("show")?.scrollIntoView();
}

function showIconographic(record) {
  store.setVisualObj({
    ...record,
    tb: "iconographic",
  });

  scrollToShow();
}

function showMedeltid(record) {
  store.setVisualObj({
    ...record,
    tb: "shm_art",
  });

  scrollToShow();
}
</script>

<style scoped>
.grid {
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
}

.item {
  padding: 0.5em;
  margin: 0.2em;
  width: 200px;
}

.select-enabled .item:not(.disabled) {
  cursor: pointer;
}

.item.selected {
  background-color: #f2f2f2;
}

.item.disabled {
  opacity: 0.5;
}

.thumb {
  position: relative;
  max-height: 100%;
  max-width: 100%;
  min-height: 140px;
  cursor: pointer;
}

.thumb-medeltid {
  position: relative;
  max-height: 150px;
  max-width: 100%;
  min-height: 140px;
  cursor: pointer;
}

figcaption {
  display: flex;
}

.caption {
  word-break: break-all;
}
</style>