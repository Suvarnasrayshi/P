<template>
  <div class="codelos-html-wrapper">
    <div class="html-element-menu-dropdown">
      <div class="space-in-between"></div>

      <div
        class="icon-circle-code"
        @click="toggleView"
        v-if="viewMode === 'code'"
      >
        <img
          src="../../../assets/eye.png"
          class="rounded mx-auto d-block"
          alt="..."
        />
      </div>

      <div
        class="icon-circle-code"
        @click="toggleViewOutput"
        v-if="viewMode === 'output'"
      >
        <img
          src="../../../assets/code.png"
          class="rounded mx-auto d-block"
          alt="..."
        />
      </div>
      <div
        :class="{
          'icon-circle-wand': true,
          'split-right': viewMode === 'split',
        }"
        @click="toggleSplitView"
      >
        <img
          src="../../../assets/magic.png"
          class="rounded mx-auto d-block"
          alt="..."
        />
      </div>
    </div>

    <div class="editor-container">
      <div :class="{ 'split-view': viewMode === 'split' }">
        <div v-if="viewMode === 'output'" class="code-editor">
          <CustomAceCodeEditor
            :key="nodeElement.id"
            @onCodeInput="onCodeInput"
            :codeValue="nodeElement.value"
            id="getthedata"
            class="code-editor"
          />
        </div>
        <div
          v-if="viewMode !== 'output'"
          class="code-editor"
          @mouseup="onMouseUp"
        >
          <div v-html="nodeElement.value"></div>
        </div>
        <div v-if="viewMode === 'split'">
          <div class="icons-overlay-right" @click="gotoOutput">
            <img src="../../../assets/right.svg" alt="Right" />
          </div>

          <div class="icons-overlay" @click="gotoCodeSide">
            <img src="../../../assets/cross.svg" alt="Wrong" />
          </div>
          <div class="selected-content">
            💡Selektiere ein Element um es individueller gestallten zu können
            <div
              v-for="(selection, index) in selections"
              :key="selection.id"
              class="selection-item"
            >
              <input
                v-model="selection.text"
                @input="updateSelectedText(index)"
                class="editable-text"
                :disabled="selection.confirmed"
              />
              <select v-model="selection.dropdownValue" class="dropdown-select">
                <option value="text">Text</option>
                <option value="number">Zahl</option>
              </select>
              <img
                src="../../../assets/right.svg"
                class="rounded mx-auto d-block"
                alt="Right"
                @click="confirmSelection(index)"
              />
              <img
                src="../../../assets/dust.svg"
                class="rounded mx-auto d-block"
                alt="Dustbin"
                @click="toggleRemove(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div classs="codeoutput">
      <div class="html-element-menu-dropdown">
        <div
          class="icon-circle-code"
          @click="toggleSplit"
          v-if="viewMode === 'codeoutput'"
        >
          <img
            src="../../../assets/edit.svg"
            class="rounded mx-auto d-block"
            alt="..."
          />
        </div>
        <div
          class="icon-circle-code"
          @click="toggleSettingsView"
          v-if="viewMode === 'codeoutput'"
        >
          <img
            src="../../../assets/setting.svg"
            class="rounded mx-auto d-block"
            alt="..."
          />
        </div>
      </div>
      <div v-if="viewMode === 'code-split'" class="split-screen"></div>
      <div v-if="viewMode === 'code-split'" class="right-side-data">
        <div
          class="icon-cross"
          @click="toggleCodeOutputView"
          v-if="viewMode === 'code-split'"
        >
          <img
            src="../../../assets/cross.svg"
            class="rounded mx-auto d-block"
            alt="..."
          />
        </div>
        <div class="code-split-right">
          <div class="right-side"></div>
          <div class="new-content">
            <div v-for="(content, index) in newContent" :key="'new-' + index">
              <div>{{ content }}</div>
            </div>
          </div>
          <div class="old-content">
            <div v-for="(content, index) in oldContent" :key="'old-' + index">
              <!-- <div>{{ content }}</div> -->
              <input
                v-model="content.text"
                @input="updateOutputData(index)"
                class="editable-text"
              />
            </div>
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
      default: null,
    },
  },
  data() {
    return {
      viewMode: 'output',
      selections: [],
      newContent: [],
      oldContent: [],
    };
  },
  methods: {
    onCodeInput(codeInput) {
      this.nodeElement.value = codeInput;
    },
    toggleSplitView() {
      console.log('MAGIC WAND', this.viewMode);
      this.viewMode = this.viewMode === 'split' ? 'code' : 'split';
    },
    toggleView() {
      console.log('Eye', this.viewMode);
      this.viewMode = this.viewMode === 'output' ? 'code' : 'output';
    },
    toggleViewOutput() {
      console.log('CODE', this.viewMode);
      this.viewMode = this.viewMode === 'code' ? 'output' : 'code';
    },
    toggleSettingsView() {
      this.viewMode = 'code-split';
    },
    onMouseUp() {
      const selection = window.getSelection();
      const text = selection.toString();
      if (text) {
        const parentElement = selection.anchorNode.parentElement;
        if (parentElement) {
          const uniqueId = `selected-${Date.now()}`;
          parentElement.innerHTML = parentElement.innerHTML.replace(
            text,
            `<span id="${uniqueId}">${text}</span>`
          );
          this.addSelection(text, uniqueId);
          this.oldContent.push({ text });
          console.log('oldContent', this.oldContent);
        }
      }
    },
    addSelection(text, uniqueId) {
      this.selections.push({
        text,
        uniqueId,
        dropdownValue: '',
        confirmed: false,
      });
    },
    updateSelectedText(index) {
      const selection = this.selections[index];
      console.log("selection.text",selection.text)
      const spanElement = document.getElementById(selection.uniqueId);
      console.log("spanElement",spanElement)
      if (spanElement) {
        this.newContent[index] = selection.text;
      }
    },
    updateOutputData(index) {
      console.log('indexdataof output', index);
     const selectedData = this.oldContent[index];
      console.log("this.nodeElement.value",this.nodeElement.value)
      console.log("selected",selectedData)
      this.nodeElement.value=selectedData
    },
    gotoCodeSide() {
      this.viewMode = 'code';
    },
    gotoOutput() {
      this.viewMode = this.viewMode === 'codeoutput' ? 'split' : 'codeoutput';
    },
    toggleSplit() {
      console.log('toggle', this.viewMode);
      this.viewMode = this.viewMode === 'codeoutput' ? 'split' : 'codeoutput';
      console.log('toggle1', this.viewMode);
    },
    toggleRemove(index) {
      this.selections.splice(index, 1);
    },

    confirmSelection(index) {
      const selection = this.selections[index];
      console.log('selectionData', selection.text);
      selection.confirmed = true;
      this.newContent[index] = this.selections[index].text;
      console.log('sdfkdsgfgsdfgdgf', selection.confirmed);
    },
    toggleCodeOutputView() {
      this.viewMode =
        this.viewMode === 'code-split' ? 'codeoutput' : 'code-split';
    },
  },
  components: {
    CustomAceCodeEditor,
  },
};
</script>

