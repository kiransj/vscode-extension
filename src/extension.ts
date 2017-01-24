'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';

var statusBarText = window.createStatusBarItem(StatusBarAlignment.Left);
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "cuda-driver-development" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.EmbInit', () => {
        Embedded_Linux_Init();        
    });

    context.subscriptions.push(disposable);
}

function Embedded_Linux_Init()  {

    if (!process.env.P4ROOT) {        
        vscode.window.showErrorMessage('P4ROOT environement variable not found');
        return;
    }

    if (!process.env.TOP) {
        vscode.window.showErrorMessage('TOP environement variable not found');
        return;
    }

    const sourceVscodeFolder = path.join(process.env.P4ROOT, "sw", "pvt", "ksj", "vscode");
    if(!fs.existsSync(sourceVscodeFolder)) {
        vscode.window.showErrorMessage("P4 path $P4ROOT/sw/pvt/ksj/vscode not synced");
        return;
    }

    console.log("P4ROOT=" + process.env.P4ROOT + " TOP=" + process.env.TOP);

    // Get the path of .vscode folder
    const vscodePath = path.join(vscode.workspace.rootPath, ".vscode");
    // If the .vscode folder does not exist then 
    // lets create it.
    if(!fs.existsSync(vscodePath)) {
        fs.mkdirSync(vscodePath);
    }

    // Get the path of the task file
    const taskFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'tasks.json');
    const sourceTaskFile = path.join(sourceVscodeFolder, "tasks.json");
    fs.writeFileSync(taskFilePath, fs.readFileSync(sourceTaskFile));

    const LaunchFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'launch.json');
    const sourceLaunchFile = path.join(sourceVscodeFolder, "launch.json");
    fs.writeFileSync(LaunchFilePath, fs.readFileSync(sourceLaunchFile));

    const cppPropertiesFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'c_cpp_properties.json');
    const cppPropertiesLaunchFile = path.join(sourceVscodeFolder, "c_cpp_properties.json");
    fs.writeFileSync(cppPropertiesFilePath, fs.readFileSync(cppPropertiesLaunchFile));

    const settingsFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'settings.json');
    const settingsLaunchFile = path.join(sourceVscodeFolder, "settings.json");
    fs.writeFileSync(settingsFilePath, fs.readFileSync(settingsLaunchFile));

    // Display a message box to the user
    vscode.window.showInformationMessage('Embedded Linux init!');

    // Indicate in the status bar what are we building.
    statusBarText.text = "Embedded_Linux";
    statusBarText.show();
    statusBarText.color = "White";
}

// this method is called when your extension is deactivated
export function deactivate() {
}