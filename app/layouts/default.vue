<template>
  <div class="app-container mx-auto flex h-screen max-w-7xl">
    <!-- Panel izquierdo (menú lateral fijo) -->
    <LeftPanel />

    <!-- Contenedor central -->
    <main class="main-content flex min-w-0 flex-1 flex-col">
      <!-- Barra superior fija dentro del contenido -->
      <header class="content-header sticky top-0 z-10 flex gap-2 border-b border-gray-200 bg-white p-4">
        <button class="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">🏠 Mi muro</button>
        <button class="rounded-lg bg-gray-100 px-4 py-2 hover:bg-gray-200">🔄 Actualizar</button>
      </header>

      <!-- Contenido con scroll -->
      <section class="content-scroll flex-1 overflow-y-auto">
        <div class="mx-auto w-full min-w-full max-w-2xl px-4 py-6 sm:min-w-[640px]">
          <slot />
          <!-- Aquí se renderiza la página (feed, perfil, etc.) -->
        </div>
      </section>
    </main>

    <!-- Panel derecho (utilidades o footer lateral) -->
    <aside class="sidebar-right hidden w-16 shrink-0 overflow-y-auto border-l border-gray-200 bg-white md:flex lg:w-80">
      <RightPanel />
    </aside>
  </div>
</template>
