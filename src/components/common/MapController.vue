<template>
  <div class="map-controller">
    <!-- 지도설정 -->
    <button class="ctrl-btn" title="지도설정" @click="$emit('map-setting')">
      <v-icon size="18">mdi-map-outline</v-icon>
    </button>

    <!-- 레이어 -->
    <button class="ctrl-btn" title="레이어" @click="$emit('layer')">
      <v-icon size="22">mdi-layers-outline</v-icon>
    </button>

    <!-- 정보보기 -->
    <button class="ctrl-btn" title="정보보기" @click="$emit('info')">
      <v-icon size="22">mdi-view-split-vertical</v-icon>
    </button>

    <!-- 출력 -->
    <button class="ctrl-btn" title="출력" @click="$emit('print')">
      <v-icon size="20">mdi-printer-outline</v-icon>
    </button>

    <!-- 측정 -->
    <button class="ctrl-btn" title="측정" @click="$emit('measure')">
      <v-icon size="20">mdi-ruler-square</v-icon>
    </button>

    <!-- 이동 -->
    <button class="ctrl-btn" title="이동" @click="$emit('move')">
      <v-icon size="22">mdi-cursor-move</v-icon>
    </button>

    <!-- 확대 (+) -->
    <button class="ctrl-btn" title="확대" @click="zoomIn">
      <v-icon size="20">mdi-plus</v-icon>
    </button>

    <!-- 줌 레벨 표시 -->
    <div class="ctrl-btn zoom-level">
      <span>{{ zoomLevel }}</span>
    </div>

    <!-- 줌 슬라이더 -->
    <div class="ctrl-slider-wrap">
      <div class="ctrl-slider-track">
        <div
          class="ctrl-slider-fill"
          :style="{ height: sliderFillHeight }"
        />
        <div
          class="ctrl-slider-thumb"
          :style="{ top: thumbPosition }"
          @mousedown="startDrag"
        />
        <div class="ctrl-slider-ticks">
          <div v-for="n in 12" :key="n" class="tick" />
        </div>
      </div>
    </div>

    <!-- 축소 (-) -->
    <button class="ctrl-btn" title="축소" @click="zoomOut">
      <v-icon size="20">mdi-minus</v-icon>
    </button>

    <!-- 내 위치 -->
    <button class="ctrl-btn" title="내 위치" @click="$emit('locate')">
      <v-icon size="20">mdi-map-marker-outline</v-icon>
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['map-setting', 'layer', 'info', 'print', 'measure', 'move', 'locate'])

const MIN_ZOOM = 1
const MAX_ZOOM = 22
const zoomLevel = ref(17)

const sliderFillHeight = computed(() => {
  const pct = ((zoomLevel.value - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
  return `${pct}%`
})

const thumbPosition = computed(() => {
  const pct = 1 - (zoomLevel.value - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)
  return `${pct * 100}%`
})

const zoomIn = () => {
  if (zoomLevel.value < MAX_ZOOM) zoomLevel.value++
}
const zoomOut = () => {
  if (zoomLevel.value > MIN_ZOOM) zoomLevel.value--
}

let dragging = false
const startDrag = (e) => {
  dragging = true
  const onMove = (ev) => {
    if (!dragging) return
    const track = ev.currentTarget?.parentElement
    if (!track) return
    const rect = track.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height))
    zoomLevel.value = Math.round(MAX_ZOOM - pct * (MAX_ZOOM - MIN_ZOOM))
  }
  const onUp = () => {
    dragging = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
</script>

<style lang="scss" scoped>
.map-controller {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 36px;
  filter: drop-shadow(2px 0px 12px rgba(0, 0, 0, 0.08));
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  background: $color-white;
  border: none;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background $transition-fast;

  :deep(.v-icon) {
    color: $color-gray-800;
  }

  &:hover {
    background: $color-gray-50;
  }

  &.zoom-level {
    cursor: default;
    &:hover { background: $color-white; }

    span {
      font-size: $font-size-sm;
      font-weight: $font-weight-semibold;
      color: $color-primary;
      letter-spacing: -0.24px;
    }
  }
}

// Zoom slider
.ctrl-slider-wrap {
  width: 36px;
  height: 160px;
  background: $color-white;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ctrl-slider-track {
  position: relative;
  width: 4px;
  height: 128px;
  background: $color-gray-300;
  border-radius: $radius-full;
}

.ctrl-slider-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: $color-primary;
  border-radius: $radius-full;
  transition: height 0.1s;
}

.ctrl-slider-thumb {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: $color-white;
  border: 2px solid $color-primary;
  border-radius: $radius-sm;
  cursor: grab;
  z-index: 1;
  transition: top 0.1s;

  &:active {
    cursor: grabbing;
  }
}

.ctrl-slider-ticks {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
  padding: 0 6px;
}

.tick {
  width: 100%;
  height: 1px;

  &:nth-child(odd) {
    background: $color-gray-400;
  }
  &:nth-child(even) {
    background: $color-gray-200;
  }
}
</style>
