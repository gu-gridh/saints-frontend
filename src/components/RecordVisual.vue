<template>
  <aside v-if="record" :class="{ selectable }">
    <template v-if="!useOpenSeadragon">
      <figure v-if="mainImage[showingIdx]" class="main">
        <a :href="mainImage[showingIdx].url" target="_blank">
          <img :src="mainImage[showingIdx].thumb || mainImage[showingIdx].url" />
        </a>
      </figure>

      <div v-if="multiImage" style="text-align: center">
        <button
          class="icon-btn"
          :disabled="showingIdx === 0"
          @click="showPrevImage"
        >
          <img :src="`${publicPath}icons/arrow-left-circle-fill.svg`" />
        </button>

        {{ imgNavLabel }}

        <button
          class="icon-btn"
          :disabled="showingIdx === mainImage.length - 1"
          @click="showNextImage"
        >
          <img :src="`${publicPath}icons/arrow-right-circle-fill.svg`" />
        </button>
      </div>
    </template>

    <template v-else>
      <ZoomViewer :src="mainImageUrls" :type="imageType" />
    </template>

    <nav v-if="record.additional?.length">
      <figure :key="record.id" @click="selectRecord(record)">
        <img
          v-if="image(record.thumbnail)"
          :src="image(record.thumbnail).thumb || image(record.thumbnail).url"
        />
        <figcaption>{{ record.motif2 }}</figcaption>
      </figure>

      <figure
        v-for="obj in record.additional"
        :key="obj.id"
        @click="selectRecord(obj)"
      >
        <img
          v-if="image(obj.thumbnail)"
          :src="image(obj.thumbnail).thumb || image(obj.thumbnail).url"
        />
        <figcaption>{{ obj.motif2 }}</figcaption>
      </figure>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from "vue";

import { image as configImage } from "@/assets/config";
import ZoomViewer from "@/components/ZoomViewer.vue";

const props = defineProps({
  tb: {
    type: String,
    required: true,
  },
  id: {
    type: [String, Number],
    default: null,
  },
  record: {
    type: Object,
    default: null,
  },
  groupObjects: {
    type: [Array, Object],
    default: null,
  },
  selectable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["select"]);


const publicPath = import.meta.env.BASE_URL;
const showingIdx = ref(0);

const imageConfig = computed(() => configImage(props.tb));

const useOpenSeadragon = computed(() => {
  return imageConfig.value?.viewer === "openseadragon";
});

const mainImage = computed(() => {
  if (!imageConfig.value || !props.record) {
    return [];
  }

  if (imageConfig.value.field === "samsoek.images.filename") {
    let images = props.record.samsoek?.images ?? [];

    if (!Array.isArray(images)) {
      images = [images];
    }

    return images
      .filter(Boolean)
      .map((imageItem) => image(imageItem.filename));
  }

  const field = imageConfig.value.field;
  let imageIds = props.record[field];

  if (!imageIds) {
    return [];
  }

  if (!Array.isArray(imageIds)) {
    imageIds = [imageIds];
  }

  if (props.record.additional?.length) {
    imageIds = [...imageIds, props.record.additional[0].filename];
  }

  return imageIds.filter(Boolean).map((imageId) => image(imageId));
});

const mainImageUrls = computed(() => {
  return mainImage.value.map((img) => img.url);
});

const multiImage = computed(() => {
  return mainImage.value.length > 1;
});

const imgNavLabel = computed(() => {
  return `${showingIdx.value + 1} / ${mainImage.value.length}`;
});

const imageType = computed(() => {
  return imageConfig.value?.type;
});

function image(imageId) {
  if (!imageConfig.value || !imageId) {
    return null;
  }

  return {
    url: imageConfig.value.toUrl(imageId),
    thumb: imageConfig.value.toThumbUrl
      ? imageConfig.value.toThumbUrl(imageId)
      : null,
  };
}

function showPrevImage() {
  if (showingIdx.value > 0) {
    showingIdx.value -= 1;
  }
}

function showNextImage() {
  if (showingIdx.value < mainImage.value.length - 1) {
    showingIdx.value += 1;
  }
}

function selectRecord(selectedRecord) {
  if (!props.selectable) return;

  emit("select", selectedRecord);
}

watch(
  () => [props.tb, props.id],
  () => {
    showingIdx.value = 0;
  }
);
</script>

<style scoped>
figure.main {
  text-align: center;
}

figure.main img {
  max-height: 300px;
}

nav {
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  figure {
    width: 200px;
    margin: 0.5rem;

    .selectable & {
      cursor: pointer;
    }

    img {
      width: 100%;
      height: auto;
    }
  }
}

.icon-btn {
  border: none;
  background-color: white;
}

button:disabled img {
  filter: opacity(0.2);
}
</style>