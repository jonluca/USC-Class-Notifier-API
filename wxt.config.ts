import { resolve } from "node:path";
import { defineConfig } from "wxt";

export default defineConfig({
  imports: false,
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  publicDir: "extension-public",
  alias: {
    "-": resolve("assets"),
  },
  manifest: {
    name: "USC Schedule Helper",
    short_name: "USC Schedule Helper",
    description: "A tool to help you find classes at USC",
    homepage_url: "https://usc.jonlu.ca",
    permissions: ["storage"],
    icons: {
      16: "/icon.png",
      32: "/icon.png",
      48: "/icon.png",
      128: "/icon.png",
    },
  },
});
