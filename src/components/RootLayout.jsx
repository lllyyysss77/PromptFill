import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, DarkModeLamp } from './';
import { useRootContext } from '../context/RootContext';
import { isMobile } from '../utils/platform';

/**
 * RootLayout - 全局布局容器
 * 负责渲染持久 UI（侧边栏、灯）
 */
export const RootLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, language, t, themeMode, setThemeMode, setLanguage } = useRootContext();
  
  const [isMobileDevice, setIsMobileDevice] = useState(isMobile());

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setIsMobileDevice(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isVideoPage = location.pathname.startsWith('/video');
  const isSettingPage = location.pathname === '/setting';

  // 针对主页模块的特殊 UI 状态
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [activeHomeTab, setActiveHomeTab] = useState('home');
  const [sortOrder, setSortOrderState] = useState('newest');

  useEffect(() => {
    const syncTab = (e) => setActiveHomeTab(e.detail);
    window.addEventListener('app-sync-tab', syncTab);
    return () => window.removeEventListener('app-sync-tab', syncTab);
  }, []);

  const handleSetSortOrder = (value) => {
    setSortOrderState(value);
    window.dispatchEvent(new CustomEvent('app-set-sort-order', { detail: value }));
  };

  const handleSetRandomSeed = (seed) => {
    window.dispatchEvent(new CustomEvent('app-set-random-seed', { detail: seed }));
  };

  // 同步 theme-color
  useEffect(() => {
    const themeColor = isDarkMode ? '#181716' : '#D6D6D6';
    let meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', themeColor);
  }, [isDarkMode]);

  const handleHome = () => {
    if (isVideoPage) navigate('/');
    setActiveHomeTab('home');
    window.dispatchEvent(new CustomEvent('app-nav-home'));
  };

  const handleDetail = () => {
    if (isVideoPage) navigate('/');
    setActiveHomeTab('details');
    window.dispatchEvent(new CustomEvent('app-nav-detail'));
  };

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('app-nav-refresh'));
  };

  return (
    <div 
      className={`flex h-screen h-[100dvh] w-screen overflow-hidden p-0 md:p-4 select-none transition-colors duration-300 ${
        isDarkMode ? 'dark-mode dark-gradient-bg' : 'mesh-gradient-bg'
      }`}
    >
      {/* Mesh gradient orbs — light mode only, each animates independently */}
      {!isDarkMode && (
        <div className="mesh-orbs-container" aria-hidden="true">
          {/* SVG noise filter for grain texture */}
          <svg className="mesh-noise-svg" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="mesh-noise" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
                <feBlend in="SourceGraphic" in2="grayNoise" mode="soft-light" result="blended" />
                <feComposite in="blended" in2="SourceGraphic" operator="in" />
              </filter>
            </defs>
          </svg>

          {/* Base orbs — full viewport coverage */}
          <div className="mesh-orb mesh-orb-1" />
          <div className="mesh-orb mesh-orb-2" />
          <div className="mesh-orb mesh-orb-3" />
          <div className="mesh-orb mesh-orb-4" />
          <div className="mesh-orb mesh-orb-5" />

          {/* Nebula cluster — bottom-right chaos orbs */}
          <div className="mesh-orb mesh-nebula-1" />
          <div className="mesh-orb mesh-nebula-2" />
          <div className="mesh-orb mesh-nebula-3" />
          <div className="mesh-orb mesh-nebula-4" />
          <div className="mesh-orb mesh-nebula-5" />

          {/* Grain overlay — covers entire container */}
          <div className="mesh-grain-overlay" />
        </div>
      )}
      {!isMobileDevice && (
        <Sidebar
          activeTab={isVideoPage ? 'video' : (isSettingPage ? 'settings' : activeHomeTab)}
          onHome={handleHome}
          onDetail={handleDetail}
          isSortMenuOpen={isSortMenuOpen}
          setIsSortMenuOpen={setIsSortMenuOpen}
          sortOrder={sortOrder}
          setSortOrder={handleSetSortOrder}
          setRandomSeed={handleSetRandomSeed}
          onRefresh={handleRefresh}
          language={language}
          setLanguage={setLanguage}
          isDarkMode={isDarkMode}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
          t={t}
        />
      )}
      
      {!isMobileDevice && <DarkModeLamp isDarkMode={isDarkMode} />}

      <div className="flex-1 h-full min-w-0 min-h-0 flex flex-col relative z-[1]">
        {children}
      </div>
    </div>
  );
};
