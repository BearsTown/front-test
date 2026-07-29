<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="isCollapsed"
    permanent
    class="app-sidebar"
    :width="240"
    :rail-width="64"
  >
    <!-- Logo -->
    <div class="sidebar-logo">
      <transition name="fade">
        <span v-if="!isCollapsed" class="logo-text">Carbon</span>
      </transition>
      <v-icon v-if="isCollapsed" class="logo-icon">mdi-leaf</v-icon>
    </div>

    <v-divider />

    <!-- Navigation Items -->
    <v-list density="compact" nav class="sidebar-nav">
      <template v-for="item in navItems" :key="item.name">
        <v-list-item
          :to="item.to"
          :prepend-icon="item.icon"
          :title="isCollapsed ? '' : item.label"
          :value="item.name"
          active-class="nav-item--active"
          class="nav-item"
          rounded="lg"
        >
          <template v-if="isCollapsed" #title>
            <v-tooltip :text="item.label" location="end">
              <template #activator="{ props }">
                <span v-bind="props" />
              </template>
            </v-tooltip>
          </template>
        </v-list-item>
      </template>
    </v-list>

    <!-- Collapse toggle -->
    <template #append>
      <v-divider />
      <div class="sidebar-footer">
        <v-btn
          :icon="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          variant="text"
          size="small"
          @click="toggleCollapse"
        />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(true)
const isCollapsed = ref(false)

const navItems = [
  { name: 'dashboard', label: '대시보드', icon: 'mdi-view-dashboard-outline', to: '/dashboard' },
]

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style lang="scss" scoped>
.app-sidebar {
  background-color: $color-bg-sidebar !important;
  border-right: none !important;

  :deep(.v-navigation-drawer__content) {
    display: flex;
    flex-direction: column;
  }
}

.sidebar-logo {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 $spacing-4;
  gap: $spacing-2;

  .logo-text {
    font-size: $font-size-xl;
    font-weight: $font-weight-bold;
    color: $color-white;
    letter-spacing: -0.5px;
  }

  .logo-icon {
    color: $color-secondary;
    font-size: 1.5rem;
  }
}

.sidebar-nav {
  flex: 1;
  padding: $spacing-2;

  .nav-item {
    color: rgba(255, 255, 255, 0.7) !important;
    margin-bottom: $spacing-1;

    :deep(.v-icon) {
      color: rgba(255, 255, 255, 0.7);
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.08) !important;
      color: $color-white !important;

      :deep(.v-icon) {
        color: $color-white;
      }
    }

    &--active {
      background-color: $color-primary !important;
      color: $color-white !important;

      :deep(.v-icon) {
        color: $color-white;
      }
    }
  }
}

.sidebar-footer {
  display: flex;
  justify-content: center;
  padding: $spacing-2;

  :deep(.v-btn) {
    color: rgba(255, 255, 255, 0.5);
    &:hover {
      color: $color-white;
    }
  }
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
