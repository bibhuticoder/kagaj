import Vue from "vue";
import Vuex from "vuex";
import { getField, updateField } from "vuex-map-fields";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {
      backgroundColor: '#80CBC4'
    },
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },
});
