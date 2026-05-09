import { ref } from 'vue'

// Module-scoped: SprigChatPanel writes its own visibility here when mounted on
// the homepage; the floating ChatWidget reads it to decide whether to render
// the bottom-right Navigator button. Defaults to false so the Navigator shows
// on every page that doesn't render the inline panel.
const sprigPanelInView = ref(false)

export const useSprigPanelVisibility = () => sprigPanelInView
