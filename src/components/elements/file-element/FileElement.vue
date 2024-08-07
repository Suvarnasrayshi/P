<template>
  <div class="file-element-wrapper">
    <div
      class="file-selection-container"
      :style="getFileSelectionContainerStyle"
      @click="onShowUploadFileDropdown"
      v-if="!nodeElement.value"
    >
      <p class="h3">
        <b-icon icon="file-earmark-arrow-up"></b-icon>
      </p>
      <p v-if="!isFileUploading">
        Laden Sie eine Datei hoch oder betten Sie sie ein
      </p>
      <div class="uploading-state" v-if="isFileUploading">
        <p>{{ file.name }}</p>
        <div>
          <span class="d-flex flex-row align-items-center gap-2"
            >{{ file.size }} KB <CustomLoader :spinnerSize="20"
          /></span>
        </div>
      </div>
    </div>
    <div
      v-if="isUploadFileDropdown && !isFileUploading"
      class="codelos-file-link-popup"
      @keyup.enter.exact.stop="onAddFileLink"
      v-click-outside="onHideUploadFileDropdown"
    >
      <div class="d-flex flex-row gap-2">
        <div
          v-for="option in uploadSelectionOptions"
          :key="option.type"
          class="user-upload-selection-container"
          @click="onSelectFileUploadOption(option)"
        >
          <div class="user-upload-selection">
            {{ option.caption }}
          </div>
          <div
            v-show="uploadSelectionType === option.type"
            class="selection-border-bottom"
          ></div>
        </div>
      </div>
      <hr class="selection-horizontal-line" />
      <div
        v-if="uploadSelectionType === 'embedLink'"
        class="codelos-selected-type-wrapper"
      >
        <h5>Link einbetten</h5>
        <!-- <h1>{{ nodeElement.value }}</h1> -->
        <input
          id="embed-link-input"
          type="text"
          placeholder="Dateilink einfügen..."
          v-model="fileLink"
        />
        <button class="link-btn" @click="onAddFileLink">Link einbetten</button>
        <div class="codelos-file-link-popup-suggestion">
          Funktioniert mit Links von PDFs, Google Drive, Google Maps, CodePen …
        </div>
      </div>
      <div
        v-if="uploadSelectionType === 'upload'"
        class="codelos-selected-type-wrapper"
      >
        <!-- <button class="link-btn">Choose a file</button> -->
        <label :for="`file_${nodeElement.id}`" class="link-btn link-upload-btn">
          Wähle eine Datei
          <input
            type="file"
            :id="`file_${nodeElement.id}`"
            class="d-none"
            @change="onFileSelect"
          />
        </label>
      </div>
    </div>

    <div
      class="file-preview-wrapper"
      v-if="nodeElement.value && !isFileUploading"
    >
      <div
        class="file-container"
        :class="{
          'selected-link': isOptionDropdown || isRenameLinkDropdown,
          'disable-hover': isOptionDropdown || isRenameLinkDropdown,
        }"
        :style="getFileSelectionContainerStyle"
        contenteditable="false"
      >
        <div class="file-name">
          <b-icon
            icon="file-earmark-arrow-up"
            v-if="nodeElement.validLink"
          ></b-icon>
          <a v-if="nodeElement.validLink" @click.stop="linkRedirect">{{
            `${nodeElement.fileName}.${nodeElement.extension}`
          }}</a>
          <b-icon icon="file-earmark-x" v-if="!nodeElement.validLink"></b-icon>
          <div v-if="!nodeElement.validLink">{{ fileURL }}</div>
        </div>
        <div v-click-outside="hideFileOptionDropdown">
          <div class="option" @click="openFileOptionDropdown">
            <span class="dropdown-icon"
              ><b-icon icon="three-dots"></b-icon
            ></span>
          </div>
          <div
            class="dropdown node-dropdown-options-wrap"
            contenteditable="false"
          >
            <div v-if="isOptionDropdown" class="file-operation-option">
              <div
                v-if="nodeElement.validLink"
                class="dropdown-option node-dropdown-option"
                @click="downloadFile"
              >
                <b-icon icon="cloud-download"></b-icon>
                Herunterladen
              </div>
              <div
                class="dropdown-option node-dropdown-option"
                @click="cloneFile(nodeElement)"
              >
                <b-icon icon="front"></b-icon>
                Duplikat
              </div>
              <div
                v-if="nodeElement.validLink"
                class="dropdown-option node-dropdown-option"
                @click="copyLinkToClipBoard"
              >
                <b-icon icon="files"></b-icon>
                Kopieren
              </div>
              <div
                class="dropdown-option node-dropdown-option"
                @click="deleteFile"
              >
                <b-icon icon="trash"></b-icon>
                Löschen
              </div>
              <div
                v-if="nodeElement.validLink"
                class="dropdown-option node-dropdown-option rename"
                @click.stop="renameFile"
              >
                <b-icon icon="pencil-square"></b-icon>
                Umbenennen
              </div>
            </div>
            <div
              class="rename-input-wrapper"
              v-if="isRenameLinkDropdown"
              v-click-outside="closeRenameDropdown"
            >
              <input
                id="file-name"
                v-model="nodeElement.fileName"
                placeholder="eg - rdtv6.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getPresignedURL,
  uploadFileToS3Bucket,
  getFile,
} from '@/services/services';
import CustomLoader from '@/components/common/CustomLoader.vue';
export default {
  props: {
    nodeElement: {
      type: Object,
      default: null,
    },
    nodeIndex: {
      type: Number,
      default: null,
    },
    elementMetaData: {
      type: Object,
      default: () => {},
    },
    isNodeElementTypeColumn: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      file: null,
      fileLink: null,
      isUploadFileDropdown: false,
      uploadSelectionType: null,
      isRenameLinkDropdown: false,
      isOptionDropdown: false,
      isFileUploading: false,
      uploadSelectionOptions: [
        {
          type: 'upload',
          caption: 'Hochladen',
        },
        {
          type: 'embedLink',
          caption: 'Link einbetten',
        },
      ],
    };
  },
  mounted() {
    if (this.nodeElement.value) {
      if (
        this.nodeElement.linkType &&
        this.nodeElement.linkType === 's3BucketKey'
      ) {
        if (this.fileURL) return;
        this.getUploadedFile();
      } else {
        this.$emit('updateNodeElementMetaData', this.nodeElement.id, {
          fileURL: this.nodeElement.value,
        });
      }
    }
  },
  methods: {
    async onUploadFile() {
      try {
        this.isFileUploading = true;

        if (this.file && this.file.size > 100 * 1024 * 1024) {
          this.$emit(
            'showToast',
            'Die Dateigröße überschreitet den Grenzwert von 100 MB. Bitte laden Sie eine kleinere Datei hoch.'
          );
          this.file = null;
          return;
        }

        const presignedURL = await getPresignedURL(this.file.name);
        await uploadFileToS3Bucket(presignedURL, this.file);
        await this.getUploadedFile(presignedURL['signature']['key']);
        const { fileName, extension } = this.getFileName(this.file.name);
        this.nodeElement.value = presignedURL['signature']['key'];
        this.nodeElement.fileName = fileName;
        this.nodeElement.extension = extension;
        this.nodeElement.linkType = 's3BucketKey';
        this.nodeElement.validLink = true;
      } catch (error) {
        this.$emit(
          'showToast',
          'Datei konnte nicht hochgeladen werden. Bitte versuche es erneut.'
        );
        throw new Error(error.message);
      } finally {
        this.isFileUploading = false;
        this.file = null;
      }
    },
    async getUploadedFile(s3BucketKey = null) {
      try {
        const fileResposne = await getFile(
          s3BucketKey || this.nodeElement.value
        );

        this.$emit('updateNodeElementMetaData', this.nodeElement.id, {
          fileURL: fileResposne.fileURL,
        });
      } catch (error) {
        throw new Error(error.message);
      }
    },
    async handleDropFile(file) {
      try {
        this.file = file;
        await this.onUploadFile();
      } catch (error) {
        //
      }
    },
    async onFileSelect(event) {
      try {
        this.isUploadFileDropdown = false;
        this.file = event.target.files[0];
        await this.onUploadFile();
      } catch (error) {
        this.nodeElement.validLink = true;
      }
    },
    closeRenameDropdown() {
      this.isRenameLinkDropdown = false;
    },
    onShowUploadFileDropdown() {
      if (this.isFileUploading) return;
      this.isUploadFileDropdown = true;
      this.uploadSelectionType = 'embedLink';
    },
    onHideUploadFileDropdown() {
      this.isUploadFileDropdown = false;
    },
    onSelectFileUploadOption(option) {
      this.uploadSelectionType = option.type;
    },
    async onAddFileLink() {
      this.nodeElement.value = this.fileLink;
      await this.getLinkMetaData(this.fileLink);
      this.$emit('updateNodeElementMetaData', this.nodeElement.id, {
        fileURL: this.fileLink,
      });
    },
    getLinkMetaData(fileURL) {
      if (fileURL.match(/https?:\/\/[^\s$.?#].[^\s]*/g)) {
        const pathname = new URL(fileURL).pathname;
        const { fileName, extension } = this.getFileName(pathname);
        this.nodeElement.fileName = fileName;
        this.nodeElement.extension = extension;
        this.nodeElement.validLink = true;
      } else {
        this.nodeElement.validLink = false;
      }
      this.onHideUploadFileDropdown();
    },
    getFileName(fileName) {
      const fileNameWithExtension = fileName.split('/').pop();
      const dotIndex = fileNameWithExtension.lastIndexOf('.');
      if (dotIndex === -1) {
        return { fileName: fileNameWithExtension, extension: '' };
      } else {
        const fileName = fileNameWithExtension.substring(0, dotIndex);
        const extension = fileNameWithExtension.substring(dotIndex + 1);
        return { fileName, extension };
      }
    },
    getFileExtension(fileName) {
      const fileNameWithExtension = fileName.split('/').pop();
      const dotIndex = fileNameWithExtension.lastIndexOf('.');
      if (dotIndex === -1) return '';
      return fileNameWithExtension.substring(dotIndex + 1);
    },
    async copyLinkToClipBoard() {
      try {
        await navigator.clipboard.writeText(this.fileURL);
        this.copied = true;
        this.$emit('showToast', 'Der Dateilink wurde erfolgreich kopiert.');
        this.isOptionDropdown = false;
      } catch (error) {
        this.$emit('showToast', error);
      }
    },
    deleteFile() {
      this.$emit('deleteBlock', this.nodeIndex, this.nodeElement);
    },
    renameFile() {
      this.isOptionDropdown = false;
      this.isRenameLinkDropdown = true;
      setTimeout(() => {
        const getInput = document.getElementById('file-name');
        getInput && getInput.focus();
      }, 100);
    },

    async downloadFile() {
      try {
        const response = await fetch(this.fileURL);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${this.nodeElement.fileName}.${this.nodeElement.extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl); // Clean up
      } catch (error) {
        this.$emit('showToast', 'Die Datei kann nicht heruntergeladen werden');
      }
    },
    cloneFile() {
      this.$emit('duplicateBlock', this.nodeIndex);
      this.isOptionDropdown = false;
    },
    linkRedirect() {
      const link = document.createElement('a');
      link.href = this.fileURL;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    openFileOptionDropdown() {
      this.isOptionDropdown = true;
    },
    hideFileOptionDropdown() {
      this.isOptionDropdown = false;
    },
  },
  computed: {
    getFileSelectionContainerStyle() {
      return {
        width: !this.isNodeElementTypeColumn ? '40%' : '100%',
      };
    },
    fileURL() {
      return this.elementMetaData && this.elementMetaData.fileURL;
    },
  },
  components: {
    CustomLoader,
  },
};
</script>

<style scoped>
.file-selection-container {
  border-radius: 4px;
  padding: 12px;
  box-shadow: 1px 1px 6px 2px #0000000f;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-selection-container p {
  margin: 0;
}

.file-element-wrapper .codelos-file-link-popup {
  display: flex;
  flex-direction: column;
  width: 15%;
  padding: 5px;
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
    rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px;
  width: 300px;
  min-width: 180px;
  max-width: calc(100vw - 24px);
  position: absolute;
  left: 30px;
  top: 45px;
  z-index: 10;
  background: white;

  border-radius: 6px;
}

.file-element-wrapper .codelos-file-link-popup input[type='text'] {
  font-size: 14px;
  line-height: 20px;
  padding: 3px 6px;
  position: relative;
  border-radius: 4px;
  box-shadow: rgba(15, 15, 15, 0.1) 0px 0px 0px 1px inset;
  background: rgba(242, 241, 238, 0.6);
  cursor: text;
  height: 28px;
  width: 100%;
}
.file-element-wrapper .codelos-selected-type-wrapper .link-btn {
  background: rgb(35, 131, 226);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 0px;
  color: white;
  padding-block: 3px;
}
.file-element-wrapper .codelos-selected-type-wrapper .link-btn.link-upload-btn {
  text-align: center;
}
.file-element-wrapper .codelos-file-link-popup-suggestion {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(120, 119, 116);
  margin-top: 2px;
  font-size: 12px;
}
.file-element-wrapper .user-upload-selection {
  padding: 4px 10px;
  cursor: pointer;
}
.file-element-wrapper .user-upload-selection:hover {
  background-color: #ededed;
  border-radius: 4px;
}
.file-element-wrapper .selection-horizontal-line {
  border-bottom: 1px solid #4747471c;
  margin-top: 0px;
  margin-bottom: 5px;
}
.file-element-wrapper .codelos-selected-type-wrapper {
  padding: 5px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.file-element-wrapper .codelos-selected-type-wrapper h5 {
  margin: 0;
}
.file-element-wrapper .user-upload-selection-container {
  position: relative;
  padding-block: 5px;
}
.file-element-wrapper .selection-border-bottom {
  position: absolute;
  border-bottom: 2px solid black;
  bottom: 0px;
  left: 8px;
  right: 8px;
}

.file-element-wrapper .file-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: transparent; /* Default color */
  padding: 5px;
  border-radius: 4px;
  position: relative;
}

.file-element-wrapper .file-container .file-name {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;
}
.file-element-wrapper .file-container a {
  display: inline-block;
  color: black;
  text-decoration: none;
  cursor: pointer;
}
.file-element-wrapper .file-container .option {
  display: none;
  cursor: pointer;
}
.file-element-wrapper .file-container .dropdown {
  position: absolute;
  padding: 5px 10px;
  cursor: pointer;
  padding: 10px;
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
    rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px;
}

.file-element-wrapper .file-container .dropdown-icon {
  display: flex;
  height: 20px;
  width: 20px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.file-element-wrapper .file-container .dropdown-icon:hover {
  background-color: #d1d1d1;
}
.file-element-wrapper .file-container:hover {
  background-color: #f0eef0;
}
.file-element-wrapper .file-container:hover .option {
  display: block;
}
.file-element-wrapper .disable-hover:hover .option {
  display: none !important; /* Hide .option on hover when disabled */
}
.file-element-wrapper .disable-hover:hover {
  background-color: transparent !important;
}
.file-element-wrapper .selected-link {
  background-color: #e0eefb !important;
}
.file-element-wrapper .selected-link:hover {
  background-color: #e0eefb !important;
}
.file-element-wrapper .rename-input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #c4c4c4;
  padding: 5px;
  border-radius: 4px;
  background-color: #f9f9f9;
  max-width: 300px; /* Adjust as per your requirement */
}
.file-element-wrapper .rename-input-wrapper input {
  border: none;
  outline: none;
  flex: 1;
  padding: 5px;
  font-size: 14px;
} /*  */

.file-element-wrapper .node-dropdown-option {
  display: flex;
  align-items: center;
  transition: all 300ms ease-in-out;
  padding: 5px;
}

.file-element-wrapper .node-dropdown-option svg {
  margin-right: 15px;
}
.file-element-wrapper .node-dropdown-options-wrap {
  background: #fff;
  padding: 0 !important;
  position: relative;
  z-index: 10;
}
.file-element-wrapper .node-dropdown-option:hover {
  background: #eee;
}
.file-element-wrapper .file-operation-option {
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 5px;
  /* position: absolute;
  z-index: 1; */
}
.file-element-wrapper .custom-loader {
  background-color: transparent !important;
  position: relative;
  width: 30px;
}
</style>
