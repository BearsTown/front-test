import { defineStore } from 'pinia'
import { reactive } from 'vue'

/**
 * 레이어 객체 형태
 * {
 *   id:      string,   - 고유 ID
 *   name:    string,   - 표시명 (파일명 등)
 *   type:    'shp' | 'wms' | 'geojson',  - 레이어 종류
 *   visible: boolean,  - 표출 여부
 *   data:    object | null,  - GeoJSON payload (shp/geojson). wms는 null
 * }
 */

export const useLayerStore = defineStore('layer', () => {
  // ── 공통 레이어 ───────────────────────────────────
  // 안(plan) 전환과 무관하게 항상 지도에 표출
  const commonLayers = reactive([])

  function addCommonLayer(layer) {
    commonLayers.push(layer)
  }

  function removeCommonLayer(layerId) {
    const idx = commonLayers.findIndex(l => l.id === layerId)
    if (idx !== -1) commonLayers.splice(idx, 1)
  }

  function toggleCommonLayerVisible(layerId) {
    const layer = commonLayers.find(l => l.id === layerId)
    if (layer) layer.visible = !layer.visible
  }

  // ── 안별 고유 레이어 ──────────────────────────────
  // 1~3안 전환 시 해당 안의 레이어만 지도에 표출
  const planLayers = reactive({
    '1': [],
    '2': [],
    '3': [],
  })

  function addPlanLayer(planId, layer) {
    planLayers[planId].push(layer)
  }

  function removePlanLayer(planId, layerId) {
    const arr = planLayers[planId]
    const idx = arr.findIndex(l => l.id === layerId)
    if (idx !== -1) arr.splice(idx, 1)
  }

  function togglePlanLayerVisible(planId, layerId) {
    const layer = planLayers[planId].find(l => l.id === layerId)
    if (layer) layer.visible = !layer.visible
  }

  function clearPlanLayers(planId) {
    planLayers[planId].splice(0)
  }

  return {
    // 공통 레이어
    commonLayers,
    addCommonLayer,
    removeCommonLayer,
    toggleCommonLayerVisible,
    // 안별 레이어
    planLayers,
    addPlanLayer,
    removePlanLayer,
    togglePlanLayerVisible,
    clearPlanLayers,
  }
})
