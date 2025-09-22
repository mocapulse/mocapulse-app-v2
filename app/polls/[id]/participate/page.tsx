"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConnectButton } from "@/components/connect-button"
import { useAirKit } from "@/contexts/airkit-context"
import { issueCredential } from "@/lib/credentials"
import {
  ArrowLeft,
  Calendar,
  Users,
  Shield,
  CheckCircle,
  Clock,
  Star,
  Send,
  AlertCircle,
  Trophy,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { useRouter } from "next/navigation"

interface Poll {
  id: string
  title: string
  description: string
  category: string
  type: "single" | "multiple"
  options: Array<{ id: string; text: string }>
  status: "active" | "closed"
  responses: number
  totalVotes: number
  endDate: string
  createdBy: string
  createdByUsername: string
  isAnonymous: boolean
  requiresReputation: boolean
  minReputation: number
  reputationReward: number
}

interface UserProfile {
  id: string
  username: string
  reputation: number
}

export default function PollParticipationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAirKit()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasParticipated, setHasParticipated] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const headerReveal = useScrollReveal()
  const pollReveal = useScrollReveal()
  const optionsReveal = useScrollReveal()

  useEffect(() => {
    // Load user profile - prioritize AIR Kit user data
    if (isAuthenticated && user) {
      const savedProfile = localStorage.getItem("mocaPulseProfile")
      let profile: UserProfile

      if (savedProfile) {
        profile = JSON.parse(savedProfile)
      } else {
        profile = {
          id: user.uuid || user.id,
          username: user.username || `User_${(user.uuid || user.id).slice(0, 8)}`,
          reputation: 100,
        }
      }
      setUserProfile(profile)
    } else {
      // Fallback to localStorage only
      const savedProfile = localStorage.getItem("mocaPulseProfile")
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile))
      }
    }

    // Mock poll data - in real app, fetch from API
    const mockPoll: Poll = {
      id: params.id,
      title: "NFT Marketplace Preferences",
      description:
        "We're researching user preferences for NFT marketplace features to improve the overall experience. Your feedback will help shape the future of digital asset trading platforms.",
      category: "NFTs",
      type: "multiple",
      options: [
        { id: "1", text: "Low transaction fees" },
        { id: "2", text: "User-friendly interface" },
        { id: "3", text: "Advanced filtering options" },
        { id: "4", text: "Creator royalty protection" },
        { id: "5", text: "Cross-chain compatibility" },
        { id: "6", text: "Social features and community" },
      ],
      status: "active",
      responses: 89,
      totalVotes: 200,
      endDate: "2024-01-20",
      createdBy: "user_456",
      createdByUsername: "CryptoBuilder",
      isAnonymous: false,
      requiresReputation: true,
      minReputation: 50,
      reputationReward: 10,
    }

    setPoll(mockPoll)

    // Check if user has already participated
    const participatedPolls = JSON.parse(localStorage.getItem("participatedPolls") || "[]")
    setHasParticipated(participatedPolls.includes(params.id))
  }, [params.id, isAuthenticated, user])

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (poll?.type === "single") {
      setSelectedOptions(checked ? [optionId] : [])
    } else {
      setSelectedOptions((prev) => (checked ? [...prev, optionId] : prev.filter((id) => id !== optionId)))
    }
  }

  const handleSubmit = async () => {
    if (!poll || !userProfile || selectedOptions.length === 0) return

    setIsSubmitting(true)

    try {
      // Issue credential for poll participation
      await issueCredential('poll_participation', {
        pollId: poll.id,
        participantId: userProfile.id,
        timestamp: new Date().toISOString(),
        response: selectedOptions,
      })

      // Update participation record
      const participatedPolls = JSON.parse(localStorage.getItem("participatedPolls") || "[]")
      participatedPolls.push(poll.id)
      localStorage.setItem("participatedPolls", JSON.stringify(participatedPolls))

      // Update user reputation
      const updatedProfile = {
        ...userProfile,
        reputation: userProfile.reputation + poll.reputationReward,
      }
      setUserProfile(updatedProfile)
      localStorage.setItem("mocaPulseProfile", JSON.stringify(updatedProfile))

      // Issue reputation credential if significant milestone
      if (updatedProfile.reputation % 100 === 0 || updatedProfile.reputation >= 500) {
        await issueCredential('reputation_badge', {
          userId: userProfile.id,
          reputationScore: updatedProfile.reputation,
          badges: [`${Math.floor(updatedProfile.reputation / 100) * 100}+ Reputation`],
          timestamp: new Date().toISOString(),
        })
      }

      setIsSubmitting(false)
      setShowConfirmation(true)
    } catch (error) {
      console.error('Failed to submit poll response:', error)
      setIsSubmitting(false)
    }
  }

  const canParticipate = () => {
    if (!poll) return false
    if (!isAuthenticated || !userProfile) return false
    if (hasParticipated) return false
    if (poll.status !== "active") return false
    if (poll.requiresReputation && userProfile.reputation < poll.minReputation) return false
    return true
  }

  const getTimeRemaining = () => {
    if (!poll) return ""
    const now = new Date()
    const end = new Date(poll.endDate)
    const diff = end.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days remaining` : "Ended"
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Loading Poll...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">MP</span>
              </div>
              <span className="text-xl font-bold text-foreground">Moca Pulse</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <Card className="p-8">
            <CardContent className="space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Response Submitted!</h1>
                <p className="text-muted-foreground">
                  Thank you for participating in "{poll.title}". Your response has been recorded on-chain.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-700 dark:text-green-300">
                    +{poll.reputationReward} Reputation Earned
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href={`/polls/${poll.id}/results`}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Results
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <span className="text-xl font-bold text-foreground">Moca Pulse</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userProfile && (
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{userProfile.reputation}</span>
              </div>
            )}
            <Button variant="outline" asChild>
              <Link href={`/polls/${poll.id}/results`}>
                <Eye className="w-4 h-4 mr-2" />
                View Results
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Poll Header */}
        <div
          ref={pollReveal.ref}
          className={`mb-8 transition-all duration-1000 ease-out delay-200 ${
            pollReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">{poll.title}</h1>
                  <p className="text-muted-foreground mb-4">{poll.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{poll.responses} responses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getTimeRemaining()}</span>
                    </div>
                    {poll.reputationReward > 0 && (
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span>+{poll.reputationReward} reputation</span>
                      </div>
                    )}
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
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Response Progress</span>
                  <span>
                    {poll.responses}/{poll.totalVotes}
                  </span>
                </div>
                <Progress value={(poll.responses / poll.totalVotes) * 100} className="h-2" />
              </div>
              {poll.requiresReputation && (
                <div className="flex items-center space-x-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-500" />
                  <span>Minimum {poll.minReputation} reputation required</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Participation Form */}
        <div
          ref={optionsReveal.ref}
          className={`transition-all duration-1000 ease-out delay-400 ${
            optionsReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {!canParticipate() ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Cannot Participate</h3>
                {hasParticipated ? (
                  <p className="text-muted-foreground mb-4">You have already participated in this poll.</p>
                ) : poll.status !== "active" ? (
                  <p className="text-muted-foreground mb-4">This poll is no longer active.</p>
                ) : poll.requiresReputation && userProfile && userProfile.reputation < poll.minReputation ? (
                  <p className="text-muted-foreground mb-4">
                    You need at least {poll.minReputation} reputation to participate. You currently have{" "}
                    {userProfile.reputation}.
                  </p>
                ) : !isAuthenticated ? (
                  <p className="text-muted-foreground mb-4">Connect your Moca ID to participate in polls.</p>
                ) : (
                  <p className="text-muted-foreground mb-4">You need to create a profile to participate.</p>
                )}
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" asChild>
                    <Link href={`/polls/${poll.id}/results`}>View Results</Link>
                  </Button>
                  {!isAuthenticated ? (
                    <ConnectButton />
                  ) : !userProfile && (
                    <Button asChild>
                      <Link href="/profile">Create Profile</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Your Response</CardTitle>
                <CardDescription>
                  {poll.type === "single"
                    ? "Select one option that best represents your view"
                    : "Select all options that apply to your preferences"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {poll.type === "single" ? (
                    <RadioGroup value={selectedOptions[0] || ""} onValueChange={(value) => setSelectedOptions([value])}>
                      {poll.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="space-y-3">
                      {poll.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={selectedOptions.includes(option.id)}
                            onCheckedChange={(checked) => handleOptionChange(option.id, checked as boolean)}
                          />
                          <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                            {option.text}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">On-Chain Verification</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Your response will be cryptographically signed and stored on the Moca Network for transparency
                        and verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {selectedOptions.length > 0 && (
                      <span>
                        {selectedOptions.length} option{selectedOptions.length > 1 ? "s" : ""} selected
                      </span>
                    )}
                  </div>
                  <Button onClick={handleSubmit} disabled={selectedOptions.length === 0 || isSubmitting} size="lg">
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Response
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
