import KoenigEditor from './KoenigEditor';
import React, {useState, useEffect} from 'react';
import {$getRoot, $isDecoratorNode} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

// Plugin to control editable state
function EditablePlugin({editable}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.setEditable(editable);
    }, [editor, editable]);

    return null;
}

function ExtendedKoenigEditor({editable = true}) {
    const skipFocusEditor = React.useRef(false);

    const [editorAPI, setEditorAPI] = useState(null);
    const containerRef = React.useRef(null);

    // mousedown can select a node which can deselect another node meaning the
    // mouseup/click event can occur outside of the initially clicked node, in
    // which case we don't want to then "re-focus" the editor and cause unexpected
    // selection changes
    function maybeSkipFocusEditor(event) {
        const clickedOnDecorator = (event.target.closest('[data-lexical-decorator]') !== null) || event.target.hasAttribute('data-lexical-decorator');
        const clickedOnSlashMenu = (event.target.closest('[data-kg-slash-menu]') !== null) || event.target.hasAttribute('data-kg-slash-menu');
        const clickedOnPortal = (event.target.closest('[data-kg-portal]') !== null) || event.target.hasAttribute('data-kg-portal');

        if (clickedOnDecorator || clickedOnSlashMenu || clickedOnPortal) {
            skipFocusEditor.current = true;
        }
    }

    function focusEditor(event) {
        const clickedOnDecorator = (event.target.closest('[data-lexical-decorator]') !== null) || event.target.hasAttribute('data-lexical-decorator');
        const clickedOnSlashMenu = (event.target.closest('[data-kg-slash-menu]') !== null) || event.target.hasAttribute('data-kg-slash-menu');
        const clickedOnPortal = (event.target.closest('[data-kg-portal]') !== null) || event.target.hasAttribute('data-kg-portal');

        if (!skipFocusEditor.current && editorAPI && !clickedOnDecorator && !clickedOnSlashMenu && !clickedOnPortal) {
            let editor = editorAPI.editorInstance;

            // if a mousedown and subsequent mouseup occurs below the editor
            // canvas, focus the editor and put the cursor at the end of the document
            let {bottom} = editor._rootElement.getBoundingClientRect();
            if (event.pageY > bottom && event.clientY > bottom) {
                event.preventDefault();

                // we should always have a visible cursor when focusing
                // at the bottom so create an empty paragraph if last
                // section is a card
                let addLastParagraph = false;

                editor.getEditorState().read(() => {
                    const nodes = $getRoot().getChildren();
                    const lastNode = nodes[nodes.length - 1];

                    if (lastNode && $isDecoratorNode(lastNode)) {
                        addLastParagraph = true;
                    }
                });

                if (addLastParagraph) {
                    editorAPI.insertParagraphAtBottom();
                }

                // Focus the editor
                editorAPI.focusEditor({position: 'bottom'});

                //scroll to the bottom of the container
                containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
        }

        skipFocusEditor.current = false;
    }

    React.useEffect(() => {
        const handleFileDrag = (event) => {
            event.preventDefault();
        };

        const handleFileDrop = (event) => {
            if (event.dataTransfer.files.length > 0) {
                event.preventDefault();
                editorAPI?.insertFiles(Array.from(event.dataTransfer.files));
            }
        };

        window.addEventListener('dragover', handleFileDrag);
        window.addEventListener('drop', handleFileDrop);

        return () => {
            window.removeEventListener('dragover', handleFileDrag);
            window.removeEventListener('drop', handleFileDrop);
        };
    }, [editorAPI]);

    return (
        <div className="koenig-demo relative h-full grow">
            <div ref={containerRef} className="h-full overflow-auto overflow-x-hidden" onClick={focusEditor} onMouseDown={maybeSkipFocusEditor}>
                <div className="mx-auto max-w-[740px] px-6 py-[15vmin] lg:px-0">
                    <KoenigEditor
                        cursorDidExitAtTop={false}
                        darkMode={false}
                        registerAPI={setEditorAPI}
                    >
                        <EditablePlugin editable={editable} />
                    </KoenigEditor>
                </div>
            </div>
        </div>
    );
}

export const MemoizedExtendedKoenigEditor = React.memo(ExtendedKoenigEditor);

