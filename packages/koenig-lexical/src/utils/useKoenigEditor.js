import cleanBasicHtml from '@fatih_ergun/kg-clean-basic-html';
import {$generateHtmlFromNodes, $generateNodesFromDOM} from '@lexical/html';
import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const useKoenigEditor = () => {
    const [editor] = useLexicalComposerContext();
  
    const getHtml = () => {
        return new Promise((resolve) => {
            editor.update(() => {
                // Cards with a caption (image, gallery, embed, video, bookmark,
                // codeblock) keep their caption in a NESTED editor. node.caption is
                // not auto-synced when that nested editor changes — only exportJSON
                // reads the nested editor. But getHtml exports via exportDOM
                // ($generateHtmlFromNodes), which reads node.caption — so a freshly
                // typed caption would be dropped from the HTML. Sync each captioned
                // node from its nested editor into node.caption before exporting.
                const syncCaptions = (node) => {
                    if (node.__captionEditor) {
                        let captionHtml = '';
                        node.__captionEditor.getEditorState().read(() => {
                            captionHtml = $generateHtmlFromNodes(node.__captionEditor, null);
                        });
                        node.caption = cleanBasicHtml(captionHtml, {firstChildInnerContent: true});
                    }
                    if (typeof node.getChildren === 'function') {
                        node.getChildren().forEach(syncCaptions);
                    }
                };
                $getRoot().getChildren().forEach(syncCaptions);

                const htmlString = $generateHtmlFromNodes(editor, null);
                resolve(htmlString);
            });
        });
    };

    const setHtml = (html) => {
        editor.update(() => {
            // Parse the HTML and generate Lexical nodes
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);

            // Clear the editor and insert the new nodes
            const root = $getRoot();
            root.clear();
            root.append(...nodes);
        });
    };

    return {getHtml, setHtml};
};