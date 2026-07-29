<template>
  <div ref="mapEl" class="the-map" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import OLMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import Feature from 'ol/Feature'
import PointGeom from 'ol/geom/Point'
import CircleStyle from 'ol/style/Circle'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import Text from 'ol/style/Text'
import { fromLonLat } from 'ol/proj'
import { createEmpty, extend, isEmpty } from 'ol/extent'
import { defaults as defaultControls } from 'ol/control'
import { useScenarioStore } from '@/stores/scenario'
import { useLayerStore } from '@/stores/layer'
import { useMapStore } from '@/stores/map'

const mapEl = ref(null)
let map = null

const scenarioStore = useScenarioStore()
const layerStore    = useLayerStore()
const mapStore      = useMapStore()

// ── 평가 포인트 레이어 ────────────────────────────────
const evalPointSource = new VectorSource()
const evalPointLayer  = new VectorLayer({
  source: evalPointSource,
  zIndex: 100,
  style: feature => new Style({
    image: new CircleStyle({
      radius: 9,
      fill:   new Fill({ color: '#256EF4' }),
      stroke: new Stroke({ color: '#ffffff', width: 2.5 }),
    }),
    text: new Text({
      text:       feature.get('label') ?? '',
      font:       'bold 11px Pretendard, sans-serif',
      fill:       new Fill({ color: '#333' }),
      stroke:     new Stroke({ color: '#fff', width: 3 }),
      offsetY:    -20,
      textAlign:  'center',
    }),
  }),
})

// 현재 표출 중인 안별 OL 레이어 (planId 전환 시 교체)
const activePlanOLLayers = new Map()   // layerId → VectorLayer
// 공통 레이어 (항상 표출)
const commonOLLayers = new Map()       // layerId → VectorLayer
// 안별 최초 fitBounds 완료 여부
const fittedPlans = new Set()

// ── 유틸 ─────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ── OL 레이어 팩토리 ──────────────────────────────────
function createOLLayer(layer) {
  if ((layer.type === 'shp' || layer.type === 'geojson') && layer.data) {
    const features = new GeoJSON().readFeatures(layer.data, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    })
    const source = new VectorSource({ features })

    return new VectorLayer({
      source,
      style: (feature) => {
        const hex = feature.get('color') ?? '#256EF4'
        return new Style({
          fill: new Fill({ color: hexToRgba(hex, 0.65) }),
          stroke: new Stroke({ color: '#ffffff', width: 1.5 }),
        })
      },
    })
  }
  // wms 등 다른 타입은 추후 분기 추가
  return null
}

// ── 안별 레이어 렌더링 ────────────────────────────────
function renderCurrentPlanLayers() {
  if (!map) return

  // 기존 안별 레이어 제거
  activePlanOLLayers.forEach(l => map.removeLayer(l))
  activePlanOLLayers.clear()

  const planId = scenarioStore.activePlan
  const layers = layerStore.planLayers[planId] ?? []
  const shouldFit = !fittedPlans.has(planId) && layers.some(l => l.visible)

  layers.filter(l => l.visible).forEach(layer => {
    const olLayer = createOLLayer(layer)
    if (!olLayer) return
    map.addLayer(olLayer)
    activePlanOLLayers.set(layer.id, olLayer)
  })

  // 안별 최초 레이어 추가 시 한 번만 범위 맞춤
  if (shouldFit && activePlanOLLayers.size > 0) {
    const extent = createEmpty()
    activePlanOLLayers.forEach(l => extend(extent, l.getSource().getExtent()))
    if (!isEmpty(extent)) {
      map.getView().fit(extent, { padding: [60, 60, 60, 60], duration: 300 })
    }
    fittedPlans.add(planId)
  }
}

// ── 공통 레이어 렌더링 ────────────────────────────────
function renderCommonLayers() {
  if (!map) return

  commonOLLayers.forEach(l => map.removeLayer(l))
  commonOLLayers.clear()

  layerStore.commonLayers.filter(l => l.visible).forEach(layer => {
    const olLayer = createOLLayer(layer)
    if (!olLayer) return
    map.addLayer(olLayer)
    commonOLLayers.set(layer.id, olLayer)
  })
}

// ── Watch: 안 전환 또는 현재 안의 레이어 변경 ────────────
// activePlan은 primitive(string)이므로 게터, planLayers는 reactive 객체이므로 직접 전달
watch(
  [() => scenarioStore.activePlan, layerStore.planLayers],
  renderCurrentPlanLayers,
  { deep: true },
)

// ── Watch: 평가 포인트 마커 ──────────────────────────
watch(
  () => ({ ...mapStore.evalPoints }),
  points => {
    evalPointSource.clear()
    Object.entries(points).forEach(([id, p]) => {
      const f = new Feature({ geometry: new PointGeom(fromLonLat([p.lng, p.lat])) })
      f.setId(id)
      f.set('label', p.name)
      evalPointSource.addFeature(f)
    })
  },
  { deep: true },
)

// ── Watch: 공통 레이어 변경 ───────────────────────────
// reactive 배열을 직접 전달 → in-place 변이(push/splice) 감지 보장
watch(
  layerStore.commonLayers,
  renderCommonLayers,
  { deep: true },
)

onMounted(() => {
  map = new OLMap({
    target: mapEl.value,
    layers: [
      new TileLayer({ source: new OSM() }),
      evalPointLayer,
    ],
    view: new View({
      center: fromLonLat([126.9156, 35.1447]),
      zoom: 13,
    }),
    // 기본 줌 컨트롤 제거 (앱 자체 MapController 사용)
    controls: defaultControls({ zoom: false, rotate: false }),
  })

  renderCommonLayers()
  renderCurrentPlanLayers()
})

onUnmounted(() => {
  if (map) {
    map.setTarget(null)
    map = null
  }
})
</script>

<style scoped>
.the-map {
  width: 100%;
  height: 100%;
}
</style>
