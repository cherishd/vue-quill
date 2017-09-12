<template>
  <div class="quill-snow">
    <div ref="editor"></div>
    <input @change="selectImage" ref="selimg" type="file" accept="image/png, image/gif, image/jpeg, image/bmp, image/x-icon" hidden>
  </div>
</template>

<script>
import 'quill/dist/quill.snow.css'
import Quill from 'quill'
import { image2DataURI } from '../util'

export default {
  name: 'quill-snow',
  props: {
    value: {
      type: String,
      required: true
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
  },
  beforeDestroy () {
    this.quill = null
  },
  methods: {
    init () {
      const self = this
      let options = {
        theme: 'snow',
        placeholder: this.placeholder,
        modules: {
          toolbar: {
            container: [
              ['bold'],
              [{'header': 2}],
              ['blockquote'],
              ['link'],
              ['image'],
              ['video'],
              ['clean']
            ],
            handlers: {
              link (value) {
                if (value) {
                  let range = this.quill.getSelection()
                  if (range == null || range.length === 0) return
                  let preview = this.quill.getText(range)
                  if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
                    preview = 'mailto:' + preview
                  }
                  let tooltip = this.quill.theme.tooltip
                  tooltip.edit('link', preview)
                } else {
                  this.quill.format('link', false)
                }
              },
              image (value) {
                self.$refs.selimg.click()
              }
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
        console.log(file)
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
.quill-snow {
  position: relative;
  height: 100%;
  .ql-toolbar {
    position: absolute;
    width: 100%;
    top: 0;
    z-index: 1;
  }
  .ql-container {
    box-sizing: border-box;
    padding-top: 42px;
  }
  .ql-tooltip {
    &::before {
      content: '访问链接：';
    }
    a.ql-action {
      &::after {
        content: '编辑';
      }
    }
    a.ql-remove {
      &::before {
        content: '移除';
      }
    }
  }
  .ql-snow .ql-tooltip[data-mode=link]::before {
    content: '输入链接:';
  }
  .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    content: '保存';
  }
}
</style>
