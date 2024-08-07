<template>
  <div
    :class="customClass"
    :style="getMainContainerPerColWidth"
    @click="onColInputClick($event)"
    :contenteditable="isContentEditable"
  >
    <draggable
      :list="pageBuilderNodes.children"
      handle=".codelos-page-content-handler"
      :draggable="true"
      @start="onDragStart"
      @end="onDragEnd"
      @move="onDragMove"
      @update="onListUpdate"
    >
      <!-- node element loop -->
      <template v-for="(node, nodeIndex) in pageBuilderNodes.children">
        <div
          v-if="node"
          :key="node.id"
          class="element-block"
          :data-block-index="nodeIndex"
          @mouseover="showHandleOnHover(nodeIndex)"
          @mouseleave="showHandleOnHover(null)"
          :class="[
            node.class,
            {
              'full-width':
                [
                  supportedNodes.TABLE.type,
                  supportedNodes.TIME_SERIES.type,
                  supportedNodes.DATAFRAME.type,
                  supportedNodes.HIGHCHART.type,
                ].includes(node.type) && node.value.isFullWidth,
            },
          ]"
        >
          <div
            class="drop-zone top"
            v-if="showDropZoneLineIndex === nodeIndex"
          ></div>
          <div class="element-wrapper">
            <!-- options icon -->
            <div
              v-if="node.type !== supportedNodes.COLUMN.type"
              class="draggible-icon"
              @click="toggleOptionsModal(nodeIndex, $event)"
            >
              <b-icon-grip-vertical
                class="codelos-page-content-handler"
              ></b-icon-grip-vertical>
            </div>

            <!-- / options icon -->

            <!-- create element popup -->
            <CommonDropdown
              v-if="
                showCreateElementModalIdx === nodeIndex &&
                isShowCreateElementModal
              "
              class="create-element"
              ref="createElementDropdown"
              @close="toggleCreateElementModal(false, null)"
            >
              <!-- <div
                class="codelos-dropdown create-element"
                ref="createElementDropdown"
                v-if="
                  showCreateElementModalIdx === nodeIndex &&
                  isShowCreateElementModal
                "
                :style="getDropdownHeight(60, 'create-element')"
              > -->
              <!-- <div
                id="create-element-overly"
                class="modal-backdrop custom-backdrop"
              ></div> -->
              <!-- @click="toggleCreateElementModal(false, null)" -->

              <div
                v-for="(
                  element, index
                ) in getFilteredCreateElementSupportedOptions"
                :key="index"
                class="codelos-dropdown-item create-element-dropdowm-item"
                :class="{
                  'create-element-dropdown-item-focus':
                    createElementOptionsFocusIndex === index,
                }"
                ref="create-element-dropdown-item"
                @click="onGenerateElementFromDropdown(element, node, nodeIndex)"
              >
                {{ element.name }}
              </div>

              <div
                v-if="!getFilteredCreateElementSupportedOptions.length"
                class="codelos-dropdown-item no-result-item"
              >
                Keine Ergebnisse
              </div>
              <!-- </div> -->
            </CommonDropdown>
            <!-- / create element popup -->

            <!-- options popup -->
            <CommonDropdown
              v-if="showOptionModalIdx === nodeIndex && isShowOptionModal"
              ref="codelosOptionsDropdown"
              @close="toggleOptionsModal(nodeIndex)"
            >
              <div class="close-btn" @click="toggleOptionsModal(nodeIndex)">
                <b-icon-x-lg></b-icon-x-lg>
              </div>
              <div
                class="codelos-dropdown-item"
                @click="deleteBlock(nodeIndex, node)"
              >
                Löschen
              </div>
              <div
                class="codelos-dropdown-item"
                @click="duplicateBlock(nodeIndex)"
              >
                Duplizieren
              </div>

              <!-- turn into -->
              <div
                class="codelos-dropdown-item"
                :class="{ 'show-turn-into': showTurnIntoIndex != null }"
                v-if="
                  !turnIntoOrSelectInputNotSupportedTypes.includes(node.type)
                "
                @mouseover="onMouseHoverOrLeaveAtTurnIno(nodeIndex)"
                @mouseleave="onMouseHoverOrLeaveAtTurnIno(null)"
              >
                Umwandeln

                <b-dropdown
                  ref="turnIntoItemsDropdown"
                  class="codelos-turninto-dropdown"
                >
                  <b-dropdown-item
                    v-for="(
                      turnIntoSupportedOption, turnIntoIndex
                    ) in turnIntoSupportedOptions"
                    :key="turnIntoIndex"
                    @click="
                      generateElement(
                        `${nodeIndex}_${node.id}`,
                        turnIntoSupportedOption.type
                      )
                    "
                    class="turn-input-select-item"
                  >
                    {{ turnIntoSupportedOption.name }}
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <!-- turn into -->

              <!-- input select -->

              <div
                class="codelos-dropdown-item"
                v-if="
                  !turnIntoOrSelectInputNotSupportedTypes.includes(node.type)
                "
                @mouseover="onMouseHoverOrLeaveAtSelectInput(nodeIndex)"
                @mouseleave="onMouseHoverOrLeaveAtSelectInput(null)"
              >
                Element auswählen
                <!-- offset="-10" -->
                <b-dropdown
                  ref="taskSelectInputItems"
                  class="codelos-input-dropdown"
                >
                  <!-- dropright -->
                  <b-dropdown-item
                    v-for="(taskInput, taskInputIndex) in getPreviousTaskInputs"
                    :key="taskInputIndex"
                    @click="
                      onTaskInputSelect(
                        `${nodeIndex}_${node.id}`,
                        taskInput,
                        node.id
                      )
                    "
                    class="task-input-select-item"
                  >
                    {{ taskInput.label }}
                  </b-dropdown-item>
                  <div
                    v-if="!getPreviousTaskInputs.length"
                    class="codelos-dropdown-item no-result-item"
                  >
                    Keine Ergebnisse
                  </div>
                </b-dropdown>
              </div>
              <!-- input select -->

              <!-- alignement start -->

              <div
                class="codelos-dropdown-item"
                v-if="alignementSelectionSupportedTypes.includes(node.type)"
                @mouseover="onMouseHoverOrLeaveAtAlignmentSelect(nodeIndex)"
                @mouseleave="onMouseHoverOrLeaveAtAlignmentSelect(null)"
              >
                Align

                <b-dropdown
                  ref="alignmentItemsDropdown"
                  class="codelos-alignment-dropdown"
                >
                  <b-dropdown-item
                    v-for="(
                      alignmentSupportedOption, alignmentItemIndex
                    ) in alignmentSupportedOptions"
                    :key="alignmentItemIndex"
                    class="alignment-select-item"
                    @click="
                      onAlignmentSelect(nodeIndex, alignmentSupportedOption)
                    "
                    :class="{
                      'alignment-active-item':
                        node.style &&
                        node.style.textAlign === alignmentSupportedOption.value,
                    }"
                  >
                    {{ alignmentSupportedOption.name }}
                  </b-dropdown-item>
                </b-dropdown>
              </div>
              <!-- alingnment end -->

              <div
                class="codelos-dropdown-item"
                v-if="
                  [
                    supportedNodes.TABLE.type,
                    supportedNodes.TIME_SERIES.type,
                    supportedNodes.DATAFRAME.type,
                    supportedNodes.HIGHCHART.type,
                  ].includes(node.type)
                "
                @click="toggleElementFullWidth(nodeIndex)"
              >
                {{ node.value.isFullWidth ? 'Linksbündig' : 'Gesamtbreite' }}
              </div>
              <div
                class="codelos-dropdown-item"
                v-if="node.type === supportedNodes.DATAFRAME.type"
                @click="onConvertChartToTable(node, nodeIndex)"
              >
                als Tabelle anzeigen
              </div>
              <div
                v-if="
                  node.type === supportedNodes.TABLE.type &&
                  isTableCreatedWithDataframe(node)
                "
                class="codelos-dropdown-item"
                @click="onConvertTableToChart(node, nodeIndex)"
              >
                Zurück zum Diagramm
              </div>
            </CommonDropdown>
            <!-- / options popup -->

            <!-- all simple elements -->

            <div
              :class="{ 'is-empty': !node.value && node.id === focusElementId }"
              :id="`${nodeIndex}_${node.id}`"
              :key="`all_simple_elements_${node.id}_${node.type}`"
              :placeholder="setPlaceholder(node)"
              :contenteditable="true"
              :style="getElementStyle(node)"
              @input="onNodeElementInput($event, nodeIndex)"
              @keyup.enter.exact.prevent="onElementEnter($event, nodeIndex)"
              @keyup.backspace.exact.prevent="
                onElementBackSpace($event, nodeIndex, node)
              "
              @keyup="onkeyUp($event, nodeIndex, node)"
              @focus="onFocusElements(nodeIndex, node)"
              @keydown="onkeyDown($event, nodeIndex, node)"
              @paste="onPasteItems($event, nodeIndex, node)"
              v-if="
                node.type !== supportedNodes.UNORDERED_LIST.type &&
                node.type !== supportedNodes.INPUT.type &&
                node.type !== supportedNodes.TABLE.type &&
                node.type !== supportedNodes.TIME_SERIES.type &&
                node.type !== supportedNodes.COLUMN.type &&
                node.type !== supportedNodes.DATAFRAME.type &&
                node.type !== supportedNodes.BUTTON.type &&
                node.type !== supportedNodes.HIGHCHART.type &&
                node.type !== supportedNodes.HTML.type &&
                node.type !== supportedNodes.CODE.type &&
                node.type !== supportedNodes.IMAGE_UPLOAD.type &&
                node.type !== supportedNodes.VIDEO.type &&
                node.type !== supportedNodes.FILE.type
              "
            >
              <template
                v-if="
                  node.type !== supportedNodes.IMAGE.type &&
                  node.type !== supportedNodes.ANCHOR.type &&
                  node.type !== supportedNodes.IFRAME.type &&
                  node.type !== supportedNodes.HEADING_ONE.type &&
                  node.type !== supportedNodes.HEADING_TWO.type &&
                  node.type !== supportedNodes.HEADING_THREE.type
                "
              >
                {{ node.value }}
              </template>
              <img
                v-if="node.type === supportedNodes.IMAGE.type"
                :src="node.src"
                :alt="node.value"
              />
              <a
                v-if="node.type === supportedNodes.ANCHOR.type"
                :href="node.src"
              >
                {{ node.value }}
              </a>

              <!-- iframe -->

              <div
                v-if="node.type === supportedNodes.IFRAME.type"
                :contenteditable="false"
              >
                <div
                  class="codelos-iframe-wrapper"
                  :style="{ width: node.value.width, justifyContent: 'center' }"
                >
                  <div
                    v-if="
                      node.value.url &&
                      (!activeIframeDropDown.id ||
                        activeIframeDropDown.id !== node.id ||
                        (activeIframeDropDown.id === node.id &&
                          activeIframeDropDown.type !== 'create'))
                    "
                    class="codelos-iframe"
                  >
                    <iframe
                      :src="node.value.url"
                      :width="node.value.width"
                      :height="node.value.height"
                    ></iframe>

                    <b-dropdown
                      no-caret
                      right
                      class="codelos-iframe-actions"
                      ref="codelos-iframe-actions"
                      @shown="onShowIframeActionDropdown"
                    >
                      <template v-slot:button-content>
                        <b-icon icon="three-dots"></b-icon>
                      </template>
                      <b-dropdown-item @click="onEditIframe(node)"
                        ><b-icon icon="pencil-square"></b-icon>
                        Edit</b-dropdown-item
                      >
                    </b-dropdown>
                  </div>

                  <div
                    v-if="node.id === activeIframeDropDown.id"
                    class="codelos-iframe-link-dropdown"
                    :class="{
                      'codelos-iframe-link-dropdown-create':
                        activeIframeDropDown.type === 'edit',
                    }"
                    v-click-outside="
                      () => onCloseIframeLinkDropDown(nodeIndex, node)
                    "
                  >
                    <h5>Link einbetten</h5>
                    <div class="mt-4 d-flex flex-column gap-2">
                      <input
                        type="text"
                        id="codelos-iframe-url-input"
                        class="codelos-iframe-create-input"
                        v-model="activeInputIframeLink"
                        placeholder="Dateilink einfügen..."
                        @keyup.prevent="onKeyUpIframeURLInput($event, node)"
                      />

                      <button
                        @click="onCreateIframeElement(node)"
                        class="codelos-iframe-create-button"
                      >
                        Link einbetten
                      </button>

                      <div class="codelos-iframe-info-text">
                        Funktioniert mit Links von PDFs, Google Drive, Google
                        Maps, CodePen …
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- iframe -->

              <!-- headings start-->

              <template
                v-if="
                  node.type === supportedNodes.HEADING_ONE.type ||
                  node.type === supportedNodes.HEADING_TWO.type ||
                  node.type === supportedNodes.HEADING_THREE.type
                "
              >
                {{ node.value }}
              </template>

              <!-- headings end-->
            </div>
            <!-- / all simple elements -->

            <!-- bullet list -->
            <div
              v-if="node.type === supportedNodes.UNORDERED_LIST.type"
              :id="`${nodeIndex}_${node.id}`"
              :key="`unordered_list_element_${node.id}`"
            >
              <div class="codelos-bulleted-list-wrap-block">
                <div class="codelos-bulleted-list-bullet">
                  <div class="pseudoBefore" style=""></div>
                </div>
                <div class="codelos-bulleted-list-content-wrap">
                  <div
                    :contenteditable="true"
                    class="codelos-bulleted-list-content-inner"
                    @input="onBulletListInput($event, nodeIndex)"
                    @keyup.enter.exact.prevent="
                      onBulletListEnter($event, nodeIndex)
                    "
                    @keyup.backspace.exact.prevent="
                      onElementBackSpace($event, nodeIndex, node)
                    "
                    @keyup="onkeyUp($event, nodeIndex, node)"
                    @focus="onFocusBulletList($event, nodeIndex, node)"
                    @keydown="onkeyDown($event, nodeIndex, node)"
                    @paste="onPasteItems($event, nodeIndex, node)"
                  >
                    <template>
                      {{ node.value }}
                    </template>
                  </div>
                </div>
              </div>
            </div>
            <!-- / bullet list -->

            <!-- table -->
            <div
              v-if="node.type === supportedNodes.TABLE.type"
              :id="`${nodeIndex}_${node.id}`"
              :key="`table_${node.id}`"
            >
              <tableComponent
                :tableSchema="{
                  rows: node.value.rows,
                  cols: node.value.cols,
                  content: node.value.content,
                  heading: node.value.headingContent,
                  boldRows: node.value.boldRows,
                }"
                :hasHeader="node.value.hasHeader"
                :editable="node.value.editable"
                :isShowHeading="node.value.isShowHeading"
                :userTheme="userTheme"
                @rowCountChange="onTableRowCountChange($event, nodeIndex)"
                @colCountChange="onTableColCountChange($event, nodeIndex)"
                @tableContentChange="onTableContentChange($event, nodeIndex)"
                @toggleRowHeader="onToggleRowHeader($event, nodeIndex)"
                @toggleHeadingInTable="onToggleRowHeading($event, nodeIndex)"
                @onTableHeadingChange="onTableHeadingChange($event, nodeIndex)"
                @toggleRowBold="toggleRowBold($event, nodeIndex)"
              />
            </div>
            <!-- / table -->

            <!-- timeseries -->

            <div
              v-if="
                [
                  supportedNodes.TIME_SERIES.type,
                  supportedNodes.DATAFRAME.type,
                  supportedNodes.HIGHCHART.type,
                ].includes(node.type)
              "
              :id="`${nodeIndex}_${node.id}`"
              :key="`chart_wrapper_${node.id}`"
            >
              <timeSeriesChart
                :nodeElement="node"
                :task="task"
                :key="`chart_${node.id}`"
              ></timeSeriesChart>
            </div>
            <!-- / timeseries -->

            <!-- input -->
            <div
              v-if="node.type === supportedNodes.INPUT.type"
              :id="`${nodeIndex}_${node.id}`"
              :key="`input_element_${node.id}`"
              :value="node.value"
              :placeholder="node.placeHolder"
              :contenteditable="true"
              class="codelos-input-block"
              :class="{ 'is-empty': !node.value && node.id === focusElementId }"
              :style="getElementStyle(node)"
              @input="onNodeElementInput($event, nodeIndex)"
              @keyup.enter.exact.prevent="onElementEnter($event, nodeIndex)"
              @keydown.enter.exact.prevent="
                onElementEnterKeyDown($event, nodeIndex)
              "
              @keyup.backspace.exact.prevent="
                onElementBackSpace($event, nodeIndex, node)
              "
              @keyup="onkeyUp($event, nodeIndex, node)"
              @focus="onFocusInputElement($event, nodeIndex, node)"
              @keydown="onkeyDown($event, nodeIndex, node)"
              @paste="onPasteItems($event, nodeIndex, node)"
            >
              {{ node.value }}
            </div>
            <!-- input -->

            <!-- col -->
            <div
              v-if="
                node.type === supportedNodes.COLUMN.type && node.elements.length
              "
              :id="`${nodeIndex}_${node.id}`"
              :key="`column_element_${node.id}`"
              class="codelos-row-block"
            >
              <RecursiveElementNodes
                ref="recursiveElementNodes"
                v-for="element in node.elements"
                :key="element.id"
                :pageBuilderNodes="element"
                :mainContainerWidthConf="{
                  widthOfSingleCol: 100 / node.elements.length,
                  noOfCol: node.elements.length,
                }"
                :customClass="element.class"
                :task="task"
                :isNodeElementTypeColumn="true"
                :nodeElementMetaData="nodeElementMetaData"
                @deleteColumnElement="deleteColumnElement"
                @showToast="showToast"
                @onDragMove="onDragMove"
                @onDragEnd="onDragEnd"
                @resetDropZone="resetDropZone"
              ></RecursiveElementNodes>
            </div>

            <!-- col -->

            <!-- button start -->

            <div
              v-if="node.type === supportedNodes.BUTTON.type"
              :id="`${nodeIndex}_${node.id}`"
              :key="`${nodeIndex}`"
              class="codelos-button-block"
            >
              <div
                class="codelos-button-wrapper"
                v-if="node.variant === 'embed-flow'"
              >
                <EmbedWorkflowButton
                  :workflows="workflows"
                  :nodeElement="node"
                  :selectedWorkflows="selectedWorkflows"
                  :getWorkFlowData="getWorkFlowData"
                  :pageBuilderNodes="pageBuilderNodes"
                />
              </div>
              <div
                v-if="node.variant === 'export-excel'"
                class="codelos-button-wrapper"
              >
                <div class="d-flex gap-2">
                  <span
                    id="button-excel-export"
                    class="span-btn-element export-excel"
                    :data-value="node.value.output"
                  >
                    {{ node.value.caption }}
                  </span>
                </div>

                <b-dropdown
                  class="export-excel-dropdown-options"
                  @hide="onButtonDropDownHide($event, node.value)"
                >
                  <template v-slot:button-content>
                    <img
                      :src="templateIcons.editButton"
                      alt="button-info-edit-icon"
                    />
                  </template>
                  <b-dropdown-form>
                    <div
                      class="d-flex flex-column export-excel-dropdown-form-item"
                    >
                      <label for="button-caption"> Caption </label>
                      <div class="export-excel-dropdown-input-elements">
                        <input
                          type="text"
                          name="button-caption"
                          v-model="node.value.caption"
                        />
                        <b-icon-chevron-down
                          class="export-excel-select-dropdown"
                          @click="showSelectionDropdown('caption', nodeIndex)"
                        ></b-icon-chevron-down>

                        <div
                          v-if="
                            activeSelectDropdown.elementIndex === nodeIndex &&
                            activeSelectDropdown.inputName === 'caption'
                          "
                          v-click-outside="closeSelectionDropdown"
                          style="position: absolute; z-index: 10"
                          class="button-dropdown-caption-selection"
                        >
                          <b-dropdown-item
                            v-for="(value, key) in getInputElement"
                            :key="key"
                            :value="value"
                            @click.native.capture.stop.prevent="
                              onSelectDropdownItem(nodeIndex, value, 'caption')
                            "
                          >
                            {{ key }}</b-dropdown-item
                          >
                        </div>
                      </div>
                    </div>
                    <div
                      class="d-flex flex-column export-excel-dropdown-form-item"
                    >
                      <label for="button-value"> Value </label>
                      <div class="export-excel-dropdown-input-elements">
                        <input
                          type="text"
                          name="button-caption"
                          v-model="node.value.output"
                        />

                        <b-icon-chevron-down
                          class="export-excel-select-dropdown"
                          @click="showSelectionDropdown('output', nodeIndex)"
                        ></b-icon-chevron-down>

                        <div
                          v-if="
                            activeSelectDropdown.elementIndex === nodeIndex &&
                            activeSelectDropdown.inputName === 'output'
                          "
                          v-click-outside="closeSelectionDropdown"
                          style="position: absolute; z-index: 10"
                          class="button-dropdown-value-selection"
                        >
                          <b-dropdown-item
                            v-for="(value, key) in getInputElement"
                            :key="key"
                            :value="value"
                            @click.native.capture.stop.prevent="
                              onSelectDropdownItem(nodeIndex, value, 'output')
                            "
                          >
                            {{ key }}</b-dropdown-item
                          >
                        </div>
                      </div>
                    </div>
                  </b-dropdown-form>
                </b-dropdown>
              </div>
            </div>

            <!-- button ended -->

            <!-- html  element start -->
            <div
              v-if="node.type === supportedNodes.HTML.type"
              :key="`html_element_${node.id}`"
              :id="`${nodeIndex}_${node.id}`"
            >
              <HTMLCodeElement :nodeElement="node" />
            </div>
            <!-- html element end -->

            <!-- code element start -->
            <div
              v-if="node.type === supportedNodes.CODE.type"
              :key="`code_element_${node.id}`"
              :id="`${nodeIndex}_${node.id}`"
            >
              <CodeElement :nodeElement="node" :key="node.id" />
            </div>
            <!-- code element end -->
            <!-- file upload dropdown start -->

            <div
              v-if="node.type === supportedNodes.FILE.type"
              :key="`file_element_${node.id}`"
              :id="`${nodeIndex}_${node.id}`"
            >
              <FileElement
                :ref="`file_element_${node.id}`"
                :nodeElement="node"
                :nodeIndex="nodeIndex"
                :key="node.id"
                :elementMetaData="nodeElementMetaData[node.id]"
                :isNodeElementTypeColumn="isNodeElementTypeColumn"
                @duplicateBlock="duplicateBlock"
                @deleteBlock="deleteBlock"
                @showToast="showToast"
                @updateNodeElementMetaData="updateNodeElementMetaData"
              />
            </div>

            <!-- file upload dropdown end -->

            <!-- image upload element start -->

            <div
              v-if="node.type === supportedNodes.IMAGE_UPLOAD.type"
              :key="`image_upload_element_${node.id}`"
              :id="`${nodeIndex}_${node.id}`"
            >
              <ImageUploadElement
                :ref="`image_upload_element_${node.id}`"
                :nodeElement="node"
                :nodeIndex="nodeIndex"
                :elementMetaData="nodeElementMetaData[node.id]"
                :isNodeElementTypeColumn="isNodeElementTypeColumn"
                @updateNodeElementMetaData="updateNodeElementMetaData"
                @showToast="showToast"
              />
            </div>
            <!-- image upload element end -->
            <!-- video element start -->
            <div
              v-if="node.type === supportedNodes.VIDEO.type"
              :key="`video_element_${node.id}`"
              :id="`${nodeIndex}_${node.id}`"
            >
              <VideoElement
                :ref="`video_element_${node.id}`"
                :nodeElement="node"
                :nodeIndex="nodeIndex"
                :elementMetaData="nodeElementMetaData[node.id]"
                :isNodeElementTypeColumn="isNodeElementTypeColumn"
                @updateNodeElementMetaData="updateNodeElementMetaData"
                @showToast="showToast"
              />
            </div>
            <!-- video element end -->
          </div>
          <div
            class="drop-zone bottom"
            v-if="
              pageBuilderNodes.children.length - 1 === nodeIndex &&
              pageBuilderNodes.children.length === showDropZoneLineIndex
            "
          ></div>
        </div>
      </template>

      <!-- / node element loop -->
    </draggable>
  </div>
  <!-- / draggable content area -->
