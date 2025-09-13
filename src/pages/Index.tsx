import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Award, Target, Book, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Import images
import heroBackground from "@/assets/hero-background.jpg";
import moodHappy from "@/assets/mood-happy.png";
import moodSad from "@/assets/mood-sad.png";
import moodStressed from "@/assets/mood-stressed.png";
import moodCalm from "@/assets/mood-calm.png";
import moodExcited from "@/assets/mood-excited.png";
import badgeTrophy from "@/assets/badge-trophy.png";
import badgeCrown from "@/assets/badge-crown.png";
import exerciseDeskStretch from "@/assets/exercise-desk-stretch.jpg";
import exerciseMeditation from "@/assets/exercise-meditation.jpg";
import exerciseBreathing from "@/assets/exercise-breathing.jpg";
import exerciseYoga from "@/assets/exercise-yoga.jpg";

// Types
interface MoodRecord {
  date: string;
  mood: number;
  note: string;
  sentiment?: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  image: string;
  instructions: string[];
  category: 'breathing' | 'movement' | 'mindfulness' | 'stretching';
}

// Constants
const MOODS = [
  { value: 1, label: "Very Sad", image: moodSad, color: "bg-purple-100" },
  { value: 2, label: "Sad", image: moodSad, color: "bg-blue-100" },
  { value: 3, label: "Neutral", image: moodCalm, color: "bg-wellness-peace" },
  { value: 4, label: "Happy", image: moodHappy, color: "bg-wellness-calm" },
  { value: 5, label: "Very Happy", image: moodExcited, color: "bg-wellness-energy" },
];

const EXERCISES: Exercise[] = [
  {
    id: "desk-stretch",
    title: "Desk Stretches",
    description: "Quick stretches to relieve study tension",
    duration: "5 minutes",
    image: exerciseDeskStretch,
    category: "stretching",
    instructions: [
      "Sit up straight in your chair",
      "Roll your shoulders backwards 10 times",
      "Gently turn your head left and right",
      "Stretch your arms overhead and hold for 15 seconds",
      "Do neck rolls slowly and carefully"
    ]
  },
  {
    id: "meditation",
    title: "Mindful Meditation",
    description: "Calm your mind and reduce stress",
    duration: "10 minutes",
    image: exerciseMeditation,
    category: "mindfulness",
    instructions: [
      "Find a quiet, comfortable place to sit",
      "Close your eyes and take deep breaths",
      "Focus on your breathing rhythm",
      "Notice thoughts without judgment",
      "Continue for 10 minutes, start with 3-5 if new to meditation"
    ]
  },
  {
    id: "breathing",
    title: "Box Breathing",
    description: "Structured breathing for anxiety relief",
    duration: "3 minutes",
    image: exerciseBreathing,
    category: "breathing",
    instructions: [
      "Inhale slowly for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly for 4 counts",
      "Hold empty lungs for 4 counts",
      "Repeat this cycle 8-10 times"
    ]
  },
  {
    id: "yoga",
    title: "Study Break Yoga",
    description: "Gentle yoga poses for students",
    duration: "8 minutes",
    image: exerciseYoga,
    category: "movement",
    instructions: [
      "Start in child's pose for 30 seconds",
      "Move to downward dog and hold for 1 minute",
      "Step forward into forward fold",
      "Rise slowly to mountain pose",
      "Repeat sequence 3 times mindfully"
    ]
  }
];

const MOTIVATIONAL_QUOTES = [
  "Every small step towards wellness counts.",
  "Your mental health is a priority, not a luxury.",
  "Progress, not perfection, is the goal.",
  "You are capable of amazing things.",
  "Take care of your mind, it's your greatest asset.",
  "Healing is not linear, be patient with yourself.",
  "Your feelings are valid and temporary.",
  "Growth happens outside your comfort zone."
];

