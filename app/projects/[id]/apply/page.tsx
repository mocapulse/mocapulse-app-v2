"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target } from "lucide-react"

export default function ProjectApplicationPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/projects/${params.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ME</span>
              </div>
              <span className="text-xl font-bold text-foreground">Apply to Project</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Apply to Project</CardTitle>
            <CardDescription>
              Project ID: {params.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This application form is under construction. The application process will be implemented here.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <Link href={`/projects/${params.id}`}>Back to Project</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/browse">Browse More Projects</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}