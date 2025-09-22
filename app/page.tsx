"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ConnectButton } from "@/components/connect-button"
import { ArrowRight, Shield, Users, Zap, CheckCircle, Globe, TrendingUp } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

export default function LandingPage() {
  const heroReveal = useScrollReveal()
  const howItWorksReveal = useScrollReveal()
  const featuresReveal = useScrollReveal()
  const ctaReveal = useScrollReveal()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MP</span>
            </div>
            <span className="text-xl font-bold text-foreground">Moca Pulse</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroReveal.ref}
        className={`py-20 px-4 transition-all duration-1000 ease-out ${
          heroReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Globe className="w-4 h-4 mr-2" />
            Built for Moca Network Buildathon
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Moca Pulse
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-4 text-balance">
            Verifiable Feedback & Reputation
          </p>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Generate your ID, join polls, and build constructive reputation on-chain. The future of decentralized
            feedback is here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/profile">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        ref={howItWorksReveal.ref}
        className={`py-20 px-4 bg-muted/30 transition-all duration-1000 ease-out delay-200 ${
          howItWorksReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Three simple steps to start building your verifiable reputation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Step 1 – Generate ID",
                description: "Create your unique decentralized identity with cryptographic verification",
                delay: "delay-300",
              },
              {
                icon: Users,
                title: "Step 2 – Join Polls",
                description: "Participate in community polls and surveys with transparent voting",
                delay: "delay-500",
              },
              {
                icon: TrendingUp,
                title: "Step 3 – Build Reputation",
                description: "Earn reputation points through constructive participation and feedback",
                delay: "delay-700",
              },
            ].map((step, index) => (
              <Card
                key={index}
                className={`p-8 text-center border-2 hover:border-primary/50 transition-all duration-1000 ease-out ${step.delay} ${
                  howItWorksReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground text-pretty">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section
        id="features"
        ref={featuresReveal.ref}
        className={`py-20 px-4 transition-all duration-1000 ease-out delay-400 ${
          featuresReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Key Features Preview</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Powerful tools for decentralized feedback and reputation management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Unique ID & Reputation",
                description: "Cryptographically secure identity with verifiable reputation scoring",
                delay: "delay-500",
              },
              {
                icon: Users,
                title: "Poll Creation & Participation",
                description: "Create and participate in polls with transparent, tamper-proof results",
                delay: "delay-700",
              },
              {
                icon: Zap,
                title: "On-chain Transparency",
                description: "All interactions recorded on blockchain for complete transparency",
                delay: "delay-900",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-1000 ease-out ${feature.delay} ${
                  featuresReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaReveal.ref}
        className={`py-20 px-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 transition-all duration-1000 ease-out delay-600 ${
          ctaReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Ready to Build Your Reputation?</h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Join the future of decentralized feedback and start building your verifiable reputation today.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link href="/profile">
              Get Started Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">MP</span>
            </div>
            <span className="text-lg font-semibold">Moca Pulse</span>
          </div>
          <p className="text-muted-foreground mb-4">Built for Moca Network Buildathon</p>
          <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Decentralized</span>
            <span className="mx-2">•</span>
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Transparent</span>
            <span className="mx-2">•</span>
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>Verifiable</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
