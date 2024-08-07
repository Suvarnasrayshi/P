<template>
  <div class="custom-loader">
    <div :style="spinnerStyles" class="spinner"></div>
  </div>
</template>

<script>
export default {
  name: 'custom-loader',
  props: {
    spinnerSize: {
      type: Number,
      default: () => 25,
    },

    spinnerColor: {
      type: String,
      default: '#000000',
    },
  },

  computed: {
    spinnerStyles() {
      const spinnerSize = this.spinnerSize ? this.spinnerSize : 25;
      return {
        height: spinnerSize + 'px',
        width: spinnerSize + 'px',
        'border-color': this.spinnerColor,
      };
    },
  },
};
</script>

<style scoped>
.spinner {
  border: 4px solid #000000;
  border-bottom-color: transparent !important;
  border-radius: 50%;
  animation: rotation 1s infinite;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.custom-loader {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: rgb(230 230 230 / 50%);
}
</style>
