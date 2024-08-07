<template>
  <div class="video-upload-wrapper">
    <div
      class="video-drop-zone"
      :style="getVideoDropZoneStyle"
      v-if="
        (!isVideoExist && !isErrorInVideo) || (isVideoExist && isVideoUploading)
      "
    >
      <div class="upload-container" @dragover.prevent @dragenter.prevent>
        <label :for="`video_upload_input_${nodeElement.id}`">
          <b-icon icon="images"></b-icon>
          <!-- before upload state -->
          <p v-if="!isVideoUploading">Fügen Sie ein Video hinzu</p>
          <!--  uploading state -->
          <div class="uploading-state" v-if="isVideoUploading">
            <p>{{ file.name }}</p>
            <div>
              <span>{{ file.size }} KB <CustomLoader :spinnerSize="20" /></span>
            </div>
          </div>
          <input
            :disabled="isVideoUploading"
            type="file"
            name="upload-file"
            :id="`video_upload_input_${nodeElement.id}`"
            accept="video/*"
            @change="onFileSelect"
          />
        </label>
      </div>
    </div>
    <div class="video-preview-wrapper" v-if="isVideoExist && !isVideoUploading">
      <CustomResizer
        :width="nodeElement.value.width"
        @resizeend="onResizeVideo"
      >
        <div
          class="error-video-wrapper"
          :draggable="false"
          v-if="isErrorInVideo"
        >
          <img
            class="error-image"
            src="../../../assets/icons/broken-file.png"
            alt=""
          />
        </div>
        <video
          v-if="!isErrorInVideo"
          :src="videoURL"
          @error="onVideoLoadingError"
          controls
          preload="metadata"
          playsinline
        />
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
  name: 'VideoElement',
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
      isVideoUploading: false,
      isImageLoading: false,
      file: null,
      isErrorInVideo: false,
    };
  },

  async created() {
    if (!this.videoURL && this.nodeElement.value.src) {
      await this.getVideoURL();
    }
  },

  methods: {
    async onUploadFile() {
      try {
        this.isVideoUploading = true;
        if (!this.file) return;
        if (!this.file.type.startsWith('video/')) {
          this.$emit(
            'showToast',
            'Ungültiger Dateityp. Bitte laden Sie eine Bilddatei hoch.'
          );
          this.file = null;
          return;
        }
        if (this.file && this.file.size > 500 * 1024 * 1024) {
          this.$emit(
            'showToast',
            'Die Videogröße überschreitet die Grenze von 500 MB. Bitte laden Sie ein kleineres Video hoch.'
          );
          this.file = null;
          return;
        }

        const maxFileSize = 500 * 1024 * 1024;

        if (this.file.size > maxFileSize) {
          this.$emit(
            'showToast',
            'Die Videogröße sollte weniger als 500 MB betragen..'
          );
          this.file = null;
          return;
        }

        const presignedURL = await getPresignedURL(this.file.name);
        this.nodeElement.value.src = presignedURL['signature']['key'];
        await uploadFileToS3Bucket(presignedURL, this.file);
        await this.getVideoURL();
        this.file = null;
      } catch (error) {
        throw new Error(error.message);
      } finally {
        this.isVideoUploading = false;
      }
    },

    async getVideoURL() {
      try {
        const videoURLResposne = await getFile(this.nodeElement.value.src);
        this.$emit('updateNodeElementMetaData', this.nodeElement.id, {
          videoURL: videoURLResposne.fileURL,
        });
      } catch (error) {
        this.isErrorInVideo = true;
        throw new Error(error.message);
      }
    },

    async onFileSelect(event) {
      try {
        this.file = event.target.files[0];
        await this.onUploadFile();
      } catch (error) {
        this.isErrorInVideo = true;
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
        this.isErrorInVideo = true;
      }
    },
    onVideoLoadingError() {
      this.isErrorInVideo = true;
    },
    onResizeVideo(width) {
      this.$set(this.nodeElement.value, 'width', width);
    },
  },

  computed: {
    videoURL() {
      return this.elementMetaData && this.elementMetaData.videoURL;
    },
    isVideoExist() {
      return this.nodeElement.value.src || this.videoURL;
    },
    getVideoDropZoneStyle() {
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
.video-upload-wrapper .video-drop-zone {
  border-radius: 4px;
  height: 60px;
  min-height: 60px;
  box-shadow: 1px 1px 6px 2px #0000000f;
}
.video-upload-wrapper .upload-container {
  height: 100%;
  width: 100%;
}
.video-upload-wrapper .video-drop-zone label {
  padding-inline: 10px;
  width: 100%;
  height: 100%;
  max-height: fit-content;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
}
.video-upload-wrapper .video-drop-zone input {
  display: none;
}
.video-upload-wrapper .video-drop-zone svg ::v-deep {
  width: 20px;
  height: 20px;
}

.video-upload-wrapper .video-drop-zone {
  position: relative;
}
.video-upload-wrapper .custom-loader {
  background-color: transparent !important;
  position: relative;
  width: 30px;
}

.video-upload-wrapper p {
  margin: 0;
}

.video-upload-wrapper .uploading-state span {
  display: flex;
  align-items: center;
  gap: 12px;
}
.video-upload-wrapper .video-preview-wrapper {
  padding-bottom: 4px;
  position: relative;
}

.video-upload-wrapper .video-preview-wrapper .error-video-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16/9;
  background: #e5e5e5;
}

.video-upload-wrapper .video-preview-wrapper video:not(.error-image) {
  height: 100%;
  width: 100%;
}
</style>
