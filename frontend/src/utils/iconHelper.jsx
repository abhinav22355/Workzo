import React from 'react';
import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Wind,
  Tv,
  Flower2,
  Truck,
  Bug,
  ShieldCheck,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

const iconMap = {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Wind,
  Tv,
  Flower2,
  Truck,
  Bug,
  ShieldCheck,
  Briefcase,
};

export const getServiceIcon = (iconName, className = 'w-6 h-6') => {
  const IconComponent = iconMap[iconName] || HelpCircle;
  return <IconComponent className={className} />;
};
