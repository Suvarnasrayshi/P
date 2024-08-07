<template>
  <div class="codelos-embed-flow-wrapper">
    <div class="codelos-add-workflow-modal">
      <b-modal
        v-model="isAddWorkflowModal"
        size="lg"
        id="add-workflow-modal"
        centered
        no-close-on-backdrop
        class="add-workflow-modal"
        :content-class="{ 'is-loading': isLoading }"
      >
        <CustomLoader v-if="isLoading" :spinnerSize="50" />
        <template #modal-header>
          <h5 class="modal-title">Workflow hinzufügen</h5>
          <div class="close-btn" @click="toggleAddWorkflowModal">
            <span aria-hidden="true"><b-icon icon="x-lg"></b-icon></span>
          </div>
        </template>

        <form
          v-if="!isLoading"
          class="add-workflow-form"
          ref="form"
          @submit.stop.prevent="handleSubmit"
        >
          <b-form-group
            label="Knopftext"
            label-for="caption-input"
            class="element-group d-flex align-items-center justify-content-between gap-3 mb-5"
          >
            <b-form-input
              class="w-full"
              id="caption-input"
              v-model="captionClone"
            ></b-form-input>
          </b-form-group>

          <div class="d-flex flex-column gap-3 py-2 workflow-element-list">
            <div
              v-for="element in getFilteredWorkflowElements"
              :key="element.id"
            >
              <b-form-group
                :label="element.name"
                :label-for="String(element.id)"
                class="element-group d-flex align-items-center justify-content-between gap-3"
              >
                <b-form-input
                  class="w-full"
                  :id="String(element.id)"
                  v-model="workflowModalFormClone[element.name]"
                ></b-form-input>
              </b-form-group>
            </div>
          </div>
        </form>

        <template #modal-footer>
          <div class="d-flex justify-content-center gap-3 w-100">
            <button
              class="add-workflow-btn save-btn"
              @click="onSaveAddWorkflow"
            >
              speichern
            </button>
            <button
              class="add-workflow-btn cancel-btn"
              @click="onCancelAddWorkflow"
            >
              verwerfen
            </button>
          </div>
        </template>
      </b-modal>
    </div>

    <div
      v-if="isWorkflowDropdown"
      class="workflow-dropdown-wrapper"
      v-click-outside="closeWorkflowDropdown"
    >
      <div class="workflow-dropdown-search-filter">
        <input
          type="text"
          v-model="workflowFilter"
          placeholder="Suchbergriff"
        />
      </div>
      <hr />
      <div class="workflow-list-wrapper">
        <div
          v-for="workflow in filteredWorkflows"
          :key="workflow.id"
          class="workflow-list-item"
          @click="onSelectWorkflow(workflow.id)"
        >
          {{ workflow.name }}
        </div>
      </div>
    </div>

    <div
      v-if="!isLoading && !isWorkflowDropdown"
      class="embed-flow-button-wrapper"
    >
      <span
        id="embed-flow-button"
        class="span-btn-element embed-flow"
        :data-value="JSON.stringify(this.nodeElement.value.workflowData)"
        :api-end-point="getAPIEndpoint"
        :flow-id="nodeElement.value.selectedWorkflowId"
      >
        {{ getButtonText }}
      </span>

      <div
        class="embed-flow-edit-button-wrapper"
        @click="toggleAddWorkflowModal"
      >
        <img class="button-edit-icon" :src="icons.editButton" alt="" />
      </div>
    </div>
  </div>
</template>

<script>
import { editButton } from '@/assets/images/preDefinedTemplate';
import CustomLoader from '@/components/common/CustomLoader.vue';

