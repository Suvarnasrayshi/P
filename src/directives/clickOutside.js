export default {
  bind: function (el, binding) {
    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    setTimeout(() => {
      document.body.addEventListener('click', el.clickOutsideEvent);
    });
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};
