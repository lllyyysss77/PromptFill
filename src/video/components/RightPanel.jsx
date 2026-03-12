import React, { useState } from 'react';
import { useRootContext } from '../../context/RootContext';
import { getLocalized } from '../../utils/helpers';
import { KnowledgePanel } from './knowledge/KnowledgePanel';

// 一级 Tab：素材库、知识库
const LEVEL1_TABS = [
  { id: 'assets', label: { cn: '素材库', en: 'Assets' } },
  { id: 'knowledge', label: { cn: '知识库', en: 'Knowledge' } },
];

// 二级 Tab - 素材库下
const LEVEL2_ASSETS = [
  { id: 'shot', label: { cn: '镜头', en: 'Shot' } },
  { id: 'character', label: { cn: '角色', en: 'Character' } },
  { id: 'scene', label: { cn: '场景', en: 'Scene' } },
  { id: 'prop', label: { cn: '道具', en: 'Prop' } },
  { id: 'bgm', label: { cn: 'BGM', en: 'BGM' } },
];

// 二级 Tab - 知识库下
const LEVEL2_KNOWLEDGE = [
  { id: 'prompt_tips', label: { cn: '提示词技巧', en: 'Prompt Tips' } },
  { id: 'case_study', label: { cn: '案例解析', en: 'Case Study' } },
  { id: 'photography', label: { cn: '摄影知识', en: 'Photography' } },
];


/** 素材库各子 Tab 占位 */
const AssetsPlaceholder = ({ tabId, isDarkMode, language }) => {
  const labels = {
    shot: { cn: '镜头类型素材（系统预设 + 自定义）', en: 'Shot type assets' },
    character: { cn: '角色素材', en: 'Character assets' },
    scene: { cn: '场景素材', en: 'Scene assets' },
    prop: { cn: '道具素材', en: 'Prop assets' },
    bgm: { cn: 'BGM', en: 'BGM' },
  };
  const t = labels[tabId] || { cn: '内容待定', en: 'Content TBD' };
  const muted = isDarkMode ? 'text-white/50' : 'text-black/50';
  return (
    <div className={`py-8 text-center text-sm ${muted}`}>
      {getLocalized(t, language) || t.cn}
    </div>
  );
};

/** 二级 Tab 条（横向居中，无底色无分割线，选中主题橙、hover 低饱和度橙） */
const Level2TabBar = ({ tabs, activeId, onSelect, isDarkMode, language }) => {
  const activeClass = isDarkMode ? 'text-orange-400' : 'text-orange-600';
  const baseClass = isDarkMode ? 'text-white/70' : 'text-black/70';
  const hoverClass = isDarkMode ? 'hover:text-orange-500/80' : 'hover:text-orange-500/70';

  return (
    <div className="flex flex-wrap gap-1 shrink-0 pb-2 justify-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={`shrink-0 px-3 py-2 font-bold rounded-md transition-colors ${activeId === tab.id ? activeClass : `${baseClass} ${hoverClass}`}`}
        >
          {getLocalized(tab.label, language)}
        </button>
      ))}
    </div>
  );
};

export const RightPanel = ({ isDarkMode: isDarkProp, className = '' }) => {
  const { language, isDarkMode: ctxDark } = useRootContext();
  const isDarkMode = isDarkProp ?? ctxDark;
  const [level1, setLevel1] = useState('assets');
  const [level2Assets, setLevel2Assets] = useState('shot');
  const [level2Knowledge, setLevel2Knowledge] = useState('photography');

  const level1ActiveClass = (id) =>
    level1 === id ? (isDarkMode ? 'text-orange-400' : 'text-orange-600') : '';
  const level1BaseClass = isDarkMode ? 'text-white/70' : 'text-black/70';
  const level1HoverClass = isDarkMode ? 'hover:text-orange-500/80' : 'hover:text-orange-500/70';

  const level2Tabs = level1 === 'assets' ? LEVEL2_ASSETS : LEVEL2_KNOWLEDGE;
  const level2Active = level1 === 'assets' ? level2Assets : level2Knowledge;
  const setLevel2 = level1 === 'assets' ? setLevel2Assets : setLevel2Knowledge;

  const renderContent = () => {
    if (level1 === 'assets') {
      return <AssetsPlaceholder tabId={level2Assets} isDarkMode={isDarkMode} language={language} />;
    }
    if (level1 === 'knowledge') {
      return (
        <KnowledgePanel
          tabId={level2Knowledge}
          language={language}
          isDarkMode={isDarkMode}
        />
      );
    }
    return null;
  };

  // KnowledgePanel 内部自带滚动容器，外层不应再 overflow-y-auto
  const isKnowledgePanel = level1 === 'knowledge';

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* 一级 Tab：横向居中，与左/中面板顶部间距一致（pt-4 = p-4） */}
      <div className="flex shrink-0 gap-1 pb-2 pt-4 justify-center">
        {LEVEL1_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setLevel1(tab.id)}
            className={`shrink-0 px-4 py-2.5 font-bold rounded-md transition-colors ${level1 === tab.id ? level1ActiveClass(tab.id) : `${level1BaseClass} ${level1HoverClass}`}`}
          >
            {getLocalized(tab.label, language)}
          </button>
        ))}
      </div>

      {/* 二级 Tab：横向居中 */}
      <div className="shrink-0 pt-2">
        <Level2TabBar
          tabs={level2Tabs}
          activeId={level2Active}
          onSelect={setLevel2}
          isDarkMode={isDarkMode}
          language={language}
        />
      </div>

      {/* 内容区：KnowledgePanel 自管滚动；其它内容用外层滚动 */}
      <div
        className={`flex-1 min-h-0 overflow-x-hidden ${isKnowledgePanel ? 'overflow-y-hidden px-2' : `overflow-y-auto p-4 custom-scrollbar pr-2 ${isDarkMode ? 'dark-mode' : ''}`}`}
      >
        {renderContent()}
      </div>
    </div>
  );
};
