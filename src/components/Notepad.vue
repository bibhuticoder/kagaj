<template>
  <div class="notepad" ref="notepad" :class="{ '--nightmode': nightMode }">
    <div class="head">
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
        v-show="inputTool.inputText"
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

          <div class="suggestionsListItem --loading" v-if="inputTool.loading">
            <div class="loading">
              <div class="dot --one"></div>
              <div class="dot --two"></div>
              <div class="dot --three"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="wordCount">{{ wordsCount }}</div>
    </div>
  </div>
</template>

<script>
import adbs from "ad-bs-converter";
import getCaretCoordinates from "textarea-caret";
import axios from "axios";
import { mapFields } from "vuex-map-fields";
import { toNpNum } from "@/utils";

export default {
  name: "Notepad",
  props: {
    msg: String,
  },

  data() {
    return {
      cancelTokenSource: null,
      suggestionTimer: null,
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
        alignment: false, //true: right, false: left
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
      let searchSpace = this.text.substr(0, this.$refs.textarea.selectionStart);

      this.inputTool.inputText = searchSpace
        .substr(
          searchSpace.lastIndexOf(" ") + 1,
          this.$refs.textarea.selectionStart
        )
        .trim();
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
      if (this.text && this.inputTool.suggestions.length) {
        let searchSpace = this.text.substr(
          0,
          this.$refs.textarea.selectionStart
        );
        let s = this.$refs.textarea.selectionStart;
        this.text =
          this.text.substr(0, searchSpace.lastIndexOf(" ")) +
          " " +
          this.inputTool.suggestions[index] +
          " " +
          this.text.substr(
            this.$refs.textarea.selectionStart,
            this.text.length - 1
          );

        // save translation to memory
        this.memory[this.inputTool.inputText] = this.inputTool.suggestions[
          index
        ];

        this.inputTool.inputText = null;
        this.inputTool.suggestions = [];
        this.inputTool.selectedSuggestionIndex = 0;
        // this.$refs.textarea.focus();
        this.$refs.textarea.selectionEnd = s;
      }
    },

    getSuggestions() {
      let conditionToProceed =
        this.inputTool.inputText != this.inputTool.lastInputText &&
        this.inputTool.inputText;
      if (!conditionToProceed) return;
      if (this.cancelTokenSource) this.cancelTokenSource.cancel();

      this.inputTool.loading = true;
      this.generateCancelTokenSource();
      let url = `https://inputtools.google.com/request?text=${this.inputTool.inputText}&itc=ne-t-i0-und&num=${this.inputTool.numSuggestions}&cp=0&cs=1&ie=utf-8&oe=utf-8`;

      axios
        .post(url, null, { cancelToken: this.cancelTokenSource.token })
        .then((resp) =>
          this.handleSuggestionsResponse(resp, this.inputTool.inputText)
        )
        .catch(() => {});
    },

    handleSuggestionsResponse(resp, inputText) {
      if (resp.data[0] == "SUCCESS") {
        this.inputTool.suggestions = resp.data[1][0][1];

        // full stop
        if (this.inputTool.suggestions.includes("."))
          this.inputTool.suggestions.unshift("।");

        // untranslated text
        if (this.inputTool.suggestions.length === 0)
          this.inputTool.suggestions.push(inputText);

        this.inputTool.selectedSuggestionIndex = 0;
        this.inputTool.lastInputText = this.inputTool.inputText;
      } else if (resp.data[0] == "FAILED_TO_PARSE_REQUEST_BODY") {
        this.inputTool.suggestions.push(inputText);
      }
      this.inputTool.loading = false;
    },

    generateCancelTokenSource() {
      const CancelToken = axios.CancelToken;
      this.cancelTokenSource = CancelToken.source();
    },
  },

  computed: {
    ...mapFields({
      nightMode: "config.nightMode",
      text: "text",
      memory: "memory",
    }),

    dateToday() {
      var d = new Date();
      let bs = adbs.ad2bs(
        `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
      ).ne;
      return `${bs.strMonth} ${bs.day} गते, ${bs.strDayOfWeek}`;
    },

    inputToolCss() {
      return `
        left: ${this.inputTool.x || -10000}px;
        top: ${this.inputTool.y}px;
      `;
      // ${this.inputTool.alignment ? "" : "transform: translate(-100%, 0%);"}
    },

    wordsCount() {
      if (!this.text) return "";

      let count = this.text
        .trim()
        .split(" ")
        .filter((word) => !`!()-[]{};:'",<>./?@#$%^&*_~।`.includes(word))
        .length;
      let countNp = toNpNum(count);
      if (count === 0) return "";
      else if (count === 1) return `${countNp} वटा शब्द`;
      return `${countNp} वटा शब्दहरु`;
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
  padding: 22px;
  padding-bottom: 10px;
  font-family: "Mukta", sans-serif;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  color: $dark-1;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease-in-out;

  &.--nightmode {
    background-color: $dark-1;
    color: whitesmoke;
    box-shadow: none;

    .head {
      .date {
        color: $dark-2;

        &:hover {
          color: $dark-3;
        }
      }
    }

    .body {
      textarea {
        background-color: $dark-1;
        color: whitesmoke;
        caret-color: whitesmoke;
      }

      .inputTool {
        .suggestionsList {
          box-shadow: none;

          .suggestionsListItem {
            background-color: $dark-2;
            &.--selected {
              background-color: black;
            }
          }
        }
      }
    }

    .footer {
      .wordCount {
        color: $dark-2;

        &:hover {
          color: $dark-3;
        }
      }
    }
  }

  .head {
    display: flex;
    justify-content: flex-end;
    .date {
      font-size: 14px;
      color: $dark-3;
      cursor: default;
      @include not-selectable;

      &:hover {
        color: $dark-2;
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
      caret-color: $dark-1;
      color: $dark-1;
      font-family: "Mukta", sans-serif;
      border: none;
      resize: none;
      outline: none;
      @include transition;
    }

    .inputTool {
      position: absolute;
      margin-top: 33px;

      .suggestionsList {
        display: flex;
        flex-direction: column;
        @include shadow;

        .suggestionsListItem {
          padding: 0.25rem 1rem;
          cursor: default;

          &.--selected {
            background-color: whitesmoke;
          }

          &.--loading {
            display: flex;
            justify-content: center;
            padding: 0.5rem 1rem;
          }
        }
      }
    }
  }

  .footer {
    display: flex;
    justify-content: flex-end;

    .wordCount {
      font-size: 14px;
      color: $dark-3;
      cursor: default;
      @include not-selectable;

      &:hover {
        color: $dark-2;
      }
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
