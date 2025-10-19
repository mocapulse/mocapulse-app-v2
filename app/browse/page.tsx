"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { SiteHeader } from "@/components/site-header"
import { useAirKit } from "@/contexts/airkit-context"
import {
  Search,
  Filter,
  Calendar,
  Users,
  Trophy,
  Star,
  Clock,
  CheckCircle,
  Plus,
  TrendingUp,
  Eye,
  Vote,
  Shield,
  Zap,
  Target,
  DollarSign,
  Timer,
  Award,
  ExternalLink,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Project {
  id: string
  title: string
  description: string
  company: string
  companyLogo?: string
  category: string
  status: "open" | "in-progress" | "closed"
  testersNeeded: number
  testersApplied: number
  paymentRange: {
    min: number
    max: number
  }
  duration: string
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  requirements: {
    minReputation: number
    specializations: string[]
    avgTurnaroundTime: number // hours
    qualityThreshold: number // percentage
  }
  features: string[]
  postedDate: string
  deadline: string
  tags: string[]
  urgent?: boolean
  featured?: boolean
  trending?: boolean
}

const CATEGORIES = [
  "All Categories",
  "Mobile App",
  "Web Application",
  "Web3 DApp",
  "NFT Platform",
  "DeFi Protocol",
  "Gaming",
  "FinTech",
  "E-commerce",
  "Social Platform",
  "Productivity",
  "Other"
]

const DIFFICULTY_LEVELS = [
  "All Levels",
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert"
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "payment", label: "Highest Payment" },
  { value: "deadline", label: "Deadline Soon" },
  { value: "openings", label: "Most Openings" },
  { value: "featured", label: "Featured First" }
]

