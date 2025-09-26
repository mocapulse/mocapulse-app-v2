"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Shield,
  Target,
  AlertCircle,
  Users,
  Trophy,
  Timer,
  DollarSign,
  Zap
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock project data - in real app this would come from API
const mockProject = {
  id: "1",
  title: "NFT Marketplace User Experience Testing",
  company: "MetaFlow Studios",
  category: "Web3 DApp",
  description: "We need experienced testers to evaluate the user experience of our new NFT marketplace platform. Test core functionalities including minting, trading, and wallet integration.",
  paymentRange: { min: 200, max: 500 },
  duration: "3-5 days",
  testersNeeded: 5,
  testersApplied: 12,
  requirements: {
    minReputation: 75,
    specializations: ["Web3", "NFT", "DeFi", "UI/UX"],
    avgTurnaroundTime: 24, // hours
    qualityThreshold: 85 // percentage
  },
  features: [
    "NFT Minting Interface",
    "Marketplace Trading",
    "Wallet Integration",
    "User Profile System",
    "Search & Filter Functions"
  ],
  testingTasks: [
    {
      id: 1,
      title: "Account Setup & Wallet Connection",
      description: "Test the user onboarding flow and wallet connection process",
      estimatedTime: "30 minutes",
      priority: "high"
    },
    {
      id: 2,
      title: "NFT Minting Process",
      description: "Test the complete NFT creation and minting workflow",
      estimatedTime: "45 minutes",
      priority: "high"
    },
    {
      id: 3,
      title: "Marketplace Navigation & Search",
      description: "Evaluate the browsing experience and search functionality",
      estimatedTime: "30 minutes",
      priority: "medium"
    },
    {
      id: 4,
      title: "Trading & Transaction Flow",
      description: "Test buying, selling, and bidding processes",
      estimatedTime: "60 minutes",
      priority: "high"
    }
  ]
}

// Mock user profile - in real app this would come from context/API
const mockUserProfile = {
  reputation: 82,
  specializations: ["Web3", "DeFi", "Mobile App"],
  avgTurnaroundTime: 18, // hours
  qualityScore: 88, // percentage
  completedTests: 23,
  successRate: 94
}

type ApplicationStep = "requirements" | "application" | "testing" | "submitted"