const Index = () => {
  const [view, setView] = useState<'dashboard' | 'checkin' | 'exercises' | 'trends'>('dashboard');
  const [selectedMood, setSelectedMood] = useState<number>(3);
  const [note, setNote] = useState("");
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentQuote, setCurrentQuote] = useState(0);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wellness-records");
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = records.find(r => r.date === today);
  const streak = calculateStreak(records);
  const avgMood = records.length > 0 ? (records.reduce((sum, r) => sum + r.mood, 0) / records.length).toFixed(1) : "N/A";

  // Sentiment analysis (mock)
  const analyzeSentiment = (text: string): string => {
    const positive = ["happy", "good", "great", "amazing", "wonderful", "excited", "joy"];
    const negative = ["sad", "bad", "terrible", "awful", "depressed", "anxious", "worried"];
    
    const words = text.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positive.some(p => word.includes(p))).length;
    const negativeCount = words.filter(word => negative.some(n => word.includes(n))).length;
    
    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  };

  const handleCheckIn = () => {
    const newRecord: MoodRecord = {
      date: today,
      mood: selectedMood,
      note,
      sentiment: note ? analyzeSentiment(note) : undefined
    };

    const updatedRecords = records.filter(r => r.date !== today).concat(newRecord);
    setRecords(updatedRecords);
    localStorage.setItem("wellness-records", JSON.stringify(updatedRecords));
    
    setNote("");
    setView("dashboard");
    
    toast({
      title: "Check-in saved!",
      description: "Your mood has been recorded. Keep up the great work!",
    });
  };

  function calculateStreak(records: MoodRecord[]): number {
    if (records.length === 0) return 0;
    
    const sortedDates = records.map(r => new Date(r.date)).sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (const recordDate of sortedDates) {
      const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === streak) {
        streak++;
        currentDate = recordDate;
      } else {
        break;
      }
    }
    
    return streak;
  }

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { image: badgeCrown, text: "Wellness Champion! 30 day streak!" };
    if (streak >= 7) return { image: badgeTrophy, text: "Great job! 7 day streak!" };
    if (streak >= 3) return { image: badgeTrophy, text: "Getting consistent! 3 day streak!" };
    return null;
  };

  const chartData = records.slice(-30).map(record => ({
    date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: record.mood
  }));

  const badge = getStreakBadge(streak);

  return (
    <div 
      className="min-h-screen bg-gradient-hero relative"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-wellness-calm bg-clip-text text-transparent mb-2">
            Student Wellness Monitor
          </h1>
          <p className="text-muted-foreground">Track your mental health journey with daily check-ins and personalized wellness</p>
          
          {/* Motivational Quote */}
          <Card className="mt-4 bg-gradient-card border-wellness-peace/30 shadow-soft">
            <CardContent className="pt-4">
              <p className="italic text-primary font-medium">"{MOTIVATIONAL_QUOTES[currentQuote]}"</p>
            </CardContent>
          </Card>
        </header>

        {/* Achievement Badge */}
        {badge && (
          <Card className="mb-6 bg-gradient-to-r from-wellness-energy/20 to-wellness-growth/20 border-wellness-energy/50">
            <CardContent className="flex items-center space-x-4 pt-4">
              <img src={badge.image} alt="Achievement" className="w-16 h-16" />
              <div>
                <h3 className="font-bold text-wellness-growth">Achievement Unlocked!</h3>
                <p className="text-sm">{badge.text}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-card rounded-full p-1 shadow-soft">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { key: 'checkin', label: 'Check-in', icon: Heart },
              { key: 'exercises', label: 'Exercises', icon: Target },
              { key: 'trends', label: 'Trends', icon: Calendar },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={view === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setView(key as any)}
                className="flex items-center space-x-2 px-4"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main>
          {view === 'dashboard' && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Today's Status */}
              <Card className="bg-gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-primary" />
                    <span>Today's Wellness</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayRecord ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={MOODS.find(m => m.value === todayRecord.mood)?.image} 
                          alt="mood" 
                          className="w-12 h-12"
                        />
                        <div>
                          <p className="font-medium">{MOODS.find(m => m.value === todayRecord.mood)?.label}</p>
                          {todayRecord.sentiment && (
                            <Badge variant="secondary" className="text-xs">
                              {todayRecord.sentiment} sentiment
                            </Badge>
                          )}
                        </div>
                      </div>
                      {todayRecord.note && (
                        <p className="text-sm text-muted-foreground italic">"{todayRecord.note}"</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">No check-in yet today</p>
                      <Button onClick={() => setView('checkin')}>Start Check-in</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span>Your Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Streak</span>
                      <span className="font-bold text-primary">{streak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Mood</span>
                      <span className="font-bold text-primary">{avgMood}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Check-ins</span>
                      <span className="font-bold text-primary">{records.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Chart */}
              {records.length > 0 && (
                <Card className="md:col-span-2 bg-gradient-card shadow-soft">
                  <CardHeader>
                    <CardTitle>Recent Mood Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData.slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {view === 'checkin' && (
            <Card className="max-w-2xl mx-auto bg-gradient-card shadow-soft">
              <CardHeader>
                <CardTitle>Daily Wellness Check-in</CardTitle>
                <p className="text-muted-foreground">How are you feeling today?</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mood Selection */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Select your mood</label>
                  <div className="grid grid-cols-5 gap-3">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => setSelectedMood(mood.value)}
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          selectedMood === mood.value 
                            ? 'border-primary shadow-glow bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img src={mood.image} alt={mood.label} className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-xs text-center font-medium">{mood.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label htmlFor="note" className="text-sm font-medium mb-2 block">
                    How was your day? (Optional)
                  </label>
                  <Textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Share any thoughts, feelings, or experiences from today..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button onClick={handleCheckIn} className="w-full">
                  Save Check-in
                </Button>
              </CardContent>
            </Card>
          )}

          {view === 'exercises' && (
            <div className="space-y-6">
              {!selectedExercise ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Wellness Exercises</h2>
                    <p className="text-muted-foreground">Choose an exercise to boost your wellbeing</p>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {EXERCISES.map((exercise) => (
                      <Card 
                        key={exercise.id} 
                        className="cursor-pointer hover:shadow-glow transition-all bg-gradient-card shadow-soft"
                        onClick={() => setSelectedExercise(exercise)}
                      >
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img 
                            src={exercise.image} 
                            alt={exercise.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{exercise.title}</h3>
                            <Badge variant="secondary">{exercise.duration}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Card className="max-w-3xl mx-auto bg-gradient-card shadow-soft">
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img 
                      src={selectedExercise.image} 
                      alt={selectedExercise.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedExercise.title}</h2>
                        <p className="text-muted-foreground">{selectedExercise.description}</p>
                      </div>
                      <Badge className="ml-4">{selectedExercise.duration}</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Instructions:</h3>
                      <ol className="space-y-2">
                        {selectedExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <Button onClick={() => setSelectedExercise(null)} variant="outline">
                        Back to Exercises
                      </Button>
                      <Button>Start Exercise</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {view === 'trends' && (
            <div className="space-y-6">
              <Card className="bg-gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle>Mood Trends (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  {records.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[1, 5]} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="mood" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No data yet. Start with daily check-ins to see your trends!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Insights */}
              {records.length > 7 && (
                <Card className="bg-gradient-card shadow-soft">
                  <CardHeader>
                    <CardTitle>Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-wellness-calm/20 rounded-lg">
                        <h4 className="font-medium">Best Day</h4>
                        <p className="text-sm text-muted-foreground">
                          {records.reduce((best, current) => current.mood > best.mood ? current : best).date}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-wellness-peace/20 rounded-lg">
                        <h4 className="font-medium">Average</h4>
                        <p className="text-sm text-muted-foreground">{avgMood}/5</p>
                      </div>
                      <div className="text-center p-4 bg-wellness-growth/20 rounded-lg">
                        <h4 className="font-medium">Improvement</h4>
                        <p className="text-sm text-muted-foreground">
                          {records.slice(-7).reduce((sum, r) => sum + r.mood, 0) / 7 > 
                           records.slice(-14, -7).reduce((sum, r) => sum + r.mood, 0) / 7 ? "↗️ Trending up" : "Keep going!"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;