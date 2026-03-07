import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "ChargeControllerPanel",
      formats: ["iife"],
      fileName: () => "controller-panel.js",
    },
    outDir: "../custom_components/generic_charge_controller/frontend",
    emptyOutDir: false,
    rollupOptions: {
      // No external dependencies – everything is bundled
    },
  },
});
