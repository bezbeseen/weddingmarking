import { renderApp } from "./App.js";

function getPageKey() {
  const bodyKey = document.body.dataset.vertical || document.body.dataset.page;
  if (bodyKey) return bodyKey;

  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return path || "home";
}

const app = document.querySelector("#app");

if (app) {
  app.innerHTML = renderApp(getPageKey());
}
