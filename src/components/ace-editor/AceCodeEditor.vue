<template>
  <AceEditor
    v-model="codeInput"
    @init="editorInit"
    @input="onEditorCodeInput"
    ref="aceEditor"
    :lang="lang"
    :theme="theme"
    :width="width"
    :height="height"
    :options="aceEditorOptions"
    class="ace-code-editor"
  />
</template>

<script>
import AceEditor from 'vuejs-ace-editor';
import 'brace/ext/language_tools';
import 'brace/mode/html';
import 'brace/mode/javascript';
import 'brace/mode/python';
import 'brace/mode/less';
import 'brace/theme/chrome';
import 'brace/snippets/html';
import 'brace/snippets/javascript';
import 'brace/snippets/python';
import 'brace/snippets/css';

export default {
  name: 'ACECodeEditor',

  props: {
    editorConfigs: {
      typeof: Object,
      default: null,
    },
    codeValue: {
      typeof: String,
      default: null,
    },
  },

  data() {
    return {
      codeInput: null,
      lang: 'html',
      theme: 'chrome',
      width: '100%',
      height: '200px',
      aceEditorOptions: {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        fontSize: 14,
        highlightActiveLine: false,
        enableSnippets: true,
        tabSize: 2,
        showPrintMargin: false,
        showGutter: true,
      },
    };
  },

  mounted() {
    this.$el.addEventListener('mouseenter', this.onMouseEnter);
    this.$el.addEventListener('mouseleave', this.onMouseLeave);
    const { lang, theme, width, height, options } = this.editorConfigs || {};
    this.lang = lang || this.lang;
    this.theme = theme || this.theme;
    this.width = width || this.width;
    this.height = height || this.height;
    this.aceEditorOptions = { ...this.aceEditorOptions, ...options };

    this.codeInput = this.codeValue;
  },

  methods: {
    onMouseEnter() {
      document.documentElement.style.overscrollBehaviorX = 'none';
      document.body.style.overscrollBehaviorX = 'none';
    },
    onMouseLeave() {
      document.documentElement.style.overscrollBehaviorX = 'auto';
      document.body.style.overscrollBehaviorX = 'auto';
    },
    editorInit: function () {
      const aceEditor = this.$refs.aceEditor.editor;
      const textInput = aceEditor.textInput.getElement();
      textInput.addEventListener('keydown', this.onEditorCodeKeyDown);
    },

    onEditorCodeKeyDown(event) {
      if (event.key === 'Tab') {
        event.preventDefault();
        const editor = this.$refs.aceEditor.editor;
        editor.execCommand('insertstring', '\t');
      }
    },
    onEditorCodeInput() {
      this.$emit('onCodeInput', this.codeInput);
    },

    onLanguageChange() {
      this.lang = this.editorConfigs.lang;
    },
  },
  beforeDestroy() {
    const aceEditor = this.$refs.aceEditor.editor;
    const textInput = aceEditor.textInput.getElement();
    textInput.removeEventListener('keydown', this.onEditorCodeKeyDown);
    this.$el.removeEventListener('mouseenter', this.onMouseEnter);
    this.$el.removeEventListener('mouseleave', this.onMouseLeave);
  },

  components: {
    AceEditor,
  },
};
</script>

<style scoped>
.ace-code-editor {
  background-color: #eeeeee;
  z-index: 0;
}
</style>
