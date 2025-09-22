"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ConnectButton } from "@/components/connect-button"
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
} from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Poll {
  id: string
  title: string
  description: string
  category: string
  type: "single" | "multiple"
  status: "active" | "closed" | "upcoming"
  responses: number
  totalVotes: number
  endDate: string
  createdBy: string
  createdByUsername: string
  isAnonymous: boolean
  requiresReputation: boolean
  minReputation: number
  reputationReward: number
  featured?: boolean
  trending?: boolean
}

const CATEGORIES = [
  "All Categories",
  "NFTs",
  "DeFi",
  "Gaming",
  "Community",
  "Governance",
  "Technology",
  "Culture",
  "Education"
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "ending-soon", label: "Ending Soon" },
  { value: "highest-reward", label: "Highest Reward" },
  { value: "trending", label: "Trending" }
]

export default function PollsPage() {
  const { user, isAuthenticated } = useAirKit()
  const [polls, setPolls] = useState<Poll[]>([])
  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("newest")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Mock poll data
  useEffect(() => {
    const mockPolls: Poll[] = [
      {
        id: "1",
        title: "NFT Marketplace Preferences",
        description: "Help us understand what features matter most to you in NFT marketplaces. Your feedback will shape the future of digital asset trading.",
        category: "NFTs",
        type: "multiple",
        status: "active",
        responses: 89,
        totalVotes: 200,
        endDate: "2024-02-15",
        createdBy: "user_456",
        createdByUsername: "CryptoBuilder",
        isAnonymous: false,
        requiresReputation: true,
        minReputation: 50,
        reputationReward: 15,
        featured: true,
        trending: true
      },
      {
        id: "2",
        title: "DeFi Protocol Security Standards",
        description: "What security measures do you consider most important for DeFi protocols?",
        category: "DeFi",
        type: "single",
        status: "active",
        responses: 156,
        totalVotes: 300,
        endDate: "2024-02-20",
        createdBy: "user_789",
        createdByUsername: "DefiExpert",
        isAnonymous: true,
        requiresReputation: true,
        minReputation: 100,
        reputationReward: 20,
        trending: true
      },
      {
        id: "3",
        title: "Gaming Token Economics",
        description: "Share your thoughts on sustainable tokenomics for blockchain games.",
        category: "Gaming",
        type: "multiple",
        status: "active",
        responses: 67,
        totalVotes: 150,
        endDate: "2024-02-10",
        createdBy: "user_123",
        createdByUsername: "GameDev",
        isAnonymous: false,
        requiresReputation: false,
        minReputation: 0,
        reputationReward: 10
      },
      {
        id: "4",
        title: "Community Governance Proposal",
        description: "Vote on the proposed changes to community guidelines and moderation policies.",
        category: "Governance",
        type: "single",
        status: "upcoming",
        responses: 0,
        totalVotes: 500,
        endDate: "2024-02-25",
        createdBy: "user_admin",
        createdByUsername: "MocaTeam",
        isAnonymous: false,
        requiresReputation: true,
        minReputation: 200,
        reputationReward: 25,
        featured: true
      },
      {
        id: "5",
        title: "Web3 Education Priorities",
        description: "What topics should we prioritize in our Web3 education initiatives?",
        category: "Education",
        type: "multiple",
        status: "closed",
        responses: 234,
        totalVotes: 234,
        endDate: "2024-01-30",
        createdBy: "user_edu",
        createdByUsername: "Web3Educator",
        isAnonymous: false,
        requiresReputation: false,
        minReputation: 0,
        reputationReward: 5
      }
    ]

    setPolls(mockPolls)
    setIsLoading(false)
  }, [])

  // Filter and sort polls
  useEffect(() => {
    let filtered = [...polls]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(poll =>
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.createdByUsername.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(poll => poll.category === selectedCategory)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(poll => poll.status === statusFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.responses - a.responses
        case "ending-soon":
          return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        case "highest-reward":
          return b.reputationReward - a.reputationReward
        case "trending":
          return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
        default: // newest
          return b.id.localeCompare(a.id)
      }
    })

    setFilteredPolls(filtered)
  }, [polls, searchQuery, selectedCategory, sortBy, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case "closed":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Closed</Badge>
      case "upcoming":
        return <Badge variant="outline"><Calendar className="w-3 h-3 mr-1" />Upcoming</Badge>
      default:
        return null
    }
  }

  const getTimeRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return "Ended"
    if (days === 0) return "Ends today"
    if (days === 1) return "1 day left"
    return `${days} days left`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MP</span>
            </div>
            <span className="text-xl font-bold text-foreground">Moca Pulse</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/polls/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Poll
              </Link>
            </Button>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore Polls</h1>
          <p className="text-muted-foreground text-lg">
            Discover polls, share your opinions, and build your reputation in the Moca community.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Vote className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{polls.length}</p>
                <p className="text-sm text-muted-foreground">Total Polls</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{polls.filter(p => p.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Polls</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{polls.reduce((sum, p) => sum + p.responses, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Votes</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{polls.reduce((sum, p) => sum + p.reputationReward, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search polls..."
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
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

        {/* Featured Polls */}
        {polls.some(p => p.featured) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured Polls</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {polls.filter(poll => poll.featured).map(poll => (
                <Card key={poll.id} className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="secondary">{poll.category}</Badge>
                          {getStatusBadge(poll.status)}
                          {poll.trending && <Badge className="bg-orange-500"><TrendingUp className="w-3 h-3 mr-1" />Trending</Badge>}
                        </div>
                        <CardTitle className="text-xl mb-2">{poll.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{poll.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress: {poll.responses}/{poll.totalVotes}</span>
                        <span>{getTimeRemaining(poll.endDate)}</span>
                      </div>
                      <Progress value={(poll.responses / poll.totalVotes) * 100} className="h-2" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{poll.responses} votes</span>
                          </div>
                          {poll.reputationReward > 0 && (
                            <div className="flex items-center space-x-1">
                              <Trophy className="w-4 h-4" />
                              <span>+{poll.reputationReward}</span>
                            </div>
                          )}
                          {poll.requiresReputation && (
                            <div className="flex items-center space-x-1">
                              <Shield className="w-4 h-4" />
                              <span>{poll.minReputation}+ rep</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/polls/${poll.id}/results`}>
                              <Eye className="w-4 h-4 mr-1" />
                              Results
                            </Link>
                          </Button>
                          {poll.status === 'active' && (
                            <Button size="sm" asChild>
                              <Link href={`/polls/${poll.id}/participate`}>
                                <Vote className="w-4 h-4 mr-1" />
                                Vote
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Polls */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Polls</h2>
          <p className="text-muted-foreground">{filteredPolls.length} polls found</p>
        </div>

        {filteredPolls.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mb-4">
              <Search className="w-12 h-12 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No polls found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or create a new poll.
            </p>
            <Button asChild>
              <Link href="/polls/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Poll
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map(poll => (
              <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary">{poll.category}</Badge>
                        {getStatusBadge(poll.status)}
                        {poll.trending && <Badge variant="outline" className="text-orange-600"><TrendingUp className="w-3 h-3 mr-1" />Trending</Badge>}
                      </div>
                      <CardTitle className="text-lg line-clamp-2">{poll.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-4">{poll.description}</CardDescription>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{poll.responses}/{poll.totalVotes} responses</span>
                      <span className="text-muted-foreground">{getTimeRemaining(poll.endDate)}</span>
                    </div>
                    <Progress value={(poll.responses / poll.totalVotes) * 100} className="h-1.5" />

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${poll.createdBy}`} />
                          <AvatarFallback className="text-xs">{poll.createdByUsername.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">{poll.createdByUsername}</span>
                      </div>

                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        {poll.reputationReward > 0 && (
                          <>
                            <Trophy className="w-4 h-4" />
                            <span>+{poll.reputationReward}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/polls/${poll.id}/results`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      {poll.status === 'active' && (
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/polls/${poll.id}/participate`}>
                            <Vote className="w-4 h-4 mr-1" />
                            Vote
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}