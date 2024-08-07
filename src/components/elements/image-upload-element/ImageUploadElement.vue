<template>
  <div class="image-upload-wrapper">
    <div
      class="image-drop-zone"
      :style="getImageDropZoneStyle"
      v-if="!isImageExist && !isErrorInImage"
    >
      <div class="upload-container" @dragover.prevent @dragenter.prevent>
        <label :for="`image_upload_input_${nodeElement.id}`">
          <b-icon icon="images"></b-icon>
          <!-- before upload state -->
          <p v-if="!isImageUploading">Fügen Sie ein Bild hinzu</p>
          <!--  uploading state -->
          <div class="uploading-state" v-if="isImageUploading">
            <p>{{ file.name }}</p>
            <div>
              <span>{{ file.size }} KB <CustomLoader :spinnerSize="20" /></span>
            </div>
          </div>
          <input
            :disabled="isImageUploading"
            type="file"
            name="upload-file"
            :id="`image_upload_input_${nodeElement.id}`"
            accept="image/*"
            @change="onFileSelect"
          />
        </label>
      </div>
    </div>
    <div class="image-preview-wrapper" v-if="isImageExist">
      <CustomResizer
        :width="nodeElement.value.width"
        @resizeend="onResizeImage"
      >
        <div
          class="error-image-wrapper"
          v-if="isErrorInImage"
          :draggable="false"
        >
          <img
            class="error-image"
            src="../../../assets/icons/broken-file.png"
            alt=""
          />
        </div>
        <img
          v-if="!isErrorInImage"
          :src="imageURL"
          @error="onImageLoadingError"
        />
        <div
          class="upload-loading-wrapper"
          v-if="isImageUploading && !isErrorInImage"
        >
          {{ file.size }} KB
          <CustomLoader :spinnerSize="25" :spinnerColor="'#ffffff'" />
        </div>
      </CustomResizer>
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
import CustomResizer from '@/components/common/CustomResizer.vue';
export default {
  name: 'ImageUploadElement',
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
      isImageUploading: false,
      isImageLoading: false,
      file: null,
      isErrorInImage: false,
    };
  },

  async created() {
    if (!this.imageURL && this.nodeElement.value.src) {
      await this.getImage();
    }
  },

  methods: {
    async onUploadFile() {
      try {
        this.isImageUploading = true;
        if (!this.file) return;
        if (!this.file.type.startsWith('image/')) {
          this.$emit(
            'showToast',
            'Ungültiger Dateityp. Bitte laden Sie eine Bilddatei hoch.'
          );
          this.file = null;
          return;
        }
        if (this.file && this.file.size > 10 * 1024 * 1024) {
          this.$emit(
            'showToast',
            'Die Bildgröße überschreitet den Grenzwert von 10 MB. Bitte laden Sie ein kleineres Bild hoch.'
          );
          this.file = null;
          return;
        }
        const imageBlobUrl = URL.createObjectURL(this.file);
        this.$emit('updateNodeElementMetaData', this.nodeElement.id, {
          imageURL: imageBlobUrl,
        });

        const presignedURL = await getPresignedURL(this.file.name);
        this.nodeElement.value.src = presignedURL['signature']['key'];
        await uploadFileToS3Bucket(presignedURL, this.file);
        await this.getImage();
        this.file = null;
        URL.revokeObjectURL(imageBlobUrl);
      } catch (error) {
        throw new Error(error.message);
      } finally {
        this.isImageUploading = false;
      }
    },

    async getImage() {
      try {
        const imageResposne = await getFile(this.nodeElement.value.src);
        this.$emit('updateNodeElementMetaData', this.nodeElement.id, {
          imageURL: imageResposne.fileURL,
        });
      } catch (error) {
        this.isErrorInImage = true;
        throw new Error(error.message);
      }
    },

    async onFileSelect(event) {
      try {
        this.file = event.target.files[0];
        await this.onUploadFile();
      } catch (error) {
        this.isErrorInImage = true;
      }
    },
    async onDropFile(event) {
      try {
        const file = event.dataTransfer.files[0];
        await this.handleDropFile(file);
      } catch (error) {
        throw new Error(error.message);
      }
    },
    async handleDropFile(file) {
      try {
        this.file = file;
        await this.onUploadFile();
      } catch (error) {
        this.isErrorInImage = true;
      }
    },
    onImageLoadingError() {
      this.isErrorInImage = true;
    },
    onResizeImage(width) {
      this.$set(this.nodeElement.value, 'width', width);
    },
  },

  computed: {
    isImageExist() {
      return this.nodeElement.value.src ||
        (this.elementMetaData && this.elementMetaData.imageURL)
        ? true
        : false;
    },
    imageURL() {
      return this.elementMetaData && this.elementMetaData.imageURL;
    },
    getImageDropZoneStyle() {
      return {
        width: !this.isNodeElementTypeColumn ? '40%' : '100%',
      };
    },
  },

  components: {
    CustomLoader,
    CustomResizer,
  },
};
</script>

<style scoped>
.image-upload-wrapper .image-drop-zone {
  border-radius: 4px;
  height: 60px;
  min-height: 60px;
  box-shadow: 1px 1px 6px 2px #0000000f;
}
.image-upload-wrapper .upload-container {
  height: 100%;
  width: 100%;
}
.image-upload-wrapper .image-drop-zone label {
  padding-inline: 10px;
  width: 100%;
  height: 100%;
  max-height: fit-content;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}
.image-upload-wrapper .image-drop-zone input {
  display: none;
}
.image-upload-wrapper .image-drop-zone svg ::v-deep {
  width: 20px;
  height: 20px;
}

.image-upload-wrapper .image-drop-zone {
  position: relative;
}
.image-upload-wrapper .custom-loader {
  background-color: transparent !important;
  position: relative;
  width: 30px;
}

.image-upload-wrapper p {
  margin: 0;
}

.image-upload-wrapper .uploading-state span {
  display: flex;
  align-items: center;
  gap: 12px;
}
.image-upload-wrapper .image-preview-wrapper {
  padding-bottom: 4px;
  position: relative;
}
.image-upload-wrapper .image-preview-wrapper img {
  -webkit-user-drag: none;
  user-select: none;
}

.image-upload-wrapper .image-preview-wrapper .upload-loading-wrapper {
  position: absolute;
  right: 0px;
  bottom: 4px;
  color: #fff;
  background: #0000003d;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
}
.image-upload-wrapper .image-preview-wrapper .error-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16/9;
  background: #e5e5e5;
}

.image-upload-wrapper .image-preview-wrapper img:not(.error-image) {
  height: 100%;
  width: 100%;
}
</style>
