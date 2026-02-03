import { motion } from 'framer-motion';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
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

interface EnrolledHackathonCardProps {
  hackathon: Hackathon;
  index: number;
}

export function EnrolledHackathonCard({ hackathon, index }: EnrolledHackathonCardProps) {
  const startDate = new Date(hackathon.start_date);
  const endDate = new Date(hackathon.end_date);
  const today = new Date();
  
  // Calculate progress
  const totalDays = differenceInDays(endDate, startDate) || 1;
  const daysElapsed = differenceInDays(today, startDate);
  const progress = Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100));
  
  const getStatusInfo = () => {
    if (isFuture(startDate)) {
      const daysUntil = differenceInDays(startDate, today);
      return { text: `Starts in ${daysUntil} days`, color: 'text-emerald-400' };
    } else if (isPast(endDate)) {
      return { text: 'Completed', color: 'text-zinc-400' };
    } else {
      const daysLeft = differenceInDays(endDate, today);
      return { text: `${daysLeft} days left`, color: 'text-amber-400' };
    }
  };
  
  const statusInfo = getStatusInfo();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card rounded-xl p-4 card-hover"
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
          {hackathon.image_url ? (
            <img
              src={hackathon.image_url}
              alt={hackathon.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm line-clamp-1">{hackathon.title}</h3>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium border ${
              hackathon.mode === 'Online' ? 'badge-online' :
              hackathon.mode === 'Offline' ? 'badge-offline' : 'badge-hybrid'
            }`}>
              {hackathon.mode}
            </span>
          </div>

          {/* Status */}
          <p className={`text-xs font-medium mb-2 ${statusInfo.color}`}>
            {statusInfo.text}
          </p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
            />
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
