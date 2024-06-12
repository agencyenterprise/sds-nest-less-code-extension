import * as vscode from "vscode";

let originalFontSize: number;

function checkNestedIndentation(document: vscode.TextDocument) {
  const editor = vscode.window.visibleTextEditors.find(
    (e) => e && e.document && e.document.uri === document.uri
  );
  if (!editor) {
    return;
  }

  const defaultMaxTabs = 3;
  const defaultMaxTabsSX = 6;
  const minimalFontSize = 10;
  const config = vscode.workspace.getConfiguration("nestlesscode");
  const defaultConfMaxTabs = config.get<number>("defaultConfMaxTabs");
  const configSxMaxTabs = config.get<number>("configSxMaxTabs");
  const fileExtension = document.fileName.split(".").pop();

  let maxTabs = defaultConfMaxTabs || defaultMaxTabs;
  if (fileExtension === "jsx" || fileExtension === "tsx") {
    maxTabs = configSxMaxTabs || defaultMaxTabsSX;
  }

  const lines = document.getText().split("\n");
  let maxIndentation = 0;
  const spacesSize: number =
    vscode.workspace.getConfiguration("editor").get("tabSize") || 4;

  for (let line of lines) {
    const tabMatch = line.match(/^\t*/) || [];
    const spaceMatch = line.match(/^ */) || [];
    const tabCount = (tabMatch[0] || "").length;
    const spaceCount = (spaceMatch[0] || "").length / spacesSize;
    const indentationCount = Math.max(tabCount, spaceCount);

    if (indentationCount > maxIndentation) {
      maxIndentation = indentationCount;
    }
  }

  if (maxIndentation <= maxTabs) {
    vscode.workspace
      .getConfiguration()
      .update(
        "editor.fontSize",
        originalFontSize,
        vscode.ConfigurationTarget.Global
      );
    return;
  }

  const exceedCount = maxIndentation - maxTabs;
  const newFontSize = Math.max(minimalFontSize, originalFontSize - exceedCount);
  vscode.workspace
    .getConfiguration()
    .update("editor.fontSize", newFontSize, vscode.ConfigurationTarget.Global);
}

function checkAllOpenDocuments() {
  if (vscode.window.visibleTextEditors.length === 0) {
    vscode.workspace
      .getConfiguration()
      .update(
        "editor.fontSize",
        originalFontSize,
        vscode.ConfigurationTarget.Global
      );
  }
}

export function activate(context: vscode.ExtensionContext) {
  originalFontSize =
    vscode.workspace.getConfiguration("editor").get<number>("fontSize") || 14;

  const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    checkNestedIndentation(event.document);
  });

  const disposableActiveEditor = vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor) {
        checkNestedIndentation(editor.document);
      }
    }
  );

  const disposableClose = vscode.workspace.onDidCloseTextDocument(() => {
    checkAllOpenDocuments();
  });

  context.subscriptions.push(
    disposable,
    disposableClose,
    disposableActiveEditor
  );
}

export function deactivate() {
  if (originalFontSize !== undefined) {
    vscode.workspace
      .getConfiguration()
      .update(
        "editor.fontSize",
        originalFontSize,
        vscode.ConfigurationTarget.Global
      );
  }
}