<style scoped>
.codelos-html-wrapper {
  border-style: solid;
  border-color: #d1d1d1;
  padding: 16px;
  border-radius: 6px;
  border-width: thin;
  height: 240px;
}
.codelos-html-wrapper ::v-deep .html-element-menu-dropdown {
  position: absolute;
  right: 20px;
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
.icon-circle-wand {
  flex-direction: row;
  padding: 5px;
  border-radius: 50%;
}
.icon-circle-code {
  flex-direction: row;
  padding: 20px;
  border-radius: 50%;
}
.space-in-between {
  padding: 5px;
}
.code-editor {
  width: 100% !important;
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
  height: 200px !important;
}

.icons-overlay {
  top: 28px;
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 19px;
}

.icons-overlay-right {
  top: 28px;
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 59px;
}
.split-right {
  position: absolute;
  right: 760px;
  top: 0px;
}
.selected-content {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-left: 40px;
}
.dropdown-select {
  margin-left: 60px;
  flex-direction: row;
  margin-right: 40px;
}
.selection-item {
  display: flex;
  align-items: center;
}
.selection-item > div {
  margin-right: 400px;
}
select {
  background-color: transparent;
  border: none;
  padding: 0 1em 0 0;
  margin: 0;
  width: 10%;
  font-family: inherit;
  font-size: inherit;
  cursor: inherit;
  line-height: inherit;
}

input {
  border: none;
}
.icon-cross {
  padding-left: 334px;
  top: 0;
}
.code-split-right {
  padding-top: 0;
  display: flex;
  flex-direction: row;
  right: 0;
  height: 200px;
}
.code-split-view {
  display: flex;
  flex-direction: row;
}
.code-split-view .code-editor {
  width: 50% !important;
  height: 200px !important;
}
.split-screen {
  display: flex;
  height: 100%;
  width: 50%;
}

.left-side {
  width: 50%;
  background-color: #f0f0f0;
  padding: 10px;
}
.right-side {
  display: flex;
  flex-direction: row;
}

.right-side-data {
  width: 35% !important;
  padding-left: 100px;
  margin-left: 839px;
}

.old-content .new-content {
  flex: 1;
  margin: 5px;
  padding: 10px;
}
</style>
