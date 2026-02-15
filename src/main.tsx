// bring in tools to start react
import { createRoot } from "react-dom/client";
// bring in the main app
import App from "./App.tsx";
// bring in all the colors and styles
import "./index.css";

// find the box to put app in
// then show the app on screen
createRoot(document.getElementById("root")!).render(<App />);
