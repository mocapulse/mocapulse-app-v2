"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Award,
  Brain,
  CheckCircle,
  Clock,
  Star,
  Target,
  Trophy,
  Zap,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Shield,
  Users,
  Crown,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { ConnectButton } from "@/components/connect-button"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface Assessment {
  id: string
  title: string
  level: "basic" | "advanced" | "expert"
  description: string
  duration: number // minutes
  passingScore: number // percentage
  questions: Question[]
  badge: {
    name: string
    color: string
    icon: any
  }
  prerequisites?: string[]
}

interface AssessmentResult {
  assessmentId: string
  score: number
  passed: boolean
  completedAt: string
  timeSpent: number
  answers: { [questionId: string]: number }
}

const ASSESSMENTS: Assessment[] = [
  {
    id: "basic-testing",
    title: "Basic Testing Fundamentals",
    level: "basic",
    description: "Test your understanding of basic software testing concepts, bug identification, and testing methodologies.",
    duration: 10,
    passingScore: 80,
    badge: {
      name: "Testing Fundamentals",
      color: "bg-green-500",
      icon: CheckCircle
    },
    questions: [
      {
        id: "q1",
        question: "You're testing a login form and notice that when you enter a valid username but leave the password field empty, the form submits successfully and logs you in. What type of issue is this?",
        options: [
          "UI/UX issue - the form should have better visual feedback",
          "Security vulnerability - authentication bypass",
          "Performance issue - the form loads too slowly",
          "Compatibility issue - doesn't work on all browsers"
        ],
        correctAnswer: 1,
        explanation: "This is a critical security vulnerability. A login form should never authenticate a user without a valid password, as this allows unauthorized access to user accounts."
      },
      {
        id: "q2",
        question: "While testing an e-commerce website, you find that the 'Add to Cart' button works fine on desktop but doesn't respond to taps on mobile devices. What should be your immediate priority?",
        options: [
          "Report it as a minor cosmetic issue",
          "Test if the button works with different mobile browsers",
          "Check if the button has proper touch event handlers",
          "Both B and C - investigate thoroughly before reporting"
        ],
        correctAnswer: 3,
        explanation: "Mobile functionality issues can significantly impact user experience and sales. You should investigate thoroughly across different browsers and check for proper touch implementations before reporting."
      },
      {
        id: "q3",
        question: "You discover that a web application crashes when you enter the text \"<script>alert('test')</script>\" in a comment field. What type of vulnerability does this suggest?",
        options: [
          "SQL injection vulnerability",
          "Cross-site scripting (XSS) vulnerability",
          "Buffer overflow vulnerability",
          "Session hijacking vulnerability"
        ],
        correctAnswer: 1,
        explanation: "When JavaScript code executes in an input field, it indicates a Cross-Site Scripting (XSS) vulnerability where user input is not properly sanitized or escaped."
      },
      {
        id: "q4",
        question: "What is the most important principle when writing a good bug report?",
        options: [
          "Use technical jargon to sound professional",
          "Include steps to reproduce, expected vs actual results",
          "Report as many bugs as possible in one ticket",
          "Focus on criticizing the developers' work"
        ],
        correctAnswer: 1,
        explanation: "A good bug report must be reproducible. Including clear steps to reproduce, expected behavior, and actual behavior helps developers understand and fix the issue efficiently."
      },
      {
        id: "q5",
        question: "During user acceptance testing, you notice the application works perfectly but users are confused about how to complete common tasks. What should you focus on?",
        options: [
          "Report that there are no bugs since everything works",
          "Focus on usability issues and user experience problems",
          "Only test the technical functionality",
          "Ask developers to add more features"
        ],
        correctAnswer: 1,
        explanation: "User acceptance testing should focus on whether the application meets user needs. Usability issues are critical findings even when technical functionality works correctly."
      }
    ]
  },
  {
    id: "advanced-testing",
    title: "Advanced Testing Techniques",
    level: "advanced",
    description: "Advanced testing methodologies, API testing, performance analysis, and complex scenario testing.",
    duration: 20,
    passingScore: 85,
    prerequisites: ["basic-testing"],
    badge: {
      name: "Advanced Tester",
      color: "bg-blue-500",
      icon: Target
    },
    questions: [
      {
        id: "aq1",
        question: "You're testing an API that should return user data. The response time is consistently 5-8 seconds for simple queries. What's your best approach?",
        options: [
          "Report it as working correctly since it returns data",
          "Investigate database indexing and query optimization issues",
          "Test only the response format and ignore performance",
          "Recommend increasing server capacity"
        ],
        correctAnswer: 1,
        explanation: "5-8 seconds for simple queries suggests poor database optimization. Before recommending hardware solutions, investigate query efficiency and database design."
      },
      {
        id: "aq2",
        question: "During load testing, you notice the application handles 100 concurrent users fine, but fails at 150 users. What's the most valuable information to gather?",
        options: [
          "Just report that it fails at 150 users",
          "Identify the specific bottleneck (database, memory, CPU, network)",
          "Recommend buying more servers immediately",
          "Test with exactly 149 users to find the limit"
        ],
        correctAnswer: 1,
        explanation: "Understanding the specific bottleneck (database connections, memory leaks, CPU usage, etc.) provides actionable information for developers to optimize the right component."
      },
      {
        id: "aq3",
        question: "You're testing a payment processing system. What should be your highest priority test case?",
        options: [
          "Testing with large transaction amounts",
          "Verifying transaction rollback on payment failures",
          "Testing the user interface responsiveness",
          "Checking payment confirmation emails"
        ],
        correctAnswer: 1,
        explanation: "In payment systems, ensuring failed transactions don't result in money being charged without service delivery (or vice versa) is critical for business integrity and legal compliance."
      },
      {
        id: "aq4",
        question: "When testing a real-time chat application, you notice messages sometimes arrive out of order. What's the most likely cause to investigate?",
        options: [
          "Network latency and race conditions",
          "Database corruption",
          "UI rendering issues",
          "User permissions problems"
        ],
        correctAnswer: 0,
        explanation: "Out-of-order messages in real-time systems typically result from network latency variations and race conditions in message handling, especially under concurrent load."
      },
      {
        id: "aq5",
        question: "You're testing a mobile app that works perfectly in your test environment but crashes frequently in production. What's your best debugging approach?",
        options: [
          "Report that testing was successful",
          "Investigate production-specific factors: data volume, network conditions, device variations",
          "Ask users to use the test environment instead",
          "Recommend rolling back to the previous version"
        ],
        correctAnswer: 1,
        explanation: "Production issues often stem from factors not present in test environments: real user data patterns, network variability, diverse device configurations, and concurrent usage."
      }
    ]
  },
  {
    id: "expert-testing",
    title: "Expert Testing & Security",
    level: "expert",
    description: "Expert-level security testing, automation strategies, and complex system integration testing.",
    duration: 30,
    passingScore: 90,
    prerequisites: ["basic-testing", "advanced-testing"],
    badge: {
      name: "Testing Expert",
      color: "bg-purple-500",
      icon: Crown
    },
    questions: [
      {
        id: "eq1",
        question: "During penetration testing of a web application, you discover that user session tokens don't expire after logout. What's the primary security risk?",
        options: [
          "Minor inconvenience for users",
          "Session hijacking and unauthorized access via stolen tokens",
          "Increased server storage usage",
          "Slower application performance"
        ],
        correctAnswer: 1,
        explanation: "Non-expiring session tokens after logout create a significant security risk. If tokens are intercepted or stolen, attackers can maintain unauthorized access indefinitely."
      },
      {
        id: "eq2",
        question: "You're designing an automated test suite for a microservices architecture. What's the most critical aspect to focus on?",
        options: [
          "Testing each microservice in complete isolation",
          "Service integration points, contract testing, and failure scenarios",
          "Only testing the user interface end-to-end",
          "Performance testing individual services under maximum load"
        ],
        correctAnswer: 1,
        explanation: "In microservices, the complexity lies in service interactions. Contract testing, integration points, and failure scenarios (circuit breakers, timeouts) are critical for system reliability."
      },
      {
        id: "eq3",
        question: "During security testing, you find that the application accepts and processes extremely large file uploads without validation. What's the most severe potential impact?",
        options: [
          "Slower upload times for users",
          "Denial of Service attacks and server resource exhaustion",
          "Minor storage cost increases",
          "Reduced image quality"
        ],
        correctAnswer: 1,
        explanation: "Unrestricted file uploads can lead to DoS attacks, server crashes, storage exhaustion, and potential malware uploads, making it a critical security vulnerability."
      },
      {
        id: "eq4",
        question: "You're testing a financial API that processes thousands of transactions per second. What's the most important aspect of your testing strategy?",
        options: [
          "Ensuring the user interface looks good",
          "Data consistency, race conditions, and transaction integrity under concurrent load",
          "Testing with only single transactions",
          "Focusing on response time optimization only"
        ],
        correctAnswer: 1,
        explanation: "In high-throughput financial systems, data consistency and transaction integrity are paramount. Race conditions can lead to financial discrepancies that have legal and business implications."
      },
      {
        id: "eq5",
        question: "When implementing test automation for a CI/CD pipeline, what's the most effective strategy for test organization?",
        options: [
          "Run all tests for every commit",
          "Pyramid approach: many unit tests, fewer integration tests, minimal E2E tests",
          "Only run manual tests before deployment",
          "Focus exclusively on end-to-end UI testing"
        ],
        correctAnswer: 1,
        explanation: "The test pyramid ensures fast feedback with comprehensive coverage. Unit tests catch logic errors quickly, integration tests verify component interactions, and E2E tests validate critical user journeys."
      }
    ]
  }
]


