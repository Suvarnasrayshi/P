<template>
  <div class="codelos-html-wrapper">
    <div class="html-element-menu-dropdown">
      <div class="icon-circle-wand" @click="toggleSplitView">
        <img src="../../../assets/magic.png" class="rounded mx-auto d-block" alt="...">
      </div>
      <div class="space-in-between"></div>

      <div class="icon-circle-code" @click="toggleView" v-if="viewMode === 'code'">
        <img src="../../../assets/eye.png" class="rounded mx-auto d-block" alt="...">
      </div>

      <div class="icon-circle-code" @click="toggleView" v-if="viewMode === 'output'">
        <img src="../../../assets/code.png" class="rounded mx-auto d-block" alt="...">
      </div>
    </div>

    <div class="editor-container">
      <div :class="{ 'split-view': viewMode === 'split' }">
        <div v-if="viewMode !== 'output'" class="code-editor">
          <ACECodeEditorWrapper
            :editorType="'custom'"
            :codeValue="nodeElement.value"
            @onCodeInput="onCodeInput"
          />
        </div>
        <div v-else class="output-data">
          <div v-html="nodeElement.value"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ACECodeEditorWrapper from '@/components/ace-editor/ACECodeEditorWrapper.vue';

export default {
  name: 'CustomHtmlCodeElement',
  props: {
    nodeElement: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      viewMode: 'code',
    };
  },
  methods: {
    toggleSplitView() {
      this.viewMode = this.viewMode === 'split' ? 'code' : 'split';
    },
    toggleView() {
      this.viewMode = this.viewMode === 'code' ? 'output' : 'code';
      if (this.viewMode === 'output' && this.viewMode !== 'split') {
        this.viewMode = 'split';
      }
    },
    onCodeInput(codeInput) {
      this.nodeElement.value = codeInput;
    },
  },
  components: {
    ACECodeEditorWrapper,
  },
};
</script>

<style scoped>
.codelos-html-wrapper {
  border-style: solid;
  border-color: #D1D1D1;
  padding: 16px;
  border-radius: 6px;
  border-width: thin;
  height: 280px;
}

.editor-container {
  display: flex;
  flex-direction: column;
}

.split-view {
  display: flex;
  flex-direction: row;
}
.code-editor {
  width: 100%;
}
.split-view .code-editor {
  width: 50% !important;
  background-color: antiquewhite;
}
.output-data {
  width: 100%;
  background-color: #f0f0f0;
}
</style>
