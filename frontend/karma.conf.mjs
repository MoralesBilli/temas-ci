import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"], // 👈 solo Jasmine, Angular se engancha solo
    plugins: [
      "karma-jasmine",
      "karma-chrome-launcher",
      "karma-coverage",
      "karma-jasmine-html-reporter",
      "karma-spec-reporter"
      // 👈 ya no pongas angularDevkit ni angularBuild
    ],
    client: {
      clearContext: false
    },
    coverageReporter: {
      dir: path.join(__dirname, "coverage/frontend"),
      subdir: ".",
      reporters: [
        { type: "lcov" },        // genera lcov.info
        { type: "html" },
        { type: "text-summary" }
      ]
    },
    reporters: ["progress", "kjhtml"],
    browsers: ["ChromeHeadless"],
    singleRun: false,
    restartOnFileChange: true
  });
}