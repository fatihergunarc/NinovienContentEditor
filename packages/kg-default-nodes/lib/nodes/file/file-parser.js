import {sizeToBytes} from '../../utils/size-byte-converter';

// Önce eski Ghost class formatını dener (`.kg-file-card-title` vb.), bulamazsa
// renderer'ın ürettiği yeni `data-kg-file-card="..."` attribute formatına
// düşer. Renderer Tailwind class'lara modernize edildikten sonra parser geride
// kaldığı için kaydedilen file card'ların başlık/açıklama/dosya adı/boyutu
// import edilirken boş kalıyordu; bu yardımcılar her iki formatı da tanır.
function readByClassOrDataAttr(domNode, className, dataAttrValue) {
    const byClass = domNode.querySelector(`.${className}`);
    if (byClass) {
        return byClass.textContent || '';
    }
    const byData = domNode.querySelector(`[data-kg-file-card="${dataAttrValue}"]`);
    return byData ? (byData.textContent || '') : '';
}

function readFileNameAndSize(domNode) {
    // Eski Ghost format: ayrı kg-file-card-filename ve kg-file-card-filesize
    const oldName = domNode.querySelector('.kg-file-card-filename')?.textContent;
    const oldSize = domNode.querySelector('.kg-file-card-filesize')?.textContent;
    if (oldName || oldSize) {
        return {fileName: oldName || '', fileSizeStr: oldSize || ''};
    }

    // Yeni renderer formatı: tek dataset div'i içinde
    //   <div data-kg-file-card="dataset">document.pdf<span> • 1.2 MB</span></div>
    const dataset = domNode.querySelector('[data-kg-file-card="dataset"]');
    if (!dataset) {
        return {fileName: '', fileSizeStr: ''};
    }
    const sizeSpan = dataset.querySelector('span');
    const fileSizeStr = sizeSpan ? (sizeSpan.textContent || '').replace(/^\s*[••]\s*/, '').trim() : '';
    // fileName: dataset'in span'ları dışındaki text node birleşimi
    let fileName = '';
    dataset.childNodes.forEach((cn) => {
        if (cn.nodeType === 3) { // TEXT_NODE
            fileName += cn.textContent;
        }
    });
    return {fileName: fileName.trim(), fileSizeStr};
}

export function parseFileNode(FileNode) {
    return {
        div: (nodeElem) => {
            const isKgFileCard = nodeElem.classList?.contains('kg-file-card');
            if (nodeElem.tagName === 'DIV' && isKgFileCard) {
                return {
                    conversion(domNode) {
                        const link = domNode.querySelector('a');
                        const src = link?.getAttribute('href') || '';
                        const fileTitle = readByClassOrDataAttr(domNode, 'kg-file-card-title', 'fileTitle');
                        const fileCaption = readByClassOrDataAttr(domNode, 'kg-file-card-caption', 'fileDescription');
                        const {fileName, fileSizeStr} = readFileNameAndSize(domNode);
                        const payload = {
                            src,
                            fileTitle,
                            fileCaption,
                            fileName,
                            fileSize: sizeToBytes(fileSizeStr)
                        };

                        const node = new FileNode(payload);
                        return {node};
                    },
                    priority: 1
                };
            }
            return null;
        }
    };
}
