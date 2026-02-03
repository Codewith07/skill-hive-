import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { SKILL_OPTIONS } from '@/lib/constants';
import { GraduationCap, Mail, Calendar, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileCardProps {
  enrolledCount: number;
}

export function ProfileCard({ enrolledCount }: ProfileCardProps) {
  const { profile } = useAuthStore();

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-black text-2xl font-bold shadow-honey">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                <GraduationCap className="h-4 w-4" />
                {profile.education}
              </div>
            </div>
          </div>
          
          <Link 
            to="/profile"
            className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <Edit className="h-4 w-4" />
          </Link>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Mail className="h-4 w-4" />
          {profile.email}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => {
              const skillInfo = SKILL_OPTIONS.find(s => s.value === skill);
              return (
                <span key={skill} className="skill-tag">
                  {skillInfo?.label || skill}
                </span>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text">{enrolledCount}</p>
            <p className="text-xs text-muted-foreground">Enrolled Hackathons</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold gradient-text">{profile.skills.length}</p>
            <p className="text-xs text-muted-foreground">Skills</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
