<template>
  <div class="step-content">

    <div class="form-section">
      <label class="form-label">시나리오 제목</label>
      <v-text-field v-model="form.title" variant="outlined" density="compact" hide-details placeholder="" />
    </div>

    <div class="form-section">
      <div class="form-row-between">
        <span class="form-label">개발사업구역 정보 입력</span>
        <button class="upload-btn"><v-icon size="13">mdi-upload</v-icon> 파일 업로드</button>
      </div>
    </div>

    <div class="form-section">
      <h4 class="form-section__title">계획인구 및 개발밀도</h4>
      <div class="form-grid">
        <div v-for="field in densityFields" :key="field.key" class="form-field">
          <label class="form-field__label">{{ field.label }}</label>
          <div class="form-field__row">
            <v-text-field v-model="form[field.key]" variant="outlined" density="compact" hide-details type="number" hide-spin-buttons :suffix="field.unit" />
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="collapsible-header" @click="sections.landUse = !sections.landUse">
        <h4 class="form-section__title">토지이용계획표</h4>
        <v-icon size="16" color="#aaa" :style="{ transform: sections.landUse ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }">mdi-chevron-right</v-icon>
      </div>
      <div class="summary-row">
        <span class="summary-label">총 면적</span>
        <span class="summary-value">{{ form.totalLandArea.toLocaleString() }} m²</span>
      </div>
      <div class="progress-bar"><div class="progress-bar__fill" style="width: 0%"></div></div>
    </div>

    <div class="form-section">
      <div class="collapsible-header" @click="sections.building = !sections.building">
        <h4 class="form-section__title">건축계획</h4>
        <v-icon size="16" color="#aaa" :style="{ transform: sections.building ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }">mdi-chevron-right</v-icon>
      </div>
      <div class="summary-row">
        <span class="summary-label">총 연면적</span>
        <span class="summary-value">{{ form.totalBuildArea.toLocaleString() }} m²</span>
      </div>
      <div class="progress-bar"><div class="progress-bar__fill" style="width: 0%"></div></div>
    </div>

  </div>
</template>

<script setup>
import { reactive } from 'vue'

const densityFields = [
  { key: 'planArea',        label: '계획인구',    unit: 'm²' },
  { key: 'planPop',         label: '계획인구',    unit: '인' },
  { key: 'popDensity',      label: '인구밀도',    unit: '인/ha' },
  { key: 'popPerHousehold', label: '세대당 인구', unit: '인' },
  { key: 'planHousehold',   label: '계획세대',    unit: '세대' },
  { key: 'publicDivision',  label: '공지구분',    unit: null }
]

const form = reactive({
  title: '',
  planArea: '', planPop: '', popDensity: '',
  popPerHousehold: '', planHousehold: '', publicDivision: '',
  totalLandArea: 0, totalBuildArea: 0
})

const sections = reactive({ landUse: false, building: false })
</script>

<style lang="scss" scoped>
.step-content { display: flex; flex-direction: column; gap: 18px; }

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  &__title { font-size: 12px; font-weight: 700; color: $color-text-dark; }
}

.form-label { font-size: 12px; font-weight: 600; color: $color-text-body; }
.form-row-between { display: flex; align-items: center; justify-content: space-between; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }

.form-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  &__label { font-size: 11px; color: $color-text-muted; }
  &__row   { display: flex; align-items: center; gap: 4px; }
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  font-size: 11px;
  color: $color-primary;
  border: 1px solid $color-primary;
  border-radius: 4px;
  transition: all 0.2s;
  &:hover { background: rgba($color-primary, 0.06); }
}

.collapsible-header { display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; }
.summary-row        { display: flex; align-items: center; justify-content: space-between; padding: 4px 0; }
.summary-label      { font-size: 12px; color: $color-text-muted; }
.summary-value      { font-size: 12px; font-weight: 600; color: $color-text-body; }

.progress-bar {
  height: 4px;
  background: $color-gray-200;
  border-radius: 2px;
  overflow: hidden;
  &__fill { height: 100%; background: $color-primary; border-radius: 2px; transition: width 0.3s; }
}

:deep(.v-field) { font-size: 12px; }
:deep(.v-field__input) { min-height: 32px !important; padding: 4px 8px !important; font-size: 12px; }
:deep(.v-field--variant-outlined .v-field__outline) { --v-field-border-color: #{$color-border-mid}; }
</style>
