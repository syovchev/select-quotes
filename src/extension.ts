import * as vscode from 'vscode';
import * as constants from './constants';

enum SearchDirection { FORWARDS, BACKWARDS }

export function activate(context: vscode.ExtensionContext) {
    const findQuotePosition = (direction: SearchDirection, charNumber: number, lineNumber: number, lineContent: string) => 
    {
        const delta: number = direction === SearchDirection.FORWARDS ?  1 : -1;
        
        let quotePosition: vscode.Position = constants.DEFAULT_POSITION;

        while (charNumber > 0 && charNumber < lineContent.length)
        {
            if (constants.isQuote(lineContent[charNumber])) 
            {
                // The following has to be done (setting the charNumber one character backwards), 
                // because otherwise the selection will include the opening quote as well.
                // This is due to "charNumber += delta" (line 27) not being called
                // because of the break statement that follows.
                charNumber += direction === SearchDirection.BACKWARDS ? 1 : 0;

                quotePosition = new vscode.Position(lineNumber, charNumber);

                break;
            }
            
            charNumber += delta;
        }

        return quotePosition;
    };


    const run = (activeSelection: vscode.Selection) => {
        return () => {
            const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

            if (!editor) 
            {
                return;
            }

            const document: vscode.TextDocument = editor.document;

            if (!constants.isActualSelection(editor.selection) || constants.isDefaultSelection(activeSelection)) 
            {
                // This assumes that the selecton was called with Alt+Q as oppossed to double-click
                // since double-click will always return an actual selection, meaning it starts and
                // ends on different columns.
                activeSelection = editor.selection;
            }
            
            let lineNumber  = activeSelection.start.line,
                lineContent = document.lineAt(lineNumber).text,

                startCharNumber = activeSelection.start.character,
                endCharNumber   = activeSelection.end.character;

            const quoteStartPosition: vscode.Position = findQuotePosition(SearchDirection.BACKWARDS, startCharNumber, lineNumber, lineContent),
                  quoteEndPosition  : vscode.Position = findQuotePosition(SearchDirection.FORWARDS,  endCharNumber,   lineNumber, lineContent);


            if (!constants.isDefaultPosition(quoteStartPosition) && !constants.isDefaultPosition(quoteEndPosition)) 
            {
                const newSelection: vscode.Selection = new vscode.Selection(quoteStartPosition, quoteEndPosition);
                
                editor.selection = newSelection;
            }
            else 
            {
                return;
            }
        };
    };

    context.subscriptions.push(vscode.commands.registerCommand(constants.SELECT_QUOTES_COMMAND_ID, run(constants.DEFAULT_SELECTION)));
    
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(e => {
            if (constants.isMouseEvent(e) && constants.isOnlyOneActiveSelection(e)) 
            {
                let activeSelection: vscode.Selection = e.selections[0];

                if (constants.isActualSelection(activeSelection) && constants.isSelectionOnOneLine(activeSelection))
                {
                    run(activeSelection)();
                }
            }
        })
    );
}

export function deactivate() {}
