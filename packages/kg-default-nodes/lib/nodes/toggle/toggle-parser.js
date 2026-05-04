export function parseToggleNode(ToggleNode) {
    return {
        div: (nodeElem) => {
            const isKgToggleCard = nodeElem.classList?.contains('kg-toggle-card');
            if (nodeElem.tagName === 'DIV' && isKgToggleCard) {
                return {
                    conversion(domNode) {
                        const headingNode = domNode.querySelector('.kg-toggle-heading-text');
                        const heading = headingNode.textContent;

                        const contentNode = domNode.querySelector('.kg-toggle-content');
                        // innerHTML (not textContent) so <p>, <ul>/<li>, <strong>, <em>, <a>
                        // structure is preserved when populateNestedEditor → $generateNodesFromDOM
                        // re-parses it. textContent flattens to a single text run, losing formatting.
                        const content = contentNode.innerHTML.trim();

                        const payload = {
                            heading,
                            content
                        };

                        const node = new ToggleNode(payload);
                        return {node};
                    },
                    priority: 1
                };
            }
            return null;
        }
    };
}