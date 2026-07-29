<template>
  <v-app>
    <AppSidebar />
    <AppHeader />
    <v-main class="main-content">
      <div class="page-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
</script>

<style lang="scss" scoped>
.main-content {
  background-color: $color-bg;
}

.page-wrapper {
  padding: $spacing-6;
  max-width: $content-max-width;
  margin: 0 auto;
  min-height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity $transition-fast;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
