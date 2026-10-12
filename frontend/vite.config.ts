import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";

// Third-party license notices are kept at the top of the built bundle
const notices = readFileSync(resolve(__dirname, "../THIRD_PARTY_NOTICES"), "utf8");

export default defineConfig({
  plugins: [
    {
      // Added after minification, which would remove a Rollup banner
      name: "third-party-notices",
      generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === "chunk") chunk.code = `/*\n${notices}*/\n${chunk.code}`;
        }
      },
    },
  ],
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
