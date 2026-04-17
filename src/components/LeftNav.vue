<template>
  <nav class="left-nav">
    <!-- 로고 -->
    <div class="left-nav__logo">
      <router-link to="/">
        <div class="logo-box">LOGO</div>
      </router-link>
    </div>

    <!-- 메뉴 아이템 -->
    <ul class="left-nav__menu">
      <li
        v-for="item in menuItems"
        :key="item.id"
        class="left-nav__item"
        :class="{ 'is-active': activeMenu === item.id }"
        @click="handleMenuClick(item.id)"
        :title="item.label"
      >
        <v-icon size="22">{{ item.icon }}</v-icon>
        <span class="left-nav__label">{{ item.label }}</span>
      </li>
    </ul>
  </nav>
</template>

<script setup>
const props = defineProps({
  activeMenu: { type: String, default: null }
})

const emit = defineEmits(['menu-click'])

const menuItems = [
  { id: 'scenario', icon: 'mdi-file-document-outline', label: '시나리오' },
  { id: 'compare',  icon: 'mdi-chart-bar',             label: '비교분석' }
]

const handleMenuClick = (id) => emit('menu-click', id)
</script>

<style lang="scss" scoped>
.left-nav {
  width: 56px;
  height: 100%;
  background: $color-white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  z-index: 20;
  flex-shrink: 0;

  &__logo {
    margin-bottom: 16px;

    .logo-box {
      background-color: $color-primary;
      color: $color-white;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
  }

  &__menu {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 0 6px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 8px 4px;
    border-radius: 8px;
    cursor: pointer;
    color: #888;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
      color: $color-primary;
    }

    &.is-active {
      background: rgba($color-primary, 0.1);
      color: $color-primary;
    }
  }

  &__label {
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    word-break: keep-all;
    text-align: center;
  }
}
</style>
