<template>
  <div class="toolbar" ref="toolbar" :class="{ '--nightmode': nightMode }">
    <button class="toolbarBtn" v-if="!nightMode">
      <ColorPicker />
    </button>

    <button class="toolbarBtn" @click="toggleNightMode()">
      <i class="fal fa-sun" v-if="nightMode"></i>
      <i class="fal fa-moon-stars" v-else></i>
    </button>

    <button class="toolbarBtn" @click="toggleFullScreen()">
      <i class="fal fa-compress-arrows-alt" v-if="fullScreen"></i>
      <i class="fal fa-compress-wide" v-else></i>
    </button>
  </div>
</template>

<script>
import { mapFields } from "vuex-map-fields";
import { openInFullScreen, exitFullScreen } from "@/utils";
import ColorPicker from "@/components/ColorPicker";

export default {
  name: "Toolbar",
  components: { ColorPicker },
  data() {
    return {
      text: null,
    };
  },

  methods: {
    toggleNightMode() {
      this.nightMode = !this.nightMode;
    },

    toggleFullScreen() {
      if (this.fullScreen) {
        exitFullScreen();
        this.fullScreen = false;
      } else {
        openInFullScreen();
        this.fullScreen = true;
      }
    },
  },

  computed: {
    ...mapFields({
      nightMode: "config.nightMode",
      fullScreen: "config.fullScreen",
    }),
  },
};
</script>

<style scoped lang="scss">
.toolbar {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  display: flex;

  .toolbarBtn {
    background: transparent;
    border: none;
    outline: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    align-self: center;
  }
}
</style>
