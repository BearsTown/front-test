<template>
  <v-app-bar
    class="app-header"
    :elevation="0"
    height="64"
    border="b"
  >
    <!-- Page title -->
    <v-app-bar-title class="header-title">
      {{ currentTitle }}
    </v-app-bar-title>

    <template #append>
      <div class="header-actions">
        <!-- Notification -->
        <v-btn icon="mdi-bell-outline" variant="text" size="small" />

        <!-- User avatar -->
        <v-avatar size="32" class="user-avatar" color="primary">
          <span class="avatar-text">U</span>
        </v-avatar>
      </div>
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTitle = computed(() => route.meta.title || '')
</script>

<style lang="scss" scoped>
.app-header {
  background-color: $color-white !important;
  border-bottom: 1px solid $color-border !important;

  :deep(.v-toolbar__content) {
    padding: 0 $spacing-6;
  }
}

.header-title {
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $color-text-primary;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding-right: $spacing-2;
}

.user-avatar {
  cursor: pointer;

  .avatar-text {
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
    color: $color-white;
  }
}
</style>
