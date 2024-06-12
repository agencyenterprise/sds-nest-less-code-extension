import * as vscode from "vscode";

let originalFontSize: number;
let activeDecorations: vscode.TextEditorDecorationType[] = [];

function applyOpacityDecoration(
  minOpacity: number,
  editor: vscode.TextEditor,
  ranges: vscode.DecorationOptions[]
) {
  const opacityDecorationType = vscode.window.createTextEditorDecorationType({
    opacity: minOpacity.toString(),
  });
  activeDecorations.push(opacityDecorationType);
  editor.setDecorations(opacityDecorationType, ranges);
}

function clearDecorations() {
  activeDecorations.forEach((decoration) => decoration.dispose());
  activeDecorations = [];
}

function calculateOpacity(
  indentationCount: number,
  maxTabs: number,
  minOpacity: number,
  index: number,
  line: string,
  ranges: vscode.DecorationOptions[]
) {
  const exceedCount = indentationCount - maxTabs;
  const opacity = Math.max(0.1, 1 - exceedCount * 0.1).toFixed(1);
  if (Number(opacity) < minOpacity) {
    minOpacity = Number(opacity);
  }
  const range = new vscode.Range(
    new vscode.Position(index, 0),
    new vscode.Position(index, line.length)
  );

  ranges.push({ range });
  return minOpacity;
}

function checkNestedIndentation(document: vscode.TextDocument) {
  const editor = vscode.window.visibleTextEditors.find(
    (e) => e && e.document && e.document.uri === document.uri
  );
  if (!editor) {
    return;
  }
  clearDecorations();

  const defaultMaxTabs = 3;
  const defaultMaxTabsSX = 6;
  const minimalFontSize = 10;
  const config = vscode.workspace.getConfiguration("nestlesscode");
  const defaultConfMaxTabs = config.get<number>("defaultConfMaxTabs");
  const configSxMaxTabs = config.get<number>("configSxMaxTabs");
  const fileExtension = document.fileName.split(".").pop();
  const ranges: vscode.DecorationOptions[] = [];

  let maxTabs = defaultConfMaxTabs || defaultMaxTabs;
  if (fileExtension === "jsx" || fileExtension === "tsx") {
    maxTabs = configSxMaxTabs || defaultMaxTabsSX;
  }

  const lines = document.getText().split("\n");
  let maxIndentation = 0;
  let minOpacity = 1;
  const spacesSize: number =
    vscode.workspace.getConfiguration("editor").get("tabSize") || 4;

  for (let [index, line] of lines.entries()) {
    const tabMatch = line.match(/^\t*/) || [];
    const spaceMatch = line.match(/^ */) || [];
    const tabCount = (tabMatch[0] || "").length;
    const spaceCount = (spaceMatch[0] || "").length / spacesSize;
    const indentationCount = Math.max(tabCount, spaceCount);

    if (indentationCount > maxIndentation) {
      maxIndentation = indentationCount;
    }
    if (indentationCount > maxTabs) {
      minOpacity = calculateOpacity(
        indentationCount,
        maxTabs,
        minOpacity,
        index,
        line,
        ranges
      );
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

  applyOpacityDecoration(minOpacity, editor, ranges);
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
