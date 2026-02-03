import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, MapPin, Trophy, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
}

interface RecommendedHackathonCardProps {
  hackathon: Hackathon;
  matchingSkills: string[];
  index: number;
}

export function RecommendedHackathonCard({ hackathon, matchingSkills, index }: RecommendedHackathonCardProps) {
  const matchPercentage = Math.round((matchingSkills.length / hackathon.skills_required.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-2xl overflow-hidden card-hover group"
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {hackathon.image_url ? (
          <img
            src={hackathon.image_url}
            alt={hackathon.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Match badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-semibold">
          <Zap className="h-3 w-3" />
          {matchPercentage}% Match
        </div>
        
        {/* Status badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium border ${
          hackathon.status === 'Upcoming' ? 'badge-upcoming' :
          hackathon.status === 'Ongoing' ? 'badge-ongoing' : 'badge-completed'
        }`}>
          {hackathon.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{hackathon.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{hackathon.description}</p>

        {/* Matching skills */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Your matching skills:</p>
          <div className="flex flex-wrap gap-1">
            {matchingSkills.slice(0, 3).map((skill) => (
              <span key={skill} className="skill-tag text-[10px] py-0.5">
                {skill}
              </span>
            ))}
            {matchingSkills.length > 3 && (
              <span className="text-xs text-muted-foreground">+{matchingSkills.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(hackathon.start_date), 'MMM d')}
          </div>
          {hackathon.prize_pool && (
            <div className="flex items-center gap-1">
              <Trophy className="h-3 w-3 text-primary" />
              {hackathon.prize_pool}
            </div>
          )}
        </div>

        {/* CTA */}
        <Link to={`/hackathons`}>
          <Button className="w-full btn-honey" size="sm">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