export default function ProjectApplicationPage({ params }: { params: { id: string } }) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>("requirements")
  const [applicationData, setApplicationData] = useState({
    motivation: "",
    relevantExperience: "",
    estimatedCompletionTime: "",
    specialFocus: [] as string[],
    agreesToTerms: false
  })
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [taskFeedback, setTaskFeedback] = useState<Record<number, { rating: number; feedback: string; screenshots?: File[] }>>({})

  const checkRequirements = () => {
    const meets = {
      reputation: mockUserProfile.reputation >= mockProject.requirements.minReputation,
      specializations: mockProject.requirements.specializations.some(spec =>
        mockUserProfile.specializations.includes(spec)
      ),
      turnaroundTime: mockUserProfile.avgTurnaroundTime <= mockProject.requirements.avgTurnaroundTime,
      qualityThreshold: mockUserProfile.qualityScore >= mockProject.requirements.qualityThreshold
    }

    return {
      meets,
      passed: Object.values(meets).every(Boolean)
    }
  }

  const requirements = checkRequirements()

  const handleApplicationSubmit = () => {
    if (applicationData.motivation && applicationData.relevantExperience && applicationData.agreesToTerms) {
      setCurrentStep("testing")
    }
  }

  const handleTaskComplete = (taskId: number, rating: number, feedback: string) => {
    setCompletedTasks(prev => [...prev, taskId])
    setTaskFeedback(prev => ({
      ...prev,
      [taskId]: { rating, feedback }
    }))
  }

  const handleFinalSubmit = () => {
    setCurrentStep("submitted")
  }

  const RequirementsCheck = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Eligibility Requirements
        </CardTitle>
        <CardDescription>
          Check if you meet the project requirements before applying
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Requirement checks */}
        <div className="grid gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {requirements.meets.reputation ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Reputation Score</p>
                <p className="text-sm text-muted-foreground">
                  Required: {mockProject.requirements.minReputation}+ | Your Score: {mockUserProfile.reputation}
                </p>
              </div>
            </div>
            <Badge variant={requirements.meets.reputation ? "secondary" : "destructive"}>
              {requirements.meets.reputation ? "✓ Met" : "✗ Not Met"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {requirements.meets.specializations ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Required Specializations</p>
                <p className="text-sm text-muted-foreground">
                  Need: {mockProject.requirements.specializations.join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  You have: {mockUserProfile.specializations.join(", ")}
                </p>
              </div>
            </div>
            <Badge variant={requirements.meets.specializations ? "secondary" : "destructive"}>
              {requirements.meets.specializations ? "✓ Met" : "✗ Not Met"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {requirements.meets.turnaroundTime ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Average Turnaround Time</p>
                <p className="text-sm text-muted-foreground">
                  Required: ≤{mockProject.requirements.avgTurnaroundTime}h | Your Average: {mockUserProfile.avgTurnaroundTime}h
                </p>
              </div>
            </div>
            <Badge variant={requirements.meets.turnaroundTime ? "secondary" : "destructive"}>
              {requirements.meets.turnaroundTime ? "✓ Met" : "✗ Not Met"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {requirements.meets.qualityThreshold ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">Quality Score</p>
                <p className="text-sm text-muted-foreground">
                  Required: {mockProject.requirements.qualityThreshold}%+ | Your Score: {mockUserProfile.qualityScore}%
                </p>
              </div>
            </div>
            <Badge variant={requirements.meets.qualityThreshold ? "secondary" : "destructive"}>
              {requirements.meets.qualityThreshold ? "✓ Met" : "✗ Not Met"}
            </Badge>
          </div>
        </div>

        {requirements.passed ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Congratulations! You meet all the requirements for this project. You can proceed with your application.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't meet all the requirements for this project. Consider building your reputation and skills in the required areas.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href={`/projects/${params.id}`}>Back to Project</Link>
          </Button>
          <Button
            onClick={() => setCurrentStep("application")}
            disabled={!requirements.passed}
          >
            Continue Application
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ApplicationForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Application Form
        </CardTitle>
        <CardDescription>
          Tell us why you're the right tester for this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="motivation">Why do you want to test this project? *</Label>
          <Textarea
            id="motivation"
            placeholder="Explain your interest in this project and what makes you a good fit..."
            value={applicationData.motivation}
            onChange={(e) => setApplicationData(prev => ({ ...prev, motivation: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Relevant Experience *</Label>
          <Textarea
            id="experience"
            placeholder="Describe your relevant testing experience, particularly with similar projects..."
            value={applicationData.relevantExperience}
            onChange={(e) => setApplicationData(prev => ({ ...prev, relevantExperience: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Estimated Completion Timeline</Label>
          <Input
            id="timeline"
            placeholder="e.g., 2-3 days, 1 week"
            value={applicationData.estimatedCompletionTime}
            onChange={(e) => setApplicationData(prev => ({ ...prev, estimatedCompletionTime: e.target.value }))}
          />
        </div>

        <div className="space-y-3">
          <Label>Areas of Special Focus (optional)</Label>
          {["UI/UX Design", "Performance", "Security", "Mobile Responsiveness", "Accessibility"].map(focus => (
            <div key={focus} className="flex items-center space-x-2">
              <Checkbox
                id={focus}
                checked={applicationData.specialFocus.includes(focus)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setApplicationData(prev => ({
                      ...prev,
                      specialFocus: [...prev.specialFocus, focus]
                    }))
                  } else {
                    setApplicationData(prev => ({
                      ...prev,
                      specialFocus: prev.specialFocus.filter(f => f !== focus)
                    }))
                  }
                }}
              />
              <Label htmlFor={focus}>{focus}</Label>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={applicationData.agreesToTerms}
            onCheckedChange={(checked) =>
              setApplicationData(prev => ({ ...prev, agreesToTerms: !!checked }))
            }
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to complete all testing tasks within the specified timeframe and provide honest, detailed feedback. *
          </Label>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setCurrentStep("requirements")}>
            Back
          </Button>
          <Button
            onClick={handleApplicationSubmit}
            disabled={!applicationData.motivation || !applicationData.relevantExperience || !applicationData.agreesToTerms}
          >
            Submit Application
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const TestingInterface = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Testing Tasks
          </CardTitle>
          <CardDescription>
            Complete all testing tasks and provide detailed feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{completedTasks.length}/{mockProject.testingTasks.length} completed</span>
            </div>
            <Progress value={(completedTasks.length / mockProject.testingTasks.length) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {mockProject.testingTasks.map(task => (
        <TestingTask
          key={task.id}
          task={task}
          isCompleted={completedTasks.includes(task.id)}
          onComplete={handleTaskComplete}
        />
      ))}

      {completedTasks.length === mockProject.testingTasks.length && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Tasks Completed!</h3>
              <p className="text-muted-foreground mb-4">
                Great work! You've completed all testing tasks. Submit your final results.
              </p>
              <Button onClick={handleFinalSubmit}>
                Submit Final Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const TestingTask = ({
    task,
    isCompleted,
    onComplete
  }: {
    task: any;
    isCompleted: boolean;
    onComplete: (id: number, rating: number, feedback: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [rating, setRating] = useState(5)
    const [feedback, setFeedback] = useState("")

    const handleSubmit = () => {
      onComplete(task.id, rating, feedback)
      setIsOpen(false)
    }

    if (isCompleted) {
      return (
        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Timer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{task.estimatedTime}</span>
              </div>
              <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                {task.priority}
              </Badge>
            </div>
          </div>

          <h3 className="font-semibold mb-2">{task.title}</h3>
          <p className="text-muted-foreground mb-4">{task.description}</p>

          {!isOpen ? (
            <Button onClick={() => setIsOpen(true)}>Start Task</Button>
          ) : (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Task Rating (1-5 stars)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className="w-6 h-6" fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Detailed Feedback</Label>
                <Textarea
                  placeholder="Describe your experience, any issues found, suggestions for improvement..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!feedback}>
                  Complete Task
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const SubmittedState = () => (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Testing Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your thorough testing. Your feedback has been submitted to {mockProject.company}.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6 text-left">
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Tasks Completed
              </h3>
              <p className="text-2xl font-bold text-green-600">{completedTasks.length}/{mockProject.testingTasks.length}</p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Estimated Payout
              </h3>
              <p className="text-2xl font-bold text-green-600">${mockProject.paymentRange.max}</p>
            </Card>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Payment will be processed within 3-5 business days after the project owner reviews your submission.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/dashboard">View Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/browse">Browse More Projects</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/browse">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Browse
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ME</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                {currentStep === "requirements" && "Check Requirements"}
                {currentStep === "application" && "Application Form"}
                {currentStep === "testing" && "Testing Tasks"}
                {currentStep === "submitted" && "Submission Complete"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Project Overview */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{mockProject.title}</h1>
                <p className="text-muted-foreground">{mockProject.company}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Payment Range</p>
                <p className="text-lg font-semibold">${mockProject.paymentRange.min} - ${mockProject.paymentRange.max}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {mockProject.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {mockProject.testersNeeded} testers needed
              </div>
              <Badge>{mockProject.category}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === "requirements" && <RequirementsCheck />}
        {currentStep === "application" && <ApplicationForm />}
        {currentStep === "testing" && <TestingInterface />}
        {currentStep === "submitted" && <SubmittedState />}
      </div>
    </div>
  )
}