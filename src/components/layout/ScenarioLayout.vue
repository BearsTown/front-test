<template>
  <div class="map-layout">

    <!-- 좌측 네비게이션 -->
    <AppNavigation @navigate="onNavigate" />

    <!-- 지도 메인 영역 -->
    <div class="map-area">
      <div class="map-container">
        <router-view />
      </div>

      <!-- 시나리오 left 패널 (슬라이드) -->
      <transition name="slide-panel">
        <ScenarioPanel
          v-if="mapStore.activeMenu === 'scenario'"
          :project-name="mapStore.savedProject.name"
          @close="mapStore.closeMenu"
          @next="onScenarioNext"
          @project-click="mapStore.openProjectDialog"
          @file-upload-click="mapStore.openFileUploadDialog"
        />
      </transition>

      <!-- 지도 컨트롤러 -->
      <MapController
        class="map-controller"
        :class="{ 'map-controller--shifted': mapStore.showResultPanel }"
      />

      <!-- 파일 업로드 결과 (지도 위 floating, 백드롭 없음) -->
      <UploadResultDialog
        v-if="mapStore.showUploadResultDialog"
        :file-name="mapStore.uploadResult.fileName"
        :grade="mapStore.uploadResult.grade"
        @close="mapStore.closeUploadResult"
      />

      <!-- 인구 및 수용 계획 ContentDialog -->
      <PopulationDialog
        v-if="mapStore.showPopulationDialog"
        :plan-id="mapStore.populationDialogPlanId"
        class="population-dialog"
        @close="mapStore.closePopulationDialog"
      />

      <!-- 인구 및 주택건설 계획 ContentDialog -->
      <HousingDialog
        v-if="mapStore.showHousingDialog"
        :plan-id="mapStore.housingDialogPlanId"
        class="housing-dialog"
        @close="mapStore.closeHousingDialog"
      />

      <!-- 토지이용계획 ContentDialog -->
      <LandDialog
        v-if="mapStore.showLandDialog"
        :plan-id="mapStore.landDialogPlanId"
        class="land-dialog"
        @close="mapStore.closeLandDialog"
      />

      <!-- Step 3 평가항목 ContentDialog -->
      <EvalItemDialog
        v-if="mapStore.showEvalItemDialog"
        :plan-id="mapStore.evalItemDialogPlanId"
        :item-code="mapStore.evalItemCode"
        class="eval-item-dialog"
        @close="mapStore.closeEvalItemDialog"
      />

      <!-- 면적 구성비 ContentDialog (Step 4) -->
      <AreaCompositionDialog
        v-if="mapStore.showAreaDialog"
        :plan-id="mapStore.areaDialogPlanId"
        class="area-dialog"
        @close="mapStore.closeAreaDialog"
      />

      <!-- 전력 사용량 예측 ContentDialog (Step 4) -->
      <ElectricityDialog
        v-if="mapStore.showElectricityDialog"
        :plan-id="mapStore.electricityDialogPlanId"
        class="electricity-dialog"
        @close="mapStore.closeElectricityDialog"
      />

      <!-- 열 사용량 예측 ContentDialog (Step 4) -->
      <HeatDialog
        v-if="mapStore.showHeatDialog"
        :plan-id="mapStore.heatDialogPlanId"
        class="heat-dialog"
        @close="mapStore.closeHeatDialog"
      />

      <!-- 결과보기 패널 (우측 슬라이드) -->
      <transition name="slide-result">
        <ResultPanel
          v-if="mapStore.showResultPanel"
          class="result-panel-wrapper"
          @close="mapStore.closeResultPanel"
        />
      </transition>
    </div>

    <!-- 프로젝트 생성 다이얼로그 -->
    <ProjectDialog
      v-if="mapStore.showProjectDialog"
      @cancel="mapStore.closeProjectDialog"
      @save="mapStore.saveProject"
    />

    <!-- 생성 완료 메시지 -->
    <MessageDialog
      v-if="mapStore.showMessageDialog"
      :project-name="mapStore.savedProject.name"
      @close="mapStore.closeMessage"
    />

    <!-- 파일 업로드 다이얼로그 (전체 backdrop) -->
    <FileUploadDialog
      v-if="mapStore.showFileUploadDialog"
      @cancel="mapStore.showFileUploadDialog = false"
      @confirm="mapStore.confirmFileUpload"
    />

    <!-- 데이터 관리 다이얼로그 (backdrop 모달) -->
    <PopulationDataDialog
      v-if="mapStore.showPopulationDataDialog"
      @close="mapStore.closePopulationDataDialog"
    />

    <HousingDataDialog
      v-if="mapStore.showHousingDataDialog"
      @close="mapStore.closeHousingDataDialog"
    />

    <LandDataDialog
      v-if="mapStore.showLandDataDialog"
      @close="mapStore.closeLandDataDialog"
    />

    <!-- 토지이용 데이터 선택 다이얼로그 -->
    <LandSelectDialog
      v-if="mapStore.showLandSelectDialog"
      :plan-id="mapStore.landSelectContext.planId"
      :item-code="mapStore.landSelectContext.itemCode"
      @close="mapStore.closeLandSelectDialog"
      @saved="mapStore.closeLandSelectDialog"
    />

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppNavigation        from '@/components/common/AppNavigation.vue'
import MapController        from '@/components/common/MapController.vue'
import ScenarioPanel        from '@/components/common/ScenarioPanel.vue'
import ProjectDialog        from '@/components/common/ProjectDialog.vue'
import MessageDialog        from '@/components/common/MessageDialog.vue'
import FileUploadDialog     from '@/components/common/FileUploadDialog.vue'
import UploadResultDialog   from '@/components/common/UploadResultDialog.vue'
import PopulationDialog     from '@/components/scenario/PopulationDialog.vue'
import PopulationDataDialog from '@/components/scenario/PopulationDataDialog.vue'
import HousingDialog        from '@/components/scenario/HousingDialog.vue'
import HousingDataDialog    from '@/components/scenario/HousingDataDialog.vue'
import LandDialog           from '@/components/scenario/LandDialog.vue'
import LandDataDialog       from '@/components/scenario/LandDataDialog.vue'
import EvalItemDialog       from '@/components/scenario/EvalItemDialog.vue'
import LandSelectDialog     from '@/components/scenario/LandSelectDialog.vue'
import AreaCompositionDialog from '@/components/scenario/AreaCompositionDialog.vue'
import ElectricityDialog    from '@/components/scenario/ElectricityDialog.vue'
import HeatDialog           from '@/components/scenario/HeatDialog.vue'
import ResultPanel          from '@/components/scenario/ResultPanel.vue'
import { useMapStore }      from '@/stores/map'

