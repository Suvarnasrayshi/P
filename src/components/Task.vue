<template>
  <div
    ref="codelosPage"
    @click="onPageClick"
    id="codelos-page"
    @dragenter.prevent="onPageDragEnter"
    @dragover.prevent
    @drop.prevent="handleFileDrop"
    @dragleave.prevent="onPageDragLeave"
  >
    <div class="header-wrap" v-if="isShowHeader">
      <div class="header-strap"></div>
      <div class="header-inner">
        <div
          v-for="(header, headerIdx) in pageBuilderNodes.header"
          :key="headerIdx"
        >
          <div
            :id="`${headerIdx}`"
            :key="headerIdx"
            v-if="header.type === supportedNodes.IMAGE.type"
          >
            <img :src="header.src" alt="" />
          </div>
          <div
            v-if="header.type === supportedNodes.HEADING_ONE.type"
            :class="[header.class, { 'is-empty': !header.value }]"
            :id="`${headerIdx}`"
            :key="headerIdx"
            placeholder="Title"
            :contenteditable="true"
            @input="onHeaderChange($event, headerIdx)"
          >
            <template v-if="header.value">{{ header.value }}</template>
          </div>
        </div>
      </div>
    </div>

    <div id="codelos-page-content" class="codelos-page-content">
      <RecursiveElementNodes
        ref="recursiveElementNodes"
        :pageBuilderNodes="pageBuilderNodes"
        :setEventListeners="true"
        :userTheme="userTheme"
        :task="task"
        :workflows="workflows"
        :getWorkFlowData="getWorkFlowData"
        :nodeElementMetaData="nodeElementMetaData"
        @showToast="showToast"
        v-if="pageBuilderNodes.children.length"
      ></RecursiveElementNodes>
      <div v-else id="codelos-pre-template">
        <p>Neue hinzufügen</p>
        <ul class="pre-template-list">
          <li @click="generateTemplate('invoice')">
            <div class="template-icon"><b-icon icon="receipt"></b-icon></div>
            Rechnung
          </li>
          <li @click="generateTemplate('table')">
            <div class="template-icon">
              <b-icon icon="table"></b-icon>
            </div>
            Tabelle
          </li>
          <li @click="generateTemplate('angebot')">
            <div class="template-icon">
              <img :src="templateIcons.saleOffer" />
            </div>
            Angebot
          </li>
          <li @click="onPageClick($event)" id="add-empty-page">
            <div class="template-icon">
              <b-icon icon="file-earmark"></b-icon>
            </div>
            Empty Page
          </li>
        </ul>
      </div>
    </div>
    <!-- Main : {{ pageBuilderNodes }} |||||||||||||||||||| -->
  </div>
</template>

<script>
import RecursiveElementNodes from '@/components/RecursiveElementNodes';
import { v4 as uuidv4 } from 'uuid';
import * as templateJson from '@/assets/template';
import preDefinedTemplate from '@/assets/images/preDefinedTemplate';

/* eslint-disable */

