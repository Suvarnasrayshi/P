
<template>
  <div class="codelos-html-wrapper">

    <div class="html-element-menu-dropdown">

      <div class="space-in-between"></div>
      
      <div class="icon-circle-code" @click="toggleView" v-if="viewMode === 'code'">
        <img src="../../../assets/eye.png" class="rounded mx-auto d-block" alt="...">
      </div>
      
      <div class="icon-circle-code" @click="toggleViewOutput" v-if="viewMode === 'output'">
        <img src="../../../assets/code.png" class="rounded mx-auto d-block" alt="...">
      </div>
      <div class="icon-circle-wand" @click="alert">
        <img src="../../../assets/magic.png" class="rounded mx-auto d-block" alt="...">
      </div>
   </div>


   <div class="editor-container">
     <div :class="{ 'split-view': viewMode === 'split'}">

   <div v-if="viewMode === 'output'" class="code-editor">
     <CustomAceCodeEditor
     :key="nodeElement.id"
     @onCodeInput="onCodeInput"
     :codeValue="nodeElement.value"
     id="getthedata"
     class="code-editor"
     />
    </div>
        <div v-if="viewMode !== 'output'" class="code-editor">
          <div v-html="nodeElement.value"></div>
        </div>
        <div v-if="viewMode === 'split'" class="icons-overlay">
          <div class="icon-right">
            <img src="../../../assets/right.svg" alt="Right">
          </div>
          <div class="space-in-between-split"></div>
          <div class="icon-wrong">
            <img src="../../../assets/cross.svg" alt="Wrong">
          </div>
        </div>
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
      default: () => ({}),
    },
  },
  data() {
    return {
     viewMode:'code',
    };
  },
  methods: {
    onCodeInput(codeInput) {
      this.nodeElement.value = codeInput;
    },
    alert() {  
      console.log("MAGIC WAND",this.viewMode)
      this.viewMode = this.viewMode === 'split'?'code':'split'
    },
   toggleView() {
     console.log("Eye",this.viewMode)
     this.viewMode=this.viewMode === 'output'?'code':'output'
    },
    
    toggleViewOutput(){
      console.log("CODE",this.viewMode)
      this.viewMode = this.viewMode === 'code' ? 'output' : 'code';
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
  border-color: #D1D1D1;
  padding: 16px;
  border-radius: 6px;
  border-width: thin;
  height: 280px;
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

.space-in-between-split{
  padding: 10px;
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
 height:200px !important
}

.icons-overlay{
  top: 10px;
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 19px;
}
</style>






