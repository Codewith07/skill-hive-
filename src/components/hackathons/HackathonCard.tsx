import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Trophy, Users, ExternalLink, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Hackathon {
  id: string;
  title: string;
  description: string;
  skills_required: string[];
  start_date: string;
  end_date: string;
  mode: string;
  status: string;
  image_url: string | null;
  prize_pool: string | null;
  organizer: string | null;
  location: string | null;
  max_team_size: number | null;
}

interface HackathonCardProps {
  hackathon: Hackathon;
  isEnrolled: boolean;
  onEnroll: (hackathonId: string) => Promise<void>;
  index: number;
}

export function HackathonCard({ hackathon, isEnrolled, onEnroll, index }: HackathonCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    if (isEnrolled || isLoading) return;
    setIsLoading(true);
    try {
      await onEnroll(hackathon.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card rounded-2xl overflow-hidden card-hover group"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {hackathon.image_url ? (
          <img
            src={hackathon.image_url}
            alt={hackathon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
            hackathon.status === 'Upcoming' ? 'badge-upcoming' :
            hackathon.status === 'Ongoing' ? 'badge-ongoing' : 'badge-completed'
          }`}>
            {hackathon.status}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${
            hackathon.mode === 'Online' ? 'badge-online' :
            hackathon.mode === 'Offline' ? 'badge-offline' : 'badge-hybrid'
          }`}>
            {hackathon.mode}
          </span>
        </div>

        {/* Prize pool badge */}
        {hackathon.prize_pool && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold backdrop-blur-sm">
            <Trophy className="h-3 w-3" />
            {hackathon.prize_pool}
          </div>
        )}

        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold">
            <Check className="h-3 w-3" />
            Enrolled
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Organizer */}
        <div className="mb-3">
          <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {hackathon.title}
          </h3>
          {hackathon.organizer && (
            <p className="text-xs text-muted-foreground">by {hackathon.organizer}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {hackathon.description}
        </p>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {hackathon.skills_required.slice(0, 4).map((skill) => (
              <span key={skill} className="skill-tag text-[11px]">
                {skill}
              </span>
            ))}
            {hackathon.skills_required.length > 4 && (
              <span className="text-xs text-muted-foreground self-center">
                +{hackathon.skills_required.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-5">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(hackathon.start_date), 'MMM d')} - {format(new Date(hackathon.end_date), 'MMM d, yyyy')}
          </div>
          {hackathon.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {hackathon.location}
            </div>
          )}
          {hackathon.max_team_size && (
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Max {hackathon.max_team_size} members
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          onClick={handleEnroll}
          disabled={isEnrolled || isLoading || hackathon.status === 'Completed'}
          className={`w-full ${isEnrolled ? 'bg-emerald-500 hover:bg-emerald-500' : 'btn-honey'}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEnrolled ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Enrolled
            </>
          ) : hackathon.status === 'Completed' ? (
            'Hackathon Ended'
          ) : (
            'Enroll Now'
          )}
        </Button>
      </div>
    </motion.div>
  );
}
