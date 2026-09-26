import React from 'react';
import { Home, BookOpen, MessageSquare, BarChart2, MoreHorizontal } from 'lucide-react';
import { BottomTab, ScreenId } from '../types';

interface PhoneBottomNavProps {
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const PhoneBottomNav: React.FC<PhoneBottomNavProps> = ({
  activeTab,
  onTabChange,
  onNavigate,
}) => {
  const tabs = [
    { id: 'home' as BottomTab, label: 'Home', icon: Home, targetScreen: 'home' as ScreenId },
    { id: 'khata' as BottomTab, label: 'Khata', icon: BookOpen, targetScreen: 'home' as ScreenId },
    { id: 'community' as BottomTab, label: 'Community', icon: MessageSquare, targetScreen: 'community' as ScreenId },
    { id: 'reports' as BottomTab, label: 'Reports', icon: BarChart2, targetScreen: 'knowledge' as ScreenId },
    { id: 'more' as BottomTab, label: 'More', icon: MoreHorizontal, targetScreen: 'profile' as ScreenId },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    onTabChange(tab.id);
    onNavigate(tab.targetScreen);
  };

  return (
    <div className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`nav-tab-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
