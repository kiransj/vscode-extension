'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';
import { deserialize } from "serializer.ts/Serializer";

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
    let disposable = vscode.commands.registerCommand('extension.cudaInit', () => {
        cudaInit();
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}


function cudaInit() {
    // Check for the env variables
    if (!process.env.P4ROOT || !process.env.TOP) {
        vscode.window.showErrorMessage('P4ROOT or TOP environement variable not defined');
        return;
    }
    console.log("P4ROOT=" + process.env.P4ROOT + " TOP=" + process.env.TOP);

    // Get the vscode path from $P4ROOT/sw/pvt/ksj/vscode
    const sourceVscodeFolder = path.join(process.env.P4ROOT, "sw", "pvt", "ksj", "vscode");
    if (!fs.existsSync(sourceVscodeFolder)) {
        vscode.window.showErrorMessage("P4 path $P4ROOT/sw/pvt/ksj/vscode not synced");
        return;
    }

    // Read the modules.json file from p4 path
    const modulesFilePath = path.join(sourceVscodeFolder, "modules.json");
    if (!fs.existsSync(modulesFilePath)) {
        vscode.window.showErrorMessage('modules file not found in ' + modulesFilePath);
        return;
    }
    let modules = loadModules(modulesFilePath);

    // Get the mames of all the modules
    let moduleList = modules.map(function (modules: Modules) { return modules.name });
    console.log("list of modules: " + moduleList.toString());

    // Show a drop down menu of all the modules. The chosen module 
    // will be initialized
    vscode.window.showQuickPick(moduleList).then(val => setEnvironment(modules, val));
}

class Modules {
    name: string;
    c_cpp_properties: string;
    launch: string;
    tasks: string;
    settings: string;
}

function loadModules(file: string): Modules[] {
    var jsonData = JSON.parse(fs.readFileSync(file).toString());
    let modules = deserialize<Modules[]>(Modules, jsonData);

    //let module = modules.find(x => x.name === "Embedded_Linux_Cuda");
    /*for(let module of modules) 
    {
        console.log(">name : " + module.name);
        console.log("c_cpp_properties : " + module.c_cpp_properties);
        console.log("launch : " + module.launch);
        console.log("tasks : " + module.tasks);
        console.log("settings : " + module.settings);
    }*/

    return modules;
}

function copyFile(destFile: string, sourceFile: string) {
    fs.writeFileSync(destFile, fs.readFileSync(sourceFile));
    return;
}

function setEnvironment(modules: Modules[], moduleName: string) {
    let module = modules.find(x => x.name === moduleName);

    // Get the path of .vscode folder in repo and p4 vscode folder
    const sourceVscodeFolder = path.join(process.env.P4ROOT, "sw", "pvt", "ksj", "vscode");
    const vscodePath = path.join(vscode.workspace.rootPath, ".vscode");

    // If the .vscode folder does not exist then  lets create it.
    if(!fs.existsSync(vscodePath)) {
        fs.mkdirSync(vscodePath);
    }

    // Copy the task file from p4 to .vscode
    const taskFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'tasks.json');
    const sourceTaskFile = path.join(sourceVscodeFolder, module.tasks);
    copyFile(taskFilePath, sourceTaskFile); 

    const LaunchFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'launch.json');
    const sourceLaunchFile = path.join(sourceVscodeFolder, module.launch);
    copyFile(LaunchFilePath, sourceLaunchFile);

    const cppPropertiesFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'c_cpp_properties.json');
    const sourcecppPropertiesFile = path.join(sourceVscodeFolder, module.c_cpp_properties);
    copyFile(cppPropertiesFilePath, sourcecppPropertiesFile);

    const settingsFilePath = path.join(vscode.workspace.rootPath, '.vscode', 'settings.json');
    const sourcesettingsFile = path.join(sourceVscodeFolder, module.settings);
    copyFile(settingsFilePath, sourcesettingsFile);

    // Display a message box to the user
    vscode.window.showInformationMessage('Initialzed for ' + module.name);

    // Indicate in the status bar what are we building.
    statusBarText.text = module.name;
    statusBarText.show();
    statusBarText.color = "White";
    statusBarText.command = 'workbench.action.tasks.runTask';
    statusBarText.tooltip = "TOP = " + process.env.TOP;
    //vscode.commands.executeCommand("workbench.action.tasks.runTask");
    return;
}