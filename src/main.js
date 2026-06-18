import { createApp } from "vue";
import App from "./App.vue";
import "./assets/style.css";
import "flag-icons/css/flag-icons.min.css";
import { initApp } from "./stores/gameStore.js";

initApp().then(() => {
  createApp(App).mount("#app");
});
