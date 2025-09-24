"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ConnectButton } from "@/components/connect-button"
import { useAirKit } from "@/contexts/airkit-context"
import { Shield, User, Star, Trophy, Edit3, Save, RefreshCw, CheckCircle, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  username: string
  walletAddress: string
  reputation: number
  badges: string[]
  joinDate: string
  pollsParticipated: number
  pollsCreated: number
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAirKit()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editForm, setEditForm] = useState({
    username: "",
    walletAddress: "",
  })


  // Load or create profile based on AIR Kit user
  useEffect(() => {
    console.log('Profile effect - isAuthenticated:', isAuthenticated, 'user:', user)

    if (isAuthenticated && user) {
      const savedProfile = localStorage.getItem("mocaEdgeProfile")
      let userProfile: UserProfile

      if (savedProfile) {
        userProfile = JSON.parse(savedProfile)
        console.log('Found saved profile:', userProfile)
        // Update with AIR Kit user data if different
        if (userProfile.id !== user.uuid && userProfile.id !== user.id) {
          userProfile = {
            ...userProfile,
            id: user.uuid || user.id,
            walletAddress: user.walletAddress || userProfile.walletAddress,
          }
        }
      } else {
        console.log('Creating new profile for user:', user)
        // Create new profile from AIR Kit user
        userProfile = {
          id: user.uuid || user.id,
          username: user.username || `User_${(user.uuid || user.id).slice(0, 8)}`,
          walletAddress: user.walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`,
          reputation: 100,
          badges: ["Moca Verified"],
          joinDate: new Date().toISOString().split("T")[0],
          pollsParticipated: 0,
          pollsCreated: 0,
        }
      }

      console.log('Setting profile:', userProfile)
      setProfile(userProfile)
      setEditForm({
        username: userProfile.username,
        walletAddress: userProfile.walletAddress,
      })

      localStorage.setItem("mocaEdgeProfile", JSON.stringify(userProfile))
    } else {
      console.log('Clearing profile - not authenticated or no user')
      // Clear profile if not authenticated
      setProfile(null)
    }
  }, [isAuthenticated, user])


  const saveProfile = () => {
    if (!profile) return

    const updatedProfile = {
      ...profile,
      username: editForm.username,
      walletAddress: editForm.walletAddress,
    }

    setProfile(updatedProfile)
    localStorage.setItem("mocaEdgeProfile", JSON.stringify(updatedProfile))
    setIsEditing(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getReputationLevel = (reputation: number) => {
    if (reputation >= 1000) return { level: "Expert", color: "text-yellow-500" }
    if (reputation >= 500) return { level: "Advanced", color: "text-blue-500" }
    if (reputation >= 200) return { level: "Intermediate", color: "text-green-500" }
    return { level: "Beginner", color: "text-gray-500" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ME</span>
              </div>
              <span className="text-xl font-bold text-foreground">Moca Edge</span>
            </Link>
            <ConnectButton />
          </div>
        </header>

        {/* Onboarding */}
        <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
          <div className="mb-8">
            <Shield className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Welcome to Moca Edge</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Connect your Moca ID to access your decentralized identity and start building your reputation on-chain.
            </p>
          </div>

          <Card className="p-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <User className="w-6 h-6" />
                Connect Your Moca Identity
              </CardTitle>
              <CardDescription>
                Your unique ID will be cryptographically secured and verifiable on the Moca Network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConnectButton />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const reputationLevel = getReputationLevel(profile.reputation)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ME</span>
            </div>
            <span className="text-xl font-bold text-foreground">Moca Edge</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/polls">Browse Polls</Link>
            </Button>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          <p>Debug: isLoading={String(isLoading)}, isAuthenticated={String(isAuthenticated)}, hasUser={String(!!user)}, hasProfile={String(!!profile)}</p>
          {user && <p>User ID: {user.uuid || user.id}</p>}
          {profile && <p>Profile ID: {profile.id}</p>}
        </div>

        {/* Profile Header */}
        <div className="mb-8">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${profile.id}`} />
                    <AvatarFallback className="text-2xl font-bold">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className={reputationLevel.color}>
                        <Star className="w-4 h-4 mr-1" />
                        {reputationLevel.level}
                      </Badge>
                      <Badge variant="outline">{profile.reputation} Reputation</Badge>
                    </div>
                    <p className="text-muted-foreground">Member since {profile.joinDate}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <div className="mt-1 p-2 bg-muted rounded-md">{profile.username}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {isEditing ? (
                      <Input
                        id="wallet"
                        value={editForm.walletAddress}
                        onChange={(e) => setEditForm({ ...editForm, walletAddress: e.target.value })}
                        className="flex-1"
                      />
                    ) : (
                      <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm">
                        {profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(profile.walletAddress)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex space-x-2">
                  <Button onClick={saveProfile}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-semibold mb-3">Moca Identity</h3>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <code className="flex-1 font-mono text-sm">{profile.id}</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(profile.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your verified identity on the Moca Network via AIR Kit
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats & Badges */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Polls Participated</span>
                  <span className="font-semibold">{profile.pollsParticipated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Polls Created</span>
                  <span className="font-semibold">{profile.pollsCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Reputation Score</span>
                  <span className="font-semibold text-primary">{profile.reputation}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="w-5 h-5" />
                Reputation Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary">
                    {badge}
                  </Badge>
                ))}
                {profile.badges.length === 0 && (
                  <p className="text-muted-foreground text-sm">Participate in polls to earn reputation badges!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">
              <User className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/polls">
              <Shield className="w-5 h-5 mr-2" />
              Browse Polls
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
