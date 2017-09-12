<template>
  <div id="app">
    <h1>Quill Editor</h1>
    <div>
      <h2>Quill Snow</h2>
      <quill-snow v-model="snow"></quill-snow>
    </div>
    <div>
      <h2>Quill Bubble</h2>
      <quill-bubble v-model="bubble" :toolbar="true"></quill-bubble>
    </div>
  </div>
</template>

<script>
import QuillSnow from './QuillEditor/QuillSnow.vue'
import QuillBubble from './QuillEditor/QuillBubble.vue'

export default {
  name: 'app',
  data () {
    return {
      snow: '',
      bubble: ''
    }
  },
  components: {
    QuillSnow,
    QuillBubble
  }
}
</script>

<style lang="scss">
#app {
  h1, h2 {
    text-align: center;
  }
  .ql-editor {
    min-height: 250px;
  }
}
</style>
