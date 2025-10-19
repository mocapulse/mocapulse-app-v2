"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Building2,
  Target,
  Users,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Send,
  Settings,
  Clock,
  Star,
  Award
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"
import { useRouter } from "next/navigation"

interface ProjectForm {
  // Basic Information
  title: string
  description: string
  company: string
  companyDescription: string
  category: string

  // Project Details
  projectType: string
  features: string[]
  objectives: string[]

  // Tester Requirements
  testersNeeded: number
  difficulty: string
  minReputation: number
  requiredSpecializations: string[]
  maxTurnaroundTime: number
  qualityThreshold: number

  // Timeline & Budget
  duration: string
  startDate: string
  deadline: string
  paymentMin: number
  paymentMax: number
  paymentStructure: string

  // Settings
  isUrgent: boolean
  allowAnonymous: boolean
  requirePortfolio: boolean
  autoAccept: boolean

  // Additional
  additionalInfo: string
  contactEmail: string
}

const CATEGORIES = [
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

const PROJECT_TYPES = [
  "Alpha Testing",
  "Beta Testing",
  "Usability Testing",
  "Security Audit",
  "Performance Testing",
  "Bug Hunting",
  "Feature Validation",
  "User Experience Review"
]

const DIFFICULTY_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "Basic testing, no special skills required" },
  { value: "intermediate", label: "Intermediate", desc: "Some experience needed" },
  { value: "advanced", label: "Advanced", desc: "Experienced testers only" },
  { value: "expert", label: "Expert", desc: "Specialists with proven track record" }
]

const SPECIALIZATIONS = [
  "Mobile Apps",
  "Web Applications",
  "Web3 DApps",
  "NFT Platforms",
  "DeFi Protocols",
  "Gaming",
  "FinTech",
  "E-commerce",
  "Social Platforms",
  "Security Testing",
  "UX/UI Design",
  "Performance Testing"
]

const DURATION_OPTIONS = [
  { value: "3", label: "3 Days - Quick Feedback" },
  { value: "7", label: "1 Week - Standard Testing" },
  { value: "14", label: "2 Weeks - Comprehensive Testing" },
  { value: "21", label: "3 Weeks - Thorough Analysis" },
  { value: "30", label: "1 Month - Complete Evaluation" }
]

