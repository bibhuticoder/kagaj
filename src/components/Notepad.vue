<template>
  <div class="notepad" spellcheck="false">
    <div class="head">
      <!-- <div
        class="title border"
        contenteditable="true"
        data-placeholder="शीर्षक"
      ></div> -->
      <div class="date">{{ dateToday }}</div>
    </div>

    <div class="body">
      <textarea
        placeholder="यहाँ लेख्नुहोस्"
        ref="textarea"
        v-model="text"
        @input="handleInput"
        @keyup="handleKeyUp"
        @keydown="handleKeyDown"
        @mousedown="handleMouseDown"
      ></textarea>

      <div
        class="inputTool"
        ref="inputTool"
        :style="inputToolCss"
        v-if="inputTool.inputText"
      >
        <div class="suggestionsList">
          <div
            class="suggestionsListItem"
            v-for="(suggestion, index) in inputTool.suggestions"
            :key="index"
            :class="{
              '--selected': inputTool.selectedSuggestionIndex === index,
            }"
            @click="appendText(index)"
          >
            {{ suggestion }}
          </div>

          <div class="suggestionListItem" v-if="inputTool.loading">
            <div class="loading">
              <div class="dot --one"></div>
              <div class="dot --two"></div>
              <div class="dot --three"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapFields } from "vuex-map-fields";
import adbs from "ad-bs-converter";
import getCaretCoordinates from "textarea-caret";
import axios from "axios";

export default {
  name: "Notepad",
  props: {
    msg: String,
  },

  data() {
    return {
      text: null,
      inputTool: {
        active: false,
        x: null,
        y: null,
        inputText: null,
        lastInputText: null,
        suggestions: [],
        selectedSuggestionIndex: null,
        loading: false,
        numSuggestions: 5,
        timer: null,
      },
    };
  },

  methods: {
    handleInput(event) {
      var caret = getCaretCoordinates(
        this.$refs.textarea,
        this.$refs.textarea.selectionStart
      );
      this.inputTool.x = caret.left;
      this.inputTool.y = caret.top;
      this.autoExpand(event.target);
    },

    handleKeyUp() {
      let searchSpace = this.text;
      this.inputTool.inputText = searchSpace.substr(
        searchSpace.lastIndexOf(" ") + 1,
        this.$refs.textarea.selectionStart
      );

      this.getSuggestions();
    },

    handleKeyDown(e) {
      if (this.inputTool.inputText) {
        if (e.key === "ArrowUp") {
          this.inputTool.selectedSuggestionIndex--;
          if (this.inputTool.selectedSuggestionIndex < 0)
            this.inputTool.selectedSuggestionIndex =
              this.inputTool.suggestions.length - 1;
          e.preventDefault();
        } else if (e.key === "ArrowDown") {
          this.inputTool.selectedSuggestionIndex++;
          if (
            this.inputTool.selectedSuggestionIndex >=
            this.inputTool.suggestions.length
          )
            this.inputTool.selectedSuggestionIndex = 0;
          e.preventDefault();
        } else if (e.key === "Enter" || e.key === " ") {
          this.appendText();
          e.preventDefault();
        }
      }
    },

    handleMouseDown() {
      this.inputTool.inputText = null;
      this.appendText();
    },

    autoExpand(field) {
      // Reset field height
      field.style.height = "inherit";

      // Get the computed styles for the element
      var computed = window.getComputedStyle(field);

      // Calculate the height
      var height =
        parseInt(computed.getPropertyValue("border-top-width"), 10) +
        parseInt(computed.getPropertyValue("padding-top"), 10) +
        field.scrollHeight +
        parseInt(computed.getPropertyValue("padding-bottom"), 10) +
        parseInt(computed.getPropertyValue("border-bottom-width"), 10);

      field.style.height = height + "px";
    },

    appendText(index = this.inputTool.selectedSuggestionIndex) {
      if (
        this.text &&
        this.inputTool.suggestions &&
        this.inputTool.suggestions.length
      ) {
        this.text =
          this.text.substr(0, this.text.lastIndexOf(" ")) +
          " " +
          this.inputTool.suggestions[index] +
          " ";

        this.inputTool.inputText = null;
        this.inputTool.suggestions = [];
        this.inputTool.selectedSuggestionIndex = 0;
        this.$refs.textarea.focus();
      }
    },

    async getSuggestions() {
      if (
        !this.inputTool.loading &&
        this.inputTool.inputText != this.inputTool.lastInputText
      ) {
        this.inputTool.loading = true;
        let url = `https://inputtools.google.com/request?text=${this.inputTool.inputText}&itc=ne-t-i0-und&num=${this.inputTool.numSuggestions}&cp=0&cs=1&ie=utf-8&oe=utf-8`;

        try {
          let resp = await axios.post(url);
          if (resp.data[0] == "SUCCESS") {
            this.inputTool.suggestions = resp.data[1][0][1];

            // handle full stop
            if (this.inputTool.suggestions.includes("."))
              this.inputTool.suggestions.unshift("।");

            this.inputTool.selectedSuggestionIndex = 0;
            this.inputTool.lastInputText = this.inputTool.inputText;
          }
        } catch (e) {
          console.log(e);
        }
        this.inputTool.loading = false;
      }
    },
  },

  computed: {
    dateToday() {
      var d = new Date();
      let bs = adbs.ad2bs(`${d.getFullYear()}/${d.getMonth()}/${d.getDay()}`)
        .ne;
      return `${bs.strMonth} ${bs.day} गते, ${bs.strDayOfWeek}`;
    },

    inputToolCss() {
      return `
        left: ${this.inputTool.x || -10000}px;
        top: ${this.inputTool.y}px;
      `;
    },
  },
};
</script>

