import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';


suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('getActiveJsonDocument returns undefined for non-JSON file', () => {
		const mockEditor = {
			document: {
				fileName: 'test.txt',
				languageId: 'plaintext'
			}
		} as unknown as vscode.TextEditor;

		const result = myExtension.getActiveJsonDocument(mockEditor);
		assert.strictEqual(result, undefined);
	});

	test('getActiveJsonDocument returns document for JSON file', () => {
		const mockDocument = {
			fileName: 'test.json',
			languageId: 'json'
		} as unknown as vscode.TextDocument;

		const mockEditor = {
			document: mockDocument
		} as unknown as vscode.TextEditor;

		const result = myExtension.getActiveJsonDocument(mockEditor);
		assert.strictEqual(result, mockDocument);
	});

	test('getActiveJsonDocument returns undefined when no editor is active', () => {
		const result = myExtension.getActiveJsonDocument(undefined);
		assert.strictEqual(result, undefined);
	});

	test('setupPanel creates a webview panel', () => {
		const mockContext = {
			subscriptions: []
		} as unknown as vscode.ExtensionContext;

		const panel = myExtension.setupPanel(mockContext);
		assert.ok(panel);
		assert.strictEqual(panel.title, 'JsonPath Preview');
		assert.strictEqual(panel.viewType, 'jsonPathPreview');
		assert.strictEqual(panel.viewColumn, vscode.ViewColumn.Two);
	});

	test('setupPanel sets webview HTML content', () => {
		const mockContext = {
			subscriptions: [],
			extensionPath: __dirname
		} as unknown as vscode.ExtensionContext;

		const panel = myExtension.setupPanel(mockContext);
		assert.ok(panel.webview.html);
	});

	test('setupPanel registers message listener', () => {
		const mockContext = {
			subscriptions: []
		} as unknown as vscode.ExtensionContext;

		const panel = myExtension.setupPanel(mockContext);
		assert.ok(panel.webview.onDidReceiveMessage);
	});

});


