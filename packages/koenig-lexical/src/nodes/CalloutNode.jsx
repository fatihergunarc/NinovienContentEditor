import CalloutCardIcon from '../assets/icons/kg-card-type-callout.svg?react';
import KoenigCardWrapper from '../components/KoenigCardWrapper';
import MINIMAL_NODES from './MinimalNodes';
import React from 'react';
import cleanBasicHtml from '@fatih_ergun/kg-clean-basic-html';
import {$generateHtmlFromNodes} from '@lexical/html';
import {CalloutNode as BaseCalloutNode} from '@fatih_ergun/kg-default-nodes';
import {CalloutNodeComponent} from './CalloutNodeComponent';
import {createCommand} from 'lexical';
import {populateNestedEditor, setupNestedEditor} from '../utils/nested-editors';

export const INSERT_CALLOUT_COMMAND = createCommand();

export class CalloutNode extends BaseCalloutNode {
    __calloutTextEditor;
    __calloutTextEditorInitialState;

    static kgMenu = [{
        label: 'Callout',
        desc: 'Info boxes that stand out',
        Icon: CalloutCardIcon,
        insertCommand: INSERT_CALLOUT_COMMAND,
        matches: ['callout'],
        priority: 3,
        shortcut: '/callout'
    }];

    getIcon() {
        return CalloutCardIcon;
    }

    constructor(dataset = {}, key) {
        super(dataset, key);

        // Customization (Ninovien): emoji feature removed. Force empty so importDOM/imported
        // mobiledoc with calloutEmoji set is normalized away, and renderer skips emoji div.
        this.__calloutEmoji = '';

        // set up nested editor instances
        setupNestedEditor(this, '__calloutTextEditor', {editor: dataset.calloutTextEditor, nodes: MINIMAL_NODES});

        // populate nested editors on initial construction
        if (!dataset.calloutTextEditor && dataset.calloutText) {
            populateNestedEditor(this, '__calloutTextEditor', `${dataset.calloutText}`); // we serialize with no wrapper
        }
    }

    exportJSON() {
        const json = super.exportJSON();

        // convert nested editor instance back into HTML because `text` may not
        // be automatically updated when the nested editor changes
        if (this.__calloutTextEditor) {
            this.__calloutTextEditor.getEditorState().read(() => {
                const html = $generateHtmlFromNodes(this.__calloutTextEditor, null);
                const cleanedHtml = cleanBasicHtml(html, {allowBr: true});
                json.calloutText = cleanedHtml;
            });
        }

        return json;
    }

    getDataset() {
        const dataset = super.getDataset();

        // client-side only data properties such as nested editors
        const self = this.getLatest();
        dataset.calloutTextEditor = self.__calloutTextEditor;
        dataset.calloutTextEditorInitialState = self.__calloutTextEditorInitialState;

        return dataset;
    }

    decorate() {
        return (
            <KoenigCardWrapper nodeKey={this.getKey()}>
                <CalloutNodeComponent
                    backgroundColor={this.backgroundColor}
                    nodeKey={this.getKey()}
                    textEditor={this.__calloutTextEditor}
                    textEditorInitialState={this.__calloutTextEditorInitialState}
                />
            </KoenigCardWrapper>
        );
    }
}

export const $createCalloutNode = (dataset) => {
    return new CalloutNode(dataset);
};

export function $isCalloutNode(node) {
    return node instanceof CalloutNode;
}
