"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  Award,
  Calendar
} from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { useAirKit } from "@/contexts/airkit-context"
import { ConnectButton } from "@/components/connect-button"
import {
  issueAgeCredential,
  issueSocialCredential,
  issueCustomCredential,
  type CredentialField
} from "@/lib/credential-issuance"

export default function IssueCredentialPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAirKit()

  // Alert state
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Loading states
  const [issuingAge, setIssuingAge] = useState(false)
  const [issuingSocial, setIssuingSocial] = useState(false)
  const [issuingCustom, setIssuingCustom] = useState(false)

  // Age credential state
  const [birthdate, setBirthdate] = useState("")

  // Social credential state
  const [socialPlatform, setSocialPlatform] = useState("")
  const [socialUsername, setSocialUsername] = useState("")
  const [socialQualityScore, setSocialQualityScore] = useState(75)

  // Custom credential state
  const [customFields, setCustomFields] = useState<CredentialField[]>([
    { name: "name", type: "string", value: "" }
  ])

  const handleIssueAge = async () => {
    if (!user?.id) {
      setAlert({ type: 'error', message: 'Please connect your wallet first' })
      return
    }

    if (!birthdate) {
      setAlert({ type: 'error', message: 'Please enter your birthdate' })
      return
    }

    setIssuingAge(true)
    setAlert(null)

    try {
      const result = await issueAgeCredential(birthdate)

      if (result.success) {
        setAlert({ type: 'success', message: 'Age credential issued successfully!' })
        setBirthdate("")
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to issue age credential' })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to issue age credential'
      })
    } finally {
      setIssuingAge(false)
    }
  }

  const handleIssueSocial = async () => {
    if (!user?.id) {
      setAlert({ type: 'error', message: 'Please connect your wallet first' })
      return
    }

    if (!socialPlatform || !socialUsername) {
      setAlert({ type: 'error', message: 'Please enter platform and username' })
      return
    }

    setIssuingSocial(true)
    setAlert(null)

    try {
      const result = await issueSocialCredential(socialPlatform, socialUsername, socialQualityScore)

      if (result.success) {
        setAlert({ type: 'success', message: 'Social verification credential issued successfully!' })
        setSocialPlatform("")
        setSocialUsername("")
        setSocialQualityScore(75)
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to issue social credential' })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to issue social credential'
      })
    } finally {
      setIssuingSocial(false)
    }
  }

  const handleIssueCustom = async () => {
    if (!user?.id) {
      setAlert({ type: 'error', message: 'Please connect your wallet first' })
      return
    }

    const validFields = customFields.filter(f => f.name.trim() !== "")
    if (validFields.length === 0) {
      setAlert({ type: 'error', message: 'Please add at least one field' })
      return
    }

    setIssuingCustom(true)
    setAlert(null)

    try {
      const result = await issueCustomCredential(validFields)

      if (result.success) {
        setAlert({ type: 'success', message: 'Custom credential issued successfully!' })
        setCustomFields([{ name: "", type: "string", value: "" }])
      } else {
        setAlert({ type: 'error', message: result.error || 'Failed to issue custom credential' })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to issue custom credential'
      })
    } finally {
      setIssuingCustom(false)
    }
  }

  const addCustomField = () => {
    setCustomFields([...customFields, { name: "", type: "string", value: "" }])
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const updateCustomField = (index: number, field: Partial<CredentialField>) => {
    setCustomFields(customFields.map((f, i) => i === index ? { ...f, ...field } : f))
  }

  const renderFieldValueInput = (field: CredentialField, index: number) => {
    switch (field.type) {
      case 'boolean':
        return (
          <select
            value={field.value.toString()}
            onChange={(e) => updateCustomField(index, { value: e.target.value === 'true' })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        )
      case 'date':
        return (
          <Input
            type="date"
            value={typeof field.value === 'string' ? field.value : ""}
            onChange={(e) => updateCustomField(index, { value: e.target.value })}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={field.value.toString()}
            onChange={(e) => updateCustomField(index, { value: parseFloat(e.target.value) || 0 })}
            placeholder="Enter number"
          />
        )
      default:
        return (
          <Input
            type="text"
            value={field.value.toString()}
            onChange={(e) => updateCustomField(index, { value: e.target.value })}
            placeholder="Enter value"
          />
        )
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <SiteHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Issue Credentials</h1>
              <p className="text-muted-foreground">
                Issue verifiable credentials to your AIR wallet on the MOCA Network.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4 py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Please connect your MOCA wallet to issue credentials to your AIR wallet.
                  </p>
                </div>
                <div className="pt-4">
                  <ConnectButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Issue Credentials</h1>
            <p className="text-muted-foreground">
              Issue verifiable credentials to your AIR wallet. These credentials are stored on-chain and can be used for verification.
            </p>
          </div>
        </div>

        {alert && (
          <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            {alert.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="age" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="age">Age Credential</TabsTrigger>
            <TabsTrigger value="social">Social Verification</TabsTrigger>
            <TabsTrigger value="custom">Custom Credential</TabsTrigger>
          </TabsList>

          {/* Age Credential Tab */}
          <TabsContent value="age">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Issue Age Credential</CardTitle>
                    <CardDescription>
                      Issue an age credential to your AIR wallet with your birthdate
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    This will issue a credential containing your birthdate and age to your AIR wallet.
                    You can then use this credential for age verification without revealing your exact birthdate.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birthdate</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your birthdate will be stored in your AIR wallet as a verifiable credential
                  </p>
                </div>

                <Button
                  onClick={handleIssueAge}
                  disabled={issuingAge || !birthdate}
                  className="w-full"
                >
                  {issuingAge ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Issuing Credential...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Issue Age Credential
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Verification Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Issue Social Verification Credential</CardTitle>
                    <CardDescription>
                      Issue a credential for your verified social media account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    This will issue a credential containing your social media verification information.
                    First verify your account on the verification page, then issue the credential here.
                  </AlertDescription>
                </Alert>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <select
                      id="platform"
                      value={socialPlatform}
                      onChange={(e) => setSocialPlatform(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select platform</option>
                      <option value="GitHub">GitHub</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Lens">Lens Protocol</option>
                      <option value="Farcaster">Farcaster</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={socialUsername}
                      onChange={(e) => setSocialUsername(e.target.value)}
                      placeholder="your-username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality-score">Quality Score: {socialQualityScore}</Label>
                  <input
                    id="quality-score"
                    type="range"
                    min="0"
                    max="100"
                    value={socialQualityScore}
                    onChange={(e) => setSocialQualityScore(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Quality score from your account verification (0-100)
                  </p>
                </div>

                <Button
                  onClick={handleIssueSocial}
                  disabled={issuingSocial || !socialPlatform || !socialUsername}
                  className="w-full"
                >
                  {issuingSocial ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Issuing Credential...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Issue Social Credential
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Credential Tab */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Issue Custom Credential</CardTitle>
                      <CardDescription>
                        Create a custom credential with your own fields
                      </CardDescription>
                    </div>
                  </div>
                  <Button onClick={addCustomField} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Define custom fields for your credential. Each field has a name, type, and value.
                  </AlertDescription>
                </Alert>

                {customFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No fields added yet.</p>
                    <p className="text-sm">Click &quot;Add Field&quot; to start building your credential.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customFields.map((field, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div className="space-y-2">
                            <Label>Field Name</Label>
                            <Input
                              value={field.name}
                              onChange={(e) => updateCustomField(index, { name: e.target.value })}
                              placeholder="e.g., name, email"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <select
                              value={field.type}
                              onChange={(e) => updateCustomField(index, { type: e.target.value as CredentialField['type'] })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="date">Date</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Value</Label>
                            {renderFieldValueInput(field, index)}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              onClick={() => removeCustomField(index)}
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleIssueCustom}
                  disabled={issuingCustom || customFields.length === 0}
                  className="w-full"
                >
                  {issuingCustom ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Issuing Credential...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Issue Custom Credential
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <Card className="mt-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              How Credential Issuance Works:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Credentials are issued to your AIR wallet using MOCA Network&apos;s AIR Kit</li>
              <li>• All credentials are stored on-chain and cryptographically signed</li>
              <li>• You control your credentials and can use them for verification without revealing the full data</li>
              <li>• Age credentials support zero-knowledge proofs for privacy-preserving verification</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