export default function CreateProjectPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState<ProjectForm>({
    // Basic Information
    title: "",
    description: "",
    company: "",
    companyDescription: "",
    category: "",

    // Project Details
    projectType: "",
    features: [""],
    objectives: [""],

    // Tester Requirements
    testersNeeded: 10,
    difficulty: "intermediate",
    minReputation: 100,
    requiredSpecializations: [],
    maxTurnaroundTime: 48,
    qualityThreshold: 80,

    // Timeline & Budget
    duration: "14",
    startDate: new Date().toISOString().split("T")[0],
    deadline: "",
    paymentMin: 100,
    paymentMax: 300,
    paymentStructure: "per-tester",

    // Settings
    isUrgent: false,
    allowAnonymous: true,
    requirePortfolio: false,
    autoAccept: false,

    // Additional
    additionalInfo: "",
    contactEmail: ""
  })

  const headerReveal = useScrollReveal()
  const formReveal = useScrollReveal()

  const addFeature = () => {
    setForm({ ...form, features: [...form.features, ""] })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...form.features]
    newFeatures[index] = value
    setForm({ ...form, features: newFeatures })
  }

  const removeFeature = (index: number) => {
    if (form.features.length > 1) {
      setForm({ ...form, features: form.features.filter((_, i) => i !== index) })
    }
  }

  const addObjective = () => {
    setForm({ ...form, objectives: [...form.objectives, ""] })
  }

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...form.objectives]
    newObjectives[index] = value
    setForm({ ...form, objectives: newObjectives })
  }

  const removeObjective = (index: number) => {
    if (form.objectives.length > 1) {
      setForm({ ...form, objectives: form.objectives.filter((_, i) => i !== index) })
    }
  }

  const calculateDeadline = (startDate: string, duration: string) => {
    const start = new Date(startDate)
    const days = parseInt(duration)
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000)
    return end.toISOString().split("T")[0]
  }

  const handleDurationChange = (duration: string) => {
    const deadline = calculateDeadline(form.startDate, duration)
    setForm({ ...form, duration, deadline })
  }

  const handleStartDateChange = (startDate: string) => {
    const deadline = calculateDeadline(startDate, form.duration)
    setForm({ ...form, startDate, deadline })
  }

  const toggleSpecialization = (spec: string) => {
    const current = form.requiredSpecializations
    if (current.includes(spec)) {
      setForm({ ...form, requiredSpecializations: current.filter(s => s !== spec) })
    } else {
      setForm({ ...form, requiredSpecializations: [...current, spec] })
    }
  }

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return form.title && form.description && form.company && form.category
      case 2:
        return form.projectType && form.features.filter(f => f.trim()).length >= 1
      case 3:
        return form.testersNeeded > 0 && form.difficulty
      case 4:
        return form.duration && form.paymentMin > 0 && form.paymentMax >= form.paymentMin
      case 5:
        return form.contactEmail.includes("@")
      default:
        return true
    }
  }

  const handleSubmit = async (isDraft = false) => {
    if (!validateCurrentStep() && !isDraft) return

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    const projectData = {
      ...form,
      id: `project_${Date.now()}`,
      status: isDraft ? "draft" : "open",
      createdAt: new Date().toISOString(),
      testersApplied: 0,
      featured: false
    }

    // Save to localStorage for demo
    const existingProjects = JSON.parse(localStorage.getItem("userProjects") || "[]")
    existingProjects.push(projectData)
    localStorage.setItem("userProjects", JSON.stringify(existingProjects))

    setIsSubmitting(false)
    router.push("/dashboard")
  }

  const steps = [
    { number: 1, title: "Basic Info", description: "Project and company details" },
    { number: 2, title: "Project Details", description: "Features and objectives" },
    { number: 3, title: "Tester Requirements", description: "Skills and criteria" },
    { number: 4, title: "Timeline & Budget", description: "Duration and payment" },
    { number: 5, title: "Review & Publish", description: "Final review" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header with Save Draft */}
        <div
          ref={headerReveal.ref}
          className={`mb-6 flex items-center justify-between transition-all duration-1000 ease-out ${
            headerReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div>
            <h1 className="text-3xl font-bold">Create Testing Project</h1>
            <p className="text-muted-foreground">Post a new project and find qualified testers</p>
          </div>
          <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
        {/* Progress Steps */}
        <div
          ref={formReveal.ref}
          className={`mb-8 transition-all duration-1000 ease-out delay-200 ${
            formReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="flex items-center justify-center mb-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors mb-2 ${
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
                  <div className="text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-shrink-0 w-8 md:w-16 h-0.5 bg-muted-foreground/20 mx-2 md:mx-4 mt-[-20px]"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Tell us about your project and company</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company">Company/Organization Name *</Label>
                    <Input
                      id="company"
                      placeholder="e.g., TechStartup Inc, OpenSource Labs"
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Project Category *</Label>
                    <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Revolutionary NFT Marketplace Beta Testing"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your project does, what needs testing, and what kind of feedback you're looking for..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Textarea
                    id="companyDescription"
                    placeholder="Brief description of your company and what you do (optional but recommended)"
                    value={form.companyDescription}
                    onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!validateCurrentStep()}
                  >
                    Next: Project Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Project Details
                </CardTitle>
                <CardDescription>Define what needs testing and your objectives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="projectType">Testing Type *</Label>
                  <Select value={form.projectType} onValueChange={(value) => setForm({ ...form, projectType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="What type of testing do you need?" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Key Features to Test *</Label>
                    <Button variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {form.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder={`Feature ${index + 1} (e.g., User authentication, NFT minting, Payment flow)`}
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                          />
                        </div>
                        {form.features.length > 1 && (
                          <Button variant="outline" size="sm" onClick={() => removeFeature(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Testing Objectives</Label>
                    <Button variant="outline" size="sm" onClick={addObjective}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Objective
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {form.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="flex-1">
                          <Input
                            placeholder={`Objective ${index + 1} (e.g., Identify usability issues, Validate new feature, Find security vulnerabilities)`}
                            value={objective}
                            onChange={(e) => updateObjective(index, e.target.value)}
                          />
                        </div>
                        {form.objectives.length > 1 && (
                          <Button variant="outline" size="sm" onClick={() => removeObjective(index)}>
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
                    disabled={!validateCurrentStep()}
                  >
                    Next: Tester Requirements
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Tester Requirements */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Tester Requirements
                </CardTitle>
                <CardDescription>Define the type of testers you need</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="testersNeeded">Number of Testers Needed *</Label>
                    <Input
                      id="testersNeeded"
                      type="number"
                      min="1"
                      max="100"
                      value={form.testersNeeded}
                      onChange={(e) => setForm({ ...form, testersNeeded: parseInt(e.target.value) || 1 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxTurnaroundTime">Max Response Time (hours)</Label>
                    <Select
                      value={form.maxTurnaroundTime.toString()}
                      onValueChange={(value) => setForm({ ...form, maxTurnaroundTime: parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 hours - Urgent</SelectItem>
                        <SelectItem value="24">24 hours - Fast</SelectItem>
                        <SelectItem value="48">48 hours - Standard</SelectItem>
                        <SelectItem value="72">72 hours - Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Difficulty Level *</Label>
                  <RadioGroup
                    value={form.difficulty}
                    onValueChange={(value) => setForm({ ...form, difficulty: value })}
                    className="mt-2 space-y-3"
                  >
                    {DIFFICULTY_LEVELS.map(level => (
                      <div key={level.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={level.value} id={level.value} />
                        <div className="flex-1">
                          <Label htmlFor={level.value} className="font-medium">{level.label}</Label>
                          <p className="text-sm text-muted-foreground">{level.desc}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="minReputation">Minimum Reputation Score</Label>
                    <Input
                      id="minReputation"
                      type="number"
                      min="0"
                      max="1000"
                      value={form.minReputation}
                      onChange={(e) => setForm({ ...form, minReputation: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">0 = No requirement, 500+ = Experienced testers</p>
                  </div>
                  <div>
                    <Label htmlFor="qualityThreshold">Quality Threshold (%)</Label>
                    <Input
                      id="qualityThreshold"
                      type="number"
                      min="0"
                      max="100"
                      value={form.qualityThreshold}
                      onChange={(e) => setForm({ ...form, qualityThreshold: parseInt(e.target.value) || 70 })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Minimum quality score for feedback acceptance</p>
                  </div>
                </div>

                <div>
                  <Label>Required Specializations</Label>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {SPECIALIZATIONS.map(spec => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          id={spec}
                          checked={form.requiredSpecializations.includes(spec)}
                          onCheckedChange={() => toggleSpecialization(spec)}
                        />
                        <Label htmlFor={spec} className="text-sm">{spec}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    disabled={!validateCurrentStep()}
                  >
                    Next: Timeline & Budget
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Timeline & Budget */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline & Budget
                </CardTitle>
                <CardDescription>Set project timeline and compensation</CardDescription>
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
                    <Label htmlFor="duration">Testing Duration *</Label>
                    <Select value={form.duration} onValueChange={handleDurationChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Project Deadline</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                    {new Date(form.deadline).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Compensation
                  </h4>

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <Label htmlFor="paymentMin">Minimum Payment ($) *</Label>
                      <Input
                        id="paymentMin"
                        type="number"
                        min="0"
                        value={form.paymentMin}
                        onChange={(e) => setForm({ ...form, paymentMin: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMax">Maximum Payment ($) *</Label>
                      <Input
                        id="paymentMax"
                        type="number"
                        min="0"
                        value={form.paymentMax}
                        onChange={(e) => setForm({ ...form, paymentMax: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Payment Structure</Label>
                    <RadioGroup
                      value={form.paymentStructure}
                      onValueChange={(value) => setForm({ ...form, paymentStructure: value })}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="per-tester" id="per-tester" />
                        <Label htmlFor="per-tester">Per Tester - Each tester receives payment individually</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="total-pool" id="total-pool" />
                        <Label htmlFor="total-pool">Total Pool - Payment divided among selected testers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="performance-based" id="performance-based" />
                        <Label htmlFor="performance-based">Performance Based - Payment based on quality of feedback</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Project Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isUrgent"
                        checked={form.isUrgent}
                        onCheckedChange={(checked) => setForm({ ...form, isUrgent: checked as boolean })}
                      />
                      <Label htmlFor="isUrgent">Mark as Urgent (higher visibility)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowAnonymous"
                        checked={form.allowAnonymous}
                        onCheckedChange={(checked) => setForm({ ...form, allowAnonymous: checked as boolean })}
                      />
                      <Label htmlFor="allowAnonymous">Allow anonymous feedback</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requirePortfolio"
                        checked={form.requirePortfolio}
                        onCheckedChange={(checked) => setForm({ ...form, requirePortfolio: checked as boolean })}
                      />
                      <Label htmlFor="requirePortfolio">Require portfolio/previous work examples</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoAccept"
                        checked={form.autoAccept}
                        onCheckedChange={(checked) => setForm({ ...form, autoAccept: checked as boolean })}
                      />
                      <Label htmlFor="autoAccept">Auto-accept qualified testers</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    disabled={!validateCurrentStep()}
                  >
                    Next: Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review & Publish */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Review & Publish
                </CardTitle>
                <CardDescription>Review your project before publishing to the marketplace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your-email@company.com"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Testers will use this to communicate with you</p>
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    placeholder="Any additional instructions, requirements, or information for testers..."
                    value={form.additionalInfo}
                    onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <Separator />

                {/* Project Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Project Summary</h4>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-2">PROJECT</h5>
                      <p className="font-medium">{form.title}</p>
                      <p className="text-sm text-muted-foreground">{form.company}</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-2">CATEGORY</h5>
                      <Badge variant="secondary">{form.category}</Badge>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm text-muted-foreground mb-2">DESCRIPTION</h5>
                    <p className="text-sm">{form.description}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-2">TESTERS NEEDED</h5>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{form.testersNeeded} testers</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-2">COMPENSATION</h5>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span>${form.paymentMin} - ${form.paymentMax}</span>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-2">DURATION</h5>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>{form.duration} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-2">REQUIREMENTS</h5>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          {form.difficulty}
                        </Badge>
                        {form.minReputation > 0 && (
                          <Badge variant="outline">
                            <Star className="w-3 h-3 mr-1" />
                            {form.minReputation}+ Rep
                          </Badge>
                        )}
                        {form.isUrgent && (
                          <Badge className="bg-red-500">
                            <Zap className="w-3 h-3 mr-1" />
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-sm text-muted-foreground mb-2">SPECIALIZATIONS</h5>
                      <div className="flex flex-wrap gap-1">
                        {form.requiredSpecializations.length > 0 ? (
                          form.requiredSpecializations.slice(0, 3).map(spec => (
                            <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No specific requirements</span>
                        )}
                        {form.requiredSpecializations.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{form.requiredSpecializations.length - 3} more
                          </Badge>
                        )}
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
                        Your testing project will be published to the Moca Edge marketplace and be visible to qualified testers immediately.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(4)}>
                    Previous
                  </Button>
                  <div className="space-x-2">
                    <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                      <Save className="w-4 h-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button onClick={() => handleSubmit(false)} disabled={isSubmitting || !validateCurrentStep()}>
                      {isSubmitting ? (
                        <>
                          <Settings className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Publish Project
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