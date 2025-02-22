import {$generateHtmlFromNodes, $generateNodesFromDOM} from '@lexical/html';
import {$getRoot} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

export const useKoenigEditor = () => {
    const [editor] = useLexicalComposerContext();
  
    const getHtml = () => {
        return new Promise((resolve) => {
            editor.update(() => {
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