export default {
  data() {
    return {
      icons: {
        editButton,
      },
      isAddWorkflowModal: false,
      isWorkflowDropdown: true,
      workflowFilter: null,
      captionClone: null,
      workflowModalFormClone: {},
      isLoading: false,
    };
  },
  props: {
    nodeElement: {
      type: Object,
      default: null,
    },
    workflows: {
      type: Array,
      default: () => [],
    },
    selectedWorkflows: {
      type: Array,
      default: () => [],
    },
    getWorkFlowData: {
      type: Function,
      default: () => {},
    },
    pageBuilderNodes: {
      type: Object,
      default: null,
    },
  },
  components: {
    CustomLoader,
  },
  mounted() {
    if (this.nodeElement.value.selectedWorkflowId) {
      this.isWorkflowDropdown = false;
    }
  },

  methods: {
    showError(message) {
      this.$bvToast.toast(message, {
        variant: 'danger',
        solid: true,
        autoHideDelay: 3000,
        noCloseButton: true,
      });
    },
    async toggleAddWorkflowModal() {
      this.isAddWorkflowModal = !this.isAddWorkflowModal;
      if (this.isAddWorkflowModal) {
        if (
          !this.selectedWorkflowData &&
          this.nodeElement &&
          this.nodeElement.value &&
          this.nodeElement.value.selectedWorkflowId &&
          !this.isLoading
        )
          try {
            this.isLoading = true;

            await this.getWorkflow(this.nodeElement.value.selectedWorkflowId);
          } catch (error) {
            this.isAddWorkflowModal = false;
          } finally {
            this.isLoading = false;
          }

        this.captionClone = this.nodeElement.value.caption;
        this.workflowModalFormClone = JSON.parse(
          JSON.stringify(this.nodeElement.value.workflowData)
        );
      } else {
        this.captionClone = '';
        this.workflowModalFormClone = {};
      }
    },
    toggleWorkflowDropdown() {
      this.isWorkflowDropdown = !this.isWorkflowDropdown;
    },
    deleteEmbedFlowElement() {
      if (
        this.pageBuilderNodes &&
        this.pageBuilderNodes.children &&
        this.pageBuilderNodes.children.length
      ) {
        const elementToRemoveIndex = this.pageBuilderNodes.children.findIndex(
          (childElement) => childElement.id === this.nodeElement.id
        );
        if (elementToRemoveIndex !== -1) {
          this.pageBuilderNodes.children.splice(elementToRemoveIndex, 1);
        }
      }
    },
    closeWorkflowDropdown() {
      this.deleteEmbedFlowElement();
      this.isWorkflowDropdown = false;
    },

    async onSelectWorkflow(workflowId) {
      try {
        this.isLoading = true;
        this.toggleAddWorkflowModal();
        this.toggleWorkflowDropdown();
        const workflowData = await this.getWorkflow(workflowId);

        this.nodeElement.value = {
          ...this.nodeElement.value,
          caption: workflowData.name,
          selectedWorkflowId: workflowData.id,
        };
        this.captionClone = workflowData.name;
      } catch (error) {
        this.toggleAddWorkflowModal();
        this.toggleWorkflowDropdown();
      } finally {
        this.isLoading = false;
      }
    },

    async getWorkflow(workflowId) {
      try {
        if (this.selectedWorkflowData) return this.selectedWorkflowData;
        const workflowData = await this.getWorkFlowData(workflowId);
        if (
          workflowData &&
          workflowData.tasks &&
          workflowData.tasks.length > 0
        ) {
          this.selectedWorkflows.push(workflowData);
          return workflowData;
        }
        throw new Error('Fehlerhaft');
      } catch (error) {
        this.showError('Fehlerhaft!');
        throw new Error(error);
      }
    },

    onSaveAddWorkflow() {
      this.nodeElement.value.caption = this.captionClone;
      this.nodeElement.value.workflowData = JSON.parse(
        JSON.stringify(this.workflowModalFormClone)
      );
      this.toggleAddWorkflowModal();
    },
    onCancelAddWorkflow() {
      this.toggleAddWorkflowModal();
    },
  },
  computed: {
    filteredWorkflows() {
      return this.workflowFilter
        ? this.workflows.filter(
            (workflow) =>
              workflow.name && workflow.name.includes(this.workflowFilter)
          )
        : this.workflows;
    },

    getFilteredWorkflowElements() {
      if (!this.flowElements || !this.flowElements.length) return [];
      const typesToRemove = [
        'image',
        'video',
        'html',
        'title',
        'description',
        'horizontalrule',
        'togglelist',
        'wrapper',
        'divwrapper',
      ];
      return this.flowElements.filter(
        (element) => !typesToRemove.includes(element.type)
      );
    },

    getButtonText() {
      if (!this.nodeElement.value.caption) return;
      return this.nodeElement.value.caption;
    },

    getAPIEndpoint() {
      if (
        this.selectedWorkflowData &&
        this.selectedWorkflowData.settings &&
        this.selectedWorkflowData.settings.apiEndpoint
      )
        return this.selectedWorkflowData.settings.apiEndpoint;
      else return '';
    },

    selectedWorkflowData() {
      return this.selectedWorkflows.find(
        (workflow) =>
          workflow &&
          this.nodeElement &&
          this.nodeElement.value &&
          workflow.id === this.nodeElement.value.selectedWorkflowId
      );
    },
    flowElements() {
      if (this.selectedWorkflowData) {
        return this.selectedWorkflowData.tasks[0].props.formTrigger.elements;
      }
      return [];
    },
  },
};
</script>

