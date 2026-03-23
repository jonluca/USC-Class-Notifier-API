import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import ContentScriptApp from "@/contents/content";
import ReactDOM from "react-dom/client";
import { createIntegratedUi, defineContentScript } from "#imports";

export default defineContentScript({
  matches: ["*://classes.usc.edu/term/*", "*://webreg.usc.edu/*"],
  allFrames: true,
  main(ctx) {
    const ui = createIntegratedUi(ctx, {
      anchor: "body",
      position: "inline",
      onMount(container) {
        const root = ReactDOM.createRoot(container);
        root.render(<ContentScriptApp />);
        return root;
      },
      onRemove(root) {
        root?.unmount();
      },
    });

    ui.mount();
  },
});
