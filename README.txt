PLAYGROUND LAB — WINDOWS DESKTOP GAME

You said you have Node.js. This project includes a Windows installer build script.

BUILD THE EXE:
1. Extract this ZIP.
2. Open the extracted PlaygroundLab-Windows folder.
3. Double-click BUILD.bat.
4. Wait while npm downloads Electron and the installer tools.
5. When it says SUCCESS, open the dist folder.
6. Run Playground-Lab-Setup.exe to install the game.

RUN WITHOUT INSTALLING:
Double-click RUN-GAME.bat. The first run downloads the packages, then opens the desktop game window.

REQUIREMENTS:
- Windows 10 or Windows 11, 64-bit
- Node.js with npm
- Internet connection for the first build (npm downloads Electron and packaging dependencies)

The game is an Electron desktop application. HTML/CSS/JavaScript are used internally to draw the game inside its native desktop window; you do not open a browser or use a separate HTML file to play.

CONTROLS:
- Pick an object, click the world to spawn.
- Drag tool: click and drag an object.
- Delete tool: click an object.
- Pin/unpin tool: anchor or release an object.
- Right-click: quick delete.
- Pause, reset, clear, and adjust gravity.
