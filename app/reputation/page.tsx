"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Star,
  Trophy,
  TrendingUp,
  Calendar,
  Download,
  Share2,
  Award,
  Target,
  BarChart3,
  Vote,
  CheckCircle,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

interface ReputationActivity {
  id: string
  type: "poll_created" | "poll_answered" | "helpful_vote" | "badge_earned"
  title: string
  description: string
  points: number
  date: string
  pollId?: string
}

interface UserBadge {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  earnedAt: string
}

interface UserProfile {
  id: string
  username: string
  reputation: number
  level: string
  joinDate: string
  totalPolls: number
  totalVotes: number
}

export default function ReputationPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<ReputationActivity[]>([])
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [reputationHistory, setReputationHistory] = useState<Array<{ date: string; reputation: number }>>([])

  const headerReveal = useScrollReveal()
  const statsReveal = useScrollReveal()
  const contentReveal = useScrollReveal()

  useEffect(() => {
    // Load user profile
    const savedProfile = localStorage.getItem("mocaPulseProfile")
    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      setUserProfile({
        id: profile.id,
        username: profile.username,
        reputation: profile.reputation,
        level: getReputationLevel(profile.reputation).level,
        joinDate: profile.joinDate,
        totalPolls: 3,
        totalVotes: 12,
      })
    }

    // Mock reputation activities
    setActivities([
      {
        id: "1",
        type: "poll_answered",
        title: "Answered NFT Marketplace Preferences",
        description: "Provided valuable feedback on marketplace features",
        points: 10,
        date: "2024-01-15",
        pollId: "poll_3",
      },
      {
        id: "2",
        type: "poll_created",
        title: "Created Web3 Development Framework Poll",
        description: "Poll received 24 responses from the community",
        points: 15,
        date: "2024-01-12",
        pollId: "poll_1",
      },
      {
        id: "3",
        type: "helpful_vote",
        title: "Received Helpful Vote",
        description: "Your response was marked as helpful by other users",
        points: 5,
        date: "2024-01-10",
      },
      {
        id: "4",
        type: "badge_earned",
        title: "Earned Active Contributor Badge",
        description: "Participated in 10+ polls this month",
        points: 25,
        date: "2024-01-08",
      },
      {
        id: "5",
        type: "poll_answered",
        title: "Answered Blockchain Scalability Solutions",
        description: "Shared insights on Layer 2 scaling solutions",
        points: 10,
        date: "2024-01-05",
        pollId: "poll_4",
      },
    ])

    // Mock badges
    setBadges([
      {
        id: "1",
        name: "Active Contributor",
        description: "Participated in 10+ polls",
        icon: "🏆",
        rarity: "rare",
        earnedAt: "2024-01-08",
      },
      {
        id: "2",
        name: "Poll Creator",
        description: "Created your first poll",
        icon: "🎯",
        rarity: "common",
        earnedAt: "2024-01-12",
      },
      {
        id: "3",
        name: "Community Helper",
        description: "Received 5+ helpful votes",
        icon: "🤝",
        rarity: "common",
        earnedAt: "2024-01-10",
      },
    ])

    // Mock reputation history
    setReputationHistory([
      { date: "2024-01-01", reputation: 100 },
      { date: "2024-01-05", reputation: 110 },
      { date: "2024-01-08", reputation: 135 },
      { date: "2024-01-10", reputation: 140 },
      { date: "2024-01-12", reputation: 155 },
      { date: "2024-01-15", reputation: 165 },
    ])
  }, [])

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 1000) return { level: "Expert", color: "text-yellow-500", next: "Master", nextThreshold: 2000 }
    if (reputation >= 500) return { level: "Advanced", color: "text-blue-500", next: "Expert", nextThreshold: 1000 }
    if (reputation >= 200)
      return { level: "Intermediate", color: "text-green-500", next: "Advanced", nextThreshold: 500 }
    return { level: "Beginner", color: "text-gray-500", next: "Intermediate", nextThreshold: 200 }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "poll_created":
        return <Target className="w-4 h-4 text-blue-500" />
      case "poll_answered":
        return <Vote className="w-4 h-4 text-green-500" />
      case "helpful_vote":
        return <TrendingUp className="w-4 h-4 text-purple-500" />
      case "badge_earned":
        return <Award className="w-4 h-4 text-yellow-500" />
      default:
        return <Star className="w-4 h-4 text-gray-500" />
    }
  }

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500"
      case "epic":
        return "bg-gradient-to-r from-purple-400 to-pink-500"
      case "rare":
        return "bg-gradient-to-r from-blue-400 to-cyan-500"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500"
    }
  }

  const exportCredentials = () => {
    if (!userProfile) return

    const credentials = {
      user: userProfile,
      reputation: userProfile.reputation,
      level: userProfile.level,
      badges: badges,
      activities: activities,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(credentials, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `moca-pulse-credentials-${userProfile.username}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Profile Required</CardTitle>
            <CardDescription>Please create your profile first to view your reputation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/profile">Create Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const levelInfo = getReputationLevel(userProfile.reputation)
  const progressToNext = ((userProfile.reputation - (levelInfo.nextThreshold - 300)) / 300) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header
        ref={headerReveal.ref}
        className={`border-b border-border/50 backdrop-blur-sm bg-background/80 transition-all duration-1000 ease-out ${
          headerReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MP</span>
              </div>
              <span className="text-xl font-bold text-foreground">Reputation</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportCredentials}>
              <Download className="w-4 h-4 mr-2" />
              Export Credentials
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <div
          ref={statsReveal.ref}
          className={`mb-8 transition-all duration-1000 ease-out delay-200 ${
            statsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${userProfile.id}`} />
                    <AvatarFallback className="text-2xl font-bold">
                      {userProfile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{userProfile.username}</h1>
                    <div className="flex items-center space-x-2 mb-2">
                      <UIBadge variant="secondary" className={levelInfo.color}>
                        <Star className="w-4 h-4 mr-1" />
                        {levelInfo.level}
                      </UIBadge>
                      <UIBadge variant="outline">{userProfile.reputation} Reputation</UIBadge>
                    </div>
                    <p className="text-muted-foreground">Member since {userProfile.joinDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-primary mb-2">{userProfile.reputation}</div>
                  <div className="text-sm text-muted-foreground">Reputation Score</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to {levelInfo.next}</span>
                    <span>
                      {userProfile.reputation}/{levelInfo.nextThreshold}
                    </span>
                  </div>
                  <Progress value={Math.max(0, Math.min(100, progressToNext))} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {levelInfo.nextThreshold - userProfile.reputation} points to next level
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-500">{userProfile.totalPolls}</div>
                    <div className="text-sm text-muted-foreground">Polls Created</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">{userProfile.totalVotes}</div>
                    <div className="text-sm text-muted-foreground">Polls Answered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-500">{badges.length}</div>
                    <div className="text-sm text-muted-foreground">Badges Earned</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div
          ref={contentReveal.ref}
          className={`transition-all duration-1000 ease-out delay-400 ${
            contentReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="badges">Badges</TabsTrigger>
              <TabsTrigger value="growth">Growth</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Recent Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activities.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3">
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <UIBadge variant="secondary" className="text-xs">
                                +{activity.points} Rep
                              </UIBadge>
                              <span className="text-xs text-muted-foreground">{activity.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Latest Badges
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {badges.slice(0, 4).map((badge) => (
                        <div
                          key={badge.id}
                          className={`p-3 rounded-lg text-center text-white ${getBadgeRarityColor(badge.rarity)}`}
                        >
                          <div className="text-2xl mb-1">{badge.icon}</div>
                          <div className="text-xs font-medium">{badge.name}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Reputation Breakdown</CardTitle>
                  <CardDescription>How you earned your reputation points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-500">45</div>
                      <div className="text-sm text-muted-foreground">Poll Creation</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <Vote className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-500">120</div>
                      <div className="text-sm text-muted-foreground">Poll Participation</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-500">25</div>
                      <div className="text-sm text-muted-foreground">Helpful Votes</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                      <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-500">75</div>
                      <div className="text-sm text-muted-foreground">Badge Rewards</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Activity History
                  </CardTitle>
                  <CardDescription>Complete history of your reputation-earning activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <UIBadge variant="secondary">+{activity.points} Rep</UIBadge>
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  <span>{activity.date}</span>
                                </div>
                              </div>
                            </div>
                            {activity.pollId && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/polls/${activity.pollId}`}>
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Badges Tab */}
            <TabsContent value="badges" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Badge Collection
                  </CardTitle>
                  <CardDescription>Badges earned through your participation and contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                      <Card key={badge.id} className="text-center">
                        <CardContent className="p-6">
                          <div
                            className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white ${getBadgeRarityColor(
                              badge.rarity,
                            )}`}
                          >
                            {badge.icon}
                          </div>
                          <h3 className="font-semibold mb-2">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                          <div className="flex items-center justify-center space-x-2">
                            <UIBadge variant="outline" className="capitalize">
                              {badge.rarity}
                            </UIBadge>
                            <div className="text-xs text-muted-foreground">Earned {badge.earnedAt}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Badges</CardTitle>
                  <CardDescription>Badges you can earn through continued participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center opacity-60">
                      <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center text-xl">
                        🎖️
                      </div>
                      <h4 className="font-medium mb-1">Survey Master</h4>
                      <p className="text-sm text-muted-foreground">Create 10 polls</p>
                      <Progress value={30} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">3/10 polls created</p>
                    </div>
                    <div className="p-4 border-2 border-dashed border-muted rounded-lg text-center opacity-60">
                      <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3 flex items-center justify-center text-xl">
                        🌟
                      </div>
                      <h4 className="font-medium mb-1">Reputation Star</h4>
                      <p className="text-sm text-muted-foreground">Reach 500 reputation</p>
                      <Progress value={33} className="mt-2" />
                      <p className="text-xs text-muted-foreground mt-1">{userProfile.reputation}/500 reputation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Growth Tab */}
            <TabsContent value="growth" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Reputation Growth
                  </CardTitle>
                  <CardDescription>Track your reputation progress over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-500">+65</div>
                        <div className="text-sm text-muted-foreground">This Month</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">+25</div>
                        <div className="text-sm text-muted-foreground">This Week</div>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-500">4.3</div>
                        <div className="text-sm text-muted-foreground">Avg per Day</div>
                      </div>
                    </div>
                    <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Reputation growth chart would be displayed here</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Milestones</CardTitle>
                  <CardDescription>Key achievements in your reputation journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-medium">Reached Beginner Level</p>
                        <p className="text-sm text-muted-foreground">Started with 100 reputation points</p>
                      </div>
                      <UIBadge variant="secondary">Completed</UIBadge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="font-medium">First Poll Created</p>
                        <p className="text-sm text-muted-foreground">Created your first community poll</p>
                      </div>
                      <UIBadge variant="secondary">Completed</UIBadge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-6 h-6 border-2 border-muted rounded-full"></div>
                      <div>
                        <p className="font-medium">Reach Intermediate Level</p>
                        <p className="text-sm text-muted-foreground">Get to 200 reputation points</p>
                      </div>
                      <UIBadge variant="outline">35 points to go</UIBadge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
