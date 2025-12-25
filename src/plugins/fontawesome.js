import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faFileWord } from '@fortawesome/free-solid-svg-icons'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import { faAlignCenter } from '@fortawesome/free-solid-svg-icons'
import { faAlignRight } from '@fortawesome/free-solid-svg-icons'
import { faAlignJustify } from '@fortawesome/free-solid-svg-icons'


library.add(faFileWord
, faPenToSquare
, faRightToBracket
, faTrash
, faAlignLeft
, faAlignCenter
, faAlignRight
, faAlignJustify
)

export { FontAwesomeIcon }