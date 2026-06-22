<template>
    <splitpanes class="default-theme">
        <pane size="50%">
            <Map/>
        </pane>
        <pane size="50%">
            <ExplorePlaces/>
        </pane>
    </splitpanes>
</template>

<script setup>
import ExplorePlaces from '@/components/ExplorePlaces.vue';
import Map from '@/components/Map.vue';
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'


</script>