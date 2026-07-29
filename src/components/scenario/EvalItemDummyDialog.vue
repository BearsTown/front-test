<template>
  <div class="eval-cd">

    <!-- 헤더 -->
    <div class="eval-cd__header">
      <span class="eval-cd__title">{{ item?.title ?? '-' }}</span>
      <button class="eval-cd__close" @click="$emit('close')">
        <v-icon size="24">mdi-close</v-icon>
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="eval-cd__loading">
      <v-progress-circular size="20" width="2" indeterminate color="#256EF4" />
    </div>

    <!-- 본문 -->
    <div v-else class="eval-cd__body">
      <div class="dummy-body">
        <v-icon size="36" color="#d5d5d5">mdi-tools</v-icon>
        <p class="dummy-body__msg">산정 로직 구현 예정</p>
        <p class="dummy-body__code">{{ itemCode }}</p>
      </div>
    </div>

    <!-- 푸터 -->
    <div class="eval-cd__footer">
      <div class="eval-cd__footer-left" />
      <div class="eval-cd__footer-right">
        <button class="btn btn--cancel" @click="$emit('close')">취소</button>
        <button class="btn btn--confirm btn--confirm-active" @click="onConfirm">확인</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useScenarioStore } from '@/stores/scenario'
import { fetchPlanEvaluationItems } from '@/api/planEvaluationApi'

const props = defineProps({
  planId:   { type: String, required: true },
  itemCode: { type: String, default: null },
})
const emit = defineEmits(['close'])

const scenarioStore = useScenarioStore()

const allItems = ref([])
const loading  = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    allItems.value = await fetchPlanEvaluationItems()
  } finally {
    loading.value = false
  }
})

const item = computed(() =>
  allItems.value.find(i => i.code === props.itemCode) ?? null
)

function onConfirm() {
  const dummyScore = item.value?.dummyResult?.value ?? 0
  scenarioStore.setEvalResult(props.planId, props.itemCode, {
    list:  [{ title: item.value?.title ?? '-', result: String(dummyScore), unit: '' }],
    score: dummyScore,
  })
  emit('close')
}
</script>

<style lang="scss" scoped>
.eval-cd {
  width: 550px;
  max-height: calc(100vh - 32px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 2px 0 24px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.eval-cd__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #eaeaea;
  height: 62px;
  flex-shrink: 0;
}

.eval-cd__title {
  flex: 1;
  font-size: 16px;
  font-weight: var(--fw-bold);
  color: #333;
  letter-spacing: -0.32px;
}

.eval-cd__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  cursor: pointer;
  color: #8f8f8f;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background var(--transition-fast);

  &:hover { background: #f3f3f3; }
}

.eval-cd__loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eval-cd__body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dummy-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;

  &__msg {
    font-size: 14px;
    font-weight: var(--fw-medium);
    color: #8f8f8f;
    letter-spacing: -0.28px;
  }

  &__code {
    font-size: 12px;
    color: #b0b0b0;
    letter-spacing: 0.5px;
  }
}

.eval-cd__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 66px;
  padding: 0 20px;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;

  &-left  { flex: 1; }
  &-right { display: flex; align-items: center; gap: 10px; }
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 34px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: var(--fw-semibold);
  letter-spacing: -0.24px;
  cursor: pointer;
  transition: all var(--transition-fast);

  &--cancel {
    background: #fff;
    border: 1px solid #e7e7e7;
    color: #656565;
    &:hover { background: #f7f7f7; }
  }

  &--confirm {
    background: #d5d5d5;
    border: 1px solid #e7e7e7;
    color: #fff;
    cursor: not-allowed;

    &-active {
      background: #256EF4;
      border-color: #256EF4;
      cursor: pointer;
      &:hover { background: #1a5bd4; }
    }
  }
}
</style>
