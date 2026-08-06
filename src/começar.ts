import React from "react";
import ReactDOM from "react-dom/client";
import PainelGraficaCompleto from "./roteador";
import "./estilos.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(PainelGraficaCompleto)
    )
  );
}