</template>

<script>
import draggable from './DraggableWrap.vue';
import { TableBuilderComponent } from '@codelos.io/table-builder';
import timeSeriesChart from '@/components/timeSeriesChart.vue';
import '@codelos.io/table-builder/dist/table-builder.css';
import { v4 as uuidv4 } from 'uuid';
import preDefinedTemplate from '@/assets/images/preDefinedTemplate';
import EmbedWorkflowButton from '@/components/elements/button-element/EmbedFlow.vue';
import HTMLCodeElement from '@/components/elements/html-element/HTMLCodeElement.vue';
import CodeElement from '@/components/elements/code-element/CodeElement.vue';
import ImageUploadElement from '@/components/elements/image-upload-element/ImageUploadElement.vue';
import VideoElement from '@/components/elements/video-element/VideoElement.vue';
import FileElement from '@/components/elements/file-element/FileElement.vue';

import CommonDropdown from '@/components/common/CommonDropdown.vue';

export default {
  name: 'RecursiveElementNodes',

  data() {
    return {
      templateIcons: preDefinedTemplate,
      isRenameLinkDropdown: false,
      isVisible: true,
      isShowOptionModal: false,
      showOptionModalIdx: null,
      isShowCreateElementModal: false,
      showCreateElementModalIdx: null,
      showTurnIntoIndex: null,
      showSelectInputIndex: null,
      showHandleIdx: null,
      supportedNodes: {
        HEADING_ONE: {
          type: 'h1',
          identifier: '#',
          initialObj: {
            id: uuidv4(),
            type: 'h1',
            value: null,
            style: {},
            class: 'codelos-header-one-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        HEADING_TWO: {
          type: 'h2',
          identifier: '##',
          initialObj: {
            id: uuidv4(),
            type: 'h2',
            value: null,
            style: {},
            class: 'codelos-header-two-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        HEADING_THREE: {
          type: 'h3',
          identifier: '###',
          initialObj: {
            id: uuidv4(),
            type: 'h3',
            value: null,
            style: {},
            class: 'codelos-header-three-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        UNORDERED_LIST: {
          type: 'ul',
          identifier: '-',
          initialObj: {
            id: uuidv4(),
            type: 'ul',
            value: null,
            class: 'codelos-bulleted-list-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        PARAGRAPH: {
          type: 'p',
          identifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'p',
            value: null,
            style: {},
            class: 'codelos-paragraph-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        IMAGE: {
          type: 'img',
          identifier: '!',
          initialObj: {
            id: uuidv4(),
            type: 'img',
            src: null,
            class: 'codelos-image-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        ANCHOR: {
          type: 'a',
          identifier: '@',
          initialObj: {
            id: uuidv4(),
            type: 'a',
            src: null,
            value: null,
            class: 'codelos-anchor-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        COLUMN: {
          type: 'col',
          identifier: '/col',
          initialObj: {
            id: uuidv4(),
            type: 'col',
            class: 'codelos-col-list-block',
            elements: [],
          },
          getInitialObj(id = null, noOfCols = 2) {
            const colObj = JSON.parse(JSON.stringify(this.initialObj));
            id ? (colObj.id = id) : (colObj.id = uuidv4());
            for (let index = 0; index < noOfCols; index++) {
              const colSubObj = {
                id: uuidv4(),
                type: 'col-sub',
                class: 'codelos-col-block',
                children: [
                  {
                    id: uuidv4(),
                    type: 'input',
                    value: null,
                    placeHolder: "Drücken Sie '/' für Befehle ...",
                    class: 'codelos-text-block',
                  },
                ],
              };
              colObj.elements.push(colSubObj);
            }
            return colObj;
          },
        },

        COLUMN_SUB: {
          type: 'col-sub',
          identifier: '/col',
          initialObj: {
            id: uuidv4(),
            type: 'col-sub',
            class: 'codelos-col-block',
            children: [],
          },
        },
        INPUT: {
          type: 'input',
          identifier: 'input',
          initialObj: {
            id: uuidv4(),
            type: 'input',
            value: null,
            placeHolder: "Drücken Sie '/' für Befehle ...",
            class: 'codelos-text-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        HR: {
          type: 'hr',
          identifier: '---',
          initialObj: {
            id: uuidv4(),
            type: 'hr',
            value: null,
            class: 'codelos-hr-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        TABLE: {
          type: 'table',
          identifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'table',
            value: {
              rows: 2,
              cols: 2,
              content: null,
              tableString: null,
              hasHeader: false,
              isShowHeading: false,
              headingContent: null,
              isFullWidth: true,
              boldRows: new Array(2).fill(false),
            },
            class: 'codelos-table-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        FILE: {
          type: 'file',
          initialObj: {
            id: uuidv4(),
            type: 'file',
            class: 'codelos-file-block',
            value: null,
            fileName: null,
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            tmp.value = '';
            return tmp;
          },
          dropdownVisbleID: null,
        },
        TIME_SERIES: {
          type: 'timeseries',
          identifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'timeseries',
            value: {
              timeSeries: null,
              isFullWidth: true,
            },
            class: 'codelos-timeseries-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        DATAFRAME: {
          type: 'dataframe',
          identifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'dataframe',
            value: {
              dataframe: null,
              isFullWidth: true,
            },
            class: 'codelos-dataframe-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        BUTTON: {
          type: 'button',
          identifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'button',
            value: null,
            class: 'codelos-button-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        HIGHCHART: {
          type: 'highchart',
          indentifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'highchart',
            value: {
              highchart: null,
              isFullwidth: true,
            },
            class: 'codelos-highchart-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },

        IFRAME: {
          type: 'iframe',
          indentifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'iframe',
            value: {
              url: '',
              width: '1000px',
              height: '562.5px',
            },
            class: 'codelos-iframe-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        HTML: {
          type: 'html',
          indentifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'html',
            value: '',
            settings: {
              viewInPDF: false,
            },
            class: 'codelos-html-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        CODE: {
          type: 'code',
          indentifier: null,
          initialObj: {
            id: uuidv4(),
            type: 'code',
            value: '',
            language: 'javascript',
            class: 'codelos-code-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        IMAGE_UPLOAD: {
          type: 'image-upload',
          identifier: '',
          initialObj: {
            id: uuidv4(),
            type: 'image-upload',
            value: {
              src: null,
            },
            class: 'codelos-img-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
        VIDEO: {
          type: 'video',
          identifier: '',
          initialObj: {
            id: uuidv4(),
            type: 'video',
            value: {
              src: null,
            },
            class: 'codelos-video-block',
          },
          getInitialObj(id = null) {
            const tmp = JSON.parse(JSON.stringify(this.initialObj));
            id ? (tmp.id = id) : (tmp.id = uuidv4());
            return tmp;
          },
        },
      },
      turnIntoSupportedOptions: [
        { name: 'H1', type: 'h1' },
        { name: 'H2', type: 'h2' },
        { name: 'H3', type: 'h3' },
        { name: 'P', type: 'input' },
      ],
      createElementSupportedOptions: [
        { name: 'Tabelle', type: 'table' },
        { name: 'Spalte 2', type: 'col', noOfCols: 2 },
        { name: 'Spalte 3', type: 'col', noOfCols: 3 },
        { name: 'Spalte 4', type: 'col', noOfCols: 4 },
        { name: 'Export', type: 'button', variant: 'export-excel' },
        { name: 'Datei', type: 'file' },
        { name: 'Iframe', type: 'iframe' },
        { name: 'Workflow einbinden', type: 'button', variant: 'embed-flow' },
        { name: 'HTML', type: 'html' },
        { name: 'Code', type: 'code' },
        { name: 'Bild', type: 'image-upload' },
        { name: 'Video', type: 'video' },
      ],
      alignmentSupportedOptions: [
        {
          name: 'Left',
          value: 'left',
        },
        {
          name: 'Right',
          value: 'right',
        },
        {
          name: 'Center',
          value: 'center',
        },
        {
          name: 'Justified',
          value: 'justify',
        },
      ],
      showDropZoneLineIndex: null,
      activeSelectDropdown: {
        elementIndex: null,
        inputName: null,
      },
      activeIframeActionDropDownId: null,
      activeIframeDropDown: {
        id: null,
        type: 'create',
      },
      activeInputIframeLink: null,
      createElementOptionsFocusIndex: 0,
      selectedWorkflows: [],
      inputTimeout: null,
      bulletListInputTimeout: null,
      isContentEditable: false,
      focusElementId: null,
    };
  },

  props: {
    pageBuilderNodes: Object,
    mainContainerWidthConf: { type: Object, default: null },
    customClass: { type: String, default: null },
    userTheme: {
      type: Object,
      default: null,
    },
    task: {
      type: Object,
      default() {
        return null;
      },
    },
    workflows: {
      type: Array,
      default() {
        return [];
      },
    },
    getWorkFlowData: {
      type: Function,
      default: () => {},
    },
    isNodeElementTypeColumn: {
      type: Boolean,
      default: false,
    },
    nodeElementMetaData: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    alignementSelectionSupportedTypes() {
      return [
        this.supportedNodes.HEADING_ONE.type,
        this.supportedNodes.HEADING_TWO.type,
        this.supportedNodes.HEADING_THREE.type,
        this.supportedNodes.INPUT.type,
      ];
    },
    turnIntoOrSelectInputNotSupportedTypes() {
      return [
        this.supportedNodes.ANCHOR.type,
        this.supportedNodes.IMAGE.type,
        this.supportedNodes.TABLE.type,
        this.supportedNodes.TIME_SERIES.type,
        this.supportedNodes.COLUMN.type,
        this.supportedNodes.DATAFRAME.type,
        this.supportedNodes.BUTTON.type,
        this.supportedNodes.HIGHCHART.type,
        this.supportedNodes.HTML.type,
        this.supportedNodes.BUTTON.type,
        this.supportedNodes.FILE.type,
        this.supportedNodes.CODE.type,
        this.supportedNodes.IFRAME.type,
        this.supportedNodes.IMAGE_UPLOAD.type,
        this.supportedNodes.VIDEO.type,
      ];
    },

    pasteItemsSupportedElements() {
      return [
        this.supportedNodes.INPUT.type,
        this.supportedNodes.HEADING_ONE.type,
        this.supportedNodes.HEADING_TWO.type,
        this.supportedNodes.HEADING_THREE.type,
        this.supportedNodes.PARAGRAPH.type,
        this.supportedNodes.UNORDERED_LIST.type,
      ];
    },
    getPageBuilderList() {
      return this.pageBuilderNodes.children.filter((el) => el);
    },
    getMainContainerPerColWidth() {
      return this.mainContainerWidthConf
        ? `width:calc(${
            this.mainContainerWidthConf.widthOfSingleCol
          }% - ((${30}px * ${this.mainContainerWidthConf.noOfCol - 1}) / ${
            this.mainContainerWidthConf.noOfCol
          }))`
        : '100%';
    },
    getPreviousTaskInputs() {
      // const supportedInputTypes = ['timeseries', 'dataframe', 'highchart'];
      const notSupportedInputTypes = ['json', 'file'];
      return this.task && this.task.input && this.task.input.length
        ? this.clone(this.task.input).filter(
            (el) => !notSupportedInputTypes.includes(el.type)
          )
        : [];
    },

    getInputElement() {
      return this.task.input.reduce((acc, obj) => {
        if (obj.type === 'text') {
          acc[obj.label] = '{' + obj.name + '}';
        }
        return acc;
      }, {});
    },

    getFilteredCreateElementSupportedOptions() {
      if (
        this.isShowCreateElementModal &&
        this.showCreateElementModalIdx !== null &&
        this.pageBuilderNodes &&
        this.pageBuilderNodes.children &&
        this.pageBuilderNodes.children.length &&
        this.pageBuilderNodes.children[this.showCreateElementModalIdx]
      ) {
        const currentFocusedElement =
          this.pageBuilderNodes.children[this.showCreateElementModalIdx];

        if (currentFocusedElement && currentFocusedElement.value) {
          const indexOfSlash = currentFocusedElement.value.indexOf('/');
          const filterValue =
            indexOfSlash !== -1
              ? currentFocusedElement.value
                  .substring(indexOfSlash + 1)
                  .trim()
                  .toLowerCase()
              : '';
          return this.createElementSupportedOptions.filter(
            (option) =>
              !(this.isNodeElementTypeColumn && option.type === 'col') &&
              option.name &&
              option.name.toLowerCase().includes(filterValue)
          );
        }
      }
      return this.createElementSupportedOptions;
    },
  },
  watch: {
    getFilteredCreateElementSupportedOptions(newVal, old) {
      if (JSON.stringify(newVal) !== JSON.stringify(old)) {
        this.createElementOptionsFocusIndex = 0;
      }
    },
  },

  methods: {
    onButtonDropDownHide(e, nodeValue) {
      if (!nodeValue.caption) nodeValue.caption = 'Als Excel exportieren';
    },

    onkeyUp(event, nodeIndex, node) {
      if (['file-name', 'codelos-iframe-url-input'].includes(event.target.id)) {
        return;
      }
      const spaceAddedAt = this.getCaretIndex(event.target.childNodes[0]);

      if (event.key === '/' && event.target.innerText.trim().length === 1) {
        const nodeIds = event.target.classList.contains(
          'codelos-bulleted-list-content-inner'
        )
          ? event.target.parentElement.parentElement.parentElement.id.split('_')
          : event.target.id.split('_');
        this.toggleCreateElementModal(true, Number(nodeIds[0]));
      }

      if (event.key === 'ArrowDown' && this.isShowCreateElementModal) {
        this.focusCreateElementDropdownItem(
          this.createElementOptionsFocusIndex + 1
        );

        setTimeout(() => {
          this.scrollCreateElementonFocus('end');
        });
      }
      if (event.key === 'ArrowUp' && this.isShowCreateElementModal) {
        this.focusCreateElementDropdownItem(
          this.createElementOptionsFocusIndex - 1
        );
        this.setCursorToPositionOrFocus(event.target, false, true);
        setTimeout(() => {
          this.scrollCreateElementonFocus('start');
        });
      }

      if (
        event.code === 'Space' &&
        this.isStringStartingHaveIdentifier(event.target.innerText) &&
        ((event.target.innerText[spaceAddedAt - 1] === ' ' &&
          this.isStringStartingHaveIdentifier(
            event.target.innerText[spaceAddedAt - 2]
          )) ||
          (event.target.innerText.trim().length === 1 &&
            this.isValidIdentifier(event.target.innerText[0])) ||
          (event.target.innerText.trim().length === 2 &&
            this.isValidIdentifier(event.target.innerText.substr(0, 2))) ||
          (event.target.innerText.trim().length === 3 &&
            this.isValidIdentifier(event.target.innerText.substr(0, 3))) ||
          this.isValidIdentifier(event.target.innerText[0], true))
      ) {
        this.generateElement(event);
      }

      if (event.code === 'Delete') {
        this.deleteElement(event, node);
      }
    },
    onkeyDown(event, nodeIndex) {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        this.onElementEnter(event, nodeIndex);
      }
      if (event.key === 'Enter') {
        event.preventDefault();
      }
      if (
        (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
        !this.isShowCreateElementModal
      ) {
        const currentLineNumber = this.getLineNumberInElement(event.target);
        const totalLines = this.getTotalLinesOfElement(event.target);

        if (
          event.key === 'ArrowDown' &&
          (currentLineNumber < totalLines ||
            nodeIndex === this.pageBuilderNodes.children.length - 1) &&
          event.target &&
          event.target.innerText &&
          event.target.innerText.length
        ) {
          return;
        }

        if (
          event.key === 'ArrowUp' &&
          (currentLineNumber > 1 || nodeIndex === 0)
        ) {
          return;
        }

        let newIndex =
          event.key === 'ArrowDown' ? nodeIndex + 1 : nodeIndex - 1;
        this.isContentEditable = true;
        setTimeout(() => {
          this.handleCaretPosision(newIndex);
        });
      }
      if (
        (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
        this.isShowCreateElementModal
      ) {
        event.preventDefault();
      }
    },
    handleCaretPosision(newElementIndex) {
      const newNode = this.pageBuilderNodes.children[newElementIndex];
      if (!newNode) {
        this.isContentEditable = false;
        return;
      }
      const newElement = document.getElementById(
        `${newElementIndex}_${newNode.id}`
      );
      const elementCaretPosition = this.getCaretIndex(newElement);
      this.isContentEditable = false;
      setTimeout(() => {
        this.setCursorToPositionOrFocus(newElement, elementCaretPosition);
      });
    },

    getLineNumberInElement(element) {
      const selection = window.getSelection();

      if (!selection.isCollapsed) {
        return;
      }

      const range = selection.getRangeAt(0);

      const cursorRange = range.cloneRange();
      cursorRange.collapse(true);

      const contentRange = document.createRange();
      contentRange.selectNodeContents(element);

      const cursorRect = cursorRange.getBoundingClientRect();
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const lineNumber = Math.ceil(
        (cursorRect.top - element.getBoundingClientRect().top) / lineHeight
      );

      return lineNumber;
    },
    getTotalLinesOfElement(element) {
      const selection = window.getSelection();

      if (!selection.isCollapsed) {
        return;
      }

      const totalHeight = element.clientHeight;

      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);

      const totalLines = Math.ceil(totalHeight / lineHeight);

      return totalLines;
    },

    scrollCreateElementonFocus(position = null) {
      const createElementDropdown = this.$refs.createElementDropdown[0];
      const dropDownRect = createElementDropdown.$el.getBoundingClientRect();
      const focusedElement = document.querySelector(
        '.create-element-dropdown-item-focus'
      );

      const focusedElementRect = focusedElement.getBoundingClientRect();

      const isFocusedElementVisible =
        position === 'start'
          ? focusedElementRect.top >=
            dropDownRect.top + focusedElementRect.height / 2
          : focusedElementRect.bottom <=
            dropDownRect.bottom - focusedElementRect.height / 2;
      if (!isFocusedElementVisible) {
        focusedElement.scrollIntoViewIfNeeded(false);
      }
    },

    isStringStartingHaveIdentifier(innerText) {
      return (
        innerText.startsWith(this.supportedNodes.HEADING_THREE.identifier) ||
        innerText.startsWith(this.supportedNodes.HEADING_TWO.identifier) ||
        innerText.startsWith(this.supportedNodes.HEADING_ONE.identifier) ||
        innerText.startsWith(this.supportedNodes.ANCHOR.identifier) ||
        innerText.startsWith(this.supportedNodes.IMAGE.identifier) ||
        innerText.startsWith(this.supportedNodes.HR.identifier) ||
        innerText.startsWith(this.supportedNodes.UNORDERED_LIST.identifier)
      );
    },

    isValidIdentifier(identifier, forImageAndAnchor = false) {
      return forImageAndAnchor
        ? identifier === this.supportedNodes.ANCHOR.identifier ||
            identifier === this.supportedNodes.IMAGE.identifier
        : identifier === this.supportedNodes.HEADING_THREE.identifier ||
            identifier === this.supportedNodes.HEADING_TWO.identifier ||
            identifier === this.supportedNodes.HEADING_ONE.identifier ||
            identifier === this.supportedNodes.HR.identifier ||
            identifier === this.supportedNodes.UNORDERED_LIST.identifier;
    },

    setPlaceholder(node) {
      if (node.type === this.supportedNodes.HEADING_ONE.type) {
        return 'Überschrift 1';
      } else if (node.type === this.supportedNodes.HEADING_TWO.type) {
        return 'Überschrift 2';
      } else if (node.type === this.supportedNodes.HEADING_THREE.type) {
        return 'Überschrift 3';
      } else if (node.type === this.supportedNodes.PARAGRAPH.type) {
        return 'Absatz';
      }
    },

    async generateElement(
      eventOrEventId,
      elementTypeToGenerate = undefined,
      isSetNewId = null,
      noOfColToGenerate = null,
      valueToSetInNode = null,
      element = null
    ) {
      const elementTypeObj = elementTypeToGenerate
        ? Object.values(this.supportedNodes).find(
            (el) => el.type === elementTypeToGenerate
          )
        : null;

      let elementType = elementTypeToGenerate ? elementTypeObj.type : null;
      const nodeToUpdate = this.pageBuilderNodes.children.find(
        (node) =>
          eventOrEventId &&
          typeof eventOrEventId === 'string' &&
          node.id === eventOrEventId.split('_')[1]
      );

      if (nodeToUpdate && nodeToUpdate.type === elementType) return;

      const elementTarget = eventOrEventId.target
        ? eventOrEventId.target
        : document.getElementById(eventOrEventId);

      let elementString = elementTarget.innerText.trim();

      const nodeIds = elementTarget.classList.contains(
        'codelos-bulleted-list-content-inner'
      )
        ? elementTarget.parentElement.parentElement.parentElement.id.split('_')
        : elementTarget.id.split('_');

      const eventTargetId = elementTarget.classList.contains(
        'codelos-bulleted-list-content-inner'
      )
        ? elementTarget.parentElement.parentElement.parentElement.id
        : elementTarget.id;

      const identifiers = [
        this.supportedNodes.HR,
        this.supportedNodes.UNORDERED_LIST,
        this.supportedNodes.PARAGRAPH,
        this.supportedNodes.IMAGE,
        this.supportedNodes.ANCHOR,
        this.supportedNodes.COLUMN,
      ];

      if (elementTypeObj) {
        elementString =
          elementTypeToGenerate === this.supportedNodes.COLUMN.type
            ? noOfColToGenerate
            : elementString.replace(elementTypeObj.identifier, '');
      } else {
        if (
          elementString.startsWith(
            this.supportedNodes.HEADING_THREE.identifier,
            ''
          )
        ) {
          elementType = this.supportedNodes.HEADING_THREE.type;
          elementString = elementString.replace(
            this.supportedNodes.HEADING_THREE.identifier,
            ''
          );
        } else if (
          elementString.startsWith(
            this.supportedNodes.HEADING_TWO.identifier,
            ''
          )
        ) {
          elementType = this.supportedNodes.HEADING_TWO.type;
          elementString = elementString.replace(
            this.supportedNodes.HEADING_TWO.identifier,
            ''
          );
        } else if (
          elementString.startsWith(
            this.supportedNodes.HEADING_ONE.identifier
          ) &&
          !elementString.startsWith(
            this.supportedNodes.HEADING_THREE.identifier
          ) &&
          !elementString.startsWith(this.supportedNodes.HEADING_TWO.identifier)
        ) {
          elementType = this.supportedNodes.HEADING_ONE.type;
          elementString = elementString.replace(
            this.supportedNodes.HEADING_ONE.identifier,
            ''
          );
        } else if (
          identifiers.find((el) => elementString.startsWith(el.identifier))
        ) {
          const foundedIdentifier = identifiers.find((el) =>
            elementString.startsWith(el.identifier)
          );
          elementType = foundedIdentifier.type;
          elementString = elementString.replace(
            foundedIdentifier.identifier,
            ''
          );
        } else {
          elementType = this.supportedNodes.PARAGRAPH.type;
          elementString = elementString;
        }
      }
      this.pageBuilderNodes.children.splice(
        nodeIds[0],
        1,
        isSetNewId
          ? this.getElementObject(
              elementType,
              elementString,
              null,
              valueToSetInNode,
              element
            )
          : this.getElementObject(
              elementType,
              elementString,
              nodeIds[1],
              valueToSetInNode,
              element
            )
      );
      await this.timeout(0);

      this.setFocusToElement(document.getElementById(eventTargetId));
      elementTarget.innerText = '';
      if (elementType === this.supportedNodes.PARAGRAPH.type) {
        await this.timeout(0);
        this.setCursorToPositionOrFocus(elementTarget, elementString.length);
      }

      if (elementType === this.supportedNodes.UNORDERED_LIST.type) {
        elementTarget.innerText = elementString;
        await this.timeout(100);

        this.setCursorToPositionOrFocus(
          document.getElementById(eventTargetId).children[0].children[1]
            .children[0]
        );
      }

      if (elementType === this.supportedNodes.ANCHOR.type) {
        if (
          elementString &&
          elementString.split(',')[1] &&
          elementString.split(',')[1].length
        ) {
          await this.timeout(100);
          this.setCursorToPositionOrFocus(
            elementTarget.children[0],
            elementString.split(',')[1].length,
            true
          );
        }
      }

      if (
        !elementString.length &&
        elementType !== this.supportedNodes.COLUMN.type
      )
        elementType === this.supportedNodes.UNORDERED_LIST.type
          ? document
              .getElementById(eventTargetId)
              .children[0].children[1].children[0].classList.add('backspaced')
          : document.getElementById(eventTargetId) &&
            document.getElementById(eventTargetId).classList.add('backspaced');

      if (elementType === this.supportedNodes.HTML.type) return;

      if (
        [
          this.supportedNodes.HEADING_ONE.type,
          this.supportedNodes.HEADING_TWO.type,
          this.supportedNodes.HEADING_THREE.type,
        ].includes(elementType)
      ) {
        elementTarget.innerText = elementString;
        await this.timeout(100);

        this.setCursorToPositionOrFocus(document.getElementById(eventTargetId));
      }
    },

    async deleteElement(event, node) {
      if (this.pageBuilderNodes.children.length === 1) {
        if (node.type === this.supportedNodes.INPUT.type) {
          this.pageBuilderNodes.children[0].value = null;
          event.target.innerText = '';
        } else {
          this.pageBuilderNodes.children[0] = this.clone(
            this.supportedNodes.INPUT.getInitialObj(node.id)
          );
        }

        const element = document.getElementById(`${0}_${node.id}`);
        await this.setFocusToElement(element);
        element.classList.add('backspaced');

        return;
      }

      let nodeIds;

      if (this.pageBuilderNodes.children.length > 1) {
        if (
          event.target.classList.contains('codelos-bulleted-list-content-inner')
        ) {
          nodeIds = event.target.parentNode.parentNode.parentNode.id.split('_');
        } else {
          nodeIds = event.target.id.split('_');
        }
        this.pageBuilderNodes.children.splice(nodeIds[0], 1);
      }
    },

    getElementObject(
      elementType,
      elementData,
      oldId = null,
      valueToSetInNode = null,
      element = null
    ) {
      if (elementType === this.supportedNodes.HEADING_ONE.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.HEADING_ONE.getInitialObj(oldId)
            : this.supportedNodes.HEADING_ONE.getInitialObj()
        );
        elementData.length ? (tmpObjHolder.value = elementData) : null;
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.HEADING_TWO.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.HEADING_TWO.getInitialObj(oldId)
            : this.supportedNodes.HEADING_TWO.getInitialObj()
        );
        elementData.length ? (tmpObjHolder.value = elementData) : null;
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.HEADING_THREE.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.HEADING_THREE.getInitialObj(oldId)
            : this.supportedNodes.HEADING_THREE.getInitialObj()
        );
        elementData.length ? (tmpObjHolder.value = elementData) : null;
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.IMAGE.type) {
        const elemObj = this.clone(
          oldId
            ? this.supportedNodes.IMAGE.getInitialObj(oldId)
            : this.supportedNodes.IMAGE.getInitialObj()
        );
        elemObj.src = elementData;
        return elemObj;
      }
      if (elementType === this.supportedNodes.ANCHOR.type) {
        const elemObj = this.clone(
          oldId
            ? this.supportedNodes.ANCHOR.getInitialObj(oldId, elementData)
            : this.supportedNodes.ANCHOR.getInitialObj(null)
        );
        const precessedElementData = elementData.split(',');
        elemObj.src = precessedElementData[0];
        elemObj.value = precessedElementData[1];
        return elemObj;
      }
      if (elementType === this.supportedNodes.HR.type) {
        return this.clone(
          oldId
            ? this.supportedNodes.HR.getInitialObj(oldId)
            : this.supportedNodes.HR.getInitialObj()
        );
      }
      if (elementType === this.supportedNodes.UNORDERED_LIST.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.UNORDERED_LIST.getInitialObj(oldId)
            : this.supportedNodes.UNORDERED_LIST.getInitialObj()
        );
        elementData.length ? (tmpObjHolder.value = elementData) : null;
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.TABLE.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.TABLE.getInitialObj(oldId)
            : this.supportedNodes.TABLE.getInitialObj()
        );
        if (valueToSetInNode && valueToSetInNode.value.dataframe) {
          return this.convertDataframeDataToTableData(
            valueToSetInNode,
            tmpObjHolder
          );
        } else return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.TIME_SERIES.type) {
        const cloneObj = this.clone(
          oldId
            ? this.supportedNodes.TIME_SERIES.getInitialObj(oldId)
            : this.supportedNodes.TIME_SERIES.getInitialObj()
        );

        cloneObj.value.timeSeries = valueToSetInNode.value;
        cloneObj.inputDataInfo = {
          name: valueToSetInNode.name,
          label: valueToSetInNode.label,
          type: valueToSetInNode.type,
        };
        return cloneObj;
      }
      if (elementType === this.supportedNodes.COLUMN.type) {
        return this.clone(
          oldId
            ? this.supportedNodes.COLUMN.getInitialObj(oldId, elementData)
            : this.supportedNodes.COLUMN.getInitialObj(null, elementData)
        );
      }
      if (elementType === this.supportedNodes.PARAGRAPH.type) {
        const elemObj = this.clone(
          oldId
            ? this.supportedNodes.PARAGRAPH.getInitialObj(oldId)
            : this.supportedNodes.PARAGRAPH.getInitialObj()
        );
        elemObj.value = elementData;
        return elemObj;
      }
      if (elementType === this.supportedNodes.INPUT.type) {
        const elemObj = this.clone(
          oldId
            ? this.supportedNodes.INPUT.getInitialObj(oldId)
            : this.supportedNodes.INPUT.getInitialObj()
        );
        elemObj.value = elementData;
        return elemObj;
      }
      if (elementType === this.supportedNodes.DATAFRAME.type) {
        const cloneObj = this.clone(
          oldId
            ? this.supportedNodes.DATAFRAME.getInitialObj(oldId)
            : this.supportedNodes.DATAFRAME.getInitialObj()
        );

        if (valueToSetInNode && valueToSetInNode.value.content) {
          return this.revertTableDataToChartData(valueToSetInNode, cloneObj);
        } else {
          cloneObj.value.dataframe = valueToSetInNode.value;
          cloneObj.inputDataInfo = {
            name: valueToSetInNode.name,
            label: valueToSetInNode.label,
            type: valueToSetInNode.type,
          };
          return cloneObj;
        }
      }
      if (elementType === this.supportedNodes.BUTTON.type) {
        const buttonElementObj = oldId
          ? this.supportedNodes.BUTTON.getInitialObj(oldId)
          : this.supportedNodes.BUTTON.getInitialObj();

        const tmpObjHolder = this.clone(buttonElementObj);
        tmpObjHolder.variant = element.variant;
        if (element.variant === 'export-excel') {
          tmpObjHolder.value = {
            caption: 'Als Excel exportieren',
            output: null,
          };
        } else if (element.variant === 'embed-flow') {
          tmpObjHolder.value = {
            caption: null,
            workflowData: {},
          };
        }
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.FILE.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.FILE.getInitialObj(oldId)
            : this.supportedNodes.FILE.getInitialObj()
        );
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.HIGHCHART.type) {
        const cloneObj = this.clone(
          oldId
            ? this.supportedNodes.HIGHCHART.getInitialObj(oldId)
            : this.supportedNodes.HIGHCHART.getInitialObj()
        );
        cloneObj.value.highchart = {
          ...valueToSetInNode.value,
          customConfigs: {
            ...valueToSetInNode.value.customConfigs,
            name: valueToSetInNode.name,
          },
        };
        cloneObj.inputDataInfo = {
          name: valueToSetInNode.name,
          label: valueToSetInNode.label,
          type: valueToSetInNode.type,
        };
        return cloneObj;
      }
      if (elementType === this.supportedNodes.IFRAME.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.IFRAME.getInitialObj(oldId)
            : this.supportedNodes.IFRAME.getInitialObj()
        );
        this.activeIframeDropDown.id = tmpObjHolder.id;
        this.activeIframeDropDown.type = 'create';
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.HTML.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.HTML.getInitialObj(oldId)
            : this.supportedNodes.HTML.getInitialObj()
        );
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.CODE.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.CODE.getInitialObj(oldId)
            : this.supportedNodes.CODE.getInitialObj()
        );
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.IMAGE_UPLOAD.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.IMAGE_UPLOAD.getInitialObj(oldId)
            : this.supportedNodes.IMAGE_UPLOAD.getInitialObj()
        );
        return tmpObjHolder;
      }
      if (elementType === this.supportedNodes.VIDEO.type) {
        const tmpObjHolder = this.clone(
          oldId
            ? this.supportedNodes.VIDEO.getInitialObj(oldId)
            : this.supportedNodes.VIDEO.getInitialObj()
        );
        return tmpObjHolder;
      }
    },

    clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    setInputValueToNodeElement(event, nodeIndex, lastCursorPosition = null) {
      const innerText = event.target.innerText;
      event.target.innerText = '';

      this.pageBuilderNodes.children[nodeIndex].value = innerText;
      event.target.innerText = innerText;
      if (lastCursorPosition) {
        this.setCursorToPositionOrFocus(event.target, lastCursorPosition);
      }
      clearTimeout(this.inputTimeout);
    },

    onNodeElementInput(event, nodeIndex) {
      clearTimeout(this.inputTimeout);
      if (['file-name', 'codelos-iframe-url-input'].includes(event.target.id)) {
        return;
      }
      if (event.inputType !== 'deleteContentBackward') {
        event.target.classList.remove('backspaced');
      }
      !event.target.innerText.length
        ? event.target.classList.add('is-empty')
        : event.target.classList.remove('is-empty');
      const lastCursorPosition = this.getCaretIndex(event.target.childNodes[0]);

      if (
        event.inputType !== 'deleteContentBackward' &&
        event.inputType !== 'insertParagraph'
      ) {
        this.inputTimeout = setTimeout(() => {
          this.setInputValueToNodeElement(event, nodeIndex, lastCursorPosition);
        }, 300);
      } else if (event.inputType === 'deleteContentBackward') {
        this.setInputValueToNodeElement(event, nodeIndex, lastCursorPosition);
      }
    },

    async onElementBackSpace(event, nodeIndex, node) {
      if (['file-name', 'codelos-iframe-url-input'].includes(event.target.id)) {
        return;
      }
      if (!event.target.innerText.length) {
        if (
          event.target.classList.contains('backspaced') &&
          node.type === this.supportedNodes.INPUT.type
        ) {
          if (this.pageBuilderNodes.children.length <= 1) {
            return;
          }
          this.pageBuilderNodes.children.splice(nodeIndex, 1);

          const previousElement =
            this.pageBuilderNodes.children[
              nodeIndex !== 0 ? nodeIndex - 1 : nodeIndex
            ];
          const isDealingWithBulletList =
            previousElement.type === this.supportedNodes.UNORDERED_LIST.type;

          await this.timeout(0);
          const elementToFocus = isDealingWithBulletList
            ? document.getElementById(
                `${Number(nodeIndex !== 0 ? nodeIndex - 1 : nodeIndex)}_${
                  previousElement.id
                }`
              ).children[0].children[1].children[0]
            : document.getElementById(
                `${Number(nodeIndex !== 0 ? nodeIndex - 1 : nodeIndex)}_${
                  previousElement.id
                }`
              );
          this.setCursorToPositionOrFocus(
            elementToFocus,
            elementToFocus.innerText.length,
            true,
            true
          );

          if (!isDealingWithBulletList) {
            elementToFocus.classList.add('backspaced');
          }
        } else if (event.target.classList.contains('backspaced')) {
          this.pageBuilderNodes.children[nodeIndex] = this.clone(
            this.supportedNodes.INPUT.getInitialObj(node.id)
          );
          this.$forceUpdate();
          await this.timeout(0);
          const element = document.getElementById(`${nodeIndex}_${node.id}`);
          await this.setFocusToElement(element);
          element.classList.add('backspaced');
        } else {
          if (
            this.isShowCreateElementModal &&
            nodeIndex === this.showCreateElementModalIdx
          ) {
            this.isShowCreateElementModal = false;
            this.showCreateElementModalIdx = null;
          }
          event.target.classList.add('backspaced');
        }
      }
    },

    setInputValueToBulletListNodeElement(
      event,
      nodeIndex,
      lastCursorPosition = null
    ) {
      const innerText = event.target.innerText;
      event.target.innerText = '';
      this.pageBuilderNodes.children[nodeIndex].value = innerText;
      event.target.innerText = this.pageBuilderNodes.children[nodeIndex].value;

      if (lastCursorPosition) {
        this.setCursorToPositionOrFocus(event.target, lastCursorPosition);
      }
      clearTimeout(this.inputTimeout);
    },

    onBulletListInput(event, nodeIndex) {
      clearTimeout(this.inputTimeout);
      if (event.inputType !== 'deleteContentBackward') {
        event.target.classList.remove('backspaced');
      }

      const lastCursorPosition = this.getCaretIndex(event.target.childNodes[0]);

      this.inputTimeout = setTimeout(() => {
        this.setInputValueToBulletListNodeElement(
          event,
          nodeIndex,
          lastCursorPosition
        );
      }, 300);
    },

    onElementEnterKeyDown(event, nodeIndex) {
      if (this.inputTimeout && !this.isShowCreateElementModal) {
        clearTimeout(this.inputTimeout);
        setTimeout(() => {
          this.pageBuilderNodes.children[nodeIndex].value =
            event.target.innerText;
        }, 200);
      }
    },
    async onElementEnter(event, nodeIndex, elementType = 'input') {
      if (
        ['codelos-iframe-url-input', 'embed-link-input'].includes(
          event.target.id
        )
      ) {
        return;
      }

      if (this.isShowCreateElementModal) {
        this.handleEnterOnCreateElementDropdown(event, nodeIndex);
        return;
      }

      if (event.target.id === 'embed-link-input') {
        this.getLinkMetaData(nodeIndex);
        return;
      }
      if (event.target.id === 'file-name') {
        this.isRenameLinkDropdown = false;
        this.supportedNodes.FILE.dropdownVisbleID = null;
        return;
      }

      const nodeIds = event.target.id.split('_');
      const newCreatedObject = await this.createNewElement(
        Number(nodeIds[0]) + 1,
        elementType
      );

      await this.timeout(0);
      const elementToFocus = document.getElementById(
        `${Number(nodeIds[0]) + 1}_${newCreatedObject.id}`
      );

      elementToFocus.classList.add('backspaced');

      // set value to element if string break start
      const cursorPosition = this.getCaretIndex(event.target);
      if (
        event.target.innerText &&
        cursorPosition < event.target.innerText.length
      ) {
        const innerText = this.pageBuilderNodes.children[nodeIndex].value;
        const currentElementValue = innerText.substring(0, cursorPosition);
        event.target.innerText = currentElementValue;
        const nextElementValue = innerText.substring(cursorPosition);
        this.pageBuilderNodes.children[nodeIndex].value = currentElementValue;

        newCreatedObject.value = nextElementValue;
        elementToFocus.innerText = nextElementValue;
      }
      // set value to element if string break end

      await this.setFocusToElement(elementToFocus);
    },

    async onBulletListEnter(event, nodeIndex) {
      if (this.inputTimeout && !this.isShowCreateElementModal) {
        clearTimeout(this.inputTimeout);
        if (event.target.innerText && event.target.innerText !== '\n\n\n') {
          setTimeout(() => {
            this.pageBuilderNodes.children[nodeIndex].value =
              event.target.innerText;
          });
        }
      }
      if (this.isShowCreateElementModal) {
        this.handleEnterOnCreateElementDropdown(event, nodeIndex);
        return;
      }
      const innerText = event.target.innerText.replaceAll('\n', '');
      const isNewElementWillBeBullet = innerText.length;
      const nodeIds =
        event.target.parentElement.parentElement.parentElement.id.split('_');
      const elementType = isNewElementWillBeBullet
        ? this.supportedNodes.UNORDERED_LIST.type
        : this.supportedNodes.INPUT.type;

      const newCreatedObject = await this.createNewElement(
        Number(nodeIds[0]) + 1,
        elementType
      );

      await this.timeout(0);
      const elementToFocus = isNewElementWillBeBullet
        ? document.getElementById(
            `${Number(nodeIds[0]) + 1}_${newCreatedObject.id}`
          ).children[0].children[1].children[0]
        : document.getElementById(
            `${Number(nodeIds[0]) + 1}_${newCreatedObject.id}`
          );
      elementToFocus.classList.add('backspaced');

      // set value to element if string break start
      const cursorPosition = this.getCaretIndex(event.target);
      if (
        event.target.innerText &&
        cursorPosition < event.target.innerText.length
      ) {
        const innerText = this.pageBuilderNodes.children[nodeIndex].value;
        const currentElementValue = innerText.substring(0, cursorPosition);
        event.target.innerText = currentElementValue;
        const nextElementValue = innerText.substring(cursorPosition);
        this.pageBuilderNodes.children[nodeIndex].value = currentElementValue;

        newCreatedObject.value = nextElementValue;
        elementToFocus.innerText = nextElementValue;
      }
      // set value to element if string break end

      await this.setFocusToElement(elementToFocus);
    },

    async createNewElement(createLocation, elementType) {
      const initialObj = this.clone(
        Object.values(this.supportedNodes)
          .find((el) => el.type === elementType)
          .getInitialObj()
      );
      this.pageBuilderNodes.children.splice(
        createLocation,
        0,
        this.clone(initialObj)
      );
      await this.timeout(0);
      return initialObj;
    },

    async setFocusToElement(element) {
      if (!element) return;
      await this.timeout(0);
      if (!element) return;
      element.focus();
    },

    setCursorToPositionOrFocus(ele, specificPos = 1, setToEnd = false) {
      if (ele && ele.innerText && ele.innerText.length) {
        const range = document.createRange();
        const sel = window.getSelection();

        if (setToEnd || specificPos > ele.childNodes[0].length) {
          range.setStart(ele, 1);
        } else {
          range.setStart(
            ele.childNodes[0],
            specificPos || specificPos === 0
              ? specificPos
              : ele.innerText.length
          );
        }

        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        ele.focus();
      } else {
        if (!ele) return;
        ele.focus();
      }
    },

    getCaretIndex(element) {
      let position = 0;
      const isSupported = typeof window.getSelection !== 'undefined';
      if (isSupported && element) {
        const selection = window.getSelection();
        if (selection.rangeCount !== 0) {
          const range = window.getSelection().getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          position = preCaretRange.toString().length;
        }
      }
      return position;
    },

    async rerender(renderAfter = 0) {
      this.isVisible = false;
      await this.timeout(renderAfter);
      this.isVisible = true;
    },
    timeout(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    toggleOptionsModal(Idx = null) {
      this.isShowOptionModal = !this.isShowOptionModal;
      this.showOptionModalIdx = Idx;
    },
    toggleCreateElementModal(isShowModel, Idx = null) {
      this.isShowCreateElementModal = isShowModel;
      this.showCreateElementModalIdx = Idx;
      this.createElementOptionsFocusIndex = 0;
    },
    showHandleOnHover(idx) {
      this.showHandleIdx = idx;
    },
    async deleteBlock(index, node) {
      if (node.id in this.nodeElementMetaData) {
        delete this.nodeElementMetaData[node.id];
      }
      if (this.isNodeElementTypeColumn) {
        this.$emit('deleteColumnElement', this.pageBuilderNodes);
      }

      if (this.pageBuilderNodes.children.length === 1) {
        this.pageBuilderNodes.children[0] = this.clone(
          this.supportedNodes.INPUT.getInitialObj(node.id)
        );
        const element = document.getElementById(`${0}_${node.id}`);
        if (element) {
          await this.setFocusToElement(element);
          element.classList.add('backspaced');
        }
      }
      this.pageBuilderNodes.children.splice(index, 1);
      this.showOptionModalIdx = null;
      this.isShowOptionModal = !this.isShowOptionModal;
      await this.timeout(0);
    },

    duplicateBlock(index) {
      const originalBlock = this.pageBuilderNodes.children[index];
      const duplicateBlock = this.clone(originalBlock);
      duplicateBlock.id = uuidv4();
      this.pageBuilderNodes.children.splice(index + 1, 0, duplicateBlock);
      if (
        [
          this.supportedNodes.FILE.type,
          this.supportedNodes.IMAGE_UPLOAD.type,
        ].includes(duplicateBlock.type)
      ) {
        this.updateNodeElementMetaData(
          duplicateBlock.id,
          this.nodeElementMetaData[originalBlock.id]
        );
      }
      this.isShowOptionModal = false;
    },

    async onTaskInputSelect(elementId, taskInput, nodeId) {
      const elementsToRegenerate = ['timeseries', 'dataframe', 'highchart'];

      this.isShowOptionModal = !this.isShowOptionModal;
      await this.timeout(100);
      if (elementsToRegenerate.includes(taskInput.type)) {
        this.generateElement(elementId, taskInput.type, true, null, taskInput);
      } else {
        const currentNode = this.pageBuilderNodes.children.find(
          (node) => node.id == nodeId
        );
        if (currentNode) {
          currentNode.value = `${currentNode.value}{${taskInput.name}}`;
        }
        const element = document.getElementById(elementId);
        if (element) {
          element.innerText += `{${taskInput.name}}`;
        }
      }
    },

    toggleElementFullWidth(nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.isFullWidth =
        !this.pageBuilderNodes.children[nodeIndex].value.isFullWidth;
      this.isShowOptionModal = !this.isShowOptionModal;
    },

    onDragStart(event) {
      this.showDropZoneLineIndex = event.currentIndex;
    },

    async onDragEnd(event) {
      this.showDropZoneLineIndex = null;
      if (!this.isNodeElementTypeColumn) {
        const isNotNeastedNodeElement = this.pageBuilderNodes.children.some(
          (childNode) => childNode.id === event.futureId
        );

        if (!isNotNeastedNodeElement) {
          const recursiveElementNodesRef = this.$refs[`recursiveElementNodes`];

          if (recursiveElementNodesRef) {
            recursiveElementNodesRef.forEach((recursiveNode) => {
              recursiveNode.resetDropZone();
            });
          }
        }

        // drag and drop update list logic start
        const isCurrentElementDirectExist = this.pageBuilderNodes.children.some(
          (childNode) => childNode.id === event.currentId
        );
        const isFutureElementDirectExist = this.pageBuilderNodes.children.some(
          (childNode) => childNode.id === event.futureId
        );

        // for col to main

        if (!isCurrentElementDirectExist && isFutureElementDirectExist) {
          const listClone = JSON.parse(
            JSON.stringify(this.pageBuilderNodes.children)
          );
          listClone.forEach((listElement) => {
            if (listElement.type === 'col' && listElement.elements.length) {
              const targetedChildNode = listElement.elements.find((element) =>
                element.children.some((child) => child.id === event.currentId)
              );

              if (targetedChildNode) {
                const elementToAdd =
                  targetedChildNode.children[event.currentIndex];
                targetedChildNode.children.splice(event.currentIndex, 1);
                listClone.splice(
                  !event.isBelovePage
                    ? event.futureIndex
                    : event.futureIndex + 1,
                  0,
                  elementToAdd
                );
                if (targetedChildNode.children.length === 0) {
                  const targetedElementIndex =
                    listElement.elements.indexOf(targetedChildNode);
                  if (targetedElementIndex !== -1) {
                    listElement.elements.splice(targetedElementIndex, 1);
                  }
                }
                if (!listElement.elements.length) {
                  const colIndexToRemove = listClone.findIndex(
                    (el) => el.id === listElement.id
                  );
                  listClone.splice(colIndexToRemove, 1);
                }
                if (listElement.elements.length === 1) {
                  const colIndexToRemove = listClone.findIndex(
                    (el) => el.id === listElement.id
                  );
                  listClone.splice(
                    colIndexToRemove,
                    1,
                    ...listElement.elements[0].children
                  );
                }

                this.onListUpdate(listClone);
              }
            }
          });
        }

        // for col to col

        if (!isCurrentElementDirectExist && !isFutureElementDirectExist) {
          const listClone = JSON.parse(
            JSON.stringify(this.pageBuilderNodes.children)
          );
          let elementToAdd;
          listClone.forEach((listElement) => {
            if (listElement.type === 'col' && listElement.elements.length) {
              const currentTargetedChildNode = listElement.elements.find(
                (element) =>
                  element.children.some(
                    (child) => child && child.id === event.currentId
                  )
              );

              const futureTargetedChildNode = listElement.elements.find(
                (element) =>
                  element.children.some(
                    (child) => child && child.id === event.futureId
                  )
              );
              if (
                currentTargetedChildNode &&
                futureTargetedChildNode &&
                futureTargetedChildNode.id === currentTargetedChildNode.id
              )
                return;
              if (currentTargetedChildNode) {
                elementToAdd =
                  currentTargetedChildNode.children[event.currentIndex];
                currentTargetedChildNode.children.splice(event.currentIndex, 1);

                if (currentTargetedChildNode.children.length === 0) {
                  const currentTargetedElementIndex =
                    listElement.elements.indexOf(currentTargetedChildNode);
                  if (currentTargetedElementIndex !== -1) {
                    listElement.elements.splice(currentTargetedElementIndex, 1);
                  }
                }
              }
            }
          });
          listClone.forEach((listElement, index) => {
            if (listElement.type === 'col' && listElement.elements.length) {
              const currentTargetedChildNode = listElement.elements.find(
                (element) =>
                  element.children.some(
                    (child) => child && child.id === event.currentId
                  )
              );
              const futureTargetedChildNode = listElement.elements.find(
                (element) =>
                  element.children.some(
                    (child) => child && child.id === event.futureId
                  )
              );
              if (
                currentTargetedChildNode &&
                futureTargetedChildNode &&
                futureTargetedChildNode.id === currentTargetedChildNode.id
              )
                return;
              if (futureTargetedChildNode) {
                futureTargetedChildNode.children.splice(
                  event.futureIndex,
                  0,
                  elementToAdd
                );
                if (listElement.elements.length === 1) {
                  listClone.splice(
                    index,
                    1,
                    ...futureTargetedChildNode.children
                  );
                }
                this.onListUpdate(listClone);
              }
            }
          });
        }

        // drag and drop update list logic end
      }

      if (this.isNodeElementTypeColumn) {
        this.$emit('onDragEnd', event);
      }
    },
    resetDropZone() {
      this.showDropZoneLineIndex = null;
    },
    onDragMove(event) {
      const futureElementInfo = this.pageBuilderNodes.children.find(
        (el) => el && el.id === event.futureId
      );
      const recursiveElementNodesRef = this.$refs[`recursiveElementNodes`];

      if (futureElementInfo) {
        this.showDropZoneLineIndex = event.dropZoneIndex;
        if (!this.isNodeElementTypeColumn) {
          if (recursiveElementNodesRef) {
            recursiveElementNodesRef.forEach((recursiveNode) => {
              recursiveNode.resetDropZone();
            });
          }
        } else {
          this.$emit('resetDropZone');
        }
      } else {
        if (!this.isNodeElementTypeColumn) {
          this.showDropZoneLineIndex = null;

          if (recursiveElementNodesRef) {
            recursiveElementNodesRef.forEach((recursiveNode) => {
              const isIdExistIsInRecursiveNode =
                recursiveNode._props.pageBuilderNodes.children.some(
                  (childNode) => childNode && childNode.id === event.futureId
                );

              if (isIdExistIsInRecursiveNode) {
                recursiveNode.onDragMove(event);
              } else {
                recursiveNode.resetDropZone();
              }
            });
          }
        }

        if (this.isNodeElementTypeColumn) {
          this.$emit('onDragMove', event);
        }
      }
    },
    onListUpdate(updatedList) {
      this.pageBuilderNodes.children = updatedList;
    },

    onMouseHoverOrLeaveAtTurnIno(index) {
      this.showTurnIntoIndex = index;

      if (index !== null) {
        this.$refs.turnIntoItemsDropdown[0].show();
      } else {
        this.$refs.turnIntoItemsDropdown[0].hide();
      }
    },

    onMouseHoverOrLeaveAtSelectInput(index) {
      this.showSelectInputIndex = index;

      if (index !== null) {
        this.$refs.taskSelectInputItems[0].show();
      } else {
        this.$refs.taskSelectInputItems[0].hide();
      }
    },

    onMouseHoverOrLeaveAtAlignmentSelect(index) {
      this.showSelectInputIndex = index;

      if (index !== null) {
        this.$refs.alignmentItemsDropdown[0].show();
      } else {
        this.$refs.alignmentItemsDropdown[0].hide();
      }
    },

    onTableRowCountChange(event, nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.boldRows.push(false);
      this.pageBuilderNodes.children[nodeIndex].value.rows = event;
    },
    onTableColCountChange(event, nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.cols = event;
    },
    onTableContentChange(event, nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.content = event;
    },
    onToggleRowHeader(event, nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.hasHeader =
        !this.pageBuilderNodes.children[nodeIndex].value.hasHeader;
    },
    onToggleRowHeading(event, nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.isShowHeading =
        !this.pageBuilderNodes.children[nodeIndex].value.isShowHeading;
    },
    onTableHeadingChange(event, nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.headingContent = event;
    },
    toggleRowBold(indexVal, nodeIndex) {
      this.pageBuilderNodes.children[nodeIndex].value.boldRows[indexVal] =
        !this.pageBuilderNodes.children[nodeIndex].value.boldRows[indexVal];
    },
    onColInputClick(event) {
      this.pageBuilderNodes.children.length &&
        this.pageBuilderNodes.children.forEach((pageBuilderNode) => {
          if (
            event.target &&
            event.target.parentNode &&
            event.target.parentNode.parentNode &&
            pageBuilderNode.id ===
              event.target.parentNode.parentNode.id.split('_')[1] &&
            pageBuilderNode.elements &&
            pageBuilderNode.elements.length
          ) {
            pageBuilderNode.elements.forEach((element) => {
              if (!element.children.length) {
                element.children.push(
                  JSON.parse(
                    JSON.stringify(this.supportedNodes.INPUT.getInitialObj())
                  )
                );
              }
            });
          }
        });
    },
    convertDataframeDataToTableData(valueToSetInNode, tmpObjHolder) {
      tmpObjHolder.inputDataInfo = valueToSetInNode.inputDataInfo;
      tmpObjHolder.value.editable = false;
      tmpObjHolder.value.content = [
        valueToSetInNode.value.dataframe.columns,
        ...valueToSetInNode.value.dataframe.data,
      ];
      tmpObjHolder.value.cols =
        valueToSetInNode.value.dataframe.columns.length ||
        valueToSetInNode.value.dataframe.data[0].length;
      tmpObjHolder.value.rows = tmpObjHolder.value.content.length;

      if (valueToSetInNode.value.dataframe.columns)
        tmpObjHolder.value.hasHeader = true;
      tmpObjHolder.value.boldRows = new Array(tmpObjHolder.value.rows).fill(
        false
      );
      tmpObjHolder.value.chartConfigs = valueToSetInNode.value.dataframe.config;
      return tmpObjHolder;
    },
    revertTableDataToChartData(valueToSetInNode, tmpObjHolder) {
      tmpObjHolder.inputDataInfo = valueToSetInNode.inputDataInfo;

      const chartData = valueToSetInNode.value.content
        .slice(1)
        .map((columnData) =>
          columnData.map((rowData) =>
            rowData && !isNaN(rowData) ? Number(rowData) : rowData
          )
        );
      tmpObjHolder.value.dataframe = {
        columns: valueToSetInNode.value.content[0],
        index: Array.from(
          { length: valueToSetInNode.value.content[0].length },
          (_, index) => index
        ),
        data: chartData,
      };
      if (valueToSetInNode.value.chartConfigs) {
        tmpObjHolder['config'] = valueToSetInNode.value.chartConfigs;
      }
      tmpObjHolder.value.isFullWidth = valueToSetInNode.value.isFullWidth;

      return tmpObjHolder;
    },
    isTableCreatedWithDataframe(node) {
      return 'chartConfigs' in node.value;
    },
    async onFocusInputElement(event, nodeIndex, node) {
      this.focusElementId = node.id;

      if (event.relatedTarget) {
        this.setInputValueToNodeElement(event, nodeIndex);
      }

      this.addBackspacedClass(nodeIndex, node);
    },

    onFocusElements(nodeIndex, node) {
      this.focusElementId = node.id;
      this.addBackspacedClass(nodeIndex, node);
    },
    async addBackspacedClass(nodeIndex, node) {
      const emptyValues = ['\n\n\n', null, ''];
      if (emptyValues.includes(node.value)) {
        const focusElement = document.getElementById(`${nodeIndex}_${node.id}`);
        if (!focusElement) return;
        await this.timeout(0);
        focusElement.classList.add('backspaced');
      }
    },
    onFocusBulletList(event, nodeIndex, node) {
      this.focusElementId = node.id;
      if (event.relatedTarget) {
        this.setInputValueToBulletListNodeElement(event, nodeIndex);
      }
    },
    showSelectionDropdown(inputName, nodeIndex) {
      this.activeSelectDropdown = {
        elementIndex: nodeIndex,
        inputName: inputName,
      };
    },
    closeSelectionDropdown() {
      this.activeSelectDropdown = {
        elementIndex: null,
        inputName: null,
      };
    },
    onSelectDropdownItem(nodeIndex, value, inputName) {
      this.pageBuilderNodes.children[nodeIndex].value[inputName] = value;
      this.closeSelectionDropdown();
    },
    onCreateIframeElement(node) {
      node.value.url = this.activeInputIframeLink;
      this.activeInputIframeLink = '';

      this.activeIframeDropDown = {
        id: '',
        type: '',
      };
    },

    onIframeAction(nodeId) {
      this.activeIframeActionDropDownId = nodeId;
    },
    onCloseIframeAction() {
      this.activeIframeActionDropDownId = null;
    },
    onEditIframe(node) {
      if (node.value && !node.value.url) return;
      this.activeInputIframeLink = node.value.url;

      this.activeIframeDropDown.id = node.id;
      this.activeIframeDropDown.type = 'edit';

      this.onCloseIframeAction();
    },
    onCloseIframeLinkDropDown(nodeIndex, node) {
      this.activeIframeDropDown.id = null;
      this.activeIframeDropDown.type = null;

      this.activeInputIframeLink = '';

      if (node && node.value && !node.value.url && nodeIndex !== undefined) {
        this.pageBuilderNodes.children.splice(nodeIndex, 1);
      }
    },

    onGenerateElementFromDropdown(element, node, nodeIndex) {
      if (element.noOfCols) {
        this.generateElement(
          `${nodeIndex}_${node.id}`,
          element.type,
          true,
          element.noOfCols
        );
      } else if (element.type === 'button' && element.variant) {
        this.generateElement(
          `${nodeIndex}_${node.id}`,
          element.type,
          true,
          null,
          null,
          element
        );
      } else {
        this.generateElement(
          `${nodeIndex}_${node.id}`,
          element.type,
          true,
          null,
          null,
          element
        );
      }

      if (element.type === this.supportedNodes.IFRAME.type) {
        setTimeout(() => {
          const iframeElementBlock = document.getElementById(
            `${nodeIndex}_${this.activeIframeDropDown.id}`
          );

          if (iframeElementBlock) {
            const iframeURLInput = iframeElementBlock.querySelector(
              '#codelos-iframe-url-input'
            );
            if (iframeURLInput) iframeURLInput.focus();
          }
        }, 100);
      }
      this.toggleCreateElementModal(false, null);
    },

    focusCreateElementDropdownItem(index) {
      const craeteElementsItems = this.$refs['create-element-dropdown-item'];
      if (index < craeteElementsItems.length && index >= 0) {
        this.createElementOptionsFocusIndex = index;
      }
    },
    deleteColumnElement(elementToDelete) {
      if (elementToDelete.children && elementToDelete.children.length === 1) {
        const columnNodeIndex = this.pageBuilderNodes.children.findIndex(
          (pageBuilderNode) => {
            return (
              pageBuilderNode.type == 'col' &&
              pageBuilderNode.elements.find(
                (pageBuilderChildNode) =>
                  pageBuilderChildNode.id === elementToDelete.id
              )
            );
          }
        );
        const columnNode = this.pageBuilderNodes.children[columnNodeIndex];
        if (columnNode && columnNode.elements && columnNode.elements.length) {
          if (columnNode.elements.length !== 1) {
            const elementIndexToDelete = columnNode.elements.findIndex(
              (element) => element.id === elementToDelete.id
            );
            columnNode.elements.splice(elementIndexToDelete, 1);

            if (columnNode.elements.length === 1) {
              this.pageBuilderNodes.children.splice(
                columnNodeIndex,
                1,
                ...columnNode.elements[0].children
              );
            }
          } else {
            this.pageBuilderNodes.children.splice(columnNodeIndex, 1);
          }
        }
      }
    },

    onShowIframeActionDropdown() {
      this.onCloseIframeLinkDropDown();
    },
    onBlurWindow() {
      if (
        Array.from(document.querySelectorAll('iframe')).includes(
          document.activeElement
        )
      ) {
        this.onCloseIframeLinkDropDown();
        const iframeDropdowns = this.$refs['codelos-iframe-actions'];
        if (iframeDropdowns && iframeDropdowns.length) {
          iframeDropdowns.forEach((dropdown) => {
            dropdown.hide();
          });
        }
      }
    },

    onKeyUpIframeURLInput(event, node) {
      if (event.key === 'Enter' && this.activeInputIframeLink) {
        this.onCreateIframeElement(node);
      }
    },

    async handleFileDrop(event) {
      event.preventDefault();
      const files = event.dataTransfer.files;
      if (!files.length) return;
      if (this.showDropZoneLineIndex === null) return;

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        let elementType;
        const fileType = file.type;
        if (fileType.startsWith('image/')) {
          elementType = this.supportedNodes.IMAGE_UPLOAD.type;
        } else if (fileType.startsWith('video/')) {
          elementType = this.supportedNodes.VIDEO.type; // Assuming VIDEO_UPLOAD is defined elsewhere
        } else {
          elementType = this.supportedNodes.FILE.type;
        }
        const elementIndex = this.showDropZoneLineIndex + i;
        const element = await this.createNewElement(elementIndex, elementType);
        const refName =
          elementType === this.supportedNodes.IMAGE_UPLOAD.type
            ? `image_upload_element_${element.id}`
            : elementType === this.supportedNodes.VIDEO.type
            ? `video_element_${element.id}`
            : `file_element_${element.id}`;

        const elementRef = this.$refs[refName];
        elementRef[0].handleDropFile(file);
      }

      this.showDropZoneLineIndex = null;
    },
    setDropzoneIndex(index) {
      this.showDropZoneLineIndex = index;
    },

    updateNodeElementMetaData(nodeId, elementMetaData) {
      this.$set(this.nodeElementMetaData, nodeId, elementMetaData);
    },
    showToast(message) {
      this.$emit('showToast', message);
    },

    onAlignmentSelect(nodeIndex, alignmentOption) {
      const nodeElement = this.pageBuilderNodes.children[nodeIndex];

      const nodeElementStyle = nodeElement.style || {};
      nodeElementStyle.textAlign = alignmentOption.value;
      nodeElement.style = nodeElementStyle;
      this.$forceUpdate();
    },
    getElementStyle(nodeElement) {
      const nodeElementStyle = nodeElement.style || {};

      const elementStyle = {
        textAlign: 'left',
      };

      for (const prop in elementStyle) {
        elementStyle[prop] = nodeElementStyle[prop] || elementStyle[prop];
      }
      return elementStyle;
    },
    async onPasteItems(event, nodeIndex, node) {
      if (!this.pasteItemsSupportedElements.includes(node.type)) {
        return;
      }
      let isNodeValueExist = false;
      if (node.value) {
        isNodeValueExist = true;
      }
      const clipboardFiles = event.clipboardData.files;
      if (clipboardFiles.length) {
        event.preventDefault();
        for (let i = 0; i < clipboardFiles.length; i++) {
          const file = clipboardFiles.item(i);
          let elementType;
          const fileType = file.type;
          if (fileType.startsWith('image/')) {
            elementType = this.supportedNodes.IMAGE_UPLOAD.type;
          } else if (fileType.startsWith('video/')) {
            elementType = this.supportedNodes.VIDEO.type;
          } else {
            elementType = this.supportedNodes.FILE.type;
          }
          const elementIndex = isNodeValueExist
            ? nodeIndex + i + 1
            : nodeIndex + i;

          let element = node;

          if (!isNodeValueExist && i === 0) {
            this.generateElement(`${nodeIndex}_${node.id}`, elementType);
          } else {
            element = await this.createNewElement(elementIndex, elementType);
          }
          const refName =
            elementType === this.supportedNodes.IMAGE_UPLOAD.type
              ? `image_upload_element_${element.id}`
              : elementType === this.supportedNodes.VIDEO.type
              ? `video_element_${element.id}`
              : `file_element_${element.id}`;
          await this.timeout(0);
          const elementRef = this.$refs[refName];
          elementRef[0].handleDropFile(file);
        }
      }
    },
    onConvertChartToTable(node, nodeIndex) {
      this.generateElement(
        `${nodeIndex}_${node.id}`,
        this.supportedNodes.TABLE.type,
        null,
        null,
        node
      );
      this.closeOptionDropdown();
    },
    onConvertTableToChart(node, nodeIndex) {
      this.generateElement(
        `${nodeIndex}_${node.id}`,
        this.supportedNodes.DATAFRAME.type,
        null,
        null,
        node
      );
      this.closeOptionDropdown();
    },

    closeOptionDropdown() {
      this.isShowOptionModal = false;
      this.showOptionModalIdx = null;
    },
    handleEnterOnCreateElementDropdown(event, nodeIndex) {
      if (!this.isShowCreateElementModal) return;
      const dropdownItemElements = this.$refs['create-element-dropdown-item'];
      if (
        dropdownItemElements &&
        dropdownItemElements.length &&
        dropdownItemElements[this.createElementOptionsFocusIndex]
      ) {
        dropdownItemElements[this.createElementOptionsFocusIndex].click();
      } else {
        event.target.innerText =
          this.pageBuilderNodes.children[nodeIndex].value;
        this.setCursorToPositionOrFocus(event.target, false, true);
      }

      this.createElementOptionsFocusIndex = 0;
    },
  },

  mounted() {
    window.addEventListener('blur', this.onBlurWindow);

    if (
      this.pageBuilderNodes &&
      this.pageBuilderNodes.children &&
      this.pageBuilderNodes.children.length
    ) {
      if (this.pageBuilderNodes.children.length === 1) {
        this.focusElementId =
          this.pageBuilderNodes.children[0] &&
          this.pageBuilderNodes.children[0].id;
      }
    }
  },
  beforeDestroy() {
    window.removeEventListener('blur', this.onBlurWindow);
  },

  components: {
    draggable,
    tableComponent: TableBuilderComponent,
    timeSeriesChart,
    EmbedWorkflowButton,
    HTMLCodeElement,
    CodeElement,
    ImageUploadElement,
    FileElement,
    VideoElement,
    CommonDropdown,
  },
};
</script>
<style scoped>
.element-wrapper {
  position: relative;
  transition: font-size 300ms ease-in-out;
}

.element-wrapper .draggible-icon {
  position: absolute;
  left: -30px;
  top: 0;
  transition: all 300ms ease-in-out;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  border-radius: 4px;
  font-size: 20px;
  color: #9f9f9f;
  opacity: 0;
  height: calc(100% + 10px);
}
.element-wrapper .draggible-icon svg {
  position: relative;
  top: 5px;
}

.codelos-anchor-block .element-wrapper .draggible-icon svg {
  top: 4px;
}

.codelos-text-block .codelos-input-block {
  padding-bottom: 0;
  padding-top: 0;
}

.codelos-text-block.element-block {
  /* margin-bottom: 0; */
}

.codelos-text-block .element-wrapper .draggible-icon svg {
  top: 2px;
}

.codelos-header-one-block .element-wrapper .draggible-icon svg,
.codelos-header-two-block .element-wrapper .draggible-icon svg {
  top: 10px;
}
.element-wrapper:hover > .draggible-icon {
  opacity: 1;
}
.element-wrapper .draggible-icon:focus {
  background: #eee;
}
.element-block {
  margin: 0;
  padding: 5px 0;
  position: relative;
}
/*Single Elements UI*/
.codelos-input-block {
  padding: 10px 0;
}

.codelos-header-one-block {
  font-size: 26px;
  color: inherit;
  font-weight: 600;
}

.codelos-header-two-block {
  font-size: 22px;
  font-weight: 600;
  color: inherit;
}

.codelos-header-three-block {
  font-size: 20px;
  font-weight: 600;
  color: inherit;
}

.list_item_wrap {
  display: flex;
  padding: 4px 0;
}

.bullet {
  min-width: 25px;
  position: relative;
}

.bullet:before {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 100%;
  background: #333;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  right: 0;
  margin: 0 auto;
}

.codelos-paragraph-block {
  color: inherit;
  font-size: 16px;
}

img {
  max-width: 100%;
}
.codelos-image-block img {
  max-width: 100%;
  max-height: 200px;
}

.codelos-anchor-block a {
  padding: 4px 0;
  font-size: 16px;
  color: inherit;
}

div[contenteditable='true']:focus-visible {
  outline: none;
}
[contenteditable='true'].is-empty:before {
  content: attr(placeholder);
  display: block;
}

.codelos-header-one-block .is-empty,
.codelos-header-two-block .is-empty,
.codelos-text-block .is-empty,
.codelos-input-block .is-empty,
.codelos-header-three-block .is-empty {
  opacity: 0.3;
  cursor: text;
}

.pseudoBefore:before {
  color: var(--pseudoBefore--color);
  content: var(--pseudoBefore--content);
  font-family: var(--pseudoBefore--fontFamily);
}

/*unordered list*/
.codelos-bulleted-list-wrap-block {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding-left: 2px;
  color: inherit;
  fill: inherit;
}
.codelos-bulleted-list-bullet {
  user-select: none;
  --pseudoSelection--background: transparent;
  margin-right: 2px;
  width: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-grow: 0;
  flex-shrink: 0;
  min-height: calc(1.5em + 3px + 3px);
}
.pseudoBefore {
  font-size: 1.5em;
  line-height: 1;
  margin-bottom: 0px;
  --pseudoBefore--fontFamily: Arial;
  --pseudoBefore--content: '•';
}
.codelos-bulleted-list-content-wrap {
  flex: 1 1 0px;
  min-width: 1px;
  display: flex;
  flex-direction: column;
}
.codelos-bulleted-list-content-inner {
  display: flex;
  padding: 3px 2px;
}

/*Update Modal*/

.codelos-dropdown-child {
  border-radius: 4px;
  background: #fff;
  max-width: calc(100vw - 24px);
  box-shadow: 0px 0px 8px rgb(0 0 0 / 20%);
  /* overflow: hidden; */
  position: absolute !important;
  left: 30px;
  padding: 35px 0 10px;
  min-width: 265px;
  transition: 400ms ease-in-out;
  z-index: 1;
}
.codelos-dropdown-child {
  padding: 10px 0px;
  position: absolute;
  top: 0px;
  left: 100%;
  min-height: unset;
}
.codelos-dropdown-item {
  padding: 7px 15px;
  cursor: pointer;
  transition: 400ms all ease-in-out;
  z-index: 1;
  position: relative;
  font-size: 16px;
  font-weight: 400;
}

.codelos-dropdown-item:hover {
  background: #eee;
}

.close-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  padding: 4px;
  z-index: 1;
  font-size: 16px;
  cursor: pointer;
}

.custom-backdrop {
  z-index: 1;
  background: transparent;
}

/* HR Block*/
.codelos-hr-block {
  position: relative;
}

.codelos-hr-block:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 1px;
  width: calc(100% - 30px);
  background: #e9e9e7;
}

