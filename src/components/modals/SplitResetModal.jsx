import React from 'react';
import { createPortal } from 'react-dom';
import { X, RotateCcw } from 'lucide-react';
import { PremiumButton } from '../PremiumButton';
import { getLocalized } from '../../utils/helpers';

// 颜色映射：类别名 -> 内联颜色样式（用于弹窗中无法使用动态 tailwind 类的场景）
const CATEGORY_COLOR_MAP = {
  blue:    { color: '#2563EB', bg: 'rgba(59,130,246,0.12)' },
  amber:   { color: '#D97706', bg: 'rgba(245,158,11,0.12)' },
  rose:    { color: '#E11D48', bg: 'rgba(244,63,94,0.12)' },
  emerald: { color: '#059669', bg: 'rgba(16,185,129,0.12)' },
  violet:  { color: '#7C3AED', bg: 'rgba(139,92,246,0.12)' },
  slate:   { color: '#475569', bg: 'rgba(100,116,139,0.12)' },
  orange:  { color: '#EA580C', bg: 'rgba(249,115,22,0.12)' },
  cyan:    { color: '#0891B2', bg: 'rgba(6,182,212,0.12)' },
  lime:    { color: '#65A30D', bg: 'rgba(132,204,22,0.12)' },
  pink:    { color: '#DB2777', bg: 'rgba(236,72,153,0.12)' },
  indigo:  { color: '#4F46E5', bg: 'rgba(99,102,241,0.12)' },
  teal:    { color: '#0D9488', bg: 'rgba(20,184,166,0.12)' },
};

/**
 * 将文本中的 {{变量名}} 解析为带颜色的 React 节点数组
 */
const renderTextWithVariables = (text, banks, isDarkMode) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/({{[^}]+}})/g);
    const rendered = parts.map((part, partIdx) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const fullKey = part.slice(2, -2).trim();
        // 提取 baseKey（去掉 _数字 后缀）
        const baseKey = fullKey.replace(/_\d+$/, '');
        const bankConfig = banks?.[baseKey] || banks?.[fullKey];
        const category = bankConfig?.category;
        const colorStyle = CATEGORY_COLOR_MAP[category] || { color: '#F97316', bg: 'rgba(249,115,22,0.12)' };
        
        return (
          <span
            key={partIdx}
            style={{
              color: colorStyle.color,
              background: colorStyle.bg,
              borderRadius: '4px',
              padding: '1px 4px',
              fontWeight: 700,
              fontSize: '0.75em',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={partIdx}>{part}</span>;
    });
    return (
      <div key={lineIdx} style={{ minHeight: '1.5em', lineHeight: '1.75' }}>
        {rendered}
      </div>
    );
  });
};

/**
 * SplitResetModal — 智能拆分后的"重置"对比弹窗
 * 左侧展示拆分前内容，右侧展示当前拆分结果，用户选择保留或还原
 */
