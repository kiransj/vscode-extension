#cuda-driver-development 
This extension loads the required environment for choosen module into vscode for building and debugging.

## Features
This extension setups the task, launch, setting and cpp/c properties requried for building and debugging cuda driver on target.

## Requirements
You should have following environement variable set before launching code.
- `P4ROOT` : $P4ROOT/sw/pvt/ksj/vscode/... files are read by this extension and also required for build.
- `TOP`    : This is required to setup build.
- `TARGET_IP`: If you need remote debug. If not set this can be changed in .vscode/launch.json file

The following packages needs to be installed on host for debugging
- `gdb-multiarch` : This package can be installed by running command `sudo apt-get install gdb-multiarch`

The following packages needs to be installed on target for debugging
- `gdbserver` : This package can be installed by running command `sudo apt-get install gdbserver`. This may be installed already on the target board.

## Extension Settings
The following cmds are supported

* `<ctrl+shift+p>cuda Init`:  Shows a dropdown list of Environment available to choose from. Choosing any one will set the environment for that. This needs to be done only once in a given repo
    - For building and debugging cuda driver go to folder `cd $TOP/gpu/drv_rel/driver/gppgu/cuda` and then run "`code .`". The list of header file path are provided in c_cpp_properites.json file where paths are relative to cuda folder.
* `<ctrl-p>cuda ` gives the list of build cmds available. 
* keyboard short cuts for building
    - Pressing `shift+ctrl+b` builds the default task. The default task is identified with `isBuildCommand": true` in task.json file in .vscode folder.

## Debugging

* Debugging program through remote gdb
    - On the target board run cmd `gdbserver --multi :12345`
    - In launch.json file 
        - Environement variable TARGET_IP will be read for ip address. If not set the IP address can be hardcoded.
        - Set the path of apps on host and target in the following section `program` and `set remote exec-file`
* Keyboard short cuts for debugging
    - Continue / Pause / Start Debugging F5
    - Step Over F10
    - Step Into F11
    - Step Out Shift+F11
    - Restart Ctrl+Shift+F5
    - Stop Shift+F5        
    - Put breakpoint F9

## Known Issues

* `In developement`

## Release Notes

* `To be filled`

### 1.0.0

Initial release of cuda-driver-development

# Contact 

- ksj@nvidia.com for any queries.

-----------------------------------------------------------------------------------------------------------

**Enjoy!**
