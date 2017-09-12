import BubbleTheme, { BubbleTooltip } from 'quill/themes/bubble'
import icons from 'quill/ui/icons'
import Emitter from 'quill/core/emitter'

function getVideoInfo (url) {
  let videoInfo = {}
  let urlRe = /(?:src=')[^']+/
  let videoUrl = urlRe.exec(url)
  if (videoUrl !== null) {
    videoInfo.url = videoUrl[0].substr(5)
  } else {
    videoInfo.url = url
  }
  let heightRe = /(?:height=)\d+/
  let videoHeight = heightRe.exec(url)
  if (videoHeight !== null) {
    videoInfo.height = videoHeight[0].substr(7)
  }
  let widthRe = /(?:width=)\d+/
  let videoWidth = widthRe.exec(url)
  if (videoWidth !== null) {
    videoInfo.width = videoWidth[0].substr(6)
  }
  return videoInfo
}

function WikiBubbleTheme (quill, options) {
  Object.assign(this, new BubbleTheme(quill, options))
}
WikiBubbleTheme.prototype = BubbleTheme.prototype
WikiBubbleTheme.prototype.extendToolbar = function (toolbar) {
  this.tooltip = new WikiBubbleTooltip(this.quill, this.options.bounds)
  this.tooltip.root.appendChild(toolbar.container)
  this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), icons)
  this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), icons)
}
Object.assign(WikiBubbleTheme, BubbleTheme)

function WikiBubbleTooltip (quill, bounds) {
  Object.assign(this, new BubbleTooltip(quill, bounds))
}
WikiBubbleTooltip.prototype = BubbleTooltip.prototype
WikiBubbleTooltip.prototype.save = function () {
  let value = this.textbox.value
  switch (this.root.getAttribute('data-mode')) {
    case 'link': {
      let scrollTop = this.quill.root.scrollTop
      if (this.linkRange) {
        this.quill.formatText(this.linkRange, 'link', value, Emitter.sources.USER)
        delete this.linkRange
      } else {
        this.restoreFocus()
        this.quill.format('link', value, Emitter.sources.USER)
      }
      this.quill.root.scrollTop = scrollTop
      break
    }
    case 'video': {
      value = getVideoInfo(value)
      if (!value) break
      let range = this.quill.getSelection(true)
      if (range != null) {
        let index = range.index + range.length
        this.quill.insertEmbed(index, this.root.getAttribute('data-mode'), value.url, Emitter.sources.USER)
        let iframe = this.quill.root.querySelector(`iframe[src="${value.url}"]`)
        if (value.width) {
          iframe.setAttribute('width', value.width)
        }
        if (value.height) {
          iframe.setAttribute('height', value.height)
        }
        this.quill.setSelection(index + 2, Emitter.sources.USER)
      }
      break
    }
    default:
  }
  this.textbox.value = ''
  this.hide()
}
WikiBubbleTooltip.prototype.constructor = WikiBubbleTooltip
WikiBubbleTooltip.TEMPLATE = [
  '<span class="ql-tooltip-arrow"></span>',
  '<div class="ql-tooltip-editor">',
  '<input type="text" data-formula="e=mc^2" data-link="请输入超链接" data-video="请输入视频链接">',
  '<a class="ql-close"></a>',
  '</div>'
].join('')

export { WikiBubbleTooltip, WikiBubbleTheme as default }
