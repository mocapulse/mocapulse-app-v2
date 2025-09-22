"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Users,
  Shield,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp,
  ExternalLink,
  Download,
  Share2,
  Vote,
} from "lucide-react"
import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

interface PollOption {
  id: string
  text: string
  votes: number
  percentage: number
}

interface Poll {
  id: string
  title: string
  description: string
  category: string
  type: "single" | "multiple"
  options: PollOption[]
  status: "active" | "closed"
  totalResponses: number
  totalVotes: number
  endDate: string
  createdBy: string
  createdByUsername: string
  createdAt: string
  isAnonymous: boolean
  blockchainHash: string
}

interface Insight {
  title: string
  description: string
  type: "trend" | "demographic" | "correlation"
}

export default function PollResultsPage({ params }: { params: { id: string } }) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [activeTab, setActiveTab] = useState("results")

  const headerReveal = useScrollReveal()
  const resultsReveal = useScrollReveal()
  const insightsReveal = useScrollReveal()

  useEffect(() => {
    // Mock poll results data
    const mockPoll: Poll = {
      id: params.id,
      title: "NFT Marketplace Preferences",
      description:
        "We're researching user preferences for NFT marketplace features to improve the overall experience. Your feedback will help shape the future of digital asset trading platforms.",
      category: "NFTs",
      type: "multiple",
      options: [
        { id: "1", text: "Low transaction fees", votes: 156, percentage: 87.2 },
        { id: "2", text: "User-friendly interface", votes: 134, percentage: 74.9 },
        { id: "3", text: "Advanced filtering options", votes: 98, percentage: 54.7 },
        { id: "4", text: "Creator royalty protection", votes: 89, percentage: 49.7 },
        { id: "5", text: "Cross-chain compatibility", votes: 76, percentage: 42.5 },
        { id: "6", text: "Social features and community", votes: 45, percentage: 25.1 },
      ],
      status: "active",
      totalResponses: 179,
      totalVotes: 598, // Total votes across all options (multiple choice)
      endDate: "2024-01-20",
      createdBy: "user_456",
      createdByUsername: "CryptoBuilder",
      createdAt: "2024-01-10",
      isAnonymous: false,
      blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    }

    setPoll(mockPoll)

    // Mock insights
    setInsights([
      {
        title: "Cost Sensitivity Dominates",
        description:
          "87% of respondents prioritize low transaction fees, indicating cost is the primary barrier to NFT adoption.",
        type: "trend",
      },
      {
        title: "UX Over Advanced Features",
        description:
          "User-friendly interface (75%) significantly outranks advanced filtering (55%), suggesting simplicity wins.",
        type: "demographic",
      },
      {
        title: "Creator Economy Concerns",
        description:
          "Nearly half (50%) value creator royalty protection, showing strong support for sustainable creator economics.",
        type: "correlation",
      },
    ])
  }, [params.id])

  const getTimeRemaining = () => {
    if (!poll) return ""
    const now = new Date()
    const end = new Date(poll.endDate)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days remaining` : "Poll ended"
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      case "demographic":
        return <Users className="w-5 h-5 text-green-500" />
      case "correlation":
        return <BarChart3 className="w-5 h-5 text-purple-500" />
      default:
        return <BarChart3 className="w-5 h-5 text-gray-500" />
    }
  }

  const copyBlockchainHash = () => {
    if (poll?.blockchainHash) {
      navigator.clipboard.writeText(poll.blockchainHash)
    }
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Loading Results...</CardTitle>
          </CardHeader>
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
              <span className="text-xl font-bold text-foreground">Poll Results</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {poll.status === "active" && (
              <Button size="sm" asChild>
                <Link href={`/polls/${poll.id}/participate`}>
                  <Vote className="w-4 h-4 mr-2" />
                  Participate
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Poll Header */}
        <div
          ref={resultsReveal.ref}
          className={`mb-8 transition-all duration-1000 ease-out delay-200 ${
            resultsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {poll.category}
                    </Badge>
                    <Badge variant={poll.status === "active" ? "default" : "secondary"}>
                      {poll.status === "active" ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Closed
                        </>
                      )}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300"
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      Verified on Moca Chain
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{poll.title}</h1>
                  <p className="text-muted-foreground mb-4">{poll.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{poll.totalResponses} responses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Vote className="w-4 h-4" />
                      <span>{poll.totalVotes} total votes</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getTimeRemaining()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${poll.createdBy}`} />
                      <AvatarFallback>{poll.createdByUsername.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{poll.createdByUsername}</p>
                      <p className="text-xs text-muted-foreground">Poll Creator</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Results Content */}
        <div
          ref={insightsReveal.ref}
          className={`transition-all duration-1000 ease-out delay-400 ${
            insightsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Results */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Poll Results
                      </CardTitle>
                      <CardDescription>
                        {poll.type === "single"
                          ? "Single choice responses"
                          : "Multiple choice responses (percentages based on total respondents)"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {poll.options
                          .sort((a, b) => b.votes - a.votes)
                          .map((option, index) => (
                            <div key={option.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                      index === 0
                                        ? "bg-primary"
                                        : index === 1
                                          ? "bg-blue-500"
                                          : index === 2
                                            ? "bg-green-500"
                                            : "bg-gray-500"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  <span className="font-medium">{option.text}</span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{option.percentage.toFixed(1)}%</div>
                                  <div className="text-sm text-muted-foreground">{option.votes} votes</div>
                                </div>
                              </div>
                              <Progress value={option.percentage} className="h-3" />
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Stats */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-primary">{poll.totalResponses}</div>
                          <div className="text-sm text-muted-foreground">Total Responses</div>
                        </div>
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Response Type</span>
                            <span className="text-sm font-medium capitalize">{poll.type} Choice</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Votes</span>
                            <span className="text-sm font-medium">{poll.totalVotes}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg per Response</span>
                            <span className="text-sm font-medium">
                              {(poll.totalVotes / poll.totalResponses).toFixed(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Created</span>
                            <span className="text-sm font-medium">{new Date(poll.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Choice</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl font-bold text-primary">1</span>
                        </div>
                        <h3 className="font-semibold mb-1">{poll.options[0]?.text}</h3>
                        <p className="text-2xl font-bold text-primary">{poll.options[0]?.percentage.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">{poll.options[0]?.votes} votes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Key Insights
                  </CardTitle>
                  <CardDescription>AI-generated insights based on response patterns and data analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insights.map((insight, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            {getInsightIcon(insight.type)}
                            <div>
                              <h4 className="font-semibold mb-2">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground">{insight.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Distribution</CardTitle>
                  <CardDescription>How responses contributed to builder insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Impact on Product Development
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        These results provide clear direction for NFT marketplace development priorities, with cost
                        optimization and user experience emerging as critical success factors.
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-500">87%</div>
                        <div className="text-sm text-muted-foreground">Want Lower Fees</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-500">75%</div>
                        <div className="text-sm text-muted-foreground">Prioritize UX</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verification Tab */}
            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Blockchain Verification
                  </CardTitle>
                  <CardDescription>
                    This poll and all responses are cryptographically verified on the Moca Network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                          Results Verified on Moca Chain
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          All poll data and responses have been cryptographically verified and stored on-chain
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-green-900 dark:text-green-100">
                          Transaction Hash
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 p-2 bg-green-100 dark:bg-green-900/20 rounded text-sm font-mono">
                            {poll.blockchainHash}
                          </code>
                          <Button variant="outline" size="sm" onClick={copyBlockchainHash}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-700 dark:text-green-300">Network:</span>
                          <span className="ml-2 font-medium">Moca Network</span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300">Block Height:</span>
                          <span className="ml-2 font-medium">2,847,392</span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300">Confirmations:</span>
                          <span className="ml-2 font-medium">1,247</span>
                        </div>
                        <div>
                          <span className="text-green-700 dark:text-green-300">Gas Used:</span>
                          <span className="ml-2 font-medium">0.0023 MOCA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Transparency Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Immutable poll data</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Cryptographic signatures</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Tamper-proof results</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Public verification</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Privacy Protection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Zero-knowledge proofs</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Anonymous participation</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">Encrypted responses</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-blue-500" />
                            <span className="text-sm">GDPR compliant</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
