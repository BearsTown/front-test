<template>
  <div class="green-city-view">

    <!-- 좌측 네비게이션 (항상 표시, 지도 위에 독립) -->
    <LeftNav
      :active-menu="activeMenu"
      @menu-click="handleMenuClick"
    />

    <!-- 지도 영역 (패널들의 기준 컨테이너) -->
    <div class="green-city-view__map-wrap">

      <OlMap
        ref="mapRef"
        :zoom="mapZoom"
        @zoom-change="mapZoom = $event"
        @map-ready="onMapReady"
      />

      <!-- 시나리오 패널 — 지도 위 왼쪽 absolute 슬라이드 -->
      <transition name="slide-left">
        <ScenarioPanel v-if="activeMenu === 'scenario'" />
      </transition>

      <!-- 지도 컨트롤 — 결과창 오픈 시 오른쪽으로 밀림 -->
      <MapControlPanel
        :zoom-level="mapZoom"
        :right-offset="resultOpen ? 500 : 0"
        @zoom-in="mapRef?.zoomIn()"
        @zoom-out="mapRef?.zoomOut()"
        @zoom-change="mapRef?.setZoom($event)"
      />

      <!-- 탄소 결과 오버레이 — 지도 위 오른쪽 absolute 슬라이드 -->
      <CarbonResultOverlay />

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LeftNav             from '@/components/LeftNav.vue'
import ScenarioPanel       from '@/components/ScenarioPanel.vue'
import OlMap               from '@/components/map/OlMap.vue'
import MapControlPanel     from '@/components/map/MapControlPanel.vue'
import CarbonResultOverlay from '@/components/CarbonResultOverlay.vue'
import { useCarbonResultStore } from '@/stores/carbonResultStore'

const activeMenu = ref(null)
const mapZoom    = ref(13)
const mapRef     = ref(null)

const carbonResultStore = useCarbonResultStore()
const resultOpen = computed(() => carbonResultStore.isOpen)

const handleMenuClick = (id) => {
  activeMenu.value = activeMenu.value === id ? null : id
}

const onMapReady = (map) => {
  mapZoom.value = Math.round(map.getView().getZoom())
}
</script>

<style lang="scss" scoped>
.green-city-view {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  &__map-wrap {
    position: relative;
    flex: 1;
    overflow: hidden;
  }
}

// ── ScenarioPanel: 왼쪽에서 슬라이드 인/아웃 ────────
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
