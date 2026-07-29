<template>
  <div class="upload-result">

    <div class="upload-result__header">
      <span class="upload-result__title">개발사업구역 업로드</span>
      <button class="close-btn" @click="$emit('close')">
        <v-icon size="20">mdi-close</v-icon>
      </button>
    </div>

    <div class="upload-result__body">
      <p class="upload-result__text">{{ fileName }} 업로드 완료.</p>
      <p class="upload-result__text">용도지역 분석 결과 : {{ grade }}</p>
    </div>

    <div class="upload-result__footer">
      <button class="close-btn-action" @click="$emit('close')">닫기</button>
    </div>

  </div>
</template>

<script setup>
defineProps({
  fileName: { type: String, default: '개발계획.shp' },
  grade: { type: String, default: '1급지' },
})
defineEmits(['close'])
</script>

<style lang="scss" scoped>
// 지도 위에 띄우는 floating 다이얼로그 (백드롭 없음)
// 패널(450px) 오른쪽 지도 영역 중앙에 위치
.upload-result {
  position: absolute;
  top: 50%;
  left: calc(50% + 225px);
  transform: translate(-50%, -50%);
  width: 400px;
  background: $color-white;
  border-radius: 20px;
  box-shadow: 2px 4px 24px rgba(0, 0, 0, 0.16);
  z-index: 60;
  overflow: hidden;
}

.upload-result__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  height: 66px;
  border-bottom: 1px solid #eaeaea;
}

.upload-result__title {
  font-size: 16px;
  font-weight: $font-weight-bold;
  color: #333;
  letter-spacing: -0.32px;
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

.upload-result__body {
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upload-result__text {
  font-size: 13px;
  font-weight: $font-weight-semibold;
  color: #333;
  letter-spacing: -0.26px;
  line-height: 1.6;
}

.upload-result__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;
  height: 66px;
  border-top: 1px solid #e5e5e5;
}

.close-btn-action {
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
  cursor: pointer;
  transition: background $transition-fast;

  &:hover { background: $color-gray-50; }
}
</style>
