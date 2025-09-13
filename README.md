# SWE4103-Project

# *Docker Installation*  
---
# For Windows:  

#### *Step 1:* Download
---
- Download Docker Desktop for Windows (The download might take some minutes depending on your Internet Speed)


https://docs.docker.com/desktop/setup/install/windows-install/
*(x86_64)

#### *Step 2:* Verify if WSL is on your Windows Machine
---
- On the Command Line / Powershell, run
`wsl –-version` 
to verify if wsl is installed.
![alt text](https://github.com/h0nt3d/SWE4103-Project/blob/docker_setup/images/wsl.png?raw=true)
- If not installed:
Run:
`wsl –-install`

#### *Step 3:* Turn on WSL tool feature
---
- On the Command Line / Powershell, run
`wsl –-version` 
to verify if wsl is installed.

- Use the search bar to find:
`Turn Windows features on or off`

- Click on the checkbox to ensure that Windows Subsystem for Linux is enabled
![alt text](https://github.com/h0nt3d/SWE4103-Project/blob/docker_setup/images/features.png?raw=true)

- Click OK
- Click on Don’t restart (if asked)

#### *Step 4:* Ensure Virtualization is enabled
---
- In your Task manager, click on the Performance on the right margin of the window.
- Check if Virtualization is enabled.

#### *Note: If not enabled try checking online on how to enable virtualization on your system. (The method varies for almost every machine but most times it will involve tweaking settings in your BIOS*

#### *Step 5:* Installation
---
- Double Click “Docker Desktop Installer.exe”
- Click on Yes
- Optional: Add Shortcut
- Wait for files to unpack
- Restart your System

#### *Step 6:* Docker Desktop Setup
- Start Docker Desktop
- Click on Accept for the Service Agreement
- Click on Skip for login
- If done correctly, you should now be able to see the window showing your containers, images and volumes.

# For Mac:  

#### *Step 1:* Download
----
 - Download Docker.dmg for Mac (The download might take some minutes depending on your Internet Speed)
https://www.docker.com/

#### *Note: For Older version of Macs, download from Intel. For the Macbook M1 or M2, download from Apple*

#### *Step 2:* 
----
 - Double click the .dmg file to open up the installer

#### *Step 3:* 
----
 - Launch Docker from Applications

#### *Step 4:* Docker Desktop Setup
----
 - Start Docker Desktop
- Click on Accept for the Service Agreement
- Click on Skip for login
- If done correctly, you should now be able to see the window showing your containers, images and volumes.
