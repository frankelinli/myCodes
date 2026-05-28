// ==UserScript==
// @name         Algicorp Suite Helpers
// @namespace    https://algicorp.cn/
// @version      0.1.0
// @description  为 Algicorp Suite 页面添加便捷操作
// @match        https://algicorp.cn/suite*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PROCESSED_ATTR = 'data-audit-id-copy-bound';
    const HIGHLIGHT_CLASS = 'tm-audit-id-copy';
    const TOAST_CLASS = 'tm-copy-toast';
    const STYLE_ID = 'tm-audit-id-style';
    const COPY_FIELDS = {
        'audit id': 'Audit ID',
        'deliverable product': 'Deliverable Product',
    };

    injectStyles();
    bindAuditIds();

    const observer = new MutationObserver(() => {
        bindAuditIds();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .${HIGHLIGHT_CLASS} {
                cursor: pointer;
                user-select: text;
                font-size: 18px;
                font-weight: 700;
                color: #ff5a1f;
                text-shadow: 0 0 10px rgba(255, 90, 31, 0.2);
                transition: opacity 0.15s ease, color 0.15s ease;
            }

            .${HIGHLIGHT_CLASS}:hover {
                opacity: 0.85;
                color: #ff2d00;
            }

            .${TOAST_CLASS} {
                position: absolute;
                z-index: 999999;
                padding: 4px 8px;
                border-radius: 999px;
                background: #16a34a;
                color: #fff;
                font-size: 12px;
                line-height: 1.4;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(22, 163, 74, 0.28);
                pointer-events: none;
                opacity: 1;
                transition: opacity 0.45s ease;
            }

            #comments .badge-picture {
                border-radius: 0 !important;
                width: 80px !important;
                height: 80px !important;
                object-fit: cover !important;
            }

            #comments .timeline-badge {
                width: 80px !important;
                height: 80px !important;
                line-height: 80px !important;
                margin-left: -40px !important;
            }
        `;

        document.head.appendChild(style);
    }

    function bindAuditIds() {
        const labels = Array.from(document.querySelectorAll('strong, span, label, div'));

        for (const label of labels) {
            const fieldKey = normalizeText(label.textContent);
            const fieldName = COPY_FIELDS[fieldKey];
            if (!fieldName) {
                continue;
            }

            const target = findValueNode(label);
            if (!target) {
                continue;
            }

            const value = extractCopyValue(target.textContent, fieldKey);
            if (!value || target.getAttribute(PROCESSED_ATTR) === 'true') {
                continue;
            }

            target.setAttribute(PROCESSED_ATTR, 'true');
            target.classList.add(HIGHLIGHT_CLASS);
            target.title = `点击复制 ${fieldName}: ${value}`;
            target.addEventListener('click', async (event) => {
                event.stopPropagation();
                await copyText(value);
                showToast(target, '已复制');
            });
        }
    }

    function findValueNode(label) {
        let node = label.nextSibling;

        while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = (node.textContent || '').trim();
                if (text) {
                    const wrapper = document.createElement('span');
                    wrapper.textContent = text;
                    node.parentNode.insertBefore(wrapper, node);
                    node.remove();
                    return wrapper;
                }
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const text = (node.textContent || '').trim();
                if (text) {
                    return node;
                }
            }

            node = node.nextSibling;
        }

        return label.parentElement || null;
    }

    function normalizeText(text) {
        return (text || '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function extractCopyValue(text, fieldKey) {
        const normalized = (text || '').replace(/\s+/g, ' ').trim();
        const unquoted = normalized.replace(/^["']+|["']+$/g, '').trim();

        if (fieldKey === 'audit id') {
            const matched = unquoted.match(/[A-Za-z0-9-]+/);
            return matched ? matched[0] : '';
        }

        return unquoted;
    }

    async function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'readonly');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
    }

    function showToast(target, message) {
        const existingToast = document.querySelector(`.${TOAST_CLASS}`);
        if (existingToast) {
            existingToast.remove();
        }

        const rect = target.getBoundingClientRect();
        const toast = document.createElement('div');
        toast.className = TOAST_CLASS;
        toast.textContent = message;
        toast.style.top = `${window.scrollY + rect.top - 2}px`;
        toast.style.left = `${window.scrollX + rect.right + 10}px`;
        document.body.appendChild(toast);

        const toastRect = toast.getBoundingClientRect();
        const maxLeft = window.scrollX + window.innerWidth - toastRect.width - 8;
        if (window.scrollX + rect.right + 10 > maxLeft) {
            toast.style.left = `${Math.max(window.scrollX + 8, maxLeft)}px`;
        }

        window.setTimeout(() => {
            toast.style.opacity = '0';
        }, 1200);

        window.setTimeout(() => {
            toast.remove();
        }, 1700);
    }
})();