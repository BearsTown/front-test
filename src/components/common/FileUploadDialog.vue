<template>
  <div class="dialog-backdrop">
    <div class="dialog">

      <div class="dialog-header">
        <h3 class="dialog-header__title">파일 업로드</h3>
        <button class="close-btn" @click="$emit('cancel')">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <div class="dialog-body">
        <div
          class="drop-zone"
          :class="{ 'drop-zone--active': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <v-icon size="40" class="drop-zone__icon">mdi-cloud-upload-outline</v-icon>
          <p class="drop-zone__main">
            파일을 드래그하거나 <span class="drop-zone__highlight">[파일선택]</span> 버튼을 클릭하세요
          </p>
          <p class="drop-zone__sub">지도(.shp) 파일을 첨부하세요</p>
          <button class="select-btn" @click="fileInput.click()">파일선택</button>
          <input ref="fileInput" type="file" accept=".shp,.zip" class="hidden-input" @change="onFileChange" />
          <p v-if="fileName" class="drop-zone__filename">
            <v-icon size="14">mdi-file-outline</v-icon>
            {{ fileName }}
          </p>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="action-btn action-btn--cancel" @click="$emit('cancel')">취소</button>
        <button
          class="action-btn action-btn--confirm"
          :class="{ 'action-btn--active': !!fileName }"
          :disabled="!fileName"
          @click="onConfirm"
        >확인</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['cancel', 'confirm'])

const fileInput = ref(null)
const fileName = ref('')
const isDragging = ref(false)

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) fileName.value = file.name
}

const onDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) fileName.value = file.name
}

const onConfirm = () => {
  if (!fileName.value) return
  emit('confirm', { fileName: fileName.value })
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
  width: 477px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 4px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  height: 60px;
  border-bottom: 1px solid #eaeaea;
  flex-shrink: 0;

  &__title {
    font-size: 16px;
    font-weight: $font-weight-bold;
    color: #333;
    letter-spacing: -0.32px;
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

  &:hover { background: $color-gray-100; }
}

.dialog-body {
  padding: 20px;
}

.drop-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 36px 20px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  background: #fafafa;
  transition: border-color $transition-fast, background $transition-fast;

  &--active {
    border-color: $color-primary;
    background: #ecf2fe;
  }

  &__icon {
    color: #c0c0c0;
    margin-bottom: 4px;
  }

  &__main {
    font-size: 13px;
    font-weight: $font-weight-semibold;
    color: #333;
    letter-spacing: -0.26px;
    text-align: center;
    line-height: 1.5;
  }

  &__highlight {
    color: $color-primary;
  }

  &__sub {
    font-size: 12px;
    color: #9a9a9a;
    letter-spacing: -0.24px;
  }

  &__filename {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: $font-weight-semibold;
    color: $color-primary;
    letter-spacing: -0.24px;
    margin-top: 4px;
  }
}

.select-btn {
  height: 32px;
  padding: 0 20px;
  background: $color-white;
  border: 1px solid $color-primary;
  border-radius: 16px;
  font-size: 13px;
  font-weight: $font-weight-semibold;
  color: $color-primary;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover { background: #ecf2fe; }
}

.hidden-input {
  display: none;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  height: 66px;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;
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

  &--confirm {
    background: #d5d5d5;
    border: 1px solid transparent;
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
