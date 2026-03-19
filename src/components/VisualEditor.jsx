// VisualEditor 组件 - ContentEditable 可视化编辑器
import React, { useRef, useEffect, useCallback, useImperativeHandle } from 'react';
import { CATEGORY_STYLES } from '../constants/styles';

// ============================================================
// 核心工具函数：纯文本 ↔ DOM 双向转换 & 光标偏移映射
// ============================================================

const PILL_ATTR = 'data-pill-var';
const PILL_REGEX = /(\{\{[^{}\n]+\}\})/g;

/**
 * 将 contenteditable DOM 反序列化为纯文本（含 {{}} 语法）
 */
function domToText(element) {
  if (!element) return '';
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.hasAttribute(PILL_ATTR)) {
        text += node.getAttribute(PILL_ATTR);
      } else if (node.tagName === 'BR') {
        text += '\n';
      } else {
        text += domToText(node);
      }
    }
  }
  return text;
}

/**
 * 获取当前光标在纯文本中的偏移位置
 * 返回 { start, end } 或 null
 */
function getTextOffset(element) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !element) return null;
  
  const range = sel.getRangeAt(0);
  if (!element.contains(range.startContainer) && element !== range.startContainer) return null;

  const calcOffset = (container, offset) => {
    let pos = 0;
    const walk = (node) => {
      if (node === container) {
        if (node.nodeType === Node.TEXT_NODE) {
          pos += offset;
          return true;
        }
        let childIdx = 0;
        for (const child of node.childNodes) {
          if (childIdx === offset) return true;
          if (walk(child)) return true;
          childIdx++;
        }
        return true;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        pos += node.textContent.length;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute(PILL_ATTR)) {
          pos += node.getAttribute(PILL_ATTR).length;
        } else if (node.tagName === 'BR') {
          pos += 1;
        } else {
          for (const child of node.childNodes) {
            if (walk(child)) return true;
          }
        }
      }
      return false;
    };
    walk(element);
    return pos;
  };

  return {
    start: calcOffset(range.startContainer, range.startOffset),
    end: calcOffset(range.endContainer, range.endOffset),
  };
}

/**
 * 将纯文本偏移转为 Range 并设置光标
 */
function setTextOffset(element, start, end) {
  if (!element) return;
  if (end === undefined) end = start;

  const findPosition = (targetOffset) => {
    let pos = 0;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent.length;
        if (pos + len >= targetOffset) {
          return { node, offset: targetOffset - pos };
        }
        pos += len;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute(PILL_ATTR)) {
          const pillLen = node.getAttribute(PILL_ATTR).length;
          if (pos + pillLen >= targetOffset) {
            const parent = node.parentNode;
            const idx = Array.from(parent.childNodes).indexOf(node);
            if (targetOffset <= pos) {
              return { node: parent, offset: idx };
            }
            return { node: parent, offset: idx + 1 };
          }
          pos += pillLen;
        } else if (node.tagName === 'BR') {
          if (pos + 1 >= targetOffset) {
            const parent = node.parentNode;
            const idx = Array.from(parent.childNodes).indexOf(node);
            if (targetOffset <= pos) {
              return { node: parent, offset: idx };
            }
            return { node: parent, offset: idx + 1 };
          }
          pos += 1;
        } else {
          for (const child of node.childNodes) {
            const result = walk(child);
            if (result) return result;
          }
        }
      }
      return null;
    };
    return walk(element) || { node: element, offset: element.childNodes.length };
  };

  const startPos = findPosition(start);
  const endPos = start === end ? startPos : findPosition(end);

  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  sel.removeAllRanges();
  sel.addRange(range);
}

// ============================================================
// 解析工具
// ============================================================

function parseVariableName(varName) {
  const match = varName.match(/^(.+?)(?:_(\d+))?$/);
  if (match) return { baseKey: match[1], groupId: match[2] || null };
  return { baseKey: varName, groupId: null };
}

