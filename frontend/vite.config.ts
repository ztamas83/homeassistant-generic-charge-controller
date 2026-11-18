import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";

// Build id shown in the panel toolbar: short git sha, "-dirty" with local
// changes, plus the build time, so a deploy can be verified in the browser
const git = (cmd: string) => {
  try {
    return execSync(`git ${cmd}`, { cwd: __dirname }).toString().trim();
  } catch {
    return "";
  }
};
const sha = git("rev-parse --short HEAD") || "unknown";
const dirty = git("status --porcelain") ? "-dirty" : "";
const buildId = `${sha}${dirty} ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;

// Third-party license notices are kept at the top of the built bundle
const notices = readFileSync(resolve(__dirname, "../THIRD_PARTY_NOTICES"), "utf8");

export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },
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
