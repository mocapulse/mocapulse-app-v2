"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Eye,
  Vote,
  Calendar,
  User,
} from "lucide-react"
import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

interface Poll {
  id: string
  title: string
  description: string
  status: "active" | "closed" | "draft"
  responses: number
  totalVotes: number
  endDate: string
  createdBy: string
  category: string
}

interface UserProfile {
  id: string
  username: string
  reputation: number
  role: "builder" | "contributor" | "both"
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userPolls, setUserPolls] = useState<Poll[]>([])
  const [availablePolls, setAvailablePolls] = useState<Poll[]>([])
  const [activeTab, setActiveTab] = useState("overview")

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
        role: "both", // Default to both for demo
      })
    }

    // Mock data for polls
    setUserPolls([
      {
        id: "poll_1",
        title: "Best Web3 Development Framework",
        description: "Help us understand developer preferences for Web3 frameworks",
        status: "active",
        responses: 24,
        totalVotes: 50,
        endDate: "2024-01-15",
        createdBy: "user_123",
        category: "Technology",
      },
      {
        id: "poll_2",
        title: "DeFi Protocol User Experience",
        description: "Rate your experience with different DeFi protocols",
        status: "closed",
        responses: 156,
        totalVotes: 156,
        endDate: "2023-12-20",
        createdBy: "user_123",
        category: "Finance",
      },
    ])

    setAvailablePolls([
      {
        id: "poll_3",
        title: "NFT Marketplace Preferences",
        description: "Which NFT marketplace features matter most to you?",
        status: "active",
        responses: 89,
        totalVotes: 200,
        endDate: "2024-01-20",
        createdBy: "user_456",
        category: "NFTs",
      },
      {
        id: "poll_4",
        title: "Blockchain Scalability Solutions",
        description: "Share your thoughts on Layer 2 scaling solutions",
        status: "active",
        responses: 45,
        totalVotes: 100,
        endDate: "2024-01-18",
        createdBy: "user_789",
        category: "Technology",
      },
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      case "draft":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "closed":
        return <XCircle className="w-4 h-4" />
      case "draft":
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Profile Required</CardTitle>
            <CardDescription>Please create your profile first to access the dashboard.</CardDescription>
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
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MP</span>
            </div>
            <span className="text-xl font-bold text-foreground">Moca Pulse</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${userProfile.id}`} />
              <AvatarFallback>{userProfile.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div
          ref={statsReveal.ref}
          className={`mb-8 transition-all duration-1000 ease-out delay-200 ${
            statsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.username}!</h1>
              <p className="text-muted-foreground">Manage your polls and track your reputation progress.</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold">{userProfile.reputation}</span>
              </div>
              <p className="text-sm text-muted-foreground">Reputation Score</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{userPolls.length}</p>
                    <p className="text-sm text-muted-foreground">Polls Created</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Vote className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Polls Answered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">180</p>
                    <p className="text-sm text-muted-foreground">Total Responses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-accent" />
                  <div>
                    <p className="text-2xl font-bold">+25</p>
                    <p className="text-sm text-muted-foreground">Rep This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div
          ref={contentReveal.ref}
          className={`transition-all duration-1000 ease-out delay-400 ${
            contentReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="contributor">Contributor</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Activity
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Answered "NFT Marketplace Preferences"</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                        <Badge variant="secondary">+10 Rep</Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Created "Web3 Development Framework" poll</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                        <Badge variant="secondary">+5 Rep</Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Poll reached 50 responses</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                        <Badge variant="secondary">+15 Rep</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Reputation Progress
                      <Star className="w-5 h-5 text-yellow-500" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Current Level: Intermediate</span>
                          <span>{userProfile.reputation}/500</span>
                        </div>
                        <Progress value={(userProfile.reputation / 500) * 100} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Next milestone: Advanced (500 reputation)</p>
                        <p className="mt-2">Ways to earn reputation:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Answer polls (+10 rep each)</li>
                          <li>Create popular polls (+5-20 rep)</li>
                          <li>Receive positive feedback (+1-5 rep)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Builder Tab */}
            <TabsContent value="builder" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Polls</h2>
                <Button asChild>
                  <Link href="/polls/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Poll
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {userPolls.map((poll) => (
                  <Card key={poll.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{poll.title}</h3>
                            <Badge variant="secondary" className={`${getStatusColor(poll.status)} text-white`}>
                              {getStatusIcon(poll.status)}
                              <span className="ml-1 capitalize">{poll.status}</span>
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{poll.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{poll.responses} responses</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Ends {poll.endDate}</span>
                            </div>
                            <Badge variant="outline">{poll.category}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${poll.id}/results`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Results
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${poll.id}`}>
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Manage
                            </Link>
                          </Button>
                        </div>
                      </div>
                      {poll.status === "active" && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Response Progress</span>
                            <span>
                              {poll.responses}/{poll.totalVotes}
                            </span>
                          </div>
                          <Progress value={(poll.responses / poll.totalVotes) * 100} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Contributor Tab */}
            <TabsContent value="contributor" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Available Polls</h2>
                <Button variant="outline" asChild>
                  <Link href="/polls">
                    <Eye className="w-4 h-4 mr-2" />
                    Browse All
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {availablePolls.map((poll) => (
                  <Card key={poll.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{poll.title}</h3>
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Active
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{poll.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{poll.responses} responses</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Ends {poll.endDate}</span>
                            </div>
                            <Badge variant="outline">{poll.category}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" asChild>
                            <Link href={`/polls/${poll.id}/participate`}>
                              <Vote className="w-4 h-4 mr-1" />
                              Participate
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${poll.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Participation Progress</span>
                          <span>
                            {poll.responses}/{poll.totalVotes}
                          </span>
                        </div>
                        <Progress value={(poll.responses / poll.totalVotes) * 100} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Reputation Summary</CardTitle>
                  <CardDescription>Your contribution activity at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-sm text-muted-foreground">Polls Answered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">120</div>
                      <div className="text-sm text-muted-foreground">Rep from Polls</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">8</div>
                      <div className="text-sm text-muted-foreground">Helpful Votes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">3</div>
                      <div className="text-sm text-muted-foreground">Badges Earned</div>
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
