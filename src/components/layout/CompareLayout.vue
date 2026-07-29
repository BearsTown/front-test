<template>
  <div class="compare-layout">
    <AppNavigation @navigate="onNavigate" />
    <div class="compare-area">
      <CompareView />
    </div>
  </div>
</template>

<script setup>
import { useRouter }   from 'vue-router'
import AppNavigation   from '@/components/common/AppNavigation.vue'
import CompareView     from '@/components/compare/CompareView.vue'

const router = useRouter()

function onNavigate(key) {
  if (key !== 'compare') {
    router.push(`/${key}`)
  }
}
</script>

<style lang="scss" scoped>
.compare-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: $color-white;
}

.compare-area {
  flex: 1;
  margin-left: 77px;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
