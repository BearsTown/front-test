<template>
  <div class="dummy-body">
    <v-icon size="36" color="#d5d5d5">mdi-tools</v-icon>
    <p class="dummy-body__msg">산정 로직 구현 예정</p>
    <p class="dummy-body__code">{{ itemCode }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const props = defineProps({
  planId:      { type: String, required: true },
  itemCode:    { type: String, required: true },
  item:        { type: Object, default: null },
  savedResult: { type: Object, default: null },
})
const emit = defineEmits(['update:result'])

onMounted(() => {
  // 저장된 결과가 있으면 복원, 없으면 dummyResult 값으로 즉시 활성화
  const score = props.savedResult?.score ?? props.item?.dummyResult?.value ?? 0
  emit('update:result', {
    list:  [{ title: props.item?.title ?? '-', result: String(score), unit: '' }],
    score,
  })
})
</script>

<style lang="scss" scoped>
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
</style>
