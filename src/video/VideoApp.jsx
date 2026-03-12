import React from 'react';
import { VideoLayout } from './components/layout/VideoLayout';
import { useRootContext } from '../context/RootContext';

const VideoApp = () => {
  const { isDarkMode } = useRootContext();
  
  return (
    <div className="w-full h-full">
      <VideoLayout isDarkMode={isDarkMode} />
    </div>
  );
};

export default VideoApp;
