<template>
  <div v-if="place" id="show" class="tabcontent">
    <button v-if="store.mode !== 'advanced'" class="frmbtn" @click="router.back()">
      ← Back
    </button>

    <h2>
      {{ place.name }}
      <small v-if="place.place_type?.name">{{ place.place_type.name }}</small>
    </h2>

    <table class="data-table">
      <tbody>
        <tr>
          <th>Attested names</th>
          <td>
            <span v-for="name in place.place_names" :key="`${name.language}-${name.name}`">
              <span class="lang">{{ name.language }}</span>
              <em>{{ name.name }}</em>
            </span>
          </td>
        </tr>

        <tr>
          <th>Place type</th>
          <td>{{ place.place_type?.name }}</td>
        </tr>

        <tr v-if="place.parent">
          <th>Situated in</th>
          <td>
            <RouterLink :to="`/explore/places/${place.parent.id}`">
              {{ place.parent.name }} {{ place.parent.municipality }}
            </RouterLink>
          </td>
        </tr>

        <tr v-if="place.parish">
          <th>Medieval Parish, Medieval Diocese</th>
          <td>
            {{ place.parish.name }},
            {{ place.parish.medival_organization?.name }}
          </td>
        </tr>

        <tr>
          <th>Modern location</th>
          <td>
            <span v-if="place.municipality">{{ place.municipality }}, </span>
            <span v-if="place.county">{{ place.county }}, </span>
            {{ place.country }}
          </td>
        </tr>

        <tr v-if="place.comment">
          <th>Comment</th>
          <td v-html="place.comment" class="comment"></td>
        </tr>

        <tr v-if="place.construction_date !== '0'">
          <th>Date of construction</th>
          <td>{{ place.construction_date }}</td>
        </tr>

        <tr v-if="place.not_before !== '0'">
          <th>First indication</th>
          <td>{{ place.not_before }}</td>
        </tr>

        <tr v-if="place.geometry?.coordinates">
          <th>Coordinates</th>
          <td>{{ place.geometry.coordinates }}</td>
        </tr>

        <tr v-if="place.created">
          <th>Created by</th>
          <td>{{ place.created.first_name }} {{ place.created.last_name }}</td>
        </tr>

        <tr v-if="place.modified">
          <th>Updated by</th>
          <td>
            {{ place.modified.first_name }} {{ place.modified.last_name }},
            {{ place.updated }}
          </td>
        </tr>
      </tbody>
    </table>

    <section v-if="place.quote?.length">
      <h4>Sources for place</h4>

      <Source
        v-for="quote in place.quote"
        :key="quote.id"
        class="grid-container"
        :quote="quote"
        :name="quote.source.name"
        :source_id="quote.source"
      />
    </section>

    <section>
      <h4>Cult manifestations located here</h4>

      <div v-if="cultrelation.length" class="grid">
        <div v-for="item in cultrelation" :key="item.id" class="grid-item">
          <RouterLink :to="`/explore/cults/${item.id}`">
            <span v-if="item.place_uncertainty">*</span>
            {{ item.cult_type }},
            {{ item.relation_cult_agent }},
            {{ item.minyear }}-{{ item.maxyear }}
          </RouterLink>
        </div>
      </div>

      <div v-else>--</div>

      <div v-if="itemCounter > pageSize - 1" class="my-2 nav">
        <button class="frmbtn" :disabled="page <= 1" @click="goBack">←</button>

        <span>
          Page {{ page }} of {{ pageCount }} ({{ itemCounter }} items)
        </span>

        <button class="frmbtn" :disabled="page >= pageCount" @click="fetchMore">
          →
        </button>
      </div>
    </section>

    <section v-if="children.length">
      <h4>Structures in Place</h4>

      <div class="grid">
        <div v-for="item in children" :key="item.id">
          <RouterLink :to="`/explore/places/${item.id}`">
            {{ item.name }}
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSaintsStore } from "@/stores/mode";
import { show, getFilterTypes } from "@/assets/db";
import Source from "@/components/Source.vue";

const route = useRoute();
const router = useRouter();
const store = useSaintsStore();

const place = ref(null);
const children = ref([]);
const cultrelation = ref([]);

const page = ref(1);
const pageSize = 100;
const itemCounter = ref(0);

const id = computed(() => route.params.id);

const pageCount = computed(() =>
  Math.ceil(itemCounter.value / pageSize)
);

function showMap() {
  const coordinates = place.value?.geometry?.coordinates;
  if (!coordinates) return;

  const [lon, lat] = coordinates;

  store.setMapCenter([lon, lat]);
  store.setZoom(17);
}

function updatePage() {
  const allRelations = place.value?.relation_cult_place ?? [];

  cultrelation.value = allRelations.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  );
}

function goBack() {
  page.value -= 1;
  updatePage();
}

function fetchMore() {
  page.value += 1;
  updatePage();
}

async function loadPlace() {
  if (route.name !== "place" || !id.value) return;

  place.value = null;
  children.value = [];
  cultrelation.value = [];
  itemCounter.value = 0;
  page.value = 1;

  const response = await show("place", id.value);
  const childresponse = await getFilterTypes("placechildren", `?id=${id.value}`);

  const data = response?.data ?? response;

  if (!data || data.id?.value === 0) return;

  place.value = data;

  const allRelations = [...(place.value.relation_cult_place ?? [])].sort((a, b) =>
    a.cult_type.localeCompare(b.cult_type)
  );

  place.value.relation_cult_place = allRelations;
  itemCounter.value = allRelations.length;
  updatePage();

  children.value = childresponse?.data?.results ?? childresponse?.results ?? [];

  showMap();
}

watch(
  () => route.params.id,
  loadPlace,
  { immediate: true }
);
</script>