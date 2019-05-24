# README

A Visual Studio Code extension which makes selecting strings less stressful.

## Usage

* When the cursor is inside a string (`Alt+Q`) will select the whole string content.

## Requirements

None

## Release Notes

For now I've removed the double-click functionality, since VS Code doesn't support a double-click event, respecitevly a double-click event handler. 
This results in buggy behaviour with the current implementation. Maybe, in the future I'll look more into this, but for now only `Alt+Q` will select string contents.

### 0.0.2

Remove double-click functionality.