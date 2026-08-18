import { renderApp } from "./App.js";
import { mountBuilder } from "./builder/gui.js";

function getPageKey() {
  const bodyKey = document.body.dataset.vertical || document.body.dataset.page;
  if (bodyKey) return bodyKey;

  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return path || "home";
}

const app = document.querySelector("#app");
const pageKey = getPageKey();

if (app) {
  if (pageKey === "builder") {
    mountBuilder(app);
  } else {
    app.innerHTML = renderApp(pageKey);
  }
}
