import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "@/assets/css/default.css";
import { I18nextProvider } from "react-i18next";
import i18n from "./plugins/i18n";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { AlertProvider } from "./plugins/global";
import "@/assets/style/_sweetaleart.scss";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </I18nextProvider>
  </Provider>
);

reportWebVitals();
