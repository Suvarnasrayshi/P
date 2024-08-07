<template>
  <div
    class="resize-wrapper"
    ref="resizeWrapper"
    :style="{ width: `${resizableWrapperWidth}px` }"
    :draggable="false"
  >
    <slot></slot>

    <div
      class="resize-handler"
      @mousedown="onMouseDown"
      ref="resizeHandler"
      :draggable="false"
    >
      <div
        class="resize-handler-icon"
        :style="{ opacity: isResizing ? '1' : '' }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomResizer',
  props: {
    width: {
      type: Number,
      required: false,
      default: 2000,
    },
  },
  data() {
    return {
      isResizing: false,
      resizableWrapperWidth: 0,
      startX: 0,
      startWidth: 0,
    };
  },

  methods: {
    onMouseDown(e) {
      if (e.button !== 0) {
        return;
      }
      this.isResizing = true;
      this.startX = e.clientX;
      const resizeWrapper = this.$refs.resizeWrapper;
      this.startWidth = parseInt(
        document.defaultView.getComputedStyle(resizeWrapper).width,
        10
      );
      resizeWrapper.addEventListener('mouseleave', this.onMouseLeave);
      window.addEventListener('mouseup', this.onMouseUp);
      window.addEventListener('mousemove', this.onMouseMove);
    },

    onMouseUp(e) {
      if (e.button !== 0) {
        return;
      }
      this.isResizing = false;
      this.removeMouseEvents();
      this.$emit('resizeend', this.resizableWrapperWidth);
    },
    onMouseMove(e) {
      if (e.which !== 1) {
        return;
      }
      if (this.isResizing) {
        this.resizableWrapperWidth = this.startWidth + e.clientX - this.startX;
      }
    },
    onMouseLeave(e) {
      if (e.which === 1) {
        return;
      }
      this.isResizing = false;
      this.removeMouseEvents();
      this.$emit('resizeend', this.resizableWrapperWidth);
    },
    removeMouseEvents() {
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('mousemove', this.onMouseMove);
      const resizeWrapper = this.$refs.resizeWrapper;
      resizeWrapper.removeEventListener('mouseleave', this.onMouseLeave);
    },
  },

  mounted() {
    this.resizableWrapperWidth = this.width;
  },
};
</script>

<style scoped>
.resize-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 100%;
  min-width: 100px;
  user-select: none;
}
.resize-handler {
  cursor: ew-resize;
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 10px;
  display: flex;
  align-items: center;
}

.resize-handler-icon {
  width: 6px;
  height: 48px;
  max-height: 50%;
  background: rgba(15, 15, 15, 0.6);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  transition: opacity 300ms ease-in 0s;
  opacity: 0;
}

.resize-wrapper:hover .resize-handler-icon {
  opacity: 1;
}
</style>
