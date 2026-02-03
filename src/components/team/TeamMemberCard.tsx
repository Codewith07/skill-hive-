import { motion } from 'framer-motion';
import { SKILL_OPTIONS } from '@/lib/constants';
import { GraduationCap, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Profile {
  id: string;
  name: string;
  email: string;
  education: string;
  skills: string[];
}

interface TeamMemberCardProps {
  profile: Profile;
  matchPercentage: number;
  commonSkills: string[];
  index: number;
}

export function TeamMemberCard({ profile, matchPercentage, commonSkills, index }: TeamMemberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl p-6 card-hover relative overflow-hidden"
    >
      {/* Background gradient based on match */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, hsl(38 92% 50% / ${matchPercentage / 100}), transparent)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-black text-xl font-bold shadow-honey">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg">{profile.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4" />
                {profile.education}
              </div>
            </div>
          </div>

          {/* Match percentage */}
          <div className="flex flex-col items-center">
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90 transform">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke="url(#matchGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${matchPercentage * 1.51} 151`}
                  initial={{ strokeDasharray: '0 151' }}
                  animate={{ strokeDasharray: `${matchPercentage * 1.51} 151` }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                />
                <defs>
                  <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(38 92% 50%)" />
                    <stop offset="100%" stopColor="hsl(24 95% 53%)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{matchPercentage}%</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Match</span>
          </div>
        </div>

        {/* Common Skills */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Common Skills ({commonSkills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {commonSkills.map((skill) => {
              const skillInfo = SKILL_OPTIONS.find(s => s.value === skill);
              return (
                <span key={skill} className="skill-tag text-[11px]">
                  {skillInfo?.label || skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* All Skills */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">All Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => {
              const isCommon = commonSkills.includes(skill);
              const skillInfo = SKILL_OPTIONS.find(s => s.value === skill);
              return (
                <span 
                  key={skill} 
                  className={`px-2 py-0.5 text-[11px] rounded-full border ${
                    isCommon 
                      ? 'bg-primary/10 text-primary border-primary/20' 
                      : 'bg-muted/50 text-muted-foreground border-border'
                  }`}
                >
                  {skillInfo?.label || skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Button className="w-full btn-honey" size="sm">
          Invite to Team
        </Button>
      </div>
    </motion.div>
  );
}
