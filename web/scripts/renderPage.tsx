import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "../src/App";

export function renderPage(path: string) {
  return renderToString(<StaticRouter location={path}><App /></StaticRouter>);
}
