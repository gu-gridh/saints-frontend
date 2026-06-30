<template>
  <div v-if="cult" id="show" class="tabcontent">
    <button v-if="store.mode !== 'advanced'" class="frmbtn" @click="router.back()">
      ← Back
    </button>

    <h2>
      <span v-if="cult.cult_uncertainty" class="unc">*</span>
      {{ cult.cult_type?.name }}

      <br />

      <span v-if="cult.place_uncertainty" class="unc">*</span>
      <span v-if="cult.place">
        {{ cult.place.name }},
        {{ cult.place.municipality }},
        {{ cult.place.place_type?.name }}
      </span>
    </h2>



    <table class="data-table">
      <tbody>
        <tr>
          <th>Cult Manifestation</th>
          <td>
            {{ cult.cult_type?.parent?.name }} :
            {{ cult.cult_type?.name }}
          </td>
        </tr>

        <tr v-if="cult.cult_uncertainty !== null">
          <th>Manifestation Certainty</th>
          <td>
            <span v-if="cult.cult_uncertainty">Uncertain</span>
            <span v-else>Certain</span>
          </td>
        </tr>

        <tr v-if="cult.minyear">
          <th>Functional Period</th>
          <td v-if="cult.minyear && cult.maxyear && cult.minyear !== cult.maxyear">
            {{ cult.minyear }} - {{ cult.maxyear }}
          </td>
          <td v-else>
            {{ cult.minyear }}
          </td>
        </tr>

        <tr v-if="cult.date_note">
          <th>Date note</th>
          <td>{{ cult.date_note }}</td>
        </tr>

        <tr v-if="cult.production_date">
          <th>Production date</th>
          <td>{{ cult.production_date }}</td>
        </tr>

        <tr v-if="cult.not_before">
          <th>First indication date</th>
          <td>{{ cult.not_before }}</td>
        </tr>

        <tr v-if="cult.place">
          <th>Place</th>
          <td>
            <span v-if="cult.place_uncertainty">*</span>
            <RouterLink :to="`/explore/places/${cult.place.id}`">
              {{ cult.place.name }},
              <span v-if="cult.place.municipality">
                {{ cult.place.municipality }},
              </span>
              {{ cult.place.place_type?.name }}
            </RouterLink>
          </td>
        </tr>

        <tr>
          <th>Object exists</th>
          <td>{{ cult.extant }}</td>
        </tr>

        <tr v-if="cult.parent">
          <th>Main Manifestation</th>
          <td>
            <RouterLink :to="`/explore/cults/${cult.parent.id}`">
              {{ cult.parent.place }},
              {{ cult.parent.cult_type }},
              {{ cult.parent.relation_cult_agent }},
              {{ cult.parent.minyear }} - {{ cult.parent.maxyear }}
            </RouterLink>
          </td>
        </tr>

        <tr v-if="cult.associated?.length">
          <th>Associated Manifestation(s)</th>
          <td>
            <p v-for="item in cult.associated" :key="item.id">
              <RouterLink :to="`/explore/cults/${item.id}`">
                {{ item.cult_type }}, {{ item.place }}
              </RouterLink>
            </p>
          </td>
        </tr>

        <tr v-if="cult.dependent?.length">
          <th>Dependent Manifestation(s)</th>
          <td>
            <p v-for="item in cult.dependent" :key="item.id">
              <RouterLink :to="`/explore/cults/${item.id}`">
                {{ item.cult_type }}, {{ item.place }}
              </RouterLink>
            </p>
          </td>
        </tr>

        <tr v-if="cult.feast_day">
          <th>Feastday</th>
          <td>{{ convertDate(cult.feast_day) }}</td>
        </tr>

        <tr v-if="cult.colour">
          <th>Colour</th>
          <td>{{ cult.colour }}</td>
        </tr>

        <tr v-if="cult.comment">
          <th>Comment</th>
          <td v-html="cult.comment" class="comment"></td>
        </tr>

        <tr v-if="cult.created">
          <th>Created by</th>
          <td>{{ cult.created.first_name }} {{ cult.created.last_name }}</td>
        </tr>

        <tr v-if="cult.modified">
          <th>Modified by</th>
          <td>{{ cult.modified.first_name }} {{ cult.modified.last_name }}</td>
        </tr>
      </tbody>
    </table>

    <section v-if="cult.relation_cult_agent?.length">
      <h4>Saints in the Cult Manifestation</h4>

      <div class="grid">
        <RouterLink
          v-for="saint in cult.relation_cult_agent"
          :key="saint.id"
          :to="`/explore/saints/${saint.id}`"
        >
          {{ saint.name }}
          <span v-if="saint.agent_alternative">
            ({{ saint.agent_alternative }})
          </span>
        </RouterLink>
      </div>
    </section>

    <section v-if="cult.relation_other_agent?.length">
      <h4>People involved in the Cult Manifestation</h4>

      <div class="grid">
        <RouterLink
          v-for="person in cult.relation_other_agent"
          :key="person.id"
          :to="`/explore/people/${person.id}`"
        >
          {{ person.name }}
          <span v-if="person.role?.name">, {{ person.role.name }}</span>
        </RouterLink>
      </div>
    </section>

    <section v-if="cult.relation_other_place?.length">
      <h4>Related Places</h4>

      <div class="grid">
        <RouterLink
          v-for="placeRelation in cult.relation_other_place"
          :key="placeRelation.place.id"
          :to="`/explore/places/${placeRelation.place.id}`"
        >
          <span v-if="placeRelation.place_uncertainty">*</span>
          {{ placeRelation.place.name }},
          <span v-if="placeRelation.place.municipality">
            {{ placeRelation.place.municipality }},
          </span>
          {{ placeRelation.place.place_type?.name }}
        </RouterLink>
      </div>
    </section>

    <section v-if="cult.quote?.length">
      <h4>Quotes and References</h4>

      <Source
        v-for="quote in cult.quote"
        :key="quote.id"
        class="grid-container"
        :quote="quote"
        :name="quote.source.name"
        :source_id="quote.source"
      />
    </section>

    <section v-if="cult.relation_digital_resource?.length">
      <h4>Digital Objects for Manifestation</h4>

      <div v-for="uri in cult.relation_digital_resource" :key="uri.id">
        <span v-if="uri.resource_uncertainty" class="unc">*</span>
        <a :href="uri.resource_uri" target="_blank" class="links">
          {{ uri.resource_uri }}
        </a>
      </div>
    </section>

    <section
        v-if="
            cult.relation_iconographic?.length ||
            cult.relation_mb_resource?.length
        ">
            <h4>Images</h4>

            <template v-if="store.visualObj">
                <button class="frmbtn close-btn" @click="store.setVisualObj(null)">
                Close
                </button>
                <br />
                <VisualDetails />
            </template>

            <VisualGrid
                v-if="cult.relation_iconographic?.length"
                :obj="cult.relation_iconographic"
                tb="iconographic"
            />

            <VisualGrid
                v-if="cult.relation_mb_resource?.length"
                :obj="cult.relation_mb_resource"
                tb="shm_art"
            />
        </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useSaintsStore } from "@/stores/mode";
