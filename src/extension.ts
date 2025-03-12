// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import { JSONPath } from 'jsonpath-plus';
import * as path from 'path';
import * as vscode from 'vscode';

let _panel: vscode.WebviewPanel | undefined = undefined;
let _jsonPath: string = '$';
let _activeDocument: vscode.TextDocument | undefined = undefined;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


  context.subscriptions.push(vscode.commands.registerCommand('jsonpatheditor.open', () => {
    _activeDocument = getActiveJsonDocument(vscode.window.activeTextEditor);
    if (_activeDocument) {
      _panel = setupPanel(context);
      updateJsonResult(_jsonPath);
    } else {
      vscode.window.showErrorMessage('Please open a valid JSON file.');
    }

  }));
  setupEventHandlers();
}

export function getActiveJsonDocument(editor: vscode.TextEditor | undefined): vscode.TextDocument | undefined {

  if (editor) {
    console.log('Active file:', editor.document.fileName);
    const document = editor.document;
    return document.languageId === 'json' ? document : undefined;
  }
  console.log('No active file');
  return undefined;
}

export function setupPanel(context: vscode.ExtensionContext) {
  console.log('Setting up panel');
  var panel = vscode.window.createWebviewPanel(
    'jsonPathPreview',
    'JsonPath Preview',
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
    }
  );
  panel.webview.html = getWebviewContent(context);
  panel.webview.onDidReceiveMessage(
    message => {
      console.log('Received message from webview:', message);
      updateJsonResult(message.jsonPath);
    },
    undefined,
    context.subscriptions
  );
  return panel;

}

export function updateJsonResult(jsonPath: string) {
  console.log('Updating JSON result');
  if (_activeDocument) {
    const fileContent = _activeDocument.getText();
    const jsonData = JSON.parse(fileContent);
    if (jsonPath === '') {
      _jsonPath = '$';
    } else {
      _jsonPath = jsonPath;
    }

    const result = JSONPath({ path: _jsonPath, json: jsonData, wrap: false });

    if (result === undefined || result.length === 0) {
      console.log('Invalid JsonPath or no matching results');
      postWebviewMessage({ fileName: _activeDocument.fileName, error: 'Invalid JsonPath or no matching results' });

    } else {
      console.log('JsonPath result:', result);
      postWebviewMessage({ fileName: _activeDocument.fileName, json: result });
    }
  } else {
    console.log('Please open a valid JSON file');
    postWebviewMessage({ error: 'Please open a valid JSON file.' });
  }
}

export function postWebviewMessage(message: any) {
  if (_panel) {
    _panel.webview.postMessage(message);
  }
}

export function setupEventHandlers() {
  // Handle active text editor change
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor) {
      console.log('A  file was activated');
      _activeDocument = getActiveJsonDocument(editor);
      updateJsonResult(_jsonPath);
    }
  });

  // Handle text document change
  vscode.workspace.onDidChangeTextDocument((event) => {
    console.log('A  file was changed');
    updateJsonResult(_jsonPath);
  });

  // Handle text document save
  vscode.workspace.onDidSaveTextDocument((document) => {

    console.log('A  file was saved');
    updateJsonResult(_jsonPath);
    // Perform actions when the JSON file is saved

  });
}

export function getWebviewContent(context: vscode.ExtensionContext) {
  // open view.html file
  const htmlPath = path.join(context.extensionPath, 'media/webview.html');
  return fs.readFileSync(htmlPath, 'utf8');
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (_panel) {
    _panel.dispose();
  }
}
