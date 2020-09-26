<template>
  <div class="colorPicker" ref="colorPicker">
    <div class="handle" @click="toggleActiveStatus()"></div>
    <div class="palette" v-if="active">
      <div
        class="colorItem"
        :class="{'--selected': color === backgroundColor}"
        v-for="(color, index) in colors"
        :key="index"
        :style="'background-color: ' + color"
        @click="selectColor(color)"
      ></div>
    </div>
  </div>
</template>

<script>
import { mapFields } from "vuex-map-fields";

export default {
  name: "Toolbar",
  data() {
    return {
      active: false,
      colors: [
        "#26A69A",
        "#66BB6A",
        "#9CCC65",
        "#D4E157",
        "#FFCA28",
        "#FFA726",
        "#FF7043",
        "#8D6E63",
        "#BDBDBD",
        "#78909C",
        "#29B6F6",
        "#5C6BC0",
        "#7E57C2",
        "#EC407A",
        "#ef5350",
        "#607D8B",
        "#4CAF50",
        "#ff5252",
      ],
    };
  },

  methods: {
    toggleActiveStatus() {
      this.active = !this.active;
    },

    selectColor(color) {
      this.backgroundColor = color;
      this.toggleActiveStatus();
    },
  },

  computed: {
    ...mapFields({
      nightMode: "config.nightMode",
      fullScreen: "config.fullScreen",
      backgroundColor: "config.backgroundColor",
    }),
  },
};
</script>

<style scoped lang="scss">
.colorPicker {
  position: relative;
  $size: 18px;
  .handle {
    height: $size;
    width: $size;
    border-radius: 50%;
    border: 1px solid $white;
    background: transparent;
    cursor: pointer;
  }

  .palette {
    position: absolute;
    min-width: 200px;
    border-radius: 5px;
    background-color: $white;
    transform: translate(
      calc(-100% + #{$size}),
      calc(-100% - #{$size} - 8px)
    );
    padding: 0.25rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    @include shadow;

    .colorItem {
      height: $size + 5;
      width: $size + 5;
      border-radius: 50%;
      cursor: pointer;
      margin: 0.25rem;
      border: 1px solid $white;

      &.--selected{
        border-color: $dark-1;
      }
    }
  }
}
</style>
