<template>
  <div class="square-outer">
    <div class="square-inner">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.square-outer {
  width: 100%;
  /* All paddings are relative to parent width. */
  padding-top: 100%;
  position: relative;
}
.square-inner {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
</style>