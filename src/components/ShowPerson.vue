<template>
  <div v-if="person" id="show" class="tabcontent" :key="`${tb} ${id}`">
    <button v-if="store.mode !== 'advanced'" class="frmbtn" @click="router.back()">
      ← Back
    </button>

    <h2>
      {{ person.name }}
      <small>{{ type === 'saint' ? 'Saint' : 'Person' }}</small>
    </h2>

    <table class="data-table">
      <tbody>
        <tr>
          <th>Attested names</th>
          <td class="grid">
            <span v-for="(name, index) in person.agent_names" :key="index">
              <span v-if="name.language" class="lang">{{ name.language }}</span>
              <em>{{ name.name }}</em>
            </span>
          </td>
        </tr>

        <tr v-if="person.agent_type?.length">
          <th>Roles</th>
          <td class="grid">
            <span v-for="role in person.agent_type" :key="role.id">
              {{ role.name }}
            </span>
          </td>
        </tr>

        <tr v-if="person.feast_day?.length">
          <th>Feast days</th>
          <td class="grid">
            <span v-for="(day, index) in person.feast_day" :key="index">
              {{ convertDate(day.day) }} - {{ day.type }}
            </span>
          </td>
        </tr>

        <tr>
          <th>Gender</th>
          <td>{{ person.gender }}</td>
        </tr>

        <tr v-if="person.not_before">
          <th>Attested Dates</th>
          <td>{{ person.not_before }}</td>
        </tr>

        <tr v-if="person.held_office?.length">
          <th>Offices</th>
          <td class="grid">
            <span v-for="(off, index) in person.held_office" :key="index">
              {{ off.role.name }},
              {{ off.organization.name }},
              {{ off.not_before }} - {{ off.not_after }}
            </span>
          </td>
        </tr>

        <tr v-if="person.attributes">
          <th>Attributes</th>
          <td>{{ person.attributes }}</td>
        </tr>

        <tr v-if="person.comment">
          <th>Comment</th>
          <td v-html="person.comment" class="comment"></td>
        </tr>
      </tbody>
    </table>

    <section>
      <h4>Manifestations</h4>

      <div v-if="manifestations.length" class="grid">
        <div v-for="(cult, index) in manifestations" :key="index" class="grid-item">
          <RouterLink :to="`/explore/cults/${cult.cult.id}`">
            {{ cult.cult.cult_type }},
            {{ cult.cult.place }},
            {{ cult.cult.minyear }}-{{ cult.cult.maxyear }}
          </RouterLink>
        </div>
      </div>

      <div v-else>--</div>

      <div v-if="person.relation_cult_agent?.length > pageSize - 1" class="my-2 nav">
        <button class="frmbtn" :disabled="page <= 1" @click="goBack">←</button>

        <span>
          Page {{ page }} of {{ pageCount }}
          ({{ person.relation_cult_agent.length }} items)
        </span>

        <button class="frmbtn" :disabled="page >= pageCount" @click="fetchMore">
          →
        </button>
      </div>

      <div v-else style="text-align: center;">
        <span>({{ person.relation_cult_agent?.length || 0 }} items)</span>
      </div>
    </section>

    <section v-if="person.relation_other_agent?.length">
      <h4>Related manifestations</h4>

      <div class="grid">
        <div
          v-for="(cult, index) in person.relation_other_agent"
          :key="index"
          class="grid-item"
        >
          <RouterLink :to="`/explore/cults/${cult.cult.id}`">
            {{ cult.cult.place }},
            {{ cult.cult.cult_type }},
            {{ cult.role.name }}
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useSaintsStore } from '@/stores/mode.js'
import { show } from '@/assets/db'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})

const route = useRoute()
const router = useRouter()
const store = useSaintsStore()

const person = ref(null)
const page = ref(1)
const pageSize = 100
const pageCount = ref(1)
const manifestations = ref([])

const tb = 'person'
const id = computed(() => route.params.id)

function convertDate(item) {
  if (item === '00-00' || item === '*') return ''

  let date
  const option = {
    month: 'short',
  }

  if (/^\d{2}-\d{2}$/.test(item)) {
    const [month, day] = item.split('-')
    date = new Date(Date.UTC(1980, Number(month) - 1, Number(day)))
    option.day = 'numeric'
  } else {
    date = new Date(Date.UTC(1980, Number(item) - 1))
  }

  return date.toLocaleString('en-US', option)
}

function updateManifestations() {
  const all = person.value?.relation_cult_agent || []

  pageCount.value = Math.ceil(all.length / pageSize) || 1

  manifestations.value = all.slice(
    (page.value - 1) * pageSize,
    page.value * pageSize
  )
}

function fetchMore() {
  if (page.value >= pageCount.value) return
  page.value++
  updateManifestations()
}

function goBack() {
  if (page.value <= 1) return
  page.value--
  updateManifestations()
}

async function loadPerson() {
  if (!id.value) return

  person.value = null
  manifestations.value = []
  page.value = 1

  const table = props.type === 'saint' ? 'saints' : 'people'
  const data = await show(table, id.value)

  if (!data || data.id === 0) return

  person.value = data

  const all = person.value.relation_cult_agent || []

  all.sort((a, b) =>
    (a.cult?.cult_type || '').localeCompare(b.cult?.cult_type || '')
  )

  pageCount.value = Math.ceil(all.length / pageSize) || 1
  manifestations.value = all.slice(0, pageSize)
}

watch(
  () => [route.params.id, props.type],
  loadPerson,
  { immediate: true }
)
</script>