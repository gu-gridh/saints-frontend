<template>
  <div>
    <div>
      <h4>Advanced Search</h4>
    </div>

    Filter by:

    <div id="grid">
      <div class="col">
        <VueTagsInput
          v-model="cults"
          :tags="cultTags"
          :autocomplete-items="autoCompleteItems"
          :add-only-from-autocomplete="true"
          placeholder="Type of cult manifestation"
          :allow-edit-tags="true"
          class="searchbar"
          @tags-changed="updateCults"
        />

        <VueTagsInput
          v-model="saintTypes"
          :tags="saintTypeTags"
          :add-only-from-autocomplete="true"
          placeholder="Type of saint/person"
          :autocomplete-items="autoCompleteSaintTypes"
          class="searchbar"
          :disabled="isSaintTypesDisabled"
          @tags-changed="updateSaintTypes"
        />

        <select v-model="diocesesSelected" class="dropdown">
          <option :value="0" disabled>Select medieval diocese</option>
          <option
            v-for="diocese in dioceseType"
            :key="diocese.id"
            :value="diocese.id"
          >
            {{ diocese.name }}
          </option>
        </select>
      </div>

      <div class="col">
        <VueTagsInput
          v-model="places"
          :tags="placeTags"
          :add-only-from-autocomplete="true"
          :autocomplete-items="autoPlaceItems"
          placeholder="Type of place"
          class="searchbar"
          @tags-changed="updatePlaces"
        />

        <VueTagsInput
          v-model="saints"
          :tags="saintTags"
          :add-only-from-autocomplete="true"
          placeholder="Saints or people by name"
          :autocomplete-items="autoCompleteSaints"
          class="searchbar"
          :disabled="isSaintsDisabled"
          @tags-changed="updateSaints"
        />

        <div class="btn-container">
          <button class="clearbtn frmbtn" @click="clearAll">
            Clear search
          </button>
          <button class="frmbtn searchbtn" @click="doSearch">
            Search
          </button>
        </div>
      </div>
    </div>

    <h4 v-if="cultsNum">Search results</h4>

    <span v-if="cultsNum" class="option-count">
      {{ cultsNum }} items
    </span>

    <div v-if="cultsNum" class="search-results">
      <OptionList
        :options="advancedOptions"
        :max="1"
        @input="onSelected"
      />
    </div>

    <div v-if="cultsNum === 0" class="search-results">
      <p>No results found</p>
    </div>

    <div v-if="cultsNum > max" class="my-2 nav">
      <button class="frmbtn" :disabled="page <= 1" @click="goBack">
        ←
      </button>

      <span>
        Page {{ page }} of {{ totalPages }} ({{ cultsNum }} items)
      </span>

      <button
        class="frmbtn"
        :disabled="page >= totalPages"
        @click="loadMore"
      >
        →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSaintsStore } from "@/stores/mode";

import VueTagsInput from "@wslyhbb/vue3-tags-input";
import OptionList from "@/components/OptionList.vue";

import {
  miniSearch,
  advancedFilteringTypes,
  advancedSearch,
  getDioceses
} from "@/assets/db";

const router = useRouter();
const store = useSaintsStore();

const cults = ref("");
const cultTags = ref([]);

const places = ref("");
const placeTags = ref([]);

const saints = ref("");
const saintTags = ref([]);

const saintTypes = ref("");
const saintTypeTags = ref([]);

const autoCompleteItems = ref([]);
const autoPlaceItems = ref([]);
const autoCompleteSaints = ref([]);
const autoCompleteSaintTypes = ref([]);
const autoCompletePersonTypes = ref([]);

const debounce = ref(null);

const searchResults = ref([]);
const totalPages = ref(null);
const cultsNum = ref(null);
const page = ref(1);

const dioceseType = ref([]);
const diocesesSelected = ref(0);
const range = ref("");

const totalTags = 4;
const max = 200;

const isSaintTypesDisabled = ref(false);
const isSaintsDisabled = ref(false);

const tagColors = [
  "rgba(255, 128, 0, 0.7)",
  "rgba(0, 0, 255, 0.7)",
  "rgba(255, 0, 0, 0.7)",
  "rgba(0, 128, 0, 0.7)",
];

const searchDateRange = computed(() => store.searchDateRange);

const advancedOptions = computed(() =>
  searchResults.value
    .map((cult) => ({
      key: cult.id,
      label: [cult.place, cult.cult_type, cult.relation_cult_agent].join(", "),
      id: cult.id,
      links: [
        {
          to: `/explore/cults/${cult.id}`,
          icon: "/icons/information.png",
        },
      ],
    }))
    .slice(0, max)
);

