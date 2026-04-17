<template>
  <aside class="scenario-panel">

    <div class="scenario-panel__header">
      <h2 class="scenario-panel__title">녹색도시 개발계획 평가 시뮬레이션</h2>
      <router-link to="/" class="scenario-panel__home">
        <v-icon size="13">mdi-home-outline</v-icon>
        <span>메인으로</span>
      </router-link>
    </div>

    <div class="scenario-panel__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-btn"
        :class="{ 'is-active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <ScenarioTabContent
      v-for="tab in tabs"
      :key="tab.value"
      :tab-id="tab.value"
      v-show="activeTab === tab.value"
    />

  </aside>
</template>

<script setup>
import { ref } from 'vue'
import ScenarioTabContent from '@/components/ScenarioTabContent.vue'

const activeTab = ref('1')
const tabs = [
  { value: '1', label: '1안' },
  { value: '2', label: '2안' },
  { value: '3', label: '3안' }
]
</script>

<style lang="scss" scoped>
.scenario-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 440px;
  z-index: 50;
  background: $color-white;
  border-right: 1px solid $color-border;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid $color-border;
    gap: 8px;
    flex-shrink: 0;
  }

  &__title {
    font-size: 13px;
    font-weight: 700;
    color: $color-text-dark;
    line-height: 1.4;
    flex: 1;
  }

  &__home {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: $color-text-muted;
    white-space: nowrap;
    text-decoration: none;
    padding: 4px 8px;
    border: 1px solid $color-border-mid;
    border-radius: 4px;
    transition: color 0.15s, border-color 0.15s;

    &:hover { color: $color-primary; border-color: $color-primary; }
  }

  &__tabs {
    display: flex;
    border-bottom: 1px solid $color-border;
    flex-shrink: 0;
  }
}

.tab-btn {
  flex: 1;
  padding: 11px 8px;
  font-size: 15px;
  font-weight: 500;
  color: $color-text-muted;
  border-bottom: 3px solid transparent;
  transition: all 0.18s;
  text-align: center;
  background: transparent;

  &.is-active {
    color: $color-primary;
    border-bottom-color: $color-primary;
    font-weight: 600;
    background: $color-primary-bg;
  }

  &:hover:not(.is-active) {
    color: $color-text-body;
    background: $color-neutral-05;
  }
}
</style>
