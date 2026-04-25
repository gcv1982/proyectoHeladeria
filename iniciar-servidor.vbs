Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "cmd /c cd /d """ & scriptDir & "\backend"" && ""C:\Program Files\nodejs\node.exe"" app.js", 0, False
WScript.Sleep 2500
WshShell.Run "http://localhost:5000", 1, False