import { show } from "@/assets/db";

import Source from "@/components/Source.vue";
import VisualGrid from "@/components/VisualGrid.vue";
import VisualDetails from "@/components/VisualDetails.vue";

const route = useRoute();
const router = useRouter();
const store = useSaintsStore();

const cult = ref(null);

const id = computed(() => route.params.id);

function centerCultOnMap() {
  const coordinates = cult.value?.place?.geometry?.coordinates;

  if (!coordinates) return;

  store.setMapCenter(coordinates);
  store.setZoom(17);
}

function closeVisual() {
  store.setVisualObj(null);
}

function convertDate(item) {
  if (!item) return "";

  if (item.length === 2) {
    const month = Number(item);
    const date = new Date(Date.UTC(1980, month - 1));

    return date.toLocaleString("en-US", {
      month: "long",
    });
  }

  const [month, day] = item.split("-");
  const date = new Date(Date.UTC(1980, Number(month) - 1, Number(day)));

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
  });
}

async function loadCult() {
  if (route.name !== "cult" || !id.value) return;

  cult.value = null;
  store.setVisualObj(null);

  const response = await show("cult", id.value);
  const data = response?.data ?? response;

  if (!data || data === 0) return;

  cult.value = data;
  centerCultOnMap();
}

watch(
  () => route.params.id,
  loadCult,
  { immediate: true }
);

onMounted(() => {
  store.setVisualObj(null);
});

onBeforeUnmount(() => {
  store.setVisualObj(null);
});
</script>

<!-- <style scoped>
.hidden {
  display: none;
}

.close-btn {
  float: right;
}

.unc {
  font-weight: bold;
  display: inline;
}

span {
  display: inline;
}

.grid-container {
  display: block !important;
}

.grid {
  display: grid;
  grid-template-columns: auto auto;
  padding: 10px;
}

p {
  padding: 0;
}

td.comment p {
  padding: 0 !important;
}
</style> -->