<style scoped>
.codelos-embed-flow-wrapper .workflow-dropdown-wrapper {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  padding: 16px;
  position: absolute;
  z-index: 1;
  background-color: white;
  width: 300px;
}
.codelos-embed-flow-wrapper .workflow-dropdown-wrapper input {
  outline: none;
  border: none;
}
.codelos-embed-flow-wrapper .workflow-dropdown-wrapper hr {
  margin-block: 8px;
}
.codelos-embed-flow-wrapper .workflow-dropdown-wrapper .workflow-list-item {
  padding: 8px;
  text-align: center;
  cursor: pointer;
  transition: 0.3s ease-in-out;
}
.codelos-embed-flow-wrapper .workflow-list-wrapper {
  max-height: 250px;
  overflow-y: scroll;
}
.codelos-embed-flow-wrapper .workflow-list-wrapper::-webkit-scrollbar {
  display: none;
}
.codelos-embed-flow-wrapper
  .workflow-dropdown-wrapper
  .workflow-list-item:hover {
  background-color: #f0f0f0;
}

.codelos-embed-flow-wrapper .element-group input {
  width: max-content;
}
/* .codelos-embed-flow-wrapper {
  overflow: scroll;
} */
.codelos-embed-flow-wrapper .button-edit-icon {
  overflow: scroll;
}

.codelos-embed-flow-wrapper .embed-flow-edit-button-wrapper img {
  width: 16px;
  cursor: pointer;
}
.codelos-embed-flow-wrapper .embed-flow-edit-button-wrapper {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.codelos-embed-flow-wrapper .embed-flow-button-wrapper {
  display: flex;
  gap: 12px;
}

.embed-flow-button-wrapper:hover .embed-flow-edit-button-wrapper {
  opacity: 1;
}
::v-deep #add-workflow-modal .close-btn {
  cursor: pointer;
}
::v-deep #add-workflow-modal .modal-content {
  height: 100%;
}

::v-deep #add-workflow-modal .modal-body {
  height: 100%;
  overflow-y: auto;
}

::v-deep #add-workflow-modal .modal-dialog-centered {
  height: calc(100% - (1.75rem * 2));
}

::v-deep #add-workflow-modal ::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #f5f5f5;
}

::v-deep #add-workflow-modal ::-webkit-scrollbar {
  width: 5px !important;
  background-color: #f5f5f5;
  height: 5px;
}

::v-deep #add-workflow-modal ::-webkit-scrollbar-thumb {
  background-color: #000000;
  border: 2px solid #555555;
}

.add-workflow-form {
  height: 100%;
}

.add-workflow-form .workflow-element-list {
  height: calc(100% - (38px + 48px + 14px));
  overflow: auto;
}
::v-deep .modal-open {
  overflow: hidden !important;
}

.add-workflow-btn {
  cursor: pointer;
  text-decoration: none;
  border: 3px solid rgba(0, 0, 0, 0.916);
  border-radius: 0.375em;
  font-family: proxima-nova, Helvetica Neue, Arial, sans-serif;
  font-weight: 400;
  line-height: 23px;
  padding: 0.6rem 1.6rem;
  font-size: 0.9375rem;
  margin-top: 5px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  min-width: 125px;
}

.add-workflow-btn.save-btn {
  background-color: #000000;
  color: #ffffff;
}
.add-workflow-btn.cancel-btn {
  background-color: #ffffff;
  color: #000000;
}

::v-deep .toast .toast-header button.close {
  margin-left: auto;
  margin-bottom: 0;
  font-size: 1.3rem;
  line-height: 0;
  color: #000;
  opacity: 0.5;
  border: none;
  background: transparent;
}
::v-deep .toast:not(.show) {
  display: block;
}
::v-deep .modal-content.is-loading:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgb(230 230 230 / 50%);
  width: 100%;
  height: 100%;
  border-radius: 6px;
  z-index: 1;
}
::v-deep .custom-loader {
  background-color: transparent;
}
.custom-loader .spinner {
  border-color: #000;
  border-bottom-color: transparent;
}

::v-deep #add-workflow-modal .element-group label {
  width: 300px;
}
::v-deep #add-workflow-modal .element-group div {
  width: calc(100% - 300px);
}
#add-workflow-modal .modal-body,
#add-workflow-modal .modal-body * {
  box-sizing: border-box !important;
}
</style>