<style scoped lang="scss">
.notepad {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  height: 90%;
  width: 50%;
  min-width: 700px;
  border-radius: 10px;
  padding: 1.3rem;
  font-family: "Mukta", sans-serif;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: #373737;

  display: flex;
  flex-direction: column;
  .head {
    display: flex;
    justify-content: flex-end;
    .date {
      font-size: 14px;
      color: #e5e5e5;
      align-self: center;
      cursor: default;
      transition: all 0.2s ease;

      &:hover {
        color: #8a8989;
      }
    }
  }

  .body {
    position: relative;
    flex: 1;
    margin-top: 1rem;
    overflow-y: auto;
    overflow-x: hidden;

    textarea {
      width: 100%;
      font-size: 1.2rem;
      caret-color: #373737;
      color: #373737;
      font-family: "Mukta", sans-serif;
      border: none;
      resize: none;
      outline: none;
    }

    .inputTool {
      position: absolute;
      transform: translate(-100%, 0%);
      margin-top: 33px;
    }
  }
}

.suggestionsList {
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  .suggestionsListItem {
    padding: 0.25rem 1rem;
    cursor: default;

    &.--selected {
      background-color: whitesmoke;
    }

    &.--loading {
      position: relative;
      animation: loadingAnim 0.5s infinite;
    }
  }
}

.loading {
  display: flex;

  .dot {
    height: 5px;
    width: 5px;
    margin: 2.5px;
    border-radius: 100%;
    background-color: grey;

    &.--one {
      animation: loadingAnim 0.5s infinite 0.2s;
      animation-direction: alternate;
    }

    &.--two {
      animation: loadingAnim 0.5s infinite 0.15s;
      animation-direction: alternate;
    }

    &.--three {
      animation: loadingAnim 0.5s infinite 0.6s;
      animation-direction: alternate;
    }
  }
}

@keyframes loadingAnim {
  0% {
    transform: translateY(0px);
  }
  25% {
    transform: translateY(1px);
  }
  50% {
    transform: translateY(3px);
  }
  75% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(8px);
  }
}
</style>
