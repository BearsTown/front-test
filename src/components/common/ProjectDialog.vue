<template>
  <div class="dialog-backdrop">
    <div class="dialog">

      <!-- 헤더 -->
      <div class="dialog-header">
        <div class="dialog-header__left">
          <h3 class="dialog-header__title">프로젝트 관리</h3>
        </div>
        <div class="dialog-header__actions">
          <button class="file-btn" @click="onLoad">
            불러오기
            <v-icon size="12">mdi-upload</v-icon>
          </button>
          <button class="file-btn file-btn--disabled" disabled>
            내보내기
            <v-icon size="12">mdi-upload</v-icon>
          </button>
        </div>
        <button class="close-btn" @click="$emit('cancel')">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <!-- 컨텐츠 -->
      <div class="dialog-content">

        <!-- 프로젝트 명 -->
        <div class="field-group">
          <label class="field-label">프로젝트 명</label>
          <input
            v-model="form.name"
            type="text"
            class="field-input"
            placeholder=""
            @input="checkValid"
          />
        </div>

        <!-- 대상지 -->
        <div class="field-group">
          <label class="field-label">대상지</label>
          <div class="field-row">
            <div class="field-select">
              <select v-model="form.sido" class="field-input" @change="onSidoChange">
                <option value="" disabled>시도</option>
                <option v-for="s in sidoList" :key="s" :value="s">{{ s }}</option>
              </select>
              <v-icon size="16" class="select-icon">mdi-chevron-down</v-icon>
            </div>
            <div class="field-select">
              <select v-model="form.sigungu" class="field-input">
                <option value="" disabled>시군구</option>
                <option v-for="s in sigunguList" :key="s" :value="s">{{ s }}</option>
              </select>
              <v-icon size="16" class="select-icon">mdi-chevron-down</v-icon>
            </div>
          </div>
        </div>

        <!-- 비고 -->
        <div class="field-group">
          <label class="field-label">비고</label>
          <textarea
            v-model="form.note"
            class="field-textarea"
            rows="4"
          />
        </div>

      </div>

      <!-- 푸터 -->
      <div class="dialog-footer">
        <div class="dialog-footer__right">
          <button class="action-btn action-btn--cancel" @click="$emit('cancel')">취소</button>
          <button
            class="action-btn action-btn--save"
            :class="{ 'action-btn--active': isValid }"
            :disabled="!isValid"
            @click="onSave"
          >
            저장
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const emit = defineEmits(['cancel', 'save'])

const form = reactive({
  name: '',
  sido: '',
  sigungu: '',
  note: '',
})

const isValid = computed(() => form.name.trim().length > 0)

const sidoList = [
  '서울특별시', '부산광역시', '대구광역시', '인천광역시',
  '광주광역시', '대전광역시', '울산광역시', '세종특별자치시',
  '경기도', '강원도', '충청북도', '충청남도',
  '전라북도', '전라남도', '경상북도', '경상남도', '제주특별자치도',
]

const sigunguMap = {
  '광주광역시': ['동구', '서구', '남구', '북구', '광산구'],
  '서울특별시': ['강남구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
}

const sigunguList = computed(() => sigunguMap[form.sido] || [])

const onSidoChange = () => {
  form.sigungu = ''
}

const checkValid = () => {}

const onLoad = () => {
  // 파일 불러오기 (추후 구현)
}

const onSave = () => {
  if (!isValid.value) return
  emit('save', { ...form })
}
</script>

<style lang="scss" scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-modal;
}

.dialog {
  width: 450px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 0px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Header
.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid #eaeaea;
  height: 66px;
  flex-shrink: 0;

  &__left {
    flex: 1;
  }

  &__title {
    font-size: 16px;
    font-weight: $font-weight-bold;
    color: #333;
    letter-spacing: -0.32px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.file-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 8px 12px;
  background: $color-white;
  border: 1px solid #e7e7e7;
  border-radius: 16px;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: #256EF4;
  letter-spacing: -0.24px;
  cursor: pointer;
  white-space: nowrap;
  transition: background $transition-fast;

  &:hover { background: #ECF2FE; }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    &:hover { background: $color-white; }
  }
}

.close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: $color-gray-500;
  border-radius: $radius-full;
  transition: background $transition-fast;
  flex-shrink: 0;

  &:hover { background: $color-gray-100; }
}

// Content
.dialog-content {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-bottom: 1px solid #f1f1f1;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  font-size: 14px;
  font-weight: $font-weight-bold;
  color: #333;
  letter-spacing: -0.28px;
}

.field-input {
  width: 100%;
  height: 38px;
  padding: 10px 12px;
  background: #f6f6f6;
  border: 1px solid #eaeaea;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: $font-weight-medium;
  color: #464C53;
  letter-spacing: -0.28px;
  outline: none;
  appearance: none;
  transition: border-color $transition-fast, background $transition-fast;

  &:focus {
    border-color: #256EF4;
    background: $color-white;
  }

  &::placeholder {
    color: #bcbcbc;
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field-select {
  position: relative;

  select.field-input {
    padding-right: 32px;
    cursor: pointer;
  }

  .select-icon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: $color-gray-500;
    pointer-events: none;
  }
}

.field-textarea {
  width: 100%;
  height: 112px;
  padding: 10px 12px;
  background: #f6f6f6;
  border: 1px solid #eaeaea;
  border-radius: $radius-md;
  font-size: 14px;
  font-weight: $font-weight-medium;
  color: #333;
  letter-spacing: -0.28px;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: border-color $transition-fast, background $transition-fast;

  &:focus {
    border-color: #256EF4;
    background: $color-white;
  }
}

// Footer
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 66px;
  padding: 16px 20px;
  flex-shrink: 0;

  &__right {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.action-btn {
  width: 70px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  letter-spacing: -0.24px;
  cursor: pointer;
  transition: all $transition-fast;

  &--cancel {
    background: $color-white;
    border: 1px solid #e7e7e7;
    color: #656565;
    &:hover { background: $color-gray-50; }
  }

  &--save {
    background: #d5d5d5;
    border: 1px solid #e7e7e7;
    color: $color-white;
    cursor: not-allowed;
  }

  &--active {
    background: #256EF4;
    border-color: #256EF4;
    cursor: pointer;
    &:hover { background: #1452C4; }
  }
}
</style>
