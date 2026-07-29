<template>
  <div class="dialog-backdrop">
    <div class="dialog">

      <!-- 헤더 -->
      <div class="dialog-header">
        <h3 class="dialog-header__title">프로젝트 생성</h3>
        <button class="close-btn" @click="$emit('close')">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <!-- 메시지 -->
      <div class="dialog-content">
        <p class="message-text">
          "{{ projectName }}" 프로젝트를 생성했습니다.
        </p>
      </div>

      <!-- 푸터 -->
      <div class="dialog-footer">
        <button class="close-action-btn" @click="$emit('close')">닫기</button>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  projectName: { type: String, default: '' },
})
defineEmits(['close'])
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
  width: 400px;
  height: 250px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 0px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  height: 66px;
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

.dialog-content {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
}

.message-text {
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: #000;
  letter-spacing: -0.24px;
  padding: 10px;
  background: $color-white;
  width: 100%;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 66px;
  padding: 16px 20px;
  border-top: 1px solid #e5e5e5;
  flex-shrink: 0;
}

.close-action-btn {
  width: 70px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $color-white;
  border: 1px solid #e7e7e7;
  border-radius: $radius-md;
  font-size: 12px;
  font-weight: $font-weight-semibold;
  color: #656565;
  letter-spacing: -0.24px;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover { background: $color-gray-50; }
}
</style>
