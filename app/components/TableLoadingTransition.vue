<script></script>
<template>
  <Transition
    name="table-loading-transition"
    mode="out-in"
    enter-active-class="transition-all duration-500"
    enter-from-class="blur-md opacity-0"
    enter-to-class="blur-none opacity-100"
    leave-active-class="transition-all duration-500"
    leave-from-class="blur-none opacity-100"
    leave-to-class="blur-md opacity-0"
  >
    <slot></slot>
  </Transition>
</template>
