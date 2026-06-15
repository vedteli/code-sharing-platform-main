import { LANGUAGE_ICONS } from '../lib/constants';

interface LanguageIconProps {
  language: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageIcon({ language, className, size = 'md' }: LanguageIconProps) {
  const iconUrl = LANGUAGE_ICONS[language] || LANGUAGE_ICONS.default;
  
  // Default responsive sizing based on size prop
  const sizeClasses = {
    sm: 'responsive-icon',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'responsive-icon-lg'
  };
  
  const finalClassName = className || sizeClasses[size];
  
  return (
    <img
      src={iconUrl}
      alt={`${language} icon`}
      className={`${finalClassName} flex-shrink-0`}
      style={{ 
        maxWidth: '100%', 
        height: 'auto', 
        objectFit: 'contain' 
      }}
      loading="lazy"
    />
  );
}