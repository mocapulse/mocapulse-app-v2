"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Calendar, Settings, Eye, Save, Send, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { useRouter } from "next/navigation"

interface PollOption {
  id: string
  text: string
}

interface PollForm {
  title: string
  description: string
  category: string
  type: "single" | "multiple"
  options: PollOption[]
  duration: string
  startDate: string
  endDate: string
  isAnonymous: boolean
  requiresReputation: boolean
  minReputation: number
}

export default function CreatePollPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState<PollForm>({
    title: "",
    description: "",
    category: "",
    type: "single",
    options: [
      { id: "1", text: "" },
      { id: "2", text: "" },
    ],
    duration: "7",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isAnonymous: false,
    requiresReputation: false,
    minReputation: 50,
  })

  const headerReveal = useScrollReveal()
  const formReveal = useScrollReveal()

  const addOption = () => {
    const newOption: PollOption = {
      id: Date.now().toString(),
      text: "",
    }
    setForm({ ...form, options: [...form.options, newOption] })
  }

  const removeOption = (id: string) => {
    if (form.options.length > 2) {
      setForm({ ...form, options: form.options.filter((option) => option.id !== id) })
    }
  }

  const updateOption = (id: string, text: string) => {
    setForm({
      ...form,
      options: form.options.map((option) => (option.id === id ? { ...option, text } : option)),
    })
  }

  const calculateEndDate = (startDate: string, duration: string) => {
    const start = new Date(startDate)
    const days = Number.parseInt(duration)
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
    return end.toISOString().split("T")[0]
  }

  const handleDurationChange = (duration: string) => {
    const endDate = calculateEndDate(form.startDate, duration)
    setForm({ ...form, duration, endDate })
  }

  const handleStartDateChange = (startDate: string) => {
    const endDate = calculateEndDate(startDate, form.duration)
    setForm({ ...form, startDate, endDate })
  }

  const validateForm = () => {
    if (!form.title.trim()) return false
    if (!form.description.trim()) return false
    if (!form.category) return false
    if (form.options.filter((opt) => opt.text.trim()).length < 2) return false
    return true
  }

  const handleSubmit = async (isDraft = false) => {
    if (!validateForm() && !isDraft) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const pollData = {
      ...form,
      id: `poll_${Date.now()}`,
      status: isDraft ? "draft" : "active",
      createdAt: new Date().toISOString(),
      responses: 0,
      totalVotes: 0,
    }

    // Save to localStorage for demo
    const existingPolls = JSON.parse(localStorage.getItem("userPolls") || "[]")
    existingPolls.push(pollData)
    localStorage.setItem("userPolls", JSON.stringify(existingPolls))

    setIsSubmitting(false)
    router.push("/dashboard")
  }

  const steps = [
    { number: 1, title: "Project Info", description: "Project details and testing scope" },
    { number: 2, title: "Questions", description: "Feedback questions and requirements" },
    { number: 3, title: "Tester Requirements", description: "Duration and tester criteria" },
    { number: 4, title: "Review", description: "Review and publish to marketplace" },
  ]

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
                <span className="text-primary-foreground font-bold text-sm">ME</span>
              </div>
              <span className="text-xl font-bold text-foreground">Create Testing Request</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" asChild>
              <Link href="/polls">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress Steps */}
        <div
          ref={formReveal.ref}
          className={`mb-8 transition-all duration-1000 ease-out delay-200 ${
            formReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold">{step.number}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-12 md:w-24 h-0.5 bg-muted-foreground/20 mx-4 md:mx-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Describe your project and what you need tested</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Project/Product Name *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Mobile Banking App, NFT Marketplace, Web3 Game"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Testing Scope & Context *</Label>
                  <Textarea
                    id="description"
                    placeholder="What do you need tested? Describe the key features, user flows, or areas you want feedback on"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Project Category *</Label>
                  <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile-app">Mobile App</SelectItem>
                      <SelectItem value="web-app">Web Application</SelectItem>
                      <SelectItem value="web3-dapp">Web3 DApp</SelectItem>
                      <SelectItem value="nft-platform">NFT Platform</SelectItem>
                      <SelectItem value="defi-protocol">DeFi Protocol</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!form.title || !form.description || !form.category}
                  >
                    Next: Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Options */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback Questions</CardTitle>
                <CardDescription>What specific feedback do you want from testers?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Feedback Type</Label>
                  <RadioGroup
                    value={form.type}
                    onValueChange={(value: "single" | "multiple") => setForm({ ...form, type: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single">Structured Questions (specific choices)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple">Open Feedback (multiple aspects)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Feedback Questions *</Label>
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {form.options.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder={`e.g., "How intuitive is the onboarding flow?", "Rate the UI design", "Any bugs found?"`}
                            value={option.text}
                            onChange={(e) => updateOption(option.id, e.target.value)}
                          />
                        </div>
                        {form.options.length > 2 && (
                          <Button variant="outline" size="sm" onClick={() => removeOption(option.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={form.options.filter((opt) => opt.text.trim()).length < 2}
                  >
                    Next: Requirements
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Tester Requirements</CardTitle>
                <CardDescription>Set timeline and criteria for testers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Testing Period</Label>
                    <Select value={form.duration} onValueChange={handleDurationChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Day (Fast Feedback)</SelectItem>
                        <SelectItem value="3">3 Days (Standard)</SelectItem>
                        <SelectItem value="7">1 Week (Detailed Testing)</SelectItem>
                        <SelectItem value="14">2 Weeks (Comprehensive)</SelectItem>
                        <SelectItem value="30">1 Month (Long-term)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Testing Deadline</Label>
                  <div className="mt-1 p-2 bg-muted rounded-md text-sm">
                    {new Date(form.endDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Tester Criteria</h4>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={form.isAnonymous}
                      onCheckedChange={(checked) => setForm({ ...form, isAnonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous">Allow anonymous feedback</Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reputation"
                        checked={form.requiresReputation}
                        onCheckedChange={(checked) => setForm({ ...form, requiresReputation: checked as boolean })}
                      />
                      <Label htmlFor="reputation">Require minimum reputation score</Label>
                    </div>
                    {form.requiresReputation && (
                      <div className="ml-6">
                        <Label htmlFor="minRep">Minimum Reputation</Label>
                        <Input
                          id="minRep"
                          type="number"
                          value={form.minReputation}
                          onChange={(e) => setForm({ ...form, minReputation: Number.parseInt(e.target.value) || 0 })}
                          className="mt-1 w-32"
                          min="0"
                          placeholder="e.g., 100"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Higher scores = more experienced testers</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <Button onClick={() => setCurrentStep(4)}>Next: Review</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Publish</CardTitle>
                <CardDescription>Review your testing request before publishing to the marketplace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">PROJECT</h4>
                    <p className="text-lg font-semibold">{form.title}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">TESTING SCOPE</h4>
                    <p className="text-sm">{form.description}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">CATEGORY</h4>
                      <Badge variant="secondary" className="capitalize">
                        {form.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">FEEDBACK TYPE</h4>
                      <Badge variant="outline" className="capitalize">
                        {form.type === 'single' ? 'Structured' : 'Open'} Feedback
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">FEEDBACK QUESTIONS</h4>
                    <div className="space-y-2 mt-2">
                      {form.options
                        .filter((opt) => opt.text.trim())
                        .map((option, index) => (
                          <div key={option.id} className="flex items-start space-x-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm">{option.text}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">TESTING PERIOD</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {form.startDate} to {form.endDate}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">TESTER REQUIREMENTS</h4>
                      <div className="space-y-1 mt-1">
                        {form.isAnonymous && <Badge variant="outline">Anonymous OK</Badge>}
                        {form.requiresReputation && <Badge variant="outline">Min Rep: {form.minReputation}</Badge>}
                        {!form.requiresReputation && <Badge variant="outline">All Skill Levels</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Ready to Publish to Marketplace</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Your testing request will be registered on the Moca Network blockchain and become available to vetted testers immediately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Previous
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || !validateForm()}>
                      {isSubmitting ? (
                        <>
                          <Settings className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Publish to Marketplace
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