function parseInlineSyntax(raw) {
  const colonIdx = raw.indexOf(':');
  if (colonIdx === -1) return { varPart: raw.trim(), inlineVal: null };
  return {
    varPart: raw.slice(0, colonIdx).trim(),
    inlineVal: raw.slice(colonIdx + 1).trim(),
  };
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// ContentEditable 核心编辑器
// ============================================================

const ContentEditableEditor = React.forwardRef(({
  value,
  onChange,
  banks,
  categories,
  isDarkMode,
  onInteraction,
  onFocus,
  className,
  style,
}, forwardedRef) => {
  const editableRef = useRef(null);
  const isComposingRef = useRef(false);
  const lastValueRef = useRef(value);
  const suppressSyncRef = useRef(false);

  // 构建 pill 的 HTML 片段
  const buildPillHTML = useCallback((fullMatch, rawInner, banks_, categories_, isDark) => {
    const { varPart } = parseInlineSyntax(rawInner);
    const parsed = parseVariableName(varPart);
    const baseKey = parsed.baseKey;
    const bank = banks_[baseKey] || banks_[varPart];
    const categoryId = bank?.category || 'other';
    const colorKey = categories_[categoryId]?.color || 'slate';
    const catStyle = CATEGORY_STYLES[colorKey];

    const displayText = rawInner;
    const escapedFullMatch = escapeAttr(fullMatch);

    const pillClasses = isDark
      ? `${catStyle.text} rounded-md px-1 py-[1px] mx-[1px] border border-white/[0.08]`
      : `${catStyle.bg} ${catStyle.text} rounded-md px-1 py-[1px] mx-[1px] border ${catStyle.border}`;

    const pillStyle = isDark
      ? `background:rgba(255,255,255,0.06);`
      : ``;

    const bracketStyle = isDark
      ? `opacity:0.3;` 
      : `opacity:0.35;`;

    return `<span ${PILL_ATTR}="${escapedFullMatch}" data-export-pill="true" contenteditable="false" class="${pillClasses}" style="${pillStyle}display:inline;white-space:nowrap;font-size:inherit;line-height:inherit;vertical-align:baseline;cursor:default;"><span style="${bracketStyle}">{{</span>${escapeHTML(displayText)}<span style="${bracketStyle}">}}</span></span>`;
  }, []);

  // 将纯文本渲染为带 pill 的 HTML
  const textToHTML = useCallback((text, banks_, categories_, isDark) => {
    if (!text) return '';
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      if (!line) return lineIdx < lines.length - 1 ? '<br>' : '';
      const parts = line.split(PILL_REGEX);
      const html = parts.map(part => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
          const rawInner = part.slice(2, -2);
          return buildPillHTML(part, rawInner, banks_, categories_, isDark);
        }
        return escapeHTML(part);
      }).join('');
      return html + (lineIdx < lines.length - 1 ? '<br>' : '');
    }).join('');
  }, [buildPillHTML]);

  // 同步 DOM 内容（当 value prop 从外部变化时）
  useEffect(() => {
    if (!editableRef.current) return;
    if (isComposingRef.current) return;
    if (suppressSyncRef.current) {
      suppressSyncRef.current = false;
      return;
    }

    const currentText = domToText(editableRef.current);
    if (currentText === value) {
      lastValueRef.current = value;
      return;
    }

    const offsetInfo = getTextOffset(editableRef.current);
    const html = textToHTML(value, banks, categories, isDarkMode);
    editableRef.current.innerHTML = html || '<br>';
    lastValueRef.current = value;

    if (offsetInfo && document.activeElement === editableRef.current) {
      try {
        const clampedStart = Math.min(offsetInfo.start, (value || '').length);
        const clampedEnd = Math.min(offsetInfo.end, (value || '').length);
        setTextOffset(editableRef.current, clampedStart, clampedEnd);
      } catch (_) { /* ignore */ }
    }
  }, [value, banks, categories, isDarkMode, textToHTML]);

  // input 事件处理
  const handleInput = useCallback(() => {
    if (isComposingRef.current) return;
    if (!editableRef.current) return;

    const newText = domToText(editableRef.current);
    if (newText === lastValueRef.current) return;

    lastValueRef.current = newText;
    suppressSyncRef.current = true;

    // pill 化检测：如果用户刚完成一个 {{...}} 模式，重新渲染 DOM
    const needsPillify = PILL_REGEX.test(newText);
    PILL_REGEX.lastIndex = 0;

    if (needsPillify) {
      const offset = getTextOffset(editableRef.current);
      const html = textToHTML(newText, banks, categories, isDarkMode);
      editableRef.current.innerHTML = html || '<br>';
      if (offset) {
        try {
          setTextOffset(editableRef.current, offset.start, offset.end);
        } catch (_) { /* ignore */ }
      }
    }

    const syntheticEvent = { target: { value: newText } };
    onChange(syntheticEvent);
  }, [onChange, banks, categories, isDarkMode, textToHTML]);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    isComposingRef.current = false;
    handleInput();
  }, [handleInput]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  }, []);

  const handleFocusEvent = useCallback(() => {
    if (onFocus) onFocus();
    if (onInteraction) onInteraction();
  }, [onFocus, onInteraction]);

  const handleClick = useCallback(() => {
    if (onInteraction) onInteraction();
  }, [onInteraction]);

  // 暴露兼容 textarea 的 API
  useImperativeHandle(forwardedRef, () => ({
    get value() { return domToText(editableRef.current); },
    get selectionStart() {
      const off = getTextOffset(editableRef.current);
      return off ? off.start : 0;
    },
    get selectionEnd() {
      const off = getTextOffset(editableRef.current);
      return off ? off.end : 0;
    },
    setSelectionRange(start, end) {
      setTextOffset(editableRef.current, start, end);
    },
    focus() { editableRef.current?.focus(); },
    get scrollTop() { return editableRef.current?.scrollTop || 0; },
    set scrollTop(v) { if (editableRef.current) editableRef.current.scrollTop = v; },
    get scrollHeight() { return editableRef.current?.scrollHeight || 0; },
    addEventListener(...args) { editableRef.current?.addEventListener(...args); },
    removeEventListener(...args) { editableRef.current?.removeEventListener(...args); },
    get _el() { return editableRef.current; },
  }), []);

  return (
    <div
      ref={editableRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onFocus={handleFocusEvent}
      onClick={handleClick}
      spellCheck={false}
      className={className}
      style={style}
      role="textbox"
      aria-multiline="true"
    />
  );
});

