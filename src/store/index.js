import Vue from "vue";
import Vuex from "vuex";
import { getField, updateField } from "vuex-map-fields";
import VuexPersistence from "vuex-persist";

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
});

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    text: null,
    config: {
      nightMode: false,
      fullScreen: false,
      backgroundColor: "#80CBC4",
    },
    memory: {},
  },
  getters: {
    getField,
  },
  mutations: {
    updateField,
  },

  plugins: [vuexLocal.plugin],
});
