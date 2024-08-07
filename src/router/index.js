import Vue from 'vue'
import Router from 'vue-router'
import Workflow from '@/components/Workflow'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Workflow',
      component: Workflow
    }
  ]
})
