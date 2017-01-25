#cuda-driver-development 
This extension loads the required environment for choosen module into vscode for building and debugging.

## Features
This extension setups the task, launch, setting and cpp/c properties requried for building and debugging cuda driver on target.


## Requirements

You should have environement variable set before launching code.
- `P4ROOT` : $P4ROOT/sw/pvt/ksj/vscode/... files are read by this extension and also required for build.
- `TOP`    : This is required to setup build.
- `TARGET_IP`: If you need remote debug. If not set this can be changed in .vscode/launch.json file

The following packages needs to be installed on host for debugging
- `gdb-multiarch` : This package can be installed by running command `sudo apt-get install gdb-multiarch`

The following packages needs to be installed on target for debugging
- `gdbserver` : This package can be installed by running command `sudo apt-get install gdbserver`.

## Extension Settings

Run the following commands

- `cuda Init`:  Shows a dropdown list of Environment available to choose from. Choosing any one will set the environment for that.

## Known Issues

* `In developement`

## Release Notes

* `To be filled`

### 1.0.0

Initial release of cuda-driver-development


-----------------------------------------------------------------------------------------------------------

**Enjoy!**