ContentEditableEditor.displayName = 'ContentEditableEditor';

// ============================================================
// VisualEditor 主组件（保持原有 props 接口不变）
// ============================================================

export const VisualEditor = React.forwardRef(({ 
  value, 
  onChange, 
  banks, 
  categories, 
  isDarkMode,
  activeTemplate,
  language,
  t,
  onInteraction,
}, ref) => {
  const containerRef = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const editorBaseClass = `w-full h-full font-mono text-sm leading-relaxed whitespace-pre-wrap break-words focus:outline-none m-0 transition-colors duration-300 selection:bg-orange-500/30 ${isDarkMode ? 'text-gray-300 caret-white selection:text-white' : 'text-gray-800 caret-gray-800 selection:bg-orange-200 selection:text-orange-900'}`;
  const editorStyle = { 
    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };

  if (isMobile) {
    const title = activeTemplate ? (typeof activeTemplate.name === 'object' ? (activeTemplate.name[language] || activeTemplate.name.cn || activeTemplate.name.en) : activeTemplate.name) : '';
    const author = activeTemplate ? activeTemplate.author : '';

    return (
      <div 
        ref={containerRef}
        onScroll={() => { if (onInteraction) onInteraction(); }}
        onClick={() => { if (onInteraction) onInteraction(); }}
        className={`w-full h-full overflow-y-auto overflow-x-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#2A2928]' : 'bg-[#FBF5EE]/80'}`}
      >
        {/* Mobile Header */}
        <div className="px-6 pt-10 pb-6 shrink-0">
          <h1 className={`text-2xl font-black tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {language === 'cn' ? '作者' : 'Author'}:
            </span>
            <span className="text-sm font-bold text-orange-500">
              {author === '官方' ? (t ? t('official') : '官方') : (author || (t ? t('official') : '官方'))}
            </span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 px-6 pb-20">
          <ContentEditableEditor
            ref={ref}
            value={value}
            onChange={onChange}
            banks={banks}
            categories={categories}
            isDarkMode={isDarkMode}
            onInteraction={onInteraction}
            className={editorBaseClass}
            style={{ ...editorStyle, minHeight: '200px' }}
          />
        </div>
      </div>
    );
  }

  // 桌面端布局
  return (
    <div className="relative w-full h-full overflow-hidden transition-colors duration-300 bg-transparent">
      <ContentEditableEditor
        ref={ref}
        value={value}
        onChange={onChange}
        banks={banks}
        categories={categories}
        isDarkMode={isDarkMode}
        onInteraction={onInteraction}
        className={`${editorBaseClass} p-8 overflow-y-auto`}
        style={{ ...editorStyle, height: '100%' }}
      />
    </div>
  );
});

VisualEditor.displayName = 'VisualEditor';
