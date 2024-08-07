<template>
  <div
    class="codelos-dropdown"
    id="codelos-common-dropdown"
    v-click-outside="close"
    :style="dropdownStyles"
    @scroll.stop
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  mounted() {
    this.setPositionOfDropdown();
    this.setDropdownHeight();
  },
  data() {
    return {
      dropdownStyles: {},
    };
  },

  methods: {
    close() {
      this.$emit('close');
    },
    setPositionOfDropdown() {
      const codelosContentWrapperElement = document.getElementById(
        'codelos-page-content'
      );

      const targetDropdownElement = document.getElementById(
        'codelos-common-dropdown'
      );

      const targetDropdownRect = targetDropdownElement.getBoundingClientRect();
      const codelosContentWrapperElementRect =
        codelosContentWrapperElement.getBoundingClientRect();

      let spaceAbove = targetDropdownRect.top;

      if (codelosContentWrapperElementRect.top > 0) {
        spaceAbove -= codelosContentWrapperElementRect.top;
      }
      let spaceBelow = window.innerHeight - targetDropdownRect.top;
      if (codelosContentWrapperElementRect.y > 0) {
        codelosContentWrapperElementRect.bottom - targetDropdownRect.top;
      }

      const spaceRight =
        codelosContentWrapperElementRect.right - targetDropdownRect.right;

      if (spaceRight < 0) {
        targetDropdownElement.style.right = 0;
        targetDropdownElement.style.left = 'unset';
      }

      if (spaceBelow > spaceAbove) {
        targetDropdownElement.style.top = 30 + 'px';
        targetDropdownElement.style.bottom = '';
      } else {
        targetDropdownElement.style.bottom = 30 + 'px';
        targetDropdownElement.style.top = '';
      }
    },

    setDropdownHeight() {
      const codelosContentWrapperElement = document.getElementById(
        'codelos-page-content'
      );
      const codelosContentWrapperElementRect =
        codelosContentWrapperElement &&
        codelosContentWrapperElement.getBoundingClientRect();
      const codelosContentWrapperElementHeight =
        codelosContentWrapperElementRect.height;

      if (
        codelosContentWrapperElementRect.top < 0 ||
        codelosContentWrapperElement.height > window.innerHeight
      ) {
        this.dropdownStyles = { minHeight: `40vh` };
        return;
      }

      const dropdownMaxHeight = codelosContentWrapperElementHeight * (60 / 100);
      // if element is there
      const dropdownElement = document.getElementById(
        'codelos-common-dropdown'
      );

      if (dropdownElement) {
        const computedStyle = window.getComputedStyle(dropdownElement);
        const bottomStyle = parseFloat(
          computedStyle.getPropertyValue('bottom')
        );

        const dropdownElementRect = dropdownElement.getBoundingClientRect();

        let availableHeight = dropdownMaxHeight;
        if (bottomStyle > 0) {
          // for the top side dropdown
          availableHeight =
            dropdownElementRect.bottom -
            codelosContentWrapperElementRect.top -
            20;
        } else {
          // for the bottom side dropdown

          availableHeight =
            codelosContentWrapperElementRect.bottom > window.innerHeight
              ? window.innerHeight - dropdownElementRect.top - 20
              : codelosContentWrapperElementRect.bottom -
                dropdownElementRect.top -
                20;
        }

        if (availableHeight === dropdownElementRect.height) {
          this.dropdownStyles = { maxHeight: `${availableHeight}px` };
          return;
        }
        // 40vh of the page
        if (availableHeight > window.innerHeight * 0.4) {
          this.dropdownStyles = { maxHeight: `40vh` };
          return;
        }

        this.dropdownStyles = {
          maxHeight: `${
            dropdownElementRect.bottom >
              codelosContentWrapperElementRect.bottom || window.innerHeight
              ? availableHeight
              : bottomStyle > 0 &&
                dropdownElementRect.top < codelosContentWrapperElementRect.top
              ? availableHeight
              : dropdownMaxHeight
          }px`,
        };
        return;
      }
      this.dropdownStyles = { maxHeight: `${dropdownMaxHeight}px` };
      return;
    },
  },
};
</script>

<style scoped>
.codelos-dropdown {
  border-radius: 4px;
  background: #fff;
  box-shadow: 0px 0px 8px rgb(0 0 0 / 20%);
  min-width: 265px;
  max-width: calc(100vw - 24px);
  position: absolute !important;
  z-index: 1;
  padding: 16px 0;
}

.codelos-dropdown .codelos-dropdown-item {
  transition: 400ms ease-in-out;
}
</style>
