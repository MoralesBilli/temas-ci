import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import karmaJasmine from "karma-jasmine";
import chromeLauncher from "karma-chrome-launcher";
import karmaCoverage from "karma-coverage";
import jasmineHtmlReporter from "karma-jasmine-html-reporter";
import specReporter from "karma-spec-reporter";

export default function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"], // 👈 usa @angular/build directamente
    plugins: [
      karmaJasmine,
      chromeLauncher,
      karmaCoverage,
      jasmineHtmlReporter,
      specReporter
      // 👈 ya no pongas angularDevkit ni angularBuildKarma
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