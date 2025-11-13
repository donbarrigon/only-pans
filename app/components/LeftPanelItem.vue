<template>
  <NuxtLink
    :to="href"
    :class="[
      'flex items-center gap-3 px-4 py-3 transition-colors',
      'hover:bg-gray-100 dark:hover:bg-slate-800',
      active ? 'bg-cyan-50 text-cyan-600 dark:bg-slate-700 dark:text-cyan-400' : 'text-gray-700 dark:text-gray-300',
    ]"
  >
    <!-- Icono -->
    <UIcon :name="icon" class="size-6 shrink-0" />

    <!-- Texto (oculto en md, visible en lg) -->
    <span class="hidden lg:block">
      <slot />
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps({
  href: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})
</script>
