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
    { number: 1, title: "Basic Info", description: "Title, description, and category" },
    { number: 2, title: "Options", description: "Poll options and type" },
    { number: 3, title: "Settings", description: "Duration and advanced settings" },
    { number: 4, title: "Review", description: "Review and publish" },
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
                <span className="text-primary-foreground font-bold text-sm">MP</span>
              </div>
              <span className="text-xl font-bold text-foreground">Create Poll</span>
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
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Provide the basic details for your poll</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="title">Poll Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear, descriptive title for your poll"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide context and details about what you're asking"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="nfts">NFTs</SelectItem>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!form.title || !form.description || !form.category}
                  >
                    Next: Options
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Options */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Poll Options</CardTitle>
                <CardDescription>Configure the options and response type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Response Type</Label>
                  <RadioGroup
                    value={form.type}
                    onValueChange={(value: "single" | "multiple") => setForm({ ...form, type: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single">Single Choice (users can select one option)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="multiple" id="multiple" />
                      <Label htmlFor="multiple">Multiple Choice (users can select multiple options)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Poll Options *</Label>
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {form.options.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${index + 1}`}
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
                    Next: Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Poll Settings</CardTitle>
                <CardDescription>Configure duration and advanced options</CardDescription>
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
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={form.duration} onValueChange={handleDurationChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Day</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">1 Week</SelectItem>
                        <SelectItem value="14">2 Weeks</SelectItem>
                        <SelectItem value="30">1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>End Date</Label>
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
                  <h4 className="font-medium">Advanced Settings</h4>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={form.isAnonymous}
                      onCheckedChange={(checked) => setForm({ ...form, isAnonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous">Anonymous responses (hide voter identities)</Label>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reputation"
                        checked={form.requiresReputation}
                        onCheckedChange={(checked) => setForm({ ...form, requiresReputation: checked as boolean })}
                      />
                      <Label htmlFor="reputation">Require minimum reputation to participate</Label>
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
                        />
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
                <CardDescription>Review your poll before publishing to the blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">TITLE</h4>
                    <p className="text-lg font-semibold">{form.title}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">DESCRIPTION</h4>
                    <p className="text-sm">{form.description}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">CATEGORY</h4>
                      <Badge variant="secondary" className="capitalize">
                        {form.category}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">TYPE</h4>
                      <Badge variant="outline" className="capitalize">
                        {form.type} Choice
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">OPTIONS</h4>
                    <div className="space-y-2 mt-2">
                      {form.options
                        .filter((opt) => opt.text.trim())
                        .map((option, index) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <span>{option.text}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">DURATION</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {form.startDate} to {form.endDate}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">SETTINGS</h4>
                      <div className="space-y-1 mt-1">
                        {form.isAnonymous && <Badge variant="outline">Anonymous</Badge>}
                        {form.requiresReputation && <Badge variant="outline">Min Rep: {form.minReputation}</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">Ready to Publish</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Your poll will be registered on the Moca Network blockchain and become available for
                        participation immediately.
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
                          Publish Poll
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
