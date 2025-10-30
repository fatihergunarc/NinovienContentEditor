import {addCreateDocumentOption} from '../../utils/add-create-document-option';
import {renderEmptyContainer} from '../../utils/render-empty-container';
import {escapeHtml} from '../../utils/escape-html';
import {bytesToSize} from '../../utils/size-byte-converter';

export function renderFileNode(node, options = {}) {
    addCreateDocumentOption(options);
    const document = options.createDocument();

    if (!node.src || node.src.trim() === '') {
        return renderEmptyContainer(document);
    }

    if (options.target === 'email') {
        return emailTemplate(node, document, options);
    } else {
        return cardTemplate(node, document);
    }
}

function emailTemplate(node, document, options) {
    let iconCls;
    if (!node.fileTitle && !node.fileCaption) {
        iconCls = 'margin-top: 6px; height: 20px; width: 20px; max-width: 20px; padding-top: 4px; padding-bottom: 4px;';
    } else {
        iconCls = 'margin-top: 6px; height: 24px; width: 24px; max-width: 24px;';
    }

    const html = (`
        <table cellspacing="0" cellpadding="4" border="0" class="kg-file-card" width="100%">
            <tr>
                <td>
                    <table cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td valign="middle" style="vertical-align: middle;">
                                ${node.fileTitle ? `
                                <table cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td>
                                    <a href="${escapeHtml(options.postUrl)}" class="kg-file-title">${escapeHtml(node.fileTitle)}</a>
                                </td></tr></table>
                                ` : ``}
                                ${node.fileCaption ? `
                                <table cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td>
                                    <a href="${escapeHtml(options.postUrl)}" class="kg-file-description">${escapeHtml(node.fileCaption)}</a>
                                </td></tr></table>
                                ` : ``}
                                <table cellspacing="0" cellpadding="0" border="0" width="100%"><tr><td>
                                    <a href="${escapeHtml(options.postUrl)}" class="kg-file-meta"><span class="kg-file-name">${escapeHtml(node.fileName)}</span> &bull; ${bytesToSize(node.fileSize)}</a>
                                </td></tr></table>
                            </td>
                            <td width="80" valign="middle" class="kg-file-thumbnail">
                                <a href="${escapeHtml(options.postUrl)}" style="display: block; top: 0; right: 0; bottom: 0; left: 0;">
                                    <img src="https://static.ghost.org/v4.0.0/images/download-icon-darkmode.png" style="${escapeHtml(iconCls)}">
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `);

    const container = document.createElement('div');
    container.innerHTML = html.trim();

    return {element: container.firstElementChild};
}

function cardTemplate(node, document) {
    const card = document.createElement('div');
    card.setAttribute('class', 'kg-card kg-file-card');

    const container = document.createElement('a');
    container.setAttribute('class', 'kg-file-card-container');
    container.setAttribute('href', node.src);
    container.setAttribute('title', 'Download');
    container.setAttribute('download', '');

    // Outer wrapper
    const wrapper = document.createElement('div');
    
    // Main flex container matching the editor design
    const flexContainer = document.createElement('div');
    flexContainer.setAttribute('class', 'flex justify-between rounded-md border border-grey/30 p-2');
    
    // Left side content container
    const hasContent = node.fileTitle || node.fileCaption;
    const contentContainer = document.createElement('div');
    contentContainer.setAttribute('class', `flex w-full flex-col px-2 font-sans ${hasContent ? 'justify-between' : 'justify-center'}`);
    
    // Title and description wrapper
    if (hasContent) {
        const textWrapper = document.createElement('div');
        textWrapper.setAttribute('class', 'flex flex-col');
        
        if (node.fileTitle) {
            const title = document.createElement('div');
            title.setAttribute('class', 'h-[30px] bg-transparent text-lg font-bold leading-none tracking-tight text-black dark:text-grey-200');
            title.setAttribute('data-kg-file-card', 'fileTitle');
            title.textContent = node.fileTitle;
            textWrapper.appendChild(title);
        }
        
        if (node.fileCaption) {
            const caption = document.createElement('div');
            caption.setAttribute('class', 'h-[26px] bg-transparent pb-1 text-[1.6rem] font-normal leading-none text-grey-700 dark:text-grey-300');
            caption.setAttribute('data-kg-file-card', 'fileDescription');
            caption.textContent = node.fileCaption;
            textWrapper.appendChild(caption);
        }
        
        contentContainer.appendChild(textWrapper);
    }
    
    // File metadata (name and size)
    const metadata = document.createElement('div');
    metadata.setAttribute('class', '!mt-0 py-1 text-sm font-medium text-grey-900 dark:text-grey-200');
    metadata.setAttribute('data-kg-file-card', 'dataset');
    
    const fileName = document.createTextNode(node.fileName || '');
    metadata.appendChild(fileName);
    
    const sizeSpan = document.createElement('span');
    sizeSpan.setAttribute('class', 'text-grey-700');
    sizeSpan.textContent = ` • ${node.formattedFileSize || ''}`;
    metadata.appendChild(sizeSpan);
    
    contentContainer.appendChild(metadata);
    flexContainer.appendChild(contentContainer);
    
    // Right side icon container with dynamic height
    const iconContainer = document.createElement('div');
    const bothTitleAndCaption = node.fileTitle && node.fileCaption;
    const iconHeight = bothTitleAndCaption ? 'h-[96px]' : hasContent ? 'h-[64px]' : 'h-[40px]';
    const iconSize = hasContent ? 'size-6' : 'size-5';
    iconContainer.setAttribute('class', `!mt-0 flex w-full max-w-[96px] items-center justify-center rounded-md bg-grey-200 dark:bg-grey-900 ${iconHeight}`);
    
    // SVG icon
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', `text-green transition-all duration-75 ease-in ${iconSize}`);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = '.a{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px}';
    defs.appendChild(style);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'a');
    path.setAttribute('d', 'M8.25 14.25 12 18l3.75-3.75M12 6.75V18');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'a');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '12');
    circle.setAttribute('r', '11.25');

    svg.appendChild(defs);
    svg.appendChild(path);
    svg.appendChild(circle);

    iconContainer.appendChild(svg);
    flexContainer.appendChild(iconContainer);
    
    wrapper.appendChild(flexContainer);
    container.appendChild(wrapper);
    card.appendChild(container);

    return {element: card};
}