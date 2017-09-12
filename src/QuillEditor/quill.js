import Quill from 'quill'
import WikiBubbleTheme from './themes/wiki-bubble'

Quill.register({
  'themes/wikibubble': WikiBubbleTheme
}, true)

export default Quill
