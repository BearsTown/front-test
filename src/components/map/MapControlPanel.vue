<template>
  <div
    class="map-control-panel"
    :style="{ right: rightOffset + 'px', transition: 'right 0.25s ease' }"
  >
    <div class="map-control-panel__tools">
      <button class="ctrl-btn" title="레이어"><v-icon size="20">mdi-layers-outline</v-icon></button>
      <button class="ctrl-btn" title="범례"><v-icon size="20">mdi-map-legend</v-icon></button>
      <button class="ctrl-btn" title="인쇄"><v-icon size="20">mdi-printer-outline</v-icon></button>
      <button class="ctrl-btn" title="측정"><v-icon size="20">mdi-ruler-square</v-icon></button>
    </div>

    <div class="map-control-panel__divider"></div>

    <div class="map-control-panel__zoom">
      <button class="ctrl-btn" title="확대" @click="$emit('zoom-in')">
        <v-icon size="20">mdi-plus</v-icon>
      </button>
      <div class="zoom-level">{{ zoomLevel }}</div>
      <div class="zoom-slider-wrap">
        <input
          class="zoom-slider"
          type="range"
          :min="minZoom"
          :max="maxZoom"
          :value="zoomLevel"
          orient="vertical"
          @input="$emit('zoom-change', Number($event.target.value))"
        />
      </div>
      <button class="ctrl-btn" title="축소" @click="$emit('zoom-out')">
        <v-icon size="20">mdi-minus</v-icon>
      </button>
    </div>

    <div class="map-control-panel__divider"></div>

    <div class="map-control-panel__bottom">
      <button class="ctrl-btn" title="현재 위치" @click="$emit('locate')">
        <v-icon size="20">mdi-account-circle-outline</v-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  zoomLevel:   { type: Number, default: 17 },
  minZoom:     { type: Number, default: 1 },
  maxZoom:     { type: Number, default: 21 },
  rightOffset: { type: Number, default: 0 },
})
defineEmits(['zoom-in', 'zoom-out', 'zoom-change', 'locate'])
</script>

<style lang="scss" scoped>
.map-control-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 48px;
  background: $color-white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  padding: 8px 0;

  &__tools  { display: flex; flex-direction: column; gap: 2px; padding: 4px 0; }
  &__zoom   { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; }
  &__bottom { margin-top: auto; padding: 4px 0; }

  &__divider {
    width: 28px;
    height: 1px;
    background: #e0e0e0;
    margin: 4px 0;
  }
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #555;
  transition: background 0.2s;

  &:hover { background: #f0f0f0; color: $color-primary; }
}

.zoom-level {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.zoom-slider-wrap {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-slider {
  -webkit-appearance: slider-vertical;
  appearance: slider-vertical;
  writing-mode: vertical-lr;
  direction: rtl;
  width: 4px;
  height: 80px;
  accent-color: $color-primary;
  cursor: pointer;
}
</style>
