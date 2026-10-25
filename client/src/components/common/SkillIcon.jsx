import {
  GraduationCap,
  Languages,
  Brain,
  HeartHandshake,
  Clock,
  Monitor,
  ShieldCheck,
  HeartPulse,
  Trophy,
  Sparkles,
  Palette,
  Wrench,
  Award,
} from 'lucide-react';

const ICON_MAP = {
  GraduationCap,
  Languages,
  Brain,
  HeartHandshake,
  Clock,
  Monitor,
  ShieldCheck,
  HeartPulse,
  Trophy,
  Sparkles,
  Palette,
  Wrench,
};

export default function SkillIcon({ iconName, emoji = '⭐', size = 20, className = '' }) {
  const IconComponent = ICON_MAP[iconName] || Award;
  return (
    <span className={`inline-flex items-center justify-center ${className}`}>
      <IconComponent size={size} />
    </span>
  );
}
