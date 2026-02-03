import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Filter, Sparkles, X } from 'lucide-react';
import { EDUCATION_LEVELS, SKILL_OPTIONS } from '@/lib/constants';

interface Profile {
  id: string;
  name: string;
  email: string;
  education: string;
  skills: string[];
}

interface MatchedProfile extends Profile {
  matchPercentage: number;
  commonSkills: string[];
}

export default function TeamMatchPage() {
  const { profile } = useAuthStore();
  const [matchedProfiles, setMatchedProfiles] = useState<MatchedProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEducation, setSelectedEducation] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchMatchedProfiles();
    }
  }, [profile]);

  const fetchMatchedProfiles = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      // Fetch all profiles except current user
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', profile.id);

      if (!error && data) {
        // Calculate match percentage and filter
        const matched = data
          .map((p: Profile) => {
            const commonSkills = p.skills.filter(skill => profile.skills.includes(skill));
            const totalUniqueSkills = new Set([...p.skills, ...profile.skills]).size;
            const matchPercentage = totalUniqueSkills > 0 
              ? Math.round((commonSkills.length / Math.min(p.skills.length, profile.skills.length)) * 100)
              : 0;

            return {
              ...p,
              matchPercentage,
              commonSkills,
            };
          })
          .filter((p: MatchedProfile) => p.commonSkills.length > 0) // At least one common skill
          .sort((a: MatchedProfile, b: MatchedProfile) => b.matchPercentage - a.matchPercentage);

        setMatchedProfiles(matched);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter profiles
  const filteredProfiles = matchedProfiles.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEducation = !selectedEducation || p.education === selectedEducation;

    return matchesSearch && matchesEducation;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEducation(null);
  };

  const hasActiveFilters = searchQuery || selectedEducation;

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
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Team Match</h1>
          </div>
          <p className="text-muted-foreground">
            Find teammates with similar skills and education to collaborate on hackathons
          </p>
        </motion.div>

        {/* Your Skills Banner */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5 mb-8 bg-gradient-to-r from-primary/5 to-secondary/5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium">Matching based on your skills</p>
            </div>
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
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or skill..."
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
            </Button>
          </div>

          {/* Filter chips */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-card rounded-xl p-4"
            >
              <p className="text-sm font-medium mb-3">Education Level</p>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_LEVELS.map((edu) => (
                  <Button
                    key={edu.value}
                    variant={selectedEducation === edu.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedEducation(selectedEducation === edu.value ? null : edu.value)}
                  >
                    {edu.label}
                  </Button>
                ))}
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4 text-muted-foreground">
                  <X className="h-4 w-4 mr-2" />
                  Clear filters
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-sm text-muted-foreground">
            Found <span className="font-medium text-foreground">{filteredProfiles.length}</span> potential teammates
          </p>
        </motion.div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((matchedProfile, index) => (
              <TeamMemberCard
                key={matchedProfile.id}
                profile={matchedProfile}
                matchPercentage={matchedProfile.matchPercentage}
                commonSkills={matchedProfile.commonSkills}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">No matches found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {matchedProfiles.length === 0
                ? "There are no other users with matching skills yet. Invite your friends to join SKILLHIVE!"
                : "Try adjusting your filters to find more teammates"}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