/* Table Block */
.codelos-table-block >>> .clone-list {
  display: flex;
}
.codelos-table-block >>> .dragging {
  cursor: move;
  user-select: none;
  background: rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0px 0px 4px rgb(0 0 0 / 15%);
  z-index: 1;
  border: 2px solid #74b6db;
}
.codelos-table-block >>> .placeholder {
  background: rgb(0, 0, 0, 0.1) !important;
}
.codelos-table-block >>> .placeholder-table tr {
  height: 43px;
  padding: 5px 0;
  border-bottom: 1px solid #e9e9e7;
}

.codelos-table-block >>> .placeholder-table {
  background: #fff;
  height: 100%;
  border: 1px solid #e9e9e7;
}

.codelos-table-block >>> .table-wrap {
  margin-right: auto;
  margin-left: 0;
  padding-top: 0;
  max-width: 90%;
  width: auto;
  display: inline-block;
}
/*  */

.codelos-table-block >>> .table-wrap table {
  width: auto;
}
/* .codelos-table-block >>> .add-new-col {
  top: calc(50% - 51px);
} */
.codelos-table-block >>> .table-centered {
  margin-left: 0;
  margin-right: auto;
}
.codelos-table-block >>> .table-centered {
  width: 50%;
}
.codelos-table-block.full-width >>> .table-centered {
  width: 100%;
}

