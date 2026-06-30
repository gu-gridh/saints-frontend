<template>
  <div ref="osd" class="osd">
    <div id="ToolbarHorizontal" v-if="src.length > 1">
      <div id="CenterNav">
        <a id="previous" href="#previous-page">
          <div id="Prev" class="NavButton"></div>
        </a>

        <span id="currentpage">
          {{ currentImg + 1 }} / {{ src.length }}
        </span>

        <a id="next" href="#next-page">
          <div id="Next" class="NavButton"></div>
        </a>
      </div>
    </div>

    <div id="ToolbarVertical">
      <a id="full-page" href="#full-page">
        <div id="FullPage" class="NavButton"></div>
      </a>

      <a id="zoom-in" href="#zoom-in">
        <div id="ZoomIn" class="NavButton"></div>
      </a>

      <a id="zoom-out" href="#zoom-out">
        <div id="ZoomOut" class="NavButton"></div>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import OpenSeadragonModule from "openseadragon";
import { useSaintsStore } from "@/stores/mode";

const OpenSeadragon =
  OpenSeadragonModule.default || OpenSeadragonModule.OpenSeadragon || OpenSeadragonModule;

const props = defineProps({
  src: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    default: "",
  },
});

const store = useSaintsStore();

const osd = ref(null);
const viewer = ref(null);
const currentImg = ref(0);

const tileSource = computed(() => {
  if (props.type === "pyramid") {
    return props.src;
  }

  return props.src.map((src) => ({
    type: "image",
    url: src,
  }));
});

function setTileSource() {
  if (!viewer.value) return;

  currentImg.value = 0;
  viewer.value.open(tileSource.value);
}

onMounted(() => {
  viewer.value = OpenSeadragon({
    homeFillsViewer: false,
    minZoomImageRatio: 0.3,
    prefixUrl: "/osd/",
    element: osd.value,
    immediateRender: true,
    fullPageButton: "full-page",
    nextButton: "next",
    previousButton: "previous",
    zoomInButton: "zoom-in",
    zoomOutButton: "zoom-out",
    sequenceMode: true,
    drawer: "canvas",
  });

  viewer.value.addHandler("page", (data) => {
    currentImg.value = data.page;
  });

  viewer.value.addHandler("full-page", (data) => {
    if (!data.fullPage) {
      store.bumpUpdateSize();
    }
  });

  setTileSource();
});

watch(
  () => props.src,
  () => {
    setTileSource();
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (viewer.value) {
    viewer.value.destroy();
    viewer.value = null;
  }
});
</script>

<style scoped>
.osd {
  height: 50vh;
  background-color: #000000c9;
  position: relative;
  width: 100%;
  margin-bottom: 15px;
}

#ToolbarHorizontal {
  position: absolute;
  display: flex;
  bottom: 20px;
  width: 100%;
  z-index: 1000;
}

#CenterNav {
  margin: auto;
}

#ToolbarHorizontal span {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  text-align: center;
  padding: 5px 10px;
  border-radius: 10px;
  font-weight: bold;
  vertical-align: 13px;
  margin-left: 10px;
  margin-right: 10px;
}

#ToolbarVertical {
  position: absolute;
  margin-top: 20px;
  width: 60px;
  margin-left: 20px;
  z-index: 1000;
}

#FullPage {
  background: url("@/assets/icons/fullpage.png");
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
  background-color: black;
}

#Prev {
  background: url("@/assets/icons/prev.png");
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
  background-color: black;
  display: inline-block;
  position: relative;
}

#Next {
  background: url("@/assets/icons/next.png");
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
  background-color: black;
  display: inline-block;
  position: relative;
}

#ZoomIn {
  background: url("@/assets/icons/plus.png");
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
  background-color: black;
  margin-top: 10px;
}

#ZoomOut {
  background: url("@/assets/icons/minus.png");
  background-size: 40px 40px;
  background-repeat: no-repeat;
  background-position: center;
  background-color: black;
}

.NavButton {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  opacity: 0.5;
}

.NavButton:hover {
  opacity: 1;
}
</style>