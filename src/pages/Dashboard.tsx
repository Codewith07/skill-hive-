import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import { EnrolledHackathonCard } from '@/components/dashboard/EnrolledHackathonCard';
import { RecommendedHackathonCard } from '@/components/dashboard/RecommendedHackathonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Zap, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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

interface Enrollment {
  hackathon_id: string;
  hackathons: Hackathon;
}

export default function Dashboard() {
  const { profile } = useAuthStore();
  const [enrolledHackathons, setEnrolledHackathons] = useState<Hackathon[]>([]);
  const [recommendedHackathons, setRecommendedHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      // Fetch enrolled hackathons
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          hackathon_id,
          hackathons (*)
        `)
        .eq('user_id', profile.id);

      if (!enrollError && enrollments) {
        const enrolled = enrollments
          .map((e: any) => e.hackathons)
          .filter(Boolean);
        setEnrolledHackathons(enrolled);
      }

      // Fetch recommended hackathons (matching user skills)
      const { data: hackathons, error: hackError } = await supabase
        .from('hackathons')
        .select('*')
        .in('status', ['Upcoming', 'Ongoing']);

      if (!hackError && hackathons) {
        // Filter hackathons that match at least one user skill
        const enrolledIds = new Set(enrolledHackathons.map(h => h.id));
        const recommended = hackathons
          .filter((h: Hackathon) => {
            if (enrolledIds.has(h.id)) return false;
            return h.skills_required.some(skill => profile.skills.includes(skill));
          })
          .slice(0, 6);
        setRecommendedHackathons(recommended);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMatchingSkills = (hackathon: Hackathon): string[] => {
    if (!profile) return [];
    return hackathon.skills_required.filter(skill => profile.skills.includes(skill));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{profile?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-muted-foreground">
            Discover hackathons, connect with teammates, and build something amazing.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Profile & Enrolled */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <ProfileCard enrolledCount={enrolledHackathons.length} />

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-5"
            >
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/hackathons">
                  <Button variant="ghost" className="w-full justify-start">
                    <Trophy className="h-4 w-4 mr-3 text-primary" />
                    Browse All Hackathons
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/team-match">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-3 text-secondary" />
                    Find Teammates
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Enrolled Hackathons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  Enrolled Hackathons
                </h3>
                <span className="text-xs text-muted-foreground">
                  {enrolledHackathons.length} total
                </span>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : enrolledHackathons.length > 0 ? (
                <div className="space-y-3">
                  {enrolledHackathons.slice(0, 3).map((hackathon, index) => (
                    <EnrolledHackathonCard
                      key={hackathon.id}
                      hackathon={hackathon}
                      index={index}
                    />
                  ))}
                  {enrolledHackathons.length > 3 && (
                    <Link to="/hackathons">
                      <Button variant="ghost" size="sm" className="w-full">
                        View all {enrolledHackathons.length} hackathons
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No hackathons enrolled yet
                  </p>
                  <Link to="/hackathons">
                    <Button size="sm" className="btn-honey">
                      Browse Hackathons
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column - Recommendations */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Recommended for You
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Based on your skills: {profile?.skills.slice(0, 3).join(', ')}
                    {profile?.skills && profile.skills.length > 3 && ` +${profile.skills.length - 3} more`}
                  </p>
                </div>
                <Link to="/hackathons">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-80 rounded-2xl" />
                  ))}
                </div>
              ) : recommendedHackathons.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendedHackathons.map((hackathon, index) => (
                    <RecommendedHackathonCard
                      key={hackathon.id}
                      hackathon={hackathon}
                      matchingSkills={getMatchingSkills(hackathon)}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-2">No recommendations yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your profile with more skills to get personalized recommendations
                  </p>
                  <Link to="/profile">
                    <Button className="btn-honey">
                      Update Skills
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