.codelos-table-block.full-width >>> .table-centered .table-wrap {
  width: 100%;
  max-width: 100%;
}

.codelos-table-block.full-width >>> .table-centered .table-wrap table {
  width: 100%;
}
.codelos-table-block >>> .add-new-col {
  top: 0;
}
.codelos-table-block >>> .add-new-col button {
  height: 100%;
}

/* Grid Layout */
.codelos-page-content .column {
  border: 2px solid gray;
}

.codelos-row-block {
  display: flex;
  justify-content: space-between;
  /* border: 1px solid gray; */
}
.codelos-row-block .codelos-col-block > div {
  height: 100%;
}
.codelos-hr-block .is-empty {
  min-height: 30px;
}
.drop-zone {
  background-color: black;
  position: absolute;
  right: 0;
  left: 0;
  height: 2px;
}
.drop-zone.top {
  top: 0;
}
.drop-zone.bottom {
  bottom: 0;
}

.codelos-button-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

::v-deep .codelos-button-wrapper .span-btn-element {
  text-decoration: none;
  color: #fff;
  border: 3px solid #000;
  border-radius: 0.375em;
  cursor: unset;
  display: inline-block;
  font-family: proxima-nova, Helvetica Neue, Arial, sans-serif;
  font-weight: 700;
  line-height: 23px;
  padding: 0.5rem 1.5rem;
  white-space: pre;
  font-size: 0.9375rem;
  opacity: 1;
  -webkit-transition: background-color 0.2s linear 0s,
    -webkit-transform 0.2s linear 0s;
  transition: background-color 0.2s linear 0s, -webkit-transform 0.2s linear 0s;
  transition: transform 0.2s linear 0s, background-color 0.2s linear 0s;
  transition: transform 0.2s linear 0s, background-color 0.2s linear 0s,
    -webkit-transform 0.2s linear 0s;
  -webkit-transform: translateY(0) scale(1.001);
  transform: translateY(0) scale(1.001);
  background-color: #000;
  cursor: pointer;
}