function updateCults(newTags) {
  autoCompleteItems.value = [];
  cultTags.value = newTags;

  cultTags.value.forEach((tag, index) => {
    tag.style = `
      background-color: ${tagColors[index % tagColors.length]} !important;
      color: white !important;
    `;
  });
}

function updatePlaces(newTags) {
  autoPlaceItems.value = [];
  placeTags.value = newTags;
}

function updateSaints(newTags) {
  autoCompleteSaints.value = [];
  saintTags.value = newTags;
  isSaintTypesDisabled.value = newTags.length > 0;
}

function updateSaintTypes(newTags) {
  autoCompleteSaintTypes.value = [];
  saintTypeTags.value = newTags;
  isSaintsDisabled.value = newTags.length > 0;
}

function updatePeopleTypes(newTags) {
  autoCompletePersonTypes.value = [];
}

function runDebounced(callback) {
  clearTimeout(debounce.value);
  debounce.value = setTimeout(callback, 500);
}

function initCults() {
  if (cults.value.length < 1) return;

  runDebounced(async () => {
    const response = await advancedFilteringTypes("culttype", cults.value);
    autoCompleteItems.value = response.results.map((a) => ({
      text: a.name,
      id: a.id,
      tb: "cult",
    }));
  });
}

function initPlaces() {
  if (places.value.length < 1) return;

  runDebounced(async () => {
    const response = await advancedFilteringTypes("placetype", places.value);
    autoPlaceItems.value = response.results.map((a) => ({
      text: a.name,
      id: a.id,
      tb: "place",
    }));
  });
}

function initSaints() {
  if (saints.value.length < 1) return;

  runDebounced(async () => {
    const response = await advancedFilteringTypes("agents", saints.value);
    autoCompleteSaints.value = response.results.map((a) => ({
      text: a.name,
      id: a.id,
      tb: "person",
    }));
  });
}

function initSaintTypes() {
  if (saintTypes.value.length < 1) return;

  runDebounced(async () => {
    const response = await advancedFilteringTypes("agenttype", saintTypes.value);
    autoCompleteSaintTypes.value = response.results.map((a) => ({
      text: a.name,
      id: a.id,
      tb: "saintType",
    }));
  });
}

async function initDioceses() {
  try {
    const dioceseResponse = await getDioceses()
    dioceseType.value = dioceseResponse.results ?? dioceseResponse ?? []
  } catch (error) {
    console.error("Failed to load dioceses:", error)
    dioceseType.value = []
  }
}

async function doSearch() {
  store.setMode("advanced")

  const cultIds = cultTags.value.map((tag) => tag.id)
  const placeIds = placeTags.value.map((tag) => tag.id)
  const saintIds = saintTags.value.map((tag) => tag.id)
  const saintTypeIds = saintTypeTags.value.map((tag) => tag.id)

  if (
    cultIds.length +
      placeIds.length +
      saintIds.length +
      saintTypeIds.length >
    totalTags
  ) {
    alert("You can only select a total of 4 tags")
    return
  }

  const storeQuery = {
    cultType: cultIds,
    placeType: placeIds,
    personName: saintIds,
    personType: saintTypeIds,
    dioceseState: diocesesSelected.value === 0 ? null : diocesesSelected.value,
  }

  const apiQuery = {
    type: cultIds.join(","),
    place_type: placeIds.join(","),
    agent: saintIds.join(","),
    agent_type: saintTypeIds.join(","),
    med_diocese: diocesesSelected.value === 0 ? "" : diocesesSelected.value,
    range: searchDateRange.value ?? "",
    page: page.value,
  }

  store.setAdvancedSearch(storeQuery)

  const response = await advancedSearch(apiQuery)

  searchResults.value = response.results
  cultsNum.value = response.count
  totalPages.value = Math.ceil(cultsNum.value / max)
}

function onSelected(selected) {
  const id = selected.pop();

  if (id) {
    router.push(`/explore/cults/${id}`);
  }
}

function clearAll() {
  cults.value = "";
  places.value = "";
  saints.value = "";
  saintTypes.value = "";

  cultTags.value = [];
  placeTags.value = [];
  saintTags.value = [];
  saintTypeTags.value = [];

  searchResults.value = [];
  page.value = 1;
  totalPages.value = null;
  cultsNum.value = null;
  diocesesSelected.value = 0;

  isSaintTypesDisabled.value = false;
  isSaintsDisabled.value = false;

  store.setAdvancedSearch(query)
}

function loadMore() {
  page.value++;
  doSearch();
}

function goBack() {
  page.value--;
  doSearch();
}

watch(cults, initCults);
watch(places, initPlaces);
watch(saints, initSaints);
watch(saintTypes, initSaintTypes);

onMounted(() => {
  initDioceses();
});
</script>