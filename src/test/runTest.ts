import * as path from "path";
import { runTests, downloadAndUnzipVSCode } from "vscode-test";

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionTestsPath = path.resolve(__dirname, "./suite");

    const vscodeExecutablePath = await downloadAndUnzipVSCode("stable");

    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      // launchArgs: ["--disable-extensions"],
    });
  } catch (err) {
    console.error("Failed to run tests", err);
    process.exit(1);
  }
}

main();