.codelos-button-block .button-info-edit-icon img {
  height: 16px;
  cursor: pointer;
}
::v-deep .codelos-button-block .export-excel-dropdown-options button {
  background: transparent !important;
  border: none;
  padding: 0;
  opacity: 0;
  transition: all 300ms ease-in-out;
}
::v-deep .codelos-iframe-block .export-excel-dropdown-options button {
  background: transparent !important;
  border: none;
  padding: 0;
  width: 20px;
  /* opacity: 0; */
  transition: all 300ms ease-in-out;
}

.codelos-button-block .export-excel-dropdown-options button img {
  width: 16px;
}
::v-deep .codelos-button-block .export-excel-dropdown-options .dropdown-menu {
  padding: 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border: none;
}

::v-deep
  .codelos-button-block
  .export-excel-dropdown-options
  .dropdown-menu
  form {
  padding: 15px;
}
.codelos-button-block .export-excel-dropdown-form-item label {
  margin-bottom: 4px;
}

.codelos-button-block .export-excel-dropdown-form-item input,
.codelos-button-block .export-excel-dropdown-form-item select {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #c5c5c5;
  background: none;
}

.codelos-button-block .export-excel-dropdown-form-item select {
  width: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
}

.codelos-button-block .export-excel-dropdown-form-item select:focus {
  outline: none;
}

