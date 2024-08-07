import PageBuilder from './components/Task.vue';
import clickOutside from './directives/clickOutside';

const PageBuilderSimple = {
  install(Vue) {
    Vue.component('page-builder', PageBuilder);
  },
};

const pageBuilderPlugins = {
  install(Vue) {
    Vue.directive('click-outside', clickOutside);
  },
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(PageBuilderSimple);
  window.Vue.use(pageBuilderPlugins);
}

export default PageBuilder;

export { PageBuilder as PageBuilderComponent, pageBuilderPlugins };
