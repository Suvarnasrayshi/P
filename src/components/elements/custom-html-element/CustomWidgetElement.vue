<template>
  <div
    class="codelos-html-wrapper"
  >
 
  <div class="editor-container">
    <div :class=" { 'split-view': isSplitView }">
  <div class="html-element-menu-dropdown">
    <div class="icon-circle-wand" @click="alert">

      <img src="../../../assets/magic.png" class="rounded mx-auto d-block" alt="...">
    </div>
    <div class="space-in-between">

    </div>
    <!-- if slitscreen is there then this eye should not show -->
    <div class="icon-circle-code" @click="getcode" v-if="!isSplitView">
      <img src="../../../assets/eye.png" class="rounded mx-auto d-block" alt="...">
  </div>

  <div class="icon-circle-code" @click="showCode">
    <img src="../../../assets/code.png" class="rounded mx-auto d-block" alt="...">
</div>
<div v-if="!isCodeView && isSplitView" class="output-view">
  <div v-html="nodeElement.value"></div>
</div>
  </div>
    
    <CustomAceCodeEditor
      :key="nodeElement.id"
      @onCodeInput="onCodeInput"
      :codeValue="nodeElement.value"
      id="getthedata"
      class="code-editor"
    />
  </div>
</div>
  </div>
</template>

<script>
import CustomAceCodeEditor from '@/components/ace-editor/CustomAceCodeEditor.vue';

export default {
  name: 'CustomHtmlCodeElement',
  props: {
    nodeElement: {
      type: Object,
      default: () => {},
    },
  },
  created() {
    if (this.nodeElement && !this.nodeElement.settings) {
      this.nodeElement.settings = {
      };
    }
  },
  data() {
    return {
      isSplitView: false,
      isCodeView: true,
    };
  },
  methods: {
    onCodeInput(codeInput) {
      // eslint-disable-next-line
      this.nodeElement.value = codeInput;
      
    },
    alert(){
     
      this.isSplitView = !this.isSplitView;
    },
    getcode(){
      this.isCodeView = false;
      if (!this.isSplitView) {
        this.isSplitView = true; 
      }
    },
    showCode(){
      this.isCodeView = true; 
    }
  },

  components: {
    CustomAceCodeEditor,
  },
};
</script>

<style scoped>
.codelos-html-wrapper {
 border-style: solid;
 border-color:#D1D1D1;
  padding: 16px;
  border-radius: 6px;
  border-width: thin;
}
.codelos-html-wrapper ::v-deep .html-element-menu-dropdown {
  
  position: absolute;
 right:20px;
  z-index: 2;
  display: flex;
}
.codelos-html-wrapper ::v-deep .html-element-menu-dropdown .dropdown-menu {
  width: 250px;
}

.codelos-html-wrapper ::v-deep .html-element-menu-dropdown button {
  background-color: transparent;

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
  
  border-radius: 40px;
}
.codelos-html-wrapper .view-in-pdf-input + .view-in-pdf-label:before {
  right: 1px;
 
  transition: background 0.4s;
}
.codelos-html-wrapper .view-in-pdf-input + .view-in-pdf-label:after {
  width: 14px;
  height: 14px;
  margin: 2px;
  
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
.icon-circle-wand{
  flex-direction: row;
  padding: 10px;
  border-radius: 50%;
}
.icon-circle-code{
  flex-direction: row;
 padding: 20px;
  border-radius: 50%;
}
.space-in-between{
  padding: 5px;
}


.code-editor {
  width:100% !important
}
.split-view {
  display: flex;
  flex-direction: row;
}

.editor-container {
  display: flex;
  flex-direction: column;
}
.split-view .code-editor {
  width: 50% !important;
  background-color: antiquewhite;
}
</style>
