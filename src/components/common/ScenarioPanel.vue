<template>
  <div class="scenario-panel">

    <!-- ① 헤더 -->
    <div class="panel-header">
      <h2 class="panel-header__title">녹색도시 개발계획 평가 시뮬레이션</h2>
      <button class="panel-header__project-btn" @click="$emit('project-click')">
        <v-icon size="12">mdi-folder-outline</v-icon>
        <span>프로젝트</span>
      </button>
    </div>

    <!-- ② 시나리오 탭 (1안·2안·3안) -->
    <div class="plan-tabs">
      <button
        v-for="plan in plans"
        :key="plan.value"
        class="plan-tab"
        :class="{ 'plan-tab--active': scenarioStore.activePlan === plan.value }"
        @click="scenarioStore.setActivePlan(plan.value)"
      >
        {{ plan.label }}
      </button>
    </div>

    <!-- ③④⑤ 각 안별 독립 PlanPanel (v-show: 탭 전환 시 각 안 상태 보존) -->
    <PlanPanel
      v-for="plan in plans"
      v-show="scenarioStore.activePlan === plan.value"
      :key="plan.value"
      :plan-id="plan.value"
      @file-upload-click="$emit('file-upload-click')"
      @next="$emit('next')"
    />

  </div>
</template>

<script setup>
import PlanPanel from '@/components/scenario/PlanPanel.vue'
import { useScenarioStore } from '@/stores/scenario'

defineProps({
  projectName: { type: String, default: '' },
})
defineEmits(['close', 'next', 'project-click', 'file-upload-click'])

const scenarioStore = useScenarioStore()

const plans = [
  { value: '1', label: '1안' },
  { value: '2', label: '2안' },
  { value: '3', label: '3안' },
]
</script>

<style lang="scss" scoped>
// ─── Panel Root ──────────────────────────────────────────────────────
.scenario-panel {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--panel-width);
  height: 100%;
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  z-index: var(--z-panel);
  overflow: hidden;
}

// ─── ① Header ────────────────────────────────────────────────────────
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  padding: 0 20px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;

  &__title {
    font-size: var(--fs-2xl);
    font-weight: var(--fw-bold);
    color: var(--color-text-title);
    letter-spacing: var(--ls-tight);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 8px;
  }

  &__project-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 12px;
    background: var(--color-white);
    border: 1px solid var(--color-border-nav);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--fs-md);
    font-weight: var(--fw-medium);
    color: var(--color-text-secondary);
    letter-spacing: var(--ls-tight);
    white-space: nowrap;
    flex-shrink: 0;
    transition: background var(--transition-fast);

    &:hover { background: var(--color-surface-section); }
  }
}

// ─── ② Tabs ──────────────────────────────────────────────────────────
.plan-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border-tab);
  flex-shrink: 0;
}

.plan-tab {
  flex: 1;
  height: var(--tab-h);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--color-text-tab);
  letter-spacing: var(--ls-tight);
  background: var(--color-white);
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);

  &--active {
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }

  &:hover:not(&--active) {
    background: var(--color-surface-section);
  }
}
</style>
