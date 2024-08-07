<template>
  <div ref="draggableRef">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'DraggableWrap',

  props: {
    list: {
      type: Array,
      default() {
        return [];
      },
    },
    handle: {
      type: String,
      required: true,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentElement: {
        index: null,
        id: null,
      },
      futureElement: {
        index: null,
        id: null,
        dropZoneIndex: null,
      },
      isAbovePage: false,
      isBelowPage: false,
    };
  },

  mounted() {
    this.attachEventListeners();
  },
  beforeDestroy() {
    this.destroyEvents();
  },

  methods: {
    getCustomEvent({
      name,
      originalEvent = null,
      currentIndex = null,
      futureIndex = null,
      currentId = null,
      futureId = null,
      target = null,
      dropZoneIndex = null,
      isAbovePage = false,
      isBelovePage = false,
    }) {
      const customEvent = new CustomEvent(name, {
        target,
      });
      Object.assign(customEvent, {
        originalEvent,
        currentIndex,
        currentId,
        futureIndex,
        futureId,
        dropZoneIndex,
        isAbovePage,
        isBelovePage,
      });

      return customEvent;
    },

    onDragStart(event) {
      const dragEle = event.target;
      // add drag over event on codelos page while drag start
      const codelosPage = document.getElementById('codelos-page');
      this.addEvent(codelosPage, 'dragover', this.onDragOver);

      const currentDraggableElement = dragEle && dragEle.children[1];
      const currentDraggableElementSplit =
        currentDraggableElement &&
        currentDraggableElement.id &&
        currentDraggableElement.id.split('_');
      if (!currentDraggableElementSplit) return;
      const currentDraggableElementIndex = currentDraggableElementSplit[0];
      const currentDraggableElementId = currentDraggableElementSplit[1];

      this.currentElement = {
        index: parseInt(currentDraggableElementIndex),
        id: currentDraggableElementId,
      };
      // create custom event to return in emit fn
      const customEvent = this.getCustomEvent({
        name: 'customdragstart',
        originalEvent: event,
        target: currentDraggableElement,
        currentIndex: parseInt(currentDraggableElementIndex),
        currentId: currentDraggableElementId,
      });
      this.$emit('start', customEvent);
    },

    onDragEnd(event) {
      if (!this.futureElement.id) return;
      const dragEle = event.target;

      const dragEleWrapper = dragEle && this.getClosest(dragEle);
      if (dragEleWrapper) {
        dragEleWrapper.style.zIndex = '';
        this.removeEvent(dragEleWrapper, 'dragstart', this.onDragStart);
        this.removeEvent(dragEleWrapper, 'dragend', this.onDragEnd);
      }
      const listClone = JSON.parse(JSON.stringify(this.list));
      let isElementCloneUpdated = false;
      if (this.isElementUpdatedWithDrag) {
        const isCurrentElementDirectExist = listClone.some(
          (childNode) => childNode && childNode.id === this.currentElement.id
        );
        const isFutureElementDirectExist = listClone.some(
          (childNode) => childNode && childNode.id === this.futureElement.id
        );

        // update list start
        // same col

        if (isCurrentElementDirectExist && isFutureElementDirectExist) {
          if (
            listClone[this.currentElement.index] &&
            listClone[this.currentElement.index].id === this.currentElement.id
          ) {
            listClone.splice(this.currentElement.index, 1);
            listClone.splice(
              this.futureElement.index,
              0,
              JSON.parse(JSON.stringify(this.list[this.currentElement.index]))
            );
            isElementCloneUpdated = true;
          }
        } else {
          // for main to col

          if (isCurrentElementDirectExist && !isFutureElementDirectExist) {
            const elementToAdd = listClone[this.currentElement.index];

            listClone.forEach((listElement) => {
              if (
                listElement &&
                listElement.type === 'col' &&
                listElement.elements.length
              ) {
                const targetedChildNode = listElement.elements.find((element) =>
                  element.children.some(
                    (child) => child.id === this.futureElement.id
                  )
                );
                if (targetedChildNode) {
                  listClone.splice(this.currentElement.index, 1);
                  targetedChildNode.children.splice(
                    this.futureElement.index,
                    0,
                    elementToAdd
                  );
                  isElementCloneUpdated = true;
                }
              }
            });
          }

          // below 2 things are managed in dragend event in recusrsive node elemetn
          // because here we get only neasted list as this.list so we can't update it directly
          // for col to main
          // for col to col
        }
      }
      if (this.elementBlocks) {
        this.destroyEvents();
      }
      this.elementBlocks = null;
      if (this.isElementUpdatedWithDrag && isElementCloneUpdated) {
        this.$emit('update', listClone);
      }

      setTimeout(() => {
        this.attachEventListeners();
      });

      // update list end

      // remove drag over event on codelos page while drag end
      const codelosPage = document.getElementById('codelos-page');
      setTimeout(() => {
        this.removeEvent(codelosPage, 'dragover', this.onDragOver);
      });

      // remove draggable element from anywhere
      dragEle.setAttribute('draggable', 'false');

      const customEvent = this.getCustomEvent({
        name: 'customdragEnd',
        originalEvent: event,
        currentIndex: this.currentElement.index,
        currentId: this.currentElement.id,
        futureId: this.futureElement.id,
        futureIndex: this.futureElement.index,
        isBelovePage: this.isBelovePage,
        isAbovePage: this.isAbovePage,
      });
      this.currentElement = {
        index: null,
        id: null,
      };
      this.futureElement = {
        index: null,
        id: null,
        dropZoneIndex: null,
      };

      this.$emit('end', customEvent);
    },

    onDragOver(event) {
      event.preventDefault();

      // get nearest element which have id
      const elementBlock = event.target.classList.contains('element-block')
        ? event.target
        : this.getClosest(event.target, '.element-block');
      const nearestElementWrapper = this.getClosest(event.target);

      const futureElement =
        nearestElementWrapper && nearestElementWrapper.children[1];

      let futureElementId = null;
      let futureElementIndex = null;
      let futureIndex = null;
      let dropZoneIndex = null;

      if (futureElement) {
        const futureElementSplit = futureElement && futureElement.id.split('_');
        futureElementIndex =
          futureElementSplit && parseInt(futureElementSplit[0]);
        futureElementId = futureElementSplit && futureElementSplit[1];
        const futureElementInfo = this.list.find(
          (el) => el && el.id === futureElementId
        );
        const currentElementInfo = this.list.find(
          (el) => el && el.id === this.currentElement.id
        );

        const nearestElementWrapperRect =
          elementBlock && elementBlock.getBoundingClientRect();

        dropZoneIndex = futureElementIndex;
        if (!nearestElementWrapperRect) {
          dropZoneIndex =
            (futureElementIndex != null &&
              !futureElementInfo &&
              futureElementId) ||
            this.currentElement.index >= futureElementIndex
              ? futureElementIndex
              : futureElementIndex + 1;
        }

        futureIndex = futureElementIndex;

        if (nearestElementWrapperRect) {
          const isAboveCenter =
            event.y <
            nearestElementWrapperRect.top +
              nearestElementWrapperRect.height / 2;

          dropZoneIndex = isAboveCenter
            ? futureElementIndex
            : futureElementIndex + 1;

          if (
            this.currentElement.index !== futureElementIndex &&
            this.currentElement.id !== futureElementId &&
            futureElementInfo &&
            currentElementInfo
          ) {
            if (this.currentElement.index < futureElementIndex) {
              futureIndex = isAboveCenter
                ? futureElementIndex - 1
                : futureElementIndex;
            } else {
              futureIndex = isAboveCenter
                ? futureElementIndex
                : futureElementIndex + 1;
            }
          }
          if (!futureElementInfo || !currentElementInfo) {
            futureIndex = isAboveCenter
              ? futureElementIndex
              : futureElementIndex + 1;
          }
        }
      }

      // condition to show dropzone at the top and bottom
      if (!futureElement) {
        const codelosRowBlock =
          nearestElementWrapper && nearestElementWrapper.children[0];
        if (!codelosRowBlock) {
          const elementBlocks = document.querySelectorAll(
            ' .codelos-page-content > div > div >  .element-block'
          );
          const elementBlocksLength = elementBlocks.length;
          const listFirstElementReact =
            elementBlocks &&
            elementBlocks[0] &&
            elementBlocks[0].getBoundingClientRect();
          const listLastElementReact =
            elementBlocks &&
            elementBlocks[elementBlocksLength - 1] &&
            elementBlocks[elementBlocksLength - 1].getBoundingClientRect();

          if (event.y < listFirstElementReact.top) {
            const listFirstElementBlock = elementBlocks[0];
            const listElementWrapper =
              listFirstElementBlock.querySelector('.element-wrapper');

            const listElement =
              listElementWrapper && listElementWrapper.children.length == 1
                ? listElementWrapper.children[0]
                : listElementWrapper.children[1];
            dropZoneIndex = 0;
            futureIndex = 0;
            futureElementId =
              listElement && listElement.id && listElement.id.split('_')[1];
            this.isAbovePage = true;
            this.isBelovePage = false;
          }
          if (event.y > listLastElementReact.bottom) {
            const listLastElementBlock = elementBlocks[elementBlocksLength - 1];
            const listElementWrapper =
              listLastElementBlock.querySelector('.element-wrapper');

            const listElement =
              listElementWrapper && listElementWrapper.children.length == 1
                ? listElementWrapper.children[0]
                : listElementWrapper.children[1];

            futureIndex = elementBlocksLength - 1;
            futureElementId =
              listElement && listElement.id && listElement.id.split('_')[1];
            dropZoneIndex = elementBlocksLength;
            this.isBelovePage = true;
            this.isAbovePage = false;
          }
        } else {
          // logic to manage index for the nested bottom
          const colBlocks = codelosRowBlock.children;

          for (const colBlock of colBlocks) {
            const rect = colBlock.getBoundingClientRect();
            const blockX = rect.left;
            const blockY = rect.top;
            const width = rect.width;
            const height = rect.height;
            if (
              event.x >= blockX &&
              event.x <= blockX + width &&
              event.y >= blockY &&
              event.y <= blockY + height
            ) {
              const colBlockElements = colBlock.querySelectorAll(
                'div > .element-block'
              );
              if (colBlockElements) {
                const colBlockElementsLength = colBlockElements.length;
                const lastElementBlock =
                  colBlockElements[colBlockElementsLength - 1];
                if (!lastElementBlock) return;
                const lastElementWrapper =
                  lastElementBlock.querySelector('.element-wrapper');
                const lastElement = lastElementWrapper.children[1];

                if (!lastElement) return;
                const [lastElementIndex, lastElementId] =
                  lastElement.id.split('_');
                futureIndex = lastElementIndex + 1;
                futureElementId = lastElementId;
                dropZoneIndex = colBlockElementsLength;
              }
              break;
            }
          }
        }
      } else {
        this.isBelovePage = false;
        this.isAbovePage = false;
      }

      this.futureElement = {
        index: futureIndex,
        id: futureElementId,
        dropZoneIndex,
      };
      // create custom event to return in emit fn
      const customEvent = this.getCustomEvent({
        name: 'custommove',
        originalEvent: event,
        target: futureElement,
        currentIndex: this.currentElement.index,
        currentId: this.currentElement.id,
        futureId: futureElementId,
        futureIndex: futureIndex,
        dropZoneIndex,
      });

      this.$emit('move', customEvent);
    },

    getClosest(el, closest = '.element-wrapper') {
      if (el.classList.contains('element-block')) {
        return el.querySelector(closest);
      }
      if (el.classList.contains('drop-zone')) {
        return closest === '.element-block'
          ? el.parentElement
          : el.parentElement && el.parentElement.querySelector(closest);
      }
      return el.closest(closest);
    },
    addEvent(el, event, fn) {
      el.addEventListener(event, fn);
    },
    removeEvent(el, event, fn) {
      el.removeEventListener(event, fn);
    },
    onMouseDown(event) {
      const dragElement = event.target;
      const closestElementWrap = this.getClosest(dragElement);
      closestElementWrap.setAttribute('draggable', 'true');
      // document.body.style.cursor = 'grabbing';
      this.addEvent(closestElementWrap, 'dragstart', this.onDragStart);
      this.addEvent(closestElementWrap, 'dragend', this.onDragEnd);
      closestElementWrap.style.zIndex = 1;
    },
    onMouseUp(event) {
      const closestElementWrap = this.getClosest(event.target);
      closestElementWrap.setAttribute('draggable', 'false');
    },

    destroyEvents() {
      if (this.elementBlocks) {
        this.elementBlocks.forEach((element) => {
          this.removeEvent(element, 'mousedown', this.onMouseDown);
          this.removeEvent(element, 'mouseup', this.onMouseUp);
        });
      }
    },
    attachEventListeners() {
      const draggableWrap = this.$refs.draggableRef;
      if (!draggableWrap) return;

      if (this.elementBlocks) {
        this.destroyEvents();
      }

      // Get new elements and attach event listeners
      const elementBlocks = draggableWrap.querySelectorAll(this.handle);

      elementBlocks.forEach((element) => {
        this.addEvent(element, 'mousedown', this.onMouseDown);
        this.addEvent(element, 'mouseup', this.onMouseUp);
      });

      this.elementBlocks = elementBlocks;
    },
  },
  computed: {
    isElementUpdatedWithDrag() {
      return (
        this.currentElement.index !== null &&
        this.currentElement.id &&
        this.futureElement.index !== null &&
        this.futureElement.id &&
        this.currentElement.id !== this.futureElementId
      );
    },
  },
  watch: {
    list: function () {
      setTimeout(() => {
        this.attachEventListeners();
      });
    },
    immediate: true,
  },
};
</script>
