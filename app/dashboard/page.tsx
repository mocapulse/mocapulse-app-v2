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

interface TestingProject {
  id: string
  title: string
  description: string
  status: "active" | "closed" | "draft" | "completed"
  applicationsReceived: number
  testersNeeded: number
  endDate: string
  createdBy: string
  category: string
  paymentRange: { min: number; max: number }
  difficulty: string
}

interface TestingApplication {
  id: string
  projectId: string
  projectTitle: string
  status: "pending" | "accepted" | "rejected" | "completed"
  appliedDate: string
  category: string
  paymentRange: { min: number; max: number }
}

interface UserProfile {
  id: string
  username: string
  reputation: number
  role: "builder" | "contributor" | "both"
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userProjects, setUserProjects] = useState<TestingProject[]>([])
  const [myApplications, setMyApplications] = useState<TestingApplication[]>([])
  const [activeTab, setActiveTab] = useState("overview")


  useEffect(() => {
    // Ensure this only runs on client side
    if (typeof window === 'undefined') return;

    // Load user profile
    const savedProfile = localStorage.getItem("mocaEdgeProfile")
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setUserProfile({
          id: profile.id,
          username: profile.username,
          reputation: profile.reputation,
          role: "both", // Default to both for demo
        })
      } catch (error) {
        console.error('Failed to parse saved profile:', error)
        // Create demo profile on error
        const demoProfile = {
          id: "demo_user",
          username: "Demo User",
          reputation: 165,
          role: "both" as const
        }
        setUserProfile(demoProfile)
        localStorage.setItem("mocaEdgeProfile", JSON.stringify(demoProfile))
      }
    } else {
      // Create a demo profile if none exists
      const demoProfile = {
        id: "demo_user",
        username: "Demo User",
        reputation: 165,
        role: "both" as const
      }
      setUserProfile(demoProfile)
      // Optionally save demo profile to localStorage
      localStorage.setItem("mocaEdgeProfile", JSON.stringify(demoProfile))
    }

    // Mock data for user's testing projects (for enterprises)
    setUserProjects([
      {
        id: "project_1",
        title: "Revolutionary NFT Marketplace Beta Testing",
        description: "Test our new NFT marketplace features including minting, trading, and collection management",
        status: "active",
        applicationsReceived: 12,
        testersNeeded: 25,
        endDate: "2024-02-15",
        createdBy: "demo_user",
        category: "NFT Platform",
        paymentRange: { min: 200, max: 500 },
        difficulty: "Advanced"
      },
      {
        id: "project_2",
        title: "Mobile Gaming App UX Testing",
        description: "Help us test our Web3 mobile game user experience and gameplay mechanics",
        status: "completed",
        applicationsReceived: 30,
        testersNeeded: 30,
        endDate: "2024-01-30",
        createdBy: "demo_user",
        category: "Gaming",
        paymentRange: { min: 150, max: 350 },
        difficulty: "Intermediate"
      },
    ])

    // Mock data for tester applications
    setMyApplications([
      {
        id: "app_1",
        projectId: "project_3",
        projectTitle: "DeFi Protocol Security Testing",
        status: "accepted",
        appliedDate: "2024-01-15",
        category: "DeFi Protocol",
        paymentRange: { min: 300, max: 750 }
      },
      {
        id: "app_2",
        projectId: "project_4",
        projectTitle: "E-commerce AR Shopping Experience",
        status: "pending",
        appliedDate: "2024-01-18",
        category: "E-commerce",
        paymentRange: { min: 200, max: 450 }
      },
      {
        id: "app_3",
        projectId: "project_5",
        projectTitle: "Social Web3 Platform Testing",
        status: "completed",
        appliedDate: "2024-01-10",
        category: "Social Platform",
        paymentRange: { min: 100, max: 250 }
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5" suppressHydrationWarning>
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ME</span>
            </div>
            <span className="text-xl font-bold text-foreground">Moca Edge</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link href="/browse">Browse Projects</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/create-project">Post Project</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/reputation">
                <User className="w-4 h-4 mr-2" />
                My Profile
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.username}!</h1>
              <p className="text-muted-foreground">Manage your testing projects and track your tester reputation.</p>
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
                    <p className="text-2xl font-bold">{userProjects.length}</p>
                    <p className="text-sm text-muted-foreground">Projects Posted</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Vote className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{myApplications.length}</p>
                    <p className="text-sm text-muted-foreground">Test Applications</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{userProjects.reduce((sum, p) => sum + p.applicationsReceived, 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
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
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="builder">My Projects</TabsTrigger>
              <TabsTrigger value="contributor">My Applications</TabsTrigger>
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
                          <p className="text-sm font-medium">Applied to "DeFi Protocol Security Testing"</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                        <Badge variant="secondary">Application Sent</Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Posted "NFT Marketplace Beta Testing"</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                        <Badge variant="secondary">+5 Rep</Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Completed testing for "Social Web3 Platform"</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                        <Badge variant="secondary">+25 Rep</Badge>
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
                          <li>Complete testing projects (+10-50 rep)</li>
                          <li>Post successful projects (+5-20 rep)</li>
                          <li>Receive high-quality ratings (+1-10 rep)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* My Projects Tab */}
            <TabsContent value="builder" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Testing Projects</h2>
                <Button asChild>
                  <Link href="/create-project">
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Project
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {userProjects.map((project) => (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{project.title}</h3>
                            <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white`}>
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{project.status}</span>
                            </Badge>
                            <Badge variant="outline">{project.difficulty}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{project.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{project.applicationsReceived} applications</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Deadline {project.endDate}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                              <span>${project.paymentRange.min}-{project.paymentRange.max}</span>
                            </div>
                            <Badge variant="outline">{project.category}</Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/projects/${project.id}/manage`}>
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Manage
                            </Link>
                          </Button>
                        </div>
                      </div>
                      {project.status === "active" && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Applications Progress</span>
                            <span>
                              {project.applicationsReceived}/{project.testersNeeded}
                            </span>
                          </div>
                          <Progress value={(project.applicationsReceived / project.testersNeeded) * 100} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* My Applications Tab */}
            <TabsContent value="contributor" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Testing Applications</h2>
                <Button variant="outline" asChild>
                  <Link href="/browse">
                    <Eye className="w-4 h-4 mr-2" />
                    Browse Projects
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                {myApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold">{application.projectTitle}</h3>
                            <Badge
                              variant="secondary"
                              className={`${
                                application.status === 'accepted' ? 'bg-green-500' :
                                application.status === 'pending' ? 'bg-yellow-500' :
                                application.status === 'rejected' ? 'bg-red-500' :
                                'bg-blue-500'
                              } text-white`}
                            >
                              <span className="capitalize">{application.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Applied {application.appliedDate}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600">
                              <span>${application.paymentRange.min}-{application.paymentRange.max}</span>
                            </div>
                            <Badge variant="outline">{application.category}</Badge>
                          </div>
                          {application.status === 'pending' && (
                            <p className="text-sm text-muted-foreground">
                              Your application is being reviewed by the project team.
                            </p>
                          )}
                          {application.status === 'accepted' && (
                            <p className="text-sm text-green-600 font-medium">
                              ✅ Congratulations! You've been selected for this testing project.
                            </p>
                          )}
                          {application.status === 'completed' && (
                            <p className="text-sm text-blue-600 font-medium">
                              🎉 Project completed successfully! Payment processed.
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/projects/${application.projectId}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Project
                            </Link>
                          </Button>
                          {application.status === 'accepted' && (
                            <Button size="sm" asChild>
                              <Link href={`/projects/${application.projectId}/test`}>
                                <Vote className="w-4 h-4 mr-1" />
                                Start Testing
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tester Stats</CardTitle>
                  <CardDescription>Your testing activity summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{myApplications.length}</div>
                      <div className="text-sm text-muted-foreground">Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{myApplications.filter(a => a.status === 'accepted').length}</div>
                      <div className="text-sm text-muted-foreground">Accepted</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">{myApplications.filter(a => a.status === 'completed').length}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-500">
                        ${myApplications.filter(a => a.status === 'completed').reduce((sum, a) => sum + a.paymentRange.max, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Earned</div>
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
