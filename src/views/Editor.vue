<template>
  <div
    class="editor relative"
    :class="{ '--nightmode': nightMode }"
    :style="editorInlineCss"
  >
    <div class="logo">कागज</div>

    <Notepad />

    <Toolbar />
  </div>
</template>

<script>
import Notepad from "@/components/Notepad.vue";
import Toolbar from "@/components/Toolbar.vue";
import { mapFields } from "vuex-map-fields";

export default {
  name: "Editor",
  components: {
    Notepad,
    Toolbar,
  },

  computed: {
    ...mapFields({
      editorBackground: "config.backgroundColor",
      nightMode: "config.nightMode",
    }),

    editorInlineCss() {
      if (this.nightMode) return "";
      return `
        background-color: ${this.editorBackground};
      `;
    },
  },
};
</script>

<style lang="scss">
.editor {
  width: 100%;
  height: 100%;
  @include transition;

  &.--nightmode {
    background-color: $dark-0;
  }

  .logo {
    position: absolute;
    top: 1rem;
    left: 1rem;
    color: white;
    font-family: "Mukta", sans-serif;
    font-size: 1.5rem;
    @include not-selectable;
  }
}
</style>
