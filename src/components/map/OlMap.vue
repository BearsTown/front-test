<template>
  <div ref="mapContainer" class="ol-map"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat } from 'ol/proj'
import 'ol/ol.css'

const props = defineProps({
  center: { type: Array, default: () => [127.1388, 37.4449] },
  zoom:   { type: Number, default: 13 }
})

const emit = defineEmits(['zoom-change', 'map-ready'])

const mapContainer = ref(null)
let map = null

onMounted(() => {
  map = new Map({
    target: mapContainer.value,
    layers: [ new TileLayer({ source: new OSM() }) ],
    view: new View({
      center: fromLonLat(props.center),
      zoom: props.zoom,
      minZoom: 1,
      maxZoom: 21
    }),
    controls: []
  })

  map.getView().on('change:resolution', () => {
    emit('zoom-change', Math.round(map.getView().getZoom()))
  })

  emit('map-ready', map)
})

onUnmounted(() => {
  if (map) { map.setTarget(null); map = null }
})

const zoomIn  = () => map?.getView().animate({ zoom: map.getView().getZoom() + 1, duration: 250 })
const zoomOut = () => map?.getView().animate({ zoom: map.getView().getZoom() - 1, duration: 250 })
const setZoom = (level) => map?.getView().animate({ zoom: level, duration: 250 })

defineExpose({ zoomIn, zoomOut, setZoom })
</script>

<style lang="scss" scoped>
.ol-map {
  width: 100%;
  height: 100%;
}
</style>
