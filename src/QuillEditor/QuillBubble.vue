<template>
  <div class="quill-bubble">
    <div ref="editor"></div>
    <input @change="selectImage" ref="selimg" type="file" accept="image/png, image/gif, image/jpeg, image/bmp, image/x-icon" hidden>
  </div>
</template>

<script>
import 'quill/dist/quill.bubble.css'
import Quill from 'quill'
import { image2DataURI } from '../util'

export default {
  name: 'quill-bubble',
  props: {
    value: {
      type: String,
      required: true
    },
    toolbar: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Insert text here ...'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      content: '',
      quill: null
    }
  },
  watch: {
    value (curVal, oldVal) {
      if (this.quill) {
        if (curVal !== this.content) {
          this.content = curVal
          this.quill.pasteHTML(curVal)
        }
      }
    },
    disabled (curVal, oldVal) {
      if (this.quill) {
        this.quill.enable(!curVal)
      }
    }
  },
  mounted () {
    this.init()
    this.$on('uploadImg', () => {
      this.$refs.selimg.click()
    })
  },
  beforeDestroy () {
    this.quill = null
  },
  methods: {
    init () {
      let options = {
        theme: 'bubble',
        placeholder: this.placeholder,
        modules: {
          toolbar: false
        }
      }
      if (this.toolbar) {
        const self = this
        options.modules.toolbar = {
          container: [
            ['bold', {'header': 2}, 'blockquote', 'link', 'image', 'video', 'clean']
          ],
          handlers: {
            image (value) {
              self.$refs.selimg.click()
            }
          }
        }
      }
      this.quill = new Quill(this.$refs.editor, options)

      if (this.value) {
        this.quill.pasteHTML(this.value)
      }
      this.quill.on('text-change', (delta, oldDelta, source) => {
        let html = this.$refs.editor.children[0].innerHTML
        let text = this.$refs.editor.children[0].textContent
        if (html === '<p><br></p>') {
          html = ''
        }
        this.content = html
        this.$emit('input', html)
        // emit "change" event
        this.$emit('contentChange', {html, text})
      })
    },
    selectImage () {
      const fileInput = this.$refs.selimg
      if (fileInput.files != null && fileInput.files[0] != null) {
        let file = fileInput.files[0]
        fileInput.value = ''
        if (file.type.split('/')[0] !== 'image') return
        image2DataURI(file)
        .then(dataURI => {
          this.insertEmbed('image', dataURI)
        })
        .catch(err => console.log(err))
      }
    },
    insertEmbed (format, src) {
      const Delta = Quill.import('delta')
      let range = this.quill.getSelection(true)
      let delta = new Delta()
        .retain(range.index)
        .delete(range.length)
        .insert({[format]: src})
      this.quill.updateContents(delta)
    }
  }
}
</script>

<style lang="scss">
.quill-bubble {
  height: 100%;
  position: relative;
  .ql-editor {
    border: 1px solid #ccc;
  }
  .link-tooltip {
    position: absolute;
    background-color: #444;
    color: #fff;
    border-radius: 15px;
    font-size: 12px;
    padding: 4px 15px 6px;
    &::after {
      content: '';
      border: 6px solid transparent;
      border-top-color: #444;
      width: 0;
      height: 0;
      position: absolute;
      top: 100%;
      left: 20px;
    }
  }
  .tooltip-fade-enter-active, .tooltip-fade-leave-active {
    transition: opacity .5s
  }
  .tooltip-fade-enter, .tooltip-fade-leave-to {
    opacity: 0
  }
  .ql-container.ql-bubble:not(.ql-disabled) a::before,
  .ql-container.ql-bubble:not(.ql-disabled) a::after {
    display: none;
  }
}
</style>
