<template>
  <div class="editor relative" :style="editorInlineCss">
    <Notepad />
  </div>
</template>

<script>
import Notepad from "@/components/Notepad.vue";
import { mapFields } from "vuex-map-fields";

export default {
  name: "Editor",
  components: {
    Notepad,
  },

  computed: {
    ...mapFields({
      editorBackground: "config.backgroundColor",
    }),

    editorInlineCss() {
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
}
</style>