export default function AssessmentsPage() {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({})
  const [isAssessmentComplete, setIsAssessmentComplete] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [userCredentials, setUserCredentials] = useState<string[]>([])

  useEffect(() => {
    // Load user credentials
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCredentials')
      if (saved) {
        setUserCredentials(JSON.parse(saved))
      }
    }
  }, [])

  const startAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setCurrentQuestion(0)
    setAnswers({})
    setIsAssessmentComplete(false)
    setAssessmentResult(null)
    setStartTime(new Date())
  }

  const selectAnswer = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const nextQuestion = () => {
    if (selectedAssessment && currentQuestion < selectedAssessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const completeAssessment = () => {
    if (!selectedAssessment || !startTime) return

    let correctAnswers = 0
    selectedAssessment.questions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / selectedAssessment.questions.length) * 100)
    const passed = score >= selectedAssessment.passingScore
    const timeSpent = Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) // minutes

    const result: AssessmentResult = {
      assessmentId: selectedAssessment.id,
      score,
      passed,
      completedAt: new Date().toISOString(),
      timeSpent,
      answers
    }

    setAssessmentResult(result)
    setIsAssessmentComplete(true)

    // Save result and credential
    if (passed) {
      const newCredentials = [...userCredentials, selectedAssessment.id]
      setUserCredentials(newCredentials)
      localStorage.setItem('userCredentials', JSON.stringify(newCredentials))

      // Update user profile reputation
      const savedProfile = localStorage.getItem("mocaEdgeProfile")
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        profile.reputation = (profile.reputation || 0) + (selectedAssessment.level === 'basic' ? 50 : selectedAssessment.level === 'advanced' ? 100 : 200)
        localStorage.setItem("mocaEdgeProfile", JSON.stringify(profile))
      }
    }
  }

  const resetAssessment = () => {
    setSelectedAssessment(null)
    setCurrentQuestion(0)
    setAnswers({})
    setIsAssessmentComplete(false)
    setAssessmentResult(null)
    setStartTime(null)
  }

  const canTakeAssessment = (assessment: Assessment) => {
    if (!assessment.prerequisites) return true
    return assessment.prerequisites.every(prereq => userCredentials.includes(prereq))
  }

  const getAssessmentIcon = (level: string) => {
    switch (level) {
      case 'basic': return CheckCircle
      case 'advanced': return Target
      case 'expert': return Crown
      default: return CheckCircle
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
      case 'advanced': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
      case 'expert': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (selectedAssessment && !isAssessmentComplete) {
    const question = selectedAssessment.questions[currentQuestion]
    const progress = ((currentQuestion + 1) / selectedAssessment.questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={resetAssessment}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Assessment
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">ME</span>
                </div>
                <span className="text-xl font-bold text-foreground">{selectedAssessment.title}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {selectedAssessment.questions.length}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[question.id]?.toString()}
                onValueChange={(value) => selectAnswer(question.id, parseInt(value))}
                className="space-y-4"
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="text-sm leading-relaxed">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentQuestion === selectedAssessment.questions.length - 1 ? (
                  <Button
                    onClick={completeAssessment}
                    disabled={!answers[question.id] && answers[question.id] !== 0}
                    className="bg-primary"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Complete Assessment
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    disabled={!answers[question.id] && answers[question.id] !== 0}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isAssessmentComplete && assessmentResult && selectedAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ME</span>
              </div>
              <span className="text-xl font-bold text-foreground">Assessment Complete</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {assessmentResult.passed ? (
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                    <RotateCcw className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">
                {assessmentResult.passed ? 'Congratulations!' : 'Assessment Not Passed'}
              </CardTitle>
              <CardDescription>
                {assessmentResult.passed
                  ? `You've earned the ${selectedAssessment.badge.name} credential!`
                  : `You need ${selectedAssessment.passingScore}% to pass. You scored ${assessmentResult.score}%.`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <div className="text-3xl font-bold text-primary">{assessmentResult.score}%</div>
                  <div className="text-sm text-muted-foreground">Your Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">{selectedAssessment.passingScore}%</div>
                  <div className="text-sm text-muted-foreground">Required</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-500">{assessmentResult.timeSpent}m</div>
                  <div className="text-sm text-muted-foreground">Time Taken</div>
                </div>
              </div>

              {assessmentResult.passed && (
                <div className="mb-8">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full ${selectedAssessment.badge.color} text-white`}>
                    <selectedAssessment.badge.icon className="w-5 h-5 mr-2" />
                    {selectedAssessment.badge.name}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    This credential has been added to your profile and will be visible to enterprises!
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {selectedAssessment.questions.map((question, qIndex) => (
                  <Card key={question.id} className={`text-left ${
                    assessmentResult.answers[question.id] === question.correctAnswer
                      ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                      : 'border-red-200 bg-red-50 dark:bg-red-950/20'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-2 mb-3">
                        {assessmentResult.answers[question.id] === question.correctAnswer ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{question.question}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your answer: {question.options[assessmentResult.answers[question.id]]}
                          </p>
                          {assessmentResult.answers[question.id] !== question.correctAnswer && (
                            <p className="text-xs text-green-600 mt-1">
                              Correct answer: {question.options[question.correctAnswer]}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center space-x-4 mt-8">
                <Button variant="outline" onClick={resetAssessment}>
                  Back to Assessments
                </Button>
                {!assessmentResult.passed && (
                  <Button onClick={() => startAssessment(selectedAssessment)}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
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
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ME</span>
            </div>
            <span className="text-xl font-bold text-foreground">Skill Assessments</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/reputation">My Profile</Link>
            </Button>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Earn Testing Credentials
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Prove your testing skills and earn verified credentials that showcase your expertise to enterprises. Build your reputation through skill-based assessments.
          </p>
        </div>

        {/* User Credentials */}
        {userCredentials.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Earned Credentials</h2>
            <div className="flex flex-wrap gap-3">
              {userCredentials.map(credId => {
                const assessment = ASSESSMENTS.find(a => a.id === credId)
                if (!assessment) return null
                return (
                  <div key={credId} className={`inline-flex items-center px-4 py-2 rounded-full ${assessment.badge.color} text-white`}>
                    <assessment.badge.icon className="w-4 h-4 mr-2" />
                    {assessment.badge.name}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Assessment Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {ASSESSMENTS.map(assessment => {
            const hasCredential = userCredentials.includes(assessment.id)
            const canTake = canTakeAssessment(assessment)
            const Icon = getAssessmentIcon(assessment.level)

            return (
              <Card key={assessment.id} className={`hover:shadow-lg transition-shadow ${
                hasCredential ? 'ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-950/10' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getLevelColor(assessment.level)}>
                      <Icon className="w-3 h-3 mr-1" />
                      {assessment.level.charAt(0).toUpperCase() + assessment.level.slice(1)}
                    </Badge>
                    {hasCredential && (
                      <Badge className="bg-green-500 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        Earned
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{assessment.title}</CardTitle>
                  <CardDescription>{assessment.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{assessment.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="w-4 h-4 mr-2" />
                      <span>{assessment.passingScore}% to pass</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Brain className="w-4 h-4 mr-2" />
                      <span>{assessment.questions.length} questions</span>
                    </div>
                    {assessment.prerequisites && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 mr-2" />
                        <span>Prerequisites: {assessment.prerequisites.map(p =>
                          ASSESSMENTS.find(a => a.id === p)?.title || p
                        ).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {!canTake ? (
                    <Button disabled className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Prerequisites Required
                    </Button>
                  ) : hasCredential ? (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Credential Earned
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => startAssessment(assessment)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Assessment
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={() => startAssessment(assessment)}>
                      <Zap className="w-4 h-4 mr-2" />
                      Start Assessment
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Why Earn Testing Credentials?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Reputation</h3>
              <p className="text-muted-foreground">Earn reputation points and showcase your verified testing skills to potential clients.</p>
            </Card>

            <Card className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Attract Enterprises</h3>
              <p className="text-muted-foreground">Verified credentials help enterprises find and hire qualified testers for their projects.</p>
            </Card>

            <Card className="p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Higher Rates</h3>
              <p className="text-muted-foreground">Credentialed testers can command higher rates and access premium testing opportunities.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}