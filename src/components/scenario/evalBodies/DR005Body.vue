<template>
  <div class="dr005-body">

    <!-- ① 건축물 등급 선택 섹션 -->
    <div class="eval-section" style="flex-direction: row">
      <div
        v-for="field in FIELDS"
        :key="field.key"
        class="dr005-field"
      >
        <span class="dr005-field__label">{{ field.title }}</span>
        <div class="dr005-select-wrap">
          <select
            class="dr005-select"
            v-model="selections[field.key]"
            @change="onSelectChange"
          >
            <option value="">선택하세요</option>
            <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <v-icon size="11" class="dr005-chevron">mdi-chevron-down</v-icon>
        </div>
      </div>
    </div>

    <!-- 구분선 -->
    <div class="eval-divider" />

    <!-- ② 평가점수 섹션 -->
    <div class="eval-section">
      <div class="eval-section__head">
        <span class="eval-section__label">평가점수</span>
        <button
          class="btn-calc"
          :class="{ 'btn-calc--active': canCalc }"
          :disabled="!canCalc || calcLoading"
          @click="onCalc"
        >산정</button>
      </div>

      <table class="result-table">
        <colgroup>
          <col /><col /><col /><col class="col-score" />
        </colgroup>
        <thead>
          <tr class="result-table__head-row">
            <th class="result-table__th">공공건축물</th>
            <th class="result-table__th">공동주택 등</th>
            <th class="result-table__th">기타 건축물</th>
            <th class="result-table__th">점수</th>
          </tr>
        </thead>
        <tbody>
          <tr class="result-table__body-row">
            <td class="result-table__td result-table__td--val">
              {{ calcScore != null ? selections.public_building : '-' }}
            </td>
            <td class="result-table__td result-table__td--val">
              {{ calcScore != null ? selections.residential : '-' }}
            </td>
            <td class="result-table__td result-table__td--val">
              {{ calcScore != null ? selections.other_building : '-' }}
            </td>
            <td class="result-table__td result-table__td--val">
              {{ calcScore ?? '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchDR005Scores } from '@/api/evalCenterApi'

const props = defineProps({
  planId:      { type: String, required: true },
  itemCode:    { type: String, required: true },
  item:        { type: Object, default: null },
  savedResult: { type: Object, default: null },
})
const emit = defineEmits(['update:result'])

const FIELDS = [
  {
    key:     'public_building',
    title:   '공공건축물',
    options: ['모두 인증', '모두 3등급 이상 인증', '모두 2등급 이상 인증', '모두 1등급 이상 인증'],
  },
  {
    key:     'residential',
    title:   '공동주택 등',
    options: ['모두 인증', '모두 3등급 이상 인증', '모두 2등급 이상 인증', '없음'],
  },
  {
    key:     'other_building',
    title:   '기타 건축물',
    options: ['모두 인증', '없음'],
  },
]

const selections = ref({
  public_building: '',
  residential:     '',
  other_building:  '',
})

const calcLoading = ref(false)
const calcScore   = ref(null)

const canCalc = computed(() =>
  FIELDS.every(f => selections.value[f.key] !== '')
)

function onSelectChange() {
  calcScore.value = null
  emit('update:result', null)
}

async function onCalc() {
  if (!canCalc.value || calcLoading.value) return
  calcLoading.value = true
  try {
    const payload = {
      public_building: selections.value.public_building,
      residential:     selections.value.residential,
      other_building:  selections.value.other_building,
    }
    const { score } = await fetchDR005Scores(props.planId, payload)
    calcScore.value = score
    emit('update:result', {
      list: FIELDS.map(f => ({
        key:    f.key,
        title:  f.title,
        result: payload[f.key],
        unit:   '',
      })),
      score,
    })
  } finally {
    calcLoading.value = false
  }
}

// savedResult 복원
onMounted(() => {
  if (!props.savedResult?.list) return
  for (const f of FIELDS) {
    const entry = props.savedResult.list.find(i => i.key === f.key)
    if (entry) selections.value[f.key] = entry.result
  }
  if (props.savedResult.score != null) {
    calcScore.value = props.savedResult.score
    emit('update:result', props.savedResult)
  }
})
</script>

<style lang="scss" scoped>
.dr005-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

// ── 셀렉트 필드 ──────────────────────────────────────
.dr005-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &__label {
    font-size: 14px;
    font-weight: $font-weight-medium;
    color: #333;
    letter-spacing: -0.28px;
  }
}

.dr005-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.dr005-select {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 12px;
  background: $color-white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-size: 13px;
  font-weight: $font-weight-regular;
  color: #373737;
  appearance: none;
  cursor: pointer;
  transition: border-color $transition-fast;

  &:focus { outline: none; border-color: #256ef4; }

  option[value=''] { color: #929292; }
}

.dr005-chevron {
  position: absolute;
  right: 10px;
  color: #929292;
  pointer-events: none;
}
</style>
