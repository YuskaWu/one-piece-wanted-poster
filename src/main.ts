import 'iconify-icon'
// The import order should start from nested custom element so that parent component
// can recognize it during creation(invoking constructor), otherwise nested custom element
// will be treated as normal HTMLElement and the setter and getter defined inside custom element
// will not work
// https://stackoverflow.com/a/73870508
import './components/LuffyLogo'
import './components/FontSelect'
import './components/WantedButton'
import './components/IconButton'
import './components/TipsDialog'
import './components/WantedPoster'
import './components/EditPanel'
import './components/OptcGalleryPanel'
import './components/App'
import './style.css'
