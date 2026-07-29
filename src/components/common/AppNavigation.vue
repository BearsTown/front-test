<template>
  <nav class="app-nav">
    <!-- Logo -->
    <div class="nav-logo">
      <div class="logo-badge">
        <span class="logo-text">LOGO</span>
      </div>
    </div>

    <div class="nav-divider" />

    <!-- Nav Items -->
    <ul class="nav-items">
      <li
        v-for="item in navItems"
        :key="item.key"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(item.key) }"
        @click="$emit('navigate', item.key)"
      >
        <v-icon class="nav-item__icon" size="20">{{ item.icon }}</v-icon>
        <span class="nav-item__label">{{ item.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineEmits(['navigate'])

const route = useRoute()

const navItems = [
  { key: 'scenario', label: '시나리오', icon: 'mdi-chart-timeline-variant' },
  { key: 'compare',  label: '비교분석', icon: 'mdi-chart-bar' },
]

const isActive = (key) => route.path.startsWith(`/${key}`)
</script>

<style lang="scss" scoped>
.app-nav {
  position: fixed;
  left: 0;
  top: 0;
  width: 77px;
  height: 100vh;
  background: $color-white;
  border-right: 1px solid #f2f2f2;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: $z-sticky;
  flex-shrink: 0;
}

.nav-logo {
  width: 100%;
  height: 67px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eaeaea;
}

.logo-badge {
  width: 32px;
  height: 32px;
  background: #e9e9e9;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 7px;
  font-weight: $font-weight-bold;
  color: $color-gray-600;
  letter-spacing: -0.3px;
}

.nav-divider {
  width: 100%;
  height: 1px;
  background: #f2f2f2;
}

.nav-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: $spacing-4;
  gap: 0;
}

.nav-item {
  width: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-5 $spacing-3;
  cursor: pointer;
  transition: background $transition-fast;
  background: $color-white;

  &:hover:not(.nav-item--active) {
    background: #f7f7f7;
  }

  &--active {
    background: $color-primary;

    .nav-item__icon {
      color: $color-white !important;
    }

    .nav-item__label {
      color: $color-white;
    }
  }

  &__icon {
    color: #717171;
    transition: color $transition-fast;
  }

  &__label {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: #717171;
    text-align: center;
    line-height: 1;
    letter-spacing: -0.24px;
    transition: color $transition-fast;
  }
}
</style>
