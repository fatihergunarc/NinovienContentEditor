import CardContext from '../context/CardContext';
import KoenigComposerContext from '../context/KoenigComposerContext.jsx';
import React from 'react';
import {$getNodeByKey} from 'lexical';
import {ActionToolbar} from '../components/ui/ActionToolbar.jsx';
import {CalloutCard} from '../components/ui/cards/CalloutCard';
import {EDIT_CARD_COMMAND} from '../plugins/KoenigBehaviourPlugin';
import {SnippetActionToolbar} from '../components/ui/SnippetActionToolbar.jsx';
import {ToolbarMenu, ToolbarMenuItem, ToolbarMenuSeparator} from '../components/ui/ToolbarMenu.jsx';
import {sanitizeHtml} from '../utils/sanitize-html';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export function CalloutNodeComponent({nodeKey, textEditor, textEditorInitialState, backgroundColor}) {
    const [editor] = useLexicalComposerContext();

    const {isSelected, isEditing} = React.useContext(CardContext);
    const {cardConfig} = React.useContext(KoenigComposerContext);
    const [showSnippetToolbar, setShowSnippetToolbar] = React.useState(false);

    const handleColorChange = (color) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            node.backgroundColor = color;
        });
    };

    const handleToolbarEdit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        editor.dispatchCommand(EDIT_CARD_COMMAND, {cardKey: nodeKey, focusEditor: false});
    };

    React.useEffect(() => {
        textEditor.setEditable(isEditing);
    }, [isEditing, textEditor]);

    return (
        <>
            <CalloutCard
                color={backgroundColor}
                handleColorChange={handleColorChange}
                isEditing={isEditing}
                nodeKey={nodeKey}
                sanitizeHtml={sanitizeHtml}
                textEditor={textEditor}
                textEditorInitialState={textEditorInitialState}
            />
            <ActionToolbar
                data-kg-card-toolbar="callout"
                isVisible={showSnippetToolbar}
            >
                <SnippetActionToolbar onClose={() => setShowSnippetToolbar(false)} />
            </ActionToolbar>

            <ActionToolbar
                data-kg-card-toolbar="callout"
                isVisible={isSelected && !isEditing && !showSnippetToolbar}
            >
                <ToolbarMenu>
                    <ToolbarMenuItem dataTestId="edit-callout-card" icon="edit" isActive={false} label="Edit" onClick={handleToolbarEdit} />
                    <ToolbarMenuSeparator hide={!cardConfig.createSnippet} />
                    <ToolbarMenuItem
                        dataTestId="create-snippet"
                        hide={!cardConfig.createSnippet}
                        icon="snippet"
                        isActive={false}
                        label="Save as snippet"
                        onClick={() => setShowSnippetToolbar(true)}
                    />
                </ToolbarMenu>
            </ActionToolbar>
        </>
    );
}