export default function BrowseProjectsPage() {
  const { user, isAuthenticated } = useAirKit()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels")
  const [statusFilter, setStatusFilter] = useState("open")
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)

  // Remove scroll reveal for better performance and prevent spacing issues

  // Mock project data
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: "1",
        title: "Revolutionary NFT Marketplace",
        description: "Test our groundbreaking NFT marketplace with unique features like fractional ownership, AI-powered curation, and cross-chain trading. We need experienced testers to validate user flows and identify edge cases.",
        company: "CryptoInnovate",
        companyLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=cryptoinnovate&backgroundColor=3b82f6",
        category: "NFT Platform",
        status: "open",
        testersNeeded: 15,
        testersApplied: 8,
        paymentRange: { min: 200, max: 500 },
        duration: "2 weeks",
        difficulty: "advanced",
        requirements: {
          minReputation: 200,
          specializations: ["Web3 DApps", "NFT Platforms"],
          avgTurnaroundTime: 24,
          qualityThreshold: 85
        },
        features: ["Minting", "Trading", "Collection Management", "Fractional Ownership"],
        postedDate: "2024-01-20",
        deadline: "2024-02-15",
        tags: ["Web3", "NFTs", "Blockchain", "High Priority"],
        urgent: true,
        featured: true,
        trending: true
      },
      {
        id: "2",
        title: "Next-Gen DeFi Lending Protocol",
        description: "Help us test a revolutionary DeFi lending platform with innovative collateral mechanisms and flash loan capabilities. Security-focused testing required.",
        company: "DeFiSecure Labs",
        companyLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=defisecure&backgroundColor=10b981",
        category: "DeFi Protocol",
        status: "open",
        testersNeeded: 10,
        testersApplied: 12,
        paymentRange: { min: 300, max: 750 },
        duration: "3 weeks",
        difficulty: "expert",
        requirements: {
          minReputation: 300,
          specializations: ["DeFi Protocol", "Security Testing"],
          avgTurnaroundTime: 12,
          qualityThreshold: 90
        },
        features: ["Lending", "Borrowing", "Flash Loans", "Liquidations"],
        postedDate: "2024-01-18",
        deadline: "2024-02-20",
        tags: ["DeFi", "Security", "High Reward", "Expert Only"],
        urgent: true,
        featured: true
      },
      {
        id: "3",
        title: "Mobile Gaming: Web3 Adventure RPG",
        description: "Test our immersive Web3 RPG with play-to-earn mechanics, NFT characters, and token rewards. Focus on gameplay balance and user experience.",
        company: "GameFi Studios",
        companyLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=gamefi&backgroundColor=f59e0b",
        category: "Gaming",
        status: "open",
        testersNeeded: 25,
        testersApplied: 18,
        paymentRange: { min: 150, max: 350 },
        duration: "10 days",
        difficulty: "intermediate",
        requirements: {
          minReputation: 100,
          specializations: ["Gaming", "Mobile Apps"],
          avgTurnaroundTime: 48,
          qualityThreshold: 75
        },
        features: ["Combat System", "NFT Integration", "Token Rewards", "Multiplayer"],
        postedDate: "2024-01-22",
        deadline: "2024-02-10",
        tags: ["Gaming", "Mobile", "Play-to-Earn", "Fun"],
        trending: true
      },
      {
        id: "4",
        title: "AI-Powered FinTech Banking App",
        description: "Test our revolutionary banking app with AI-driven insights, instant crypto conversion, and smart budgeting tools. Focus on financial security and UX.",
        company: "NeoBank AI",
        companyLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=neobank&backgroundColor=8b5cf6",
        category: "FinTech",
        status: "open",
        testersNeeded: 20,
        testersApplied: 5,
        paymentRange: { min: 250, max: 400 },
        duration: "2 weeks",
        difficulty: "intermediate",
        requirements: {
          minReputation: 150,
          specializations: ["FinTech", "Mobile Apps"],
          avgTurnaroundTime: 36,
          qualityThreshold: 80
        },
        features: ["AI Insights", "Crypto Integration", "Smart Budgeting", "Instant Transfers"],
        postedDate: "2024-01-19",
        deadline: "2024-02-25",
        tags: ["FinTech", "AI", "Banking", "Innovation"],
        featured: true
      },
      {
        id: "5",
        title: "Social Web3 Platform: Decentralized Twitter",
        description: "Help test our decentralized social platform with token rewards, NFT profiles, and community governance. Looking for social media enthusiasts.",
        company: "SocialWeb3",
        companyLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=socialweb3&backgroundColor=ec4899",
        category: "Social Platform",
        status: "open",
        testersNeeded: 30,
        testersApplied: 22,
        paymentRange: { min: 100, max: 250 },
        duration: "1 week",
        difficulty: "beginner",
        requirements: {
          minReputation: 50,
          specializations: ["Social Platform", "Web3 DApps"],
          avgTurnaroundTime: 72,
          qualityThreshold: 70
        },
        features: ["Social Feed", "Token Rewards", "NFT Profiles", "Governance"],
        postedDate: "2024-01-21",
        deadline: "2024-02-05",
        tags: ["Social", "Community", "Beginner Friendly", "Quick"],
        trending: true
      },
      {
        id: "6",
        title: "E-commerce: AR Shopping Experience",
        description: "Test our innovative AR-powered e-commerce platform where users can virtually try products before buying. Focus on AR functionality and checkout flow.",
        company: "ARCommerce Inc",
        companyLogo: "https://api.dicebear.com/7.x/shapes/svg?seed=arcommerce&backgroundColor=ef4444",
        category: "E-commerce",
        status: "in-progress",
        testersNeeded: 15,
        testersApplied: 15,
        paymentRange: { min: 200, max: 450 },
        duration: "2 weeks",
        difficulty: "intermediate",
        requirements: {
          minReputation: 120,
          specializations: ["E-commerce", "Mobile Apps"],
          avgTurnaroundTime: 48,
          qualityThreshold: 78
        },
        features: ["AR Try-On", "Product Catalog", "Checkout", "Reviews"],
        postedDate: "2024-01-15",
        deadline: "2024-02-08",
        tags: ["AR", "Shopping", "Innovation", "Mobile"]
      }
    ]

    setProjects(mockProjects)
    setIsLoading(false)
  }, [])

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(project => project.category === selectedCategory)
    }

    // Difficulty filter
    if (selectedDifficulty !== "All Levels") {
      filtered = filtered.filter(project =>
        project.difficulty.toLowerCase() === selectedDifficulty.toLowerCase()
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(project => project.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "payment":
          return b.paymentRange.max - a.paymentRange.max
        case "deadline":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "openings":
          return (b.testersNeeded - b.testersApplied) - (a.testersNeeded - a.testersApplied)
        case "featured":
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        default: // newest
          return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      }
    })

    setFilteredProjects(filtered)
  }, [projects, searchQuery, selectedCategory, selectedDifficulty, statusFilter, sortBy])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Open</Badge>
      case "in-progress":
        return <Badge className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>
      case "closed":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Closed</Badge>
      default:
        return null
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      expert: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    }

    return (
      <Badge className={colors[difficulty as keyof typeof colors] || colors.beginner}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    )
  }

  const getTimeRemaining = (deadline: string) => {
    const now = new Date()
    const end = new Date(deadline)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return "Expired"
    if (days === 0) return "Due today"
    if (days === 1) return "1 day left"
    return `${days} days left`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading testing projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SiteHeader />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Browse Testing Projects
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Discover exciting testing opportunities from innovative companies. Apply for projects that match your skills and build your reputation as a trusted early tester.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{projects.filter(p => p.status === 'open').length}</div>
              <div className="text-sm text-muted-foreground">Open Projects</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">
                ${Math.max(...projects.map(p => p.paymentRange.max))}
              </div>
              <div className="text-sm text-muted-foreground">Top Reward</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + (p.testersNeeded - p.testersApplied), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Open Spots</div>
            </Card>
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold">{projects.filter(p => p.featured).length}</div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mb-4">
              <Search className="w-12 h-12 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or check back later for new opportunities.
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Card key={project.id} className={`hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                project.featured ? 'ring-2 ring-primary/20 shadow-lg' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={project.companyLogo} />
                        <AvatarFallback>{project.company.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{project.company}</p>
                        <p className="text-xs text-muted-foreground">{project.category}</p>
                      </div>
                    </div>
                    {project.featured && (
                      <Badge className="bg-gradient-to-r from-primary to-accent">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    <CardTitle className="text-lg leading-tight line-clamp-2">
                      {project.title}
                    </CardTitle>

                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(project.status)}
                      {getDifficultyBadge(project.difficulty)}
                      {project.urgent && (
                        <Badge className="bg-red-500">
                          <Zap className="w-3 h-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                      {project.trending && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span>${project.paymentRange.min}-{project.paymentRange.max}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-blue-500" />
                      <span>{project.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span>{project.testersNeeded - project.testersApplied} spots left</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>{getTimeRemaining(project.deadline)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Applications</span>
                      <span>{project.testersApplied}/{project.testersNeeded}</span>
                    </div>
                    <Progress
                      value={(project.testersApplied / project.testersNeeded) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Requirements</p>
                    <div className="flex flex-wrap gap-1">
                      {project.requirements.minReputation > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          {project.requirements.minReputation}+ Rep
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {project.requirements.avgTurnaroundTime}h Response
                      </Badge>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    {project.status === 'open' && (
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/projects/${project.id}/apply`}>
                          <Target className="w-4 h-4 mr-1" />
                          Apply Now
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Don't see a perfect match?</h3>
            <p className="text-muted-foreground mb-6">
              New testing opportunities are added daily. Build your reputation and get notified about projects that match your expertise.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link href="/reputation">
                  <Star className="w-4 h-4 mr-2" />
                  Build Your Profile
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}