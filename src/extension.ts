'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument } from 'vscode';
import { deserialize } from "serializer.ts/Serializer";

var statusBarText = window.createStatusBarItem(StatusBarAlignment.Left);
const cudaSettingsPath = path.join(vscode.workspace.rootPath, ".vscode", "cuda.json");


// This function gets called when vscode starts up
export function activate(context: vscode.ExtensionContext) {

    // log to console the extension is getting initialized
    console.log('Congratulations, your extension "cuda-driver-development" is now active!');

    // Register the commands
    vscode.commands.registerCommand('extension.cudaInit', () => { cudaInit(); });
    vscode.commands.registerCommand('extension.cudaSetDebug', () => { cudaSetBuildType("debug"); });
    vscode.commands.registerCommand('extension.cudaSetRelease', () => { cudaSetBuildType("release"); });
    vscode.commands.registerCommand('extension.cudaSetInternal', () => { cudaSetBuildConf("internal"); });
    vscode.commands.registerCommand('extension.cudaSetExternal', () => { cudaSetBuildConf("external"); });

    try {
        var stats= fs.statSync(cudaSettingsPath);        
        var settings = new cudaSettings();
        settings.loadSettings(cudaSettingsPath);
        SetStatusBarInfo(settings);
        // Check for the env variables
        if (!process.env.P4ROOT || !process.env.TOP) {
            vscode.window.showErrorMessage('P4ROOT or TOP environement variable not defined. Some features might not work.');
            return;
        }
    }
    catch(e) {

    }    
}

// this method is called when your extension is deactivated
export function deactivate() {

}

class cudaSettings
{
    TOP: string;
    P4ROOT: string;
    build_conf: string; //internal or external
    build_type: string; //debug or release
    target_product: string; //t186ref, t210ref
    arch: string; //aarch64 or ARMv7
    //embedded-linux, l4t, QNX etc
    build_name: string; 

    cudaSettings()
    {
        
    }

    saveSettings(filename: string)
    {        
        var settingsJson = JSON.stringify(this);
        fs.writeFileSync(filename, settingsJson);
    }

    loadSettings(filename: string)
    {             
        var jsonData = JSON.parse(fs.readFileSync(filename).toString());        
        // Load the obj and return it.
        var obj = deserialize<cudaSettings>(cudaSettings, jsonData);        
        this.TOP = obj.TOP;
        this.P4ROOT = obj.P4ROOT;
        this.build_conf = obj.build_conf;
        this.build_type = obj.build_type;
        this.target_product = obj.target_product;
        this.arch = obj.arch;
        this.build_name = obj.build_name;
    }
}

class Modules {
    description: string;
    name: string;
    c_cpp_properties: string;
    launch: string;
    tasks: string;
    settings: string;
    arch: string;
    target_product: string;
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
    let moduleList = modules.map(function (modules: Modules) { return modules.description });
    console.log("list of modules: " + moduleList.toString());

    // Show a drop down menu of all the modules. The chosen module 
    // will be initialized
    vscode.window.showQuickPick(moduleList).then(val => setEnvironment(modules, val));
}

function loadModules(file: string): Modules[] {
    var jsonData = JSON.parse(fs.readFileSync(file).toString());
    let modules = deserialize<Modules[]>(Modules, jsonData);
    return modules;
}

function setEnvironment(modules: Modules[], moduleName: string) {
    let module = modules.find(x => x.description === moduleName);

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
    
    //vscode.commands.executeCommand("workbench.action.tasks.runTask");

    // Set the default build parameters
    var settings = new cudaSettings();
    settings.arch = module.arch;
    settings.build_conf = "external";
    settings.build_type = "debug";
    settings.P4ROOT = process.env.P4ROOT;
    settings.TOP = process.env.TOP;
    settings.target_product = module.target_product;
    settings.build_name = module.name;

    settings.saveSettings(cudaSettingsPath);

    SetStatusBarInfo(settings);
    return;
}


function cudaSetBuildType(buildType: string) {
    if(!fs.existsSync(cudaSettingsPath)) {
        vscode.window.showErrorMessage("First run 'cuda Init' before setting build type");
        return;
    }
    // Loads the current settings
    var settings = new cudaSettings();
    settings.loadSettings(cudaSettingsPath);

    // Change the settings only if necessary
    if(settings.build_type !== buildType) {
        settings.build_type = buildType;
        settings.saveSettings(cudaSettingsPath);
        SetStatusBarInfo(settings);
    }
}

function cudaSetBuildConf(buildConf: string) {
    if(!fs.existsSync(cudaSettingsPath)) {
        vscode.window.showErrorMessage("First run 'cuda Init' before setting build type");
        return;
    }
    // Loads the current settings
    var settings = new cudaSettings();
    settings.loadSettings(cudaSettingsPath);

    // Change the settings only if necessary
    if(settings.build_conf !== buildConf) {
        settings.build_conf = buildConf;
        settings.saveSettings(cudaSettingsPath);
        SetStatusBarInfo(settings);
    }
}

function SetStatusBarInfo(settings: cudaSettings)
{
    // Indicate in the status bar what are we building.
    statusBarText.text = settings.build_name + "_" + settings.build_conf + "_" + settings.build_type;    
    statusBarText.color = "White";
    statusBarText.command = 'workbench.action.tasks.runTask';
    statusBarText.tooltip = "TOP="+settings.TOP;
    statusBarText.show();
}

function copyFile(destFile: string, sourceFile: string) {
    fs.writeFileSync(destFile, fs.readFileSync(sourceFile));
    return;
}