const router   = useRouter()
const mapStore = useMapStore()

function onNavigate(key) {
  if (key === 'scenario') {
    // 시나리오 도메인 내부 → 패널 토글
    mapStore.toggleMenu('scenario')
  } else {
    router.push(`/${key}`)
  }
}

const onScenarioNext = () => {
  // TODO: 다음 단계
}
</script>

<style lang="scss" scoped>
.map-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #e8e4dc;
}

.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  margin-left: 77px;
}

.map-container {
  width: 100%;
  height: 100%;
  isolation: isolate;
}

.map-controller {
  position: absolute;
  right: 26px;
  top: 26px;
  z-index: 10;
  transition: right $transition-base;

  &--shifted {
    right: 558px;
  }
}

.population-dialog,
.housing-dialog,
.land-dialog,
.eval-item-dialog,
.area-dialog,
.electricity-dialog,
.heat-dialog {
  position: absolute;
  left: 450px;
  top: 16px;
  z-index: 20;
}

.result-panel-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 15;
}

// 좌측 패널 슬라이드 트랜지션
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform $transition-base;
}
.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(-100%);
}
.slide-panel-enter-to,
.slide-panel-leave-from {
  transform: translateX(0);
}

// 우측 결과 패널 슬라이드 트랜지션
.slide-result-enter-active,
.slide-result-leave-active {
  transition: transform $transition-base;
}
.slide-result-enter-from,
.slide-result-leave-to {
  transform: translateX(100%);
}
.slide-result-enter-to,
.slide-result-leave-from {
  transform: translateX(0);
}
</style>
