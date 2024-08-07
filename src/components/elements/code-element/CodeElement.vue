<template>
  <div
    class="codelos-code-wrapper"
    :data-language="JSON.stringify(getSelectedLanguage)"
    :data-value="nodeElement.value"
  >
    <div class="code-language-dropdown">
      <b-dropdown
        :text="getSelectedLanguage.label"
        class="mb-3 lang-dropdown"
        no-caret
      >
        <template #button-content>
          <span>{{ getSelectedLanguage.label }}</span>
          <b-icon-chevron-down></b-icon-chevron-down>
        </template>
        <b-form-input
          v-model="filterLanguageValue"
          class="m-2 language-search-input"
          placeholder="Search for a language..."
        ></b-form-input>
        <div class="language-dropdown-items">
          <b-dropdown-item
            v-for="lang in getFilterSupportedLanguages"
            :key="lang.value"
            @click="onSelectLanguage(lang.value)"
          >
            {{ lang.label }}</b-dropdown-item
          >
        </div>
      </b-dropdown>
    </div>
    <AceCodeEditor
      @onCodeInput="onCodeInput"
      :editorConfigs="aceEditorConfigs"
      ref="aceCodeEditor"
      :key="nodeElement.id"
      :codeValue="nodeElement.value"
    />
  </div>
</template>

<script>
import AceCodeEditor from '@/components/ace-editor/AceCodeEditor.vue';

export default {
  name: 'CodeElement',
  props: {
    nodeElement: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      aceEditorConfigs: {
        lang: this.nodeElement.language,
      },
      filterLanguageValue: '',
      supportedLanguages: [
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
      ],
    };
  },

  methods: {
    onCodeInput(codeInput) {
      this.nodeElement.value = codeInput;
    },
    onSelectLanguage(language) {
      this.nodeElement.language = language;

      this.$refs.aceCodeEditor.onLanguageChange();
    },
  },

  computed: {
    getFilterSupportedLanguages() {
      return this.supportedLanguages.filter((lang) =>
        lang.value
          .toLowerCase()
          .includes(this.filterLanguageValue.toLowerCase())
      );
    },

    getSelectedLanguage() {
      return this.supportedLanguages.find(
        (lang) => lang.value === this.nodeElement.language
      );
    },
  },

  components: {
    AceCodeEditor,
  },
};
</script>

<style scoped>
.codelos-code-wrapper {
  background-color: #eeeeee;
  padding: 16px;
  border-radius: 6px;
}

.codelos-code-wrapper .language-search-input {
  width: 240px;
}

.codelos-code-wrapper ::v-deep .lang-dropdown button {
  background-color: transparent;
  border: none;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.codelos-code-wrapper ::v-deep .lang-dropdown button svg {
  width: 12px;
  height: 12px;
}
.codelos-code-wrapper ::v-deep .lang-dropdown button:active,
.codelos-code-wrapper ::v-deep .lang-dropdown button:focus-visible {
  background-color: transparent;
  border: none;
  color: black;
  box-shadow: none !important;
}

.codelos-code-wrapper ::v-deep .lang-dropdown button:hover {
  background-color: #e1e1e1;
}

.codelos-code-wrapper .language-dropdown-items {
  max-height: 200px;
  overflow-y: scroll;
}

.codelos-code-wrapper .language-dropdown-items::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
.codelos-code-wrapper .language-dropdown-items::-webkit-scrollbar {
  width: 10px;
  background-color: #f5f5f5;
}
.codelos-code-wrapper .language-dropdown-items::-webkit-scrollbar-thumb {
  background-color: #787878;
}

::v-deep .dropdown-item:active {
  background-color: #eee;
  color: #000000;
}
</style>
