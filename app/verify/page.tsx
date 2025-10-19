"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  CheckCircle2,
  XCircle,
  Github,
  Twitter,
  Globe,
  FileText,
  Linkedin,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Trophy
} from "lucide-react"
import { useAirKit } from "@/contexts/airkit-context"
import {
  verifyAge,
  hasAgeVerification,
  getSocialVerifications,
  issueSocialCredential
} from "@/lib/credentials"
import {
  verifyGitHub,
  verifyLensProfile,
  verifyFarcaster,
  verifyTwitter,
  calculateOverallReputation,
  type SocialPlatform,
  type VerificationResult
} from "@/lib/social-verification"
import { VerificationBadgeList, VerificationStatus } from "@/components/verification-badge"

type VerificationStep = {
  id: SocialPlatform | 'age';
  name: string;
  description: string;
  icon: React.ElementType;
  tier: 1 | 2 | 3;
  completed: boolean;
  qualityScore?: number;
  username?: string;
};

export default function VerifyPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAirKit()
  const [isLoading, setIsLoading] = useState(true)
  const [ageVerified, setAgeVerified] = useState(false)
  const [verifications, setVerifications] = useState<VerificationResult[]>([])
  const [overallScore, setOverallScore] = useState(0)

  // Form states for each platform
  const [githubUsername, setGithubUsername] = useState("")
  const [lensHandle, setLensHandle] = useState("")
  const [farcasterUsername, setFarcasterUsername] = useState("")
  const [twitterUsername, setTwitterUsername] = useState("")

  // Loading states
  const [verifyingAge, setVerifyingAge] = useState(false)
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null)

  // Alert state
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Load existing verifications
  useEffect(() => {
    const loadVerifications = async () => {
      if (!user?.id) {
        setIsLoading(false)
        return
      }

      try {
        // Check age verification
        const hasAge = await hasAgeVerification(user.id)
        setAgeVerified(hasAge)

        // Load social verifications
        const socialVerifs = await getSocialVerifications(user.id)
        const verifResults: VerificationResult[] = socialVerifs.map(sv => sv.verificationData)
        setVerifications(verifResults)

        // Calculate overall score
        if (verifResults.length > 0) {
          const score = calculateOverallReputation(verifResults)
          setOverallScore(score)
        }
      } catch (error) {
        console.error('Failed to load verifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVerifications()
  }, [user])

  const handleAgeVerification = async () => {
    if (!user?.id) {
      setAlert({ type: 'error', message: 'Please connect your wallet first' })
      return
    }

    setVerifyingAge(true)
    setAlert(null)

    try {
      const verified = await verifyAge(user.id)

      if (verified) {
        setAgeVerified(true)
        setAlert({ type: 'success', message: 'Age verified successfully! You can now apply to projects.' })
      } else {
        setAlert({ type: 'error', message: 'Age verification failed or was cancelled' })
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to verify age. Please try again.' })
    } finally {
      setVerifyingAge(false)
    }
  }

  const handlePlatformVerification = async (
    platform: SocialPlatform,
    username: string
  ) => {
    if (!user?.id) {
      setAlert({ type: 'error', message: 'Please connect your wallet first' })
      return
    }

    if (!username.trim()) {
      setAlert({ type: 'error', message: `Please enter your ${platform} username` })
      return
    }

    setVerifyingPlatform(platform)
    setAlert(null)

    try {
      let result: VerificationResult

      switch (platform) {
        case 'github':
          result = await verifyGitHub(username)
          break
        case 'lens':
          result = await verifyLensProfile(username)
          break
        case 'farcaster':
          result = await verifyFarcaster(username)
          break
        case 'twitter':
          result = await verifyTwitter(username)
          break
        default:
          throw new Error(`Platform ${platform} not yet implemented`)
      }

      if (result.verified) {
        // Issue credential
        await issueSocialCredential(user.id, result)

        // Update local state
        setVerifications(prev => {
          const filtered = prev.filter(v => v.platform !== platform)
          return [...filtered, result]
        })

        // Recalculate overall score
        const updatedVerifs = verifications.filter(v => v.platform !== platform)
        updatedVerifs.push(result)
        const newScore = calculateOverallReputation(updatedVerifs)
        setOverallScore(newScore)

        setAlert({
          type: 'success',
          message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} verified successfully! Quality score: ${result.qualityScore}/100`
        })

        // Clear input
        switch (platform) {
          case 'github':
            setGithubUsername("")
            break
          case 'lens':
            setLensHandle("")
            break
          case 'farcaster':
            setFarcasterUsername("")
            break
          case 'twitter':
            setTwitterUsername("")
            break
        }
      } else {
        setAlert({
          type: 'error',
          message: `Verification failed: ${result.error || 'Account not found or invalid'}`
        })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Failed to verify ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setVerifyingPlatform(null)
    }
  }

  const isVerified = (platform: SocialPlatform): boolean => {
    return verifications.some(v => v.platform === platform && v.verified)
  }

  const getVerification = (platform: SocialPlatform): VerificationResult | undefined => {
    return verifications.find(v => v.platform === platform)
  }

  const totalVerifications = (ageVerified ? 1 : 0) + verifications.filter(v => v.verified).length
  const completionPercentage = Math.round((totalVerifications / 8) * 100) // 1 age + 7 social platforms

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to access verification features.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Account Verification</h1>
          <p className="text-muted-foreground">
            Verify your identity and connect social accounts to increase your reputation score and unlock more opportunities.
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

      {/* Overall Progress */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Progress</CardTitle>
              <CardDescription>
                {totalVerifications} of 8 verifications completed
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div className="text-right">
                <div className="text-2xl font-bold">{overallScore}</div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="mb-4" />
          <VerificationStatus
            hasAgeVerification={ageVerified}
            socialVerifications={verifications
              .filter(v => v.verified)
              .map(v => ({
                platform: v.platform,
                username: v.accountData?.username || v.accountData?.handle,
                qualityScore: v.qualityScore
              }))
            }
            overallScore={overallScore}
            compact={false}
          />
        </CardContent>
      </Card>

      {/* Age Verification */}
      <Card className={`mb-6 ${ageVerified ? 'border-green-500' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-600" />
              <div>
                <CardTitle>Age Verification (Required)</CardTitle>
                <CardDescription>
                  Verify you are 18+ using zero-knowledge proofs (your actual age remains private)
                </CardDescription>
              </div>
            </div>
            {ageVerified && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {ageVerified ? (
            <Alert className="border-green-500">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Age verified successfully. You can now apply to testing projects.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  MOCA AIR Kit uses zero-knowledge proofs to verify your age without revealing your birthdate.
                  Your privacy is fully protected.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleAgeVerification}
                disabled={verifyingAge}
                className="w-full"
              >
                {verifyingAge ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Age (18+)
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier 1 - Highest Priority */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default" className="text-sm">TIER 1 - Recommended</Badge>
          <span className="text-sm text-muted-foreground">Essential for quality verification</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* GitHub */}
          <Card className={isVerified('github') ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">GitHub</CardTitle>
                    <CardDescription>Technical expertise</CardDescription>
                  </div>
                </div>
                {isVerified('github') && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              </div>
            </CardHeader>
            <CardContent>
              {isVerified('github') ? (
                <div className="space-y-2">
                  <Alert className="border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Verified: @{getVerification('github')?.accountData?.username}
                      <br />
                      Quality Score: {getVerification('github')?.qualityScore}/100
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlatformVerification('github', githubUsername)}
                    disabled={verifyingPlatform !== null}
                    className="w-full"
                  >
                    Re-verify
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="github-username">GitHub Username</Label>
                    <Input
                      id="github-username"
                      placeholder="octocat"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      disabled={verifyingPlatform !== null}
                    />
                  </div>
                  <Button
                    onClick={() => handlePlatformVerification('github', githubUsername)}
                    disabled={verifyingPlatform !== null}
                    className="w-full"
                  >
                    {verifyingPlatform === 'github' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Github className="h-4 w-4 mr-2" />
                        Verify GitHub
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lens Protocol */}
          <Card className={isVerified('lens') ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-emerald-500" />
                  <div>
                    <CardTitle className="text-lg">Lens Protocol</CardTitle>
                    <CardDescription>Web3 social presence</CardDescription>
                  </div>
                </div>
                {isVerified('lens') && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              </div>
            </CardHeader>
            <CardContent>
              {isVerified('lens') ? (
                <div className="space-y-2">
                  <Alert className="border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Verified: {getVerification('lens')?.accountData?.handle}
                      <br />
                      Quality Score: {getVerification('lens')?.qualityScore}/100
                    </AlertDescription>
                  </Alert>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlatformVerification('lens', lensHandle)}
                    disabled={verifyingPlatform !== null}
                    className="w-full"
                  >
                    Re-verify
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="lens-handle">Lens Handle</Label>
                    <Input
                      id="lens-handle"
                      placeholder="vitalik.lens"
                      value={lensHandle}
                      onChange={(e) => setLensHandle(e.target.value)}
                      disabled={verifyingPlatform !== null}
                    />
                  </div>
                  <Button
                    onClick={() => handlePlatformVerification('lens', lensHandle)}
                    disabled={verifyingPlatform !== null}
                    className="w-full"
                  >
                    {verifyingPlatform === 'lens' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Verify Lens
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Farcaster */}
          <Card className={isVerified('farcaster') ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <div>
                    <CardTitle className="text-lg">Farcaster</CardTitle>
                    <CardDescription>Web3 builder community</CardDescription>
                  </div>
                </div>
                {isVerified('farcaster') && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              </div>
            </CardHeader>
            <CardContent>
              {isVerified('farcaster') ? (
                <div className="space-y-2">
                  <Alert className="border-green-500">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription>
                      Verified: @{getVerification('farcaster')?.accountData?.username}
                      <br />
                      Quality Score: {getVerification('farcaster')?.qualityScore}/100
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="farcaster-username">Farcaster Username</Label>
                    <Input
                      id="farcaster-username"
                      placeholder="dwr"
                      value={farcasterUsername}
                      onChange={(e) => setFarcasterUsername(e.target.value)}
                      disabled={verifyingPlatform !== null}
                    />
                  </div>
                  <Button
                    onClick={() => handlePlatformVerification('farcaster', farcasterUsername)}
                    disabled={verifyingPlatform !== null}
                    className="w-full"
                  >
                    {verifyingPlatform === 'farcaster' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        Verify Farcaster
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Note: Requires Neynar API key for production use
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tier 2 - High Value */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="text-sm">TIER 2 - Optional</Badge>
          <span className="text-sm text-muted-foreground">Enhance your profile</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Twitter */}
          <Card className={isVerified('twitter') ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Twitter className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">Twitter/X</CardTitle>
                    <CardDescription>Social presence</CardDescription>
                  </div>
                </div>
                {isVerified('twitter') && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="twitter-username">Twitter Username</Label>
                  <Input
                    id="twitter-username"
                    placeholder="jack"
                    value={twitterUsername}
                    onChange={(e) => setTwitterUsername(e.target.value)}
                    disabled={verifyingPlatform !== null}
                  />
                </div>
                <Button
                  onClick={() => handlePlatformVerification('twitter', twitterUsername)}
                  disabled={verifyingPlatform !== null}
                  className="w-full"
                >
                  {verifyingPlatform === 'twitter' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Twitter className="h-4 w-4 mr-2" />
                      Verify Twitter
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Note: Requires Twitter API credentials
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
