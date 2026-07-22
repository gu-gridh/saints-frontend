<template>
  <p v-if="loading">Loading table...</p>

  <p v-else-if="error">
    Could not load the table.
  </p>

  <div v-else class="table-wrapper">
    <table class="cult-type-table">
      <thead>
        <tr>
          <th scope="col">Type of Evidence</th>
          <th scope="col">Intermediate</th>
          <th scope="col">Specific Evidence Types</th>
        </tr>
      </thead>

      <tbody>
        <template
          v-for="category in categories"
          :key="category.id"
        >
          <tr
            v-for="(group, groupIndex) in category.groups"
            :key="group.id"
            :class="categoryClass(category)"
          >
            <th
              v-if="groupIndex === 0"
              scope="rowgroup"
              :rowspan="category.groups.length"
              class="category-cell"
            >
              {{ category.name }}
            </th>

            <th scope="row" class="group-cell">
              {{ group.name }}
            </th>

            <td>
              <template
                v-for="(item, itemIndex) in group.items"
                :key="item.id"
              >
                <span v-if="itemIndex > 0">, </span>
                <span>{{ item.name }}</span>
              </template>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useCultTypeTable } from '@/composables/useCultTypeTable'

const { categories, loading, error } = useCultTypeTable()

function categoryClass(category) {
  return `category-${category.id}`
}
</script>

<style scoped>
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  font-size: smaller;
}

.cult-type-table {
  width: 100%;
  border-collapse: collapse;
}

.cult-type-table th,
.cult-type-table td {
  padding: 0.75rem;
  border: 1px solid #222;
  text-align: left;
  vertical-align: top;
}

.cult-type-table thead th {
  background: var(--contrast-color-menu-light);
  font-weight: 700;
}

.category-cell {
  width: 18%;
}

.group-cell {
  width: 25%;
}

.category-2, .category-4 > * {
  background: var(--light-grey);
}

@media (max-width: 768px) {
  .cult-type-table {
    min-width: 750px;
  }
}
</style>