export default {
  name: 'Task',

  data() {
    return {
      isVisible: true,
      templateIcons: preDefinedTemplate,
      supportedNodes: {
        HEADING_ONE: {
          type: 'h1',
          identifier: '#',
          initialObj: {
            id: uuidv4(),
            type: 'h1',
            value: null,
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
      },

      pageBuilderNodes: {
        id: uuidv4(),
        type: 'row',
        value: null,
        header: {
          img: {
            type: 'img',
            src: 'https://www.notion.so/icons/apple_green.svg?mode=light',
            value: 'Header Image',
            class: 'codelos-image-block',
          },
          title: {
            type: 'h1',
            value: 'Der Titel des Page Builders wird hier sein...',
            class: 'codelos-header-one-block',
          },
        },

        children: [],
      },
      nodeElementMetaData: {},
    };
  },
  created() {
    if (this.taskProps && this.taskProps.jsonContent)
      this.pageBuilderNodes = this.clone(this.taskProps.jsonContent);
  },
  props: {
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
    taskProps: {
      type: Object,
      default() {
        return null;
      },
    },
    isShowHeader: {
      type: Boolean,
      default: false,
    },
    userTheme: {
      type: Object,
      default: null,
    },
    getWorkFlowData: {
      type: Function,
      default: () => {},
    },
  },

  watch: {
    pageBuilderNodes: {
      deep: true,
      handler(v) {
        setTimeout(() => this.emitNewJsonAndHtml(), 100);
      },
    },
    nodeElementMetaData: {
      deep: true,
      handler(v) {
        setTimeout(() => this.emitNewJsonAndHtml(), 100);
      },
    },
  },

  methods: {
    showToast(message) {
      this.$bvToast.toast(message, {
        variant: 'secondary',
        solid: true,
        autoHideDelay: 5000,
        noCloseButton: true,
      });
    },
    onPageClick(event) {
      if (
        (event.target.id === 'codelos-page' ||
          event.target.id === 'codelos-page-content' ||
          event.target.id === 'add-empty-page') &&
        ((this.pageBuilderNodes.children[
          this.pageBuilderNodes.children.length - 1
        ] &&
          this.pageBuilderNodes.children[
            this.pageBuilderNodes.children.length - 1
          ].type !== this.supportedNodes.INPUT.type) ||
          !this.pageBuilderNodes.children.length)
      ) {
        this.addInputElement();
      }
    },

    addInputElement(index = null) {
      if (!index) {
        this.pageBuilderNodes.children.push(
          this.clone(this.supportedNodes.INPUT.getInitialObj())
        );
      }
    },

    emitNewJsonAndHtml() {
      this.$emit('onContentChange', {
        jsonContent: this.clone(this.pageBuilderNodes),
        htmlContent: this.getSanitizedString(),
      });
    },

    clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    getSanitizedString() {
      let htmlString = document.getElementById('codelos-page').innerHTML;
      htmlString = htmlString.replaceAll('<!---->', '');
      htmlString = htmlString.replaceAll('class="cellSelected"', '');
      htmlString = htmlString.replaceAll('class="selected"', '');

      const tmpElement = document.createElement('div');
      tmpElement.innerHTML = htmlString;
      tmpElement
        .querySelectorAll(
          '.draggible-icon, #rowHandle, #columnHandle, .btn-secondary, .close-btn, #codelos-pre-template'
        )
        .forEach((el) => el.remove());

      tmpElement.querySelectorAll('input[headingValue]').forEach((el) => {
        el.parentNode.innerHTML = `<div id="${el.id}"> ${
          el.getAttribute('headingValue') || ''
        } </div>`;
      });

      tmpElement.querySelectorAll('input[cellValue]').forEach((el) => {
        el.parentNode.innerHTML = `<div  class="table-cell-content" id="${
          el.id
        }"> ${el.getAttribute('cellValue') || ''} </div>`;
      });

      tmpElement.querySelectorAll('div[timeseriestmpname]').forEach((el) => {
        el.parentNode.innerHTML = `<div id="${el.getAttribute(
          'timeseriestmpname'
        )}"> { ${el.getAttribute('timeseriestmpname')} } </div>`;
      });

      // tmpElement
      //   .querySelectorAll('.codelos-col-block')
      //   .forEach((el) => el.style.removeProperty('width'));
      htmlString = tmpElement.innerHTML;
      return htmlString;
    },

    generateTemplate(templateName) {
      this.pageBuilderNodes.children = JSON.parse(
        JSON.stringify(templateJson[templateName])
      );
    },
    onPageDragEnter(event) {
      const isFileDrag = event.dataTransfer.types.includes('Files');

      if (
        isFileDrag &&
        this.pageBuilderNodes &&
        this.pageBuilderNodes.children &&
        this.pageBuilderNodes.children.length
      ) {
        let isDropIndexSet = false;

        const firstPageBuilderNodeId = this.pageBuilderNodes.children[0].id;
        const firstPageBuilderNode = document.getElementById(
          `0_${firstPageBuilderNodeId}`
        );
        const numberOfElementsInPageBuilder =
          this.pageBuilderNodes.children.length;

        const lastPageBuilderNodeId =
          this.pageBuilderNodes.children[numberOfElementsInPageBuilder - 1].id;

        const lastPageBuilderNode = document.getElementById(
          `${numberOfElementsInPageBuilder - 1}_${lastPageBuilderNodeId}`
        );

        if (!firstPageBuilderNode) return;
        if (!lastPageBuilderNode) return;

        const firstPageBuilderNodeRect =
          firstPageBuilderNode.getBoundingClientRect();
        const lastPageBuilderNodeRect =
          lastPageBuilderNode.getBoundingClientRect();

        if (event.y < firstPageBuilderNodeRect.top) {
          this.$refs.recursiveElementNodes.setDropzoneIndex(0);
          isDropIndexSet = true;
        } else if (event.y > lastPageBuilderNodeRect.bottom) {
          this.$refs.recursiveElementNodes.setDropzoneIndex(
            numberOfElementsInPageBuilder
          );
          isDropIndexSet = true;
        } else {
          isDropIndexSet = false;
        }

        if (!isDropIndexSet && event.target) {
          const elementBlock = event.target.closest('.element-block');
          if (!elementBlock) return;
          const blockIndex = elementBlock.getAttribute('data-block-index');
          this.$refs.recursiveElementNodes.setDropzoneIndex(
            parseInt(blockIndex)
          );
        }
      }
    },
    handleFileDrop(event) {
      if (this.$refs.recursiveElementNodes) {
        this.$refs.recursiveElementNodes.handleFileDrop(event);
      }
    },
    onPageDragLeave(event) {
      if (this.$refs.recursiveElementNodes && event.x === 0 && event.y === 0) {
        this.$refs.recursiveElementNodes.setDropzoneIndex(null);
      } else {
        const codelosPage = this.$refs.codelosPage;
        if (codelosPage) {
          const codelosPageBoundingReact = codelosPage.getBoundingClientRect();
          const x = event.clientX;
          const y = event.clientY;
          if (
            x < codelosPageBoundingReact.left ||
            x > codelosPageBoundingReact.right ||
            y < codelosPageBoundingReact.top ||
            y > codelosPageBoundingReact.bottom
          ) {
            this.$refs.recursiveElementNodes.setDropzoneIndex(null);
          }
        }
      }
    },
  },

  components: {
    RecursiveElementNodes,
  },
};
</script>

<style scoped>
.is-empty {
  position: relative;
}

.is-empty:before {
  content: attr(placeholder);
  display: block;
}

.tab {
  text-align: left;
  padding: 20px 31px;
  height: 577px;
  position: relative;
  overflow: scroll;
}
/****** Header ******/
.header-strap {
  position: relative;
  width: 100%;
  height: 220px;
  background: linear-gradient(
    90deg,
    rgba(130, 214, 231, 1) 35%,
    rgba(200, 237, 245, 1) 100%
  );
}
.header-inner {
  max-width: 90%;
  margin: 0 auto;
  position: relative;
  top: -60px;
  padding: 0 35px;
}
.header-inner img {
  max-width: 100%;
  width: 100px;
  filter: hue-rotate(45deg);
  position: relative;
  left: -15px;
}
.codelos-header-one-block {
  font-size: 26px;
  color: inherit;
  font-weight: 600;
}

/***** Page CSS ******/
.codelos-page-content {
  position: relative;
  margin: 0 auto;
  padding: 40px 35px;
  min-height: 50vh;
}

#codelos-pre-template {
  color: rgba(55, 53, 47, 0.65);
}
#codelos-pre-template .pre-template-list {
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin: 0;
}

.pre-template-list .template-icon {
  margin-right: 10px;
}
#codelos-pre-template .pre-template-list li {
  list-style-type: none;
  padding-left: 5px;
  margin-bottom: 3px;
  display: flex;
  padding: 5px 10px;
  border-radius: 4px;
}

#codelos-pre-template .pre-template-list li:hover {
  color: rgb(55, 53, 47);
  background-color: rgba(55, 53, 47, 0.08);
  padding-top: 4px;
}

.template-icon .table-icon {
  font-size: 10px;
}
.template-icon img {
  width: 17px;
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
</style>
