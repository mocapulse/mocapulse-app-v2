"use client"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Shield,
  CheckCircle2,
  Github,
  Twitter,
  Linkedin,
  FileText,
  Globe,
  Verified
} from "lucide-react"
import type { SocialPlatform } from "@/lib/social-verification"

interface VerificationBadgeProps {
  platform: SocialPlatform | 'age_verification';
  username?: string;
  qualityScore?: number;
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const platformConfig = {
  age_verification: {
    icon: Shield,
    label: 'Age Verified (18+)',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    iconColor: 'text-green-600'
  },
  github: {
    icon: Github,
    label: 'GitHub',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    iconColor: 'text-gray-700'
  },
  twitter: {
    icon: Twitter,
    label: 'Twitter/X',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    iconColor: 'text-blue-500'
  },
  lens: {
    icon: Verified,
    label: 'Lens Protocol',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    iconColor: 'text-emerald-500'
  },
  farcaster: {
    icon: Globe,
    label: 'Farcaster',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    iconColor: 'text-purple-600'
  },
  mirror: {
    icon: FileText,
    label: 'Mirror',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    iconColor: 'text-indigo-500'
  },
  linkedin: {
    icon: Linkedin,
    label: 'LinkedIn',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    iconColor: 'text-blue-700'
  },
  link3: {
    icon: Globe,
    label: 'Link3',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    iconColor: 'text-teal-500'
  }
};

const sizeConfig = {
  sm: {
    icon: 'h-3 w-3',
    badge: 'text-xs px-2 py-0.5',
    gap: 'gap-1'
  },
  md: {
    icon: 'h-4 w-4',
    badge: 'text-sm px-2.5 py-1',
    gap: 'gap-1.5'
  },
  lg: {
    icon: 'h-5 w-5',
    badge: 'text-base px-3 py-1.5',
    gap: 'gap-2'
  }
};

export function VerificationBadge({
  platform,
  username,
  qualityScore,
  verified,
  size = 'md',
  showLabel = true
}: VerificationBadgeProps) {
  const config = platformConfig[platform];
  const sizeStyles = sizeConfig[size];
  const Icon = config.icon;

  if (!verified) {
    return null;
  }

  const tooltipContent = (
    <div className="space-y-1">
      <div className="font-semibold">{config.label}</div>
      {username && <div className="text-xs">@{username}</div>}
      {qualityScore !== undefined && (
        <div className="text-xs">
          Quality Score: {qualityScore}/100
        </div>
      )}
      <div className="text-xs text-muted-foreground flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={`${config.color} ${sizeStyles.badge} ${sizeStyles.gap} flex items-center cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
            {showLabel && <span>{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface VerificationBadgeListProps {
  verifications: Array<{
    platform: SocialPlatform | 'age_verification';
    username?: string;
    qualityScore?: number;
    verified: boolean;
  }>;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  maxDisplay?: number;
}

export function VerificationBadgeList({
  verifications,
  size = 'sm',
  showLabels = false,
  maxDisplay
}: VerificationBadgeListProps) {
  const displayedVerifications = maxDisplay
    ? verifications.slice(0, maxDisplay)
    : verifications;

  const remainingCount = maxDisplay && verifications.length > maxDisplay
    ? verifications.length - maxDisplay
    : 0;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayedVerifications.map((verification, index) => (
        <VerificationBadge
          key={`${verification.platform}-${index}`}
          platform={verification.platform}
          username={verification.username}
          qualityScore={verification.qualityScore}
          verified={verification.verified}
          size={size}
          showLabel={showLabels}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}

interface VerificationStatusProps {
  hasAgeVerification: boolean;
  socialVerifications: Array<{
    platform: SocialPlatform;
    username?: string;
    qualityScore?: number;
  }>;
  overallScore?: number;
  compact?: boolean;
}

export function VerificationStatus({
  hasAgeVerification,
  socialVerifications,
  overallScore,
  compact = false
}: VerificationStatusProps) {
  const allVerifications = [
    ...(hasAgeVerification ? [{
      platform: 'age_verification' as const,
      verified: true,
      qualityScore: 100
    }] : []),
    ...socialVerifications.map(v => ({
      ...v,
      verified: true
    }))
  ];

  const verificationCount = allVerifications.length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <VerificationBadgeList
          verifications={allVerifications}
          size="sm"
          showLabels={false}
          maxDisplay={3}
        />
        {overallScore !== undefined && (
          <Badge variant="outline" className="text-xs">
            Score: {overallScore}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Verifications ({verificationCount})</h4>
        {overallScore !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overall Score:</span>
            <Badge variant={overallScore >= 70 ? "default" : "secondary"}>
              {overallScore}/100
            </Badge>
          </div>
        )}
      </div>
      <VerificationBadgeList
        verifications={allVerifications}
        size="md"
        showLabels={true}
      />
      {verificationCount === 0 && (
        <p className="text-sm text-muted-foreground">
          No verifications yet. Complete verifications to improve your reputation score.
        </p>
      )}
    </div>
  );
}
