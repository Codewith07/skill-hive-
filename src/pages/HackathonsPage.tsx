import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, X, Trophy, Sparkles } from 'lucide-react';
import { SKILL_OPTIONS } from '@/lib/constants';

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

export default function HackathonsPage() {
  const { profile } = useAuthStore();
  const { toast } = useToast();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHackathons();
    if (profile) {
      fetchEnrollments();
    }
  }, [profile]);

  const fetchHackathons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .order('start_date', { ascending: true });

      if (!error && data) {
        setHackathons(data);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('enrollments')
      .select('hackathon_id')
      .eq('user_id', profile.id);

    if (!error && data) {
      setEnrolledIds(new Set(data.map(e => e.hackathon_id)));
    }
  };

  const handleEnroll = async (hackathonId: string) => {
    if (!profile) return;

    const { error } = await supabase
      .from('enrollments')
      .insert({
        user_id: profile.id,
        hackathon_id: hackathonId,
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Already enrolled',
          description: 'You are already enrolled in this hackathon',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to enroll. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    setEnrolledIds(prev => new Set([...prev, hackathonId]));
    toast({
      title: 'Enrolled successfully! 🎉',
      description: 'You have been enrolled in this hackathon.',
    });
  };

  // Filter hackathons
  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesSearch = hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || hackathon.status === selectedStatus;
    const matchesMode = !selectedMode || hackathon.mode === selectedMode;
    const matchesSkill = !selectedSkill || hackathon.skills_required.includes(selectedSkill);

    return matchesSearch && matchesStatus && matchesMode && matchesSkill;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatus(null);
    setSelectedMode(null);
    setSelectedSkill(null);
  };

  const hasActiveFilters = searchQuery || selectedStatus || selectedMode || selectedSkill;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Hackathons</h1>
          </div>
          <p className="text-muted-foreground">
            Discover and enroll in exciting hackathons that match your skills
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hackathons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter toggle */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Filter chips */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card rounded-xl p-4 space-y-4"
            >
              {/* Status filter */}
              <div>
                <p className="text-sm font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {['Upcoming', 'Ongoing', 'Completed'].map((status) => (
                    <Button
                      key={status}
                      variant={selectedStatus === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Mode filter */}
              <div>
                <p className="text-sm font-medium mb-2">Mode</p>
                <div className="flex flex-wrap gap-2">
                  {['Online', 'Offline', 'Hybrid'].map((mode) => (
                    <Button
                      key={mode}
                      variant={selectedMode === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedMode(selectedMode === mode ? null : mode)}
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Skills filter */}
              <div>
                <p className="text-sm font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <Button
                      key={skill.value}
                      variant={selectedSkill === skill.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedSkill(selectedSkill === skill.value ? null : skill.value)}
                    >
                      {skill.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredHackathons.length}</span> hackathons
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{enrolledIds.size}</span> enrolled
          </div>
        </motion.div>

        {/* Hackathon Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : filteredHackathons.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHackathons.map((hackathon, index) => (
              <HackathonCard
                key={hackathon.id}
                hackathon={hackathon}
                isEnrolled={enrolledIds.has(hackathon.id)}
                onEnroll={handleEnroll}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">No hackathons found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
