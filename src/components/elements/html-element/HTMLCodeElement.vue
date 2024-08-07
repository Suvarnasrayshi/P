<template>
  <div
    class="codelos-html-wrapper"
    :view-in-pdf="nodeElement.settings.viewInPDF"
    :data-value="nodeElement.value"
  >
    <div class="html-element-menu-dropdown">
      <b-dropdown id="html-element-menu" right no-caret>
        <template #button-content>
          <b-icon icon="three-dots"> </b-icon>
        </template>
        <!-- eslint-disable -->
        <div class="html-dropdown-menu-item">
          <label> Im PDF anzeigen</label>
          <input
            v-model="nodeElement.settings.viewInPDF"
            type="checkbox"
            :name="'view-in-pdf-' + nodeElement.id"
            :id="'view-in-pdf-' + nodeElement.id"
            class="view-in-pdf-input"
          />

          <label
            :for="'view-in-pdf-' + nodeElement.id"
            class="view-in-pdf-label"
          ></label>
        </div>
        <!-- eslint-enable -->
      </b-dropdown>
    </div>

    <AceCodeEditor
      :key="nodeElement.id"
      @onCodeInput="onCodeInput"
      :codeValue="nodeElement.value"
    />
  </div>
</template>

<script>
import AceCodeEditor from '@/components/ace-editor/AceCodeEditor.vue';

export default {
  name: 'HTMLCodeElement',
  props: {
    nodeElement: {
      type: Object,
      default: () => {},
    },
  },
  created() {
    if (this.nodeElement && !this.nodeElement.settings) {
      this.nodeElement.settings = {
        viewInPDF: false,
      };
    }
  },

  methods: {
    onCodeInput(codeInput) {
      // eslint-disable-next-line
      this.nodeElement.value = codeInput;
    },
  },

  components: {
    AceCodeEditor,
  },
};
</script>

<style scoped>
.codelos-html-wrapper {
  background-color: #eeeeee;
  padding: 16px;
  border-radius: 6px;
}
.codelos-html-wrapper ::v-deep .html-element-menu-dropdown {
  text-align: end;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
}
.codelos-html-wrapper ::v-deep .html-element-menu-dropdown .dropdown-menu {
  width: 250px;
}

.codelos-html-wrapper ::v-deep .html-element-menu-dropdown button {
  background-color: transparent;
  color: #666666;
  border: none;
}

.codelos-html-wrapper ::v-deep .html-element-menu-dropdown button:active,
.codelos-html-wrapper
  ::v-deep
  .html-element-menu-dropdown
  button:focus-visible {
  background-color: transparent;
  border: none;
  color: black;
  box-shadow: none !important;
}

.codelos-html-wrapper .html-dropdown-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-inline: 8px;
  justify-content: space-between;
}

.codelos-html-wrapper .view-in-pdf-input + .view-in-pdf-label {
  display: block;
  position: relative;
  cursor: pointer;
  outline: none;
  user-select: none;
  padding: 2px;
  width: 40px;
  height: 20px;
  background-color: #dddddd;
  border-radius: 40px;
}
.codelos-html-wrapper .view-in-pdf-input + .view-in-pdf-label:before {
  right: 1px;
  background-color: #f1f1f1;
  border-radius: 60px;
  transition: background 0.4s;
}
.codelos-html-wrapper .view-in-pdf-input + .view-in-pdf-label:after {
  width: 14px;
  height: 14px;
  margin: 2px;
  background-color: #fff;
  border-radius: 100%;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  transition: all 0.4s;
}
.codelos-html-wrapper .view-in-pdf-input + .view-in-pdf-label:before,
.codelos-html-wrapper .view-in-pdf-input + .view-in-pdf-label:after {
  display: block;
  position: absolute;
  top: 1px;
  left: 1px;
  bottom: 1px;
  content: '';
}
.codelos-html-wrapper .view-in-pdf-input:checked + .view-in-pdf-label:before {
  background-color: #000000;
}
.codelos-html-wrapper .view-in-pdf-input:checked + .view-in-pdf-label:after {
  transform: translateX(20px);
}

.codelos-html-wrapper .view-in-pdf-input {
  position: absolute;
  opacity: 0;
}
</style>