export const SplitResetModal = ({
  isOpen,
  onClose,
  onRestore,           // 还原到拆分前
  snapshot,            // { originalContent } — 拆分前的模板内容
  currentContent,      // 当前模板内容（拆分后）
  language = 'cn',
  templateLanguage = 'cn',
  isDarkMode = false,
  banks = {},
}) => {
  if (!isOpen || !snapshot) return null;

  const beforeText = getLocalized(snapshot.originalContent, templateLanguage) || '';
  const afterText = getLocalized(currentContent, templateLanguage) || '';

  const modal = (
    <div
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`
          w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border
          animate-in slide-in-from-bottom-4 duration-300
          ${isDarkMode ? 'bg-[#1C1917] border-white/10' : 'bg-white border-gray-100'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-5 flex items-center justify-between border-b ${isDarkMode ? 'border-white/[0.03] bg-white/[0.01]' : 'border-gray-100 bg-gray-50/30'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <RotateCcw size={20} />
            </div>
            <div>
              <h3 className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {language === 'cn' ? '查看拆分前后对比' : 'Compare Before & After Split'}
              </h3>
              <p className={`text-[11px] mt-0.5 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {language === 'cn' ? '确认是否还原到拆分前的内容' : 'Decide whether to restore the pre-split content'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-white/10 text-gray-500 hover:text-gray-300' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content: 左右对比 */}
        <div className="p-6 grid grid-cols-2 gap-6 relative">
          {/* 中间垂直分隔线 */}
          <div className={`absolute left-1/2 top-8 bottom-8 w-px -translate-x-1/2 ${isDarkMode ? 'bg-white/[0.03]' : 'bg-gray-100'}`} />

          {/* 左：拆分前 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {language === 'cn' ? '拆分前' : 'Before Split'}
              </span>
            </div>
            <div 
              className={`relative group rounded-2xl overflow-hidden border border-transparent`}
              style={{ 
                boxSizing: 'border-box',
                borderRadius: '16px',
                boxShadow: 'inset 0px 2px 4px 0px rgba(0, 0, 0, 0.3)',
                background: isDarkMode 
                  ? 'linear-gradient(#252525, #252525) padding-box, linear-gradient(0deg, #646464 0%, rgba(0, 0, 0, 0) 100%) border-box' 
                  : 'linear-gradient(#E8E3DD, #E8E3DD) padding-box, linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 97%) border-box',
              }}
            >
              <div
                className={`
                  w-full h-64 text-xs font-mono leading-relaxed p-4 bg-transparent
                  overflow-y-auto custom-scrollbar
                  ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}
                `}
              >
                {renderTextWithVariables(beforeText, banks, isDarkMode)}
              </div>
            </div>
          </div>

          {/* 右：拆分后（当前） */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-orange-500/50' : 'text-orange-400'}`}>
                {language === 'cn' ? '拆分后（当前）' : 'After Split (Current)'}
              </span>
            </div>
            <div 
              className={`relative group rounded-2xl overflow-hidden border border-transparent`}
              style={{ 
                boxSizing: 'border-box',
                borderRadius: '16px',
                boxShadow: 'inset 0px 2px 4px 0px rgba(0, 0, 0, 0.3)',
                background: isDarkMode 
                  ? 'linear-gradient(#252525, #252525) padding-box, linear-gradient(0deg, #EA580C 0%, rgba(234, 88, 12, 0) 100%) border-box' 
                  : 'linear-gradient(#F9FAFB, #F9FAFB) padding-box, linear-gradient(0deg, #FB923C 0%, rgba(251, 146, 60, 0) 100%) border-box',
              }}
            >
              <div
                className={`
                  w-full h-64 text-xs font-mono leading-relaxed p-4 bg-transparent
                  overflow-y-auto custom-scrollbar
                  ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}
                `}
              >
                {renderTextWithVariables(afterText, banks, isDarkMode)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-6 flex items-center justify-between gap-3 border-t ${isDarkMode ? 'border-white/[0.03] bg-white/[0.01]' : 'border-gray-100 bg-gray-50/30'}`}>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
            {language === 'cn' ? '还原后当前拆分结果将丢失' : 'Restoring will discard the current split result'}
          </p>
          <div className="flex items-center gap-3">
            <PremiumButton
              onClick={onClose}
              isDarkMode={isDarkMode}
              className="!h-11 !rounded-2xl min-w-[100px]"
            >
              <span className="text-sm font-bold px-4">
                {language === 'cn' ? '保留结果' : 'Keep Result'}
              </span>
            </PremiumButton>
            <PremiumButton
              onClick={() => {
                onRestore();
                onClose();
              }}
              active={true}
              isDarkMode={isDarkMode}
              className="!h-11 !rounded-2xl min-w-[100px]"
            >
              <span className="text-sm font-black tracking-widest px-4">
                {language === 'cn' ? '还原' : 'Restore'}
              </span>
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default SplitResetModal;