.codelos-button-block .export-excel-dropdown-form-item {
  margin-bottom: 15px;
}

::v-deep .codelos-button-block:hover .export-excel-dropdown-options button {
  opacity: 1;
}

::v-deep
  .codelos-button-block
  .export-excel-dropdown-form-item
  .export-excel-dropdown-input-elements {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

::v-deep .codelos-button-block .export-excel-dropdown-select-icon {
  color: #c5c5c5;
}

.export-excel-select-dropdown {
  cursor: pointer;
}
.codelos-button-block .button-dropdown-caption-selection,
.codelos-button-block .button-dropdown-value-selection {
  position: absolute;
  z-index: 10;
  background-color: #ffffff;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  right: 0;
}
.codelos-button-block .button-dropdown-caption-selection {
  top: 40px;
}
.codelos-button-block .button-dropdown-value-selection {
  top: 60px;
}

.element-block .codelos-iframe-wrapper {
  position: relative;
  max-width: 100%;
}

.element-block .codelos-iframe-wrapper:hover .codelos-iframe-actions {
  background-color: #ffffff;
  border-radius: 4px;
}

.element-block .codelos-iframe {
  width: 100%;
}
.element-block .codelos-iframe iframe {
  max-width: 100%;
}
.element-block .codelos-iframe-link-dropdown {
  position: absolute;
  z-index: 1;
  padding: 16px;
  background-color: white;
  box-shadow: rgba(15, 15, 15, 0.05) 0px 0px 0px 1px,
    rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px;
  width: 300px;
  min-width: 180px;
  max-width: calc(100vw - 24px);
}

.element-block .codelos-iframe-link-dropdown-create {
  top: 55px;
  right: 20px;
}

.element-block .codelos-iframe-create-input {
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

.element-block .codelos-iframe-create-button {
  background: rgb(35, 131, 226);
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 0px;
  color: white;
}
.element-block .codelos-iframe-info-text {
  white-space: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(120, 119, 116);
  margin-top: 2px;
  font-size: 12px;
}
.element-block .codelos-iframe-actions {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

::v-deep .codelos-iframe-actions.btn-group button {
  background-color: transparent !important;
  border: none;
  height: 30px;
  color: black;
  display: flex;
  justify-content: center;
  box-shadow: none !important;
}
::v-deep .codelos-iframe-actions.btn-group .dropdown-item:is(:hover, :active) {
  background-color: #eee !important;
  color: black;
}
.element-block .codelos-dropdown-item.create-element-dropdowm-item {
  transition: background-color 100ms linear;
}
.element-block .create-element-dropdown-item-focus {
  background-color: #eee;
  outline: none;
}
.element-block .no-result-item {
  cursor: auto;
}
.element-block .no-result-item:hover {
  background-color: transparent;
}
.element-block .codelos-dropdown-item ::v-deep .dropdown-toggle {
  opacity: 0;
  visibility: hidden;
  height: 0px;
}

.element-block .codelos-dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.element-block .codelos-dropdown-item .task-input-select-item,
.element-block .codelos-dropdown-item .turn-input-select-item {
  padding: 3px 0px;
  min-width: 265px;
}
.element-block .codelos-dropdown-item .task-input-select-item :hover,
.element-block .codelos-dropdown-item .turn-input-select-item :hover,
.element-block .codelos-dropdown-item .alignment-select-item :hover {
  background: #eee;
  color: #000000;
}
.element-block .codelos-dropdown-item .task-input-select-item :active,
.element-block .codelos-dropdown-item .turn-input-select-item :active,
.element-block .codelos-dropdown-item .alignment-select-item :active {
  background: #eee;
  color: #000000;
}
.element-block
  .codelos-dropdown-item
  .alignment-select-item.alignment-active-item {
  background: #eee;
  color: #000000;
}

.element-block ::v-deep .dropdown-menu {
  left: 10px !important;
}

.element-block .create-element {
  max-height: 40vh;
  overflow-y: auto;
  padding: 16px 0px !important;
}

.element-block .create-element::-webkit-scrollbar-track,
.element-block
  ::v-deep
  .codelos-input-dropdown
  .dropdown-menu::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  background-color: #f5f5f5;
  border-radius: 10px;
}

.element-block .create-element::-webkit-scrollbar,
.element-block
  ::v-deep
  .codelos-input-dropdown
  .dropdown-menu::-webkit-scrollbar {
  width: 6px;
  background-color: #ffffff !important;
}

.element-block .create-element::-webkit-scrollbar-thumb,
.element-block
  ::v-deep
  .codelos-input-dropdown
  .dropdown-menu::-webkit-scrollbar-thumb {
  background-color: #706f6f;
  border-radius: 10px;
}

.element-block .codelos-dropdown-item.show-turn-into {
  z-index: 10;
}
::v-deep .element-block .codelos-input-dropdown .dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}

.codelos-input-dropdown .dropdown-menu ::-webkit-scrollbar {
  width: 6px;
  background-color: #ffffff !important;
}
.element-block ::v-deep .codelos-input-dropdown .dropdown-menu,
.element-block ::v-deep .codelos-alignment-dropdown .dropdown-menu,
.element-block ::v-deep .codelos-turninto-dropdown .dropdown-menu {
  left: 45px !important;
}

.element-block
  ::v-deep
  .codelos-input-dropdown
  .dropdown-menu[x-placement='bottom-start'],
.element-block
  ::v-deep
  .codelos-alignment-dropdown
  .dropdown-menu[x-placement='bottom-start'],
.element-block
  ::v-deep
  .codelos-turninto-dropdown
  .dropdown-menu[x-placement='bottom-start'] {
  top: -22px !important;
}

.element-block
  ::v-deep
  .codelos-input-dropdown
  .dropdown-menu[x-placement='top-start'],
.element-block
  ::v-deep
  .codelos-alignment-dropdown
  .dropdown-menu[x-placement='top-start'],
.element-block
  ::v-deep
  .codelos-turninto-dropdown
  .dropdown-menu[x-placement='top-start'] {
  top: 22px !important;
}
</style>
