"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Upload,
  Zap,
  Lock,
  FileText,
  CheckCircle2,
  ArrowRight
} from "lucide-react"

export type VerificationMethod = 'zkproof' | 'document' | null

interface VerificationMethodSelectorProps {
  onSelectMethod: (method: VerificationMethod) => void;
  selectedMethod: VerificationMethod;
}

export function VerificationMethodSelector({
  onSelectMethod,
  selectedMethod
}: VerificationMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Choose Verification Method</h2>
        <p className="text-muted-foreground">
          Select how you'd like to verify your age (18+)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* ZK Proof Method */}
        <Card
          className={`cursor-pointer transition-all hover:border-primary ${
            selectedMethod === 'zkproof'
              ? 'border-primary shadow-lg ring-2 ring-primary ring-opacity-50'
              : 'hover:shadow-md'
          }`}
          onClick={() => onSelectMethod('zkproof')}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Zero-Knowledge Proof</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    Recommended
                  </Badge>
                </div>
              </div>
              {selectedMethod === 'zkproof' && (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardDescription className="mt-3">
              Use an existing age credential from your AIR wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Lock className="w-4 h-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Maximum Privacy</p>
                  <p className="text-xs text-muted-foreground">
                    Prove you're 18+ without revealing your birthdate
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Zap className="w-4 h-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Instant Verification</p>
                  <p className="text-xs text-muted-foreground">
                    No documents needed, verifies in seconds
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Shield className="w-4 h-4 mt-0.5 text-primary" />
                <div>
                  <p className="font-medium">Cryptographic Security</p>
                  <p className="text-xs text-muted-foreground">
                    Verified on MOCA Network blockchain
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                <strong>Requirements:</strong> You must have an age credential in your AIR wallet
              </p>
              {selectedMethod === 'zkproof' && (
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation()
                  onSelectMethod('zkproof')
                }}>
                  Continue with ZK Proof
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Method */}
        <Card
          className={`cursor-pointer transition-all hover:border-primary ${
            selectedMethod === 'document'
              ? 'border-primary shadow-lg ring-2 ring-primary ring-opacity-50'
              : 'hover:shadow-md'
          }`}
          onClick={() => onSelectMethod('document')}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upload ID Document</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    First-time users
                  </Badge>
                </div>
              </div>
              {selectedMethod === 'document' && (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <CardDescription className="mt-3">
              Verify your age by uploading a government-issued ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <FileText className="w-4 h-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">First-Time Verification</p>
                  <p className="text-xs text-muted-foreground">
                    No existing credential needed
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">Privacy Protected</p>
                  <p className="text-xs text-muted-foreground">
                    Document never stored, only age verified
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Lock className="w-4 h-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">Secure Processing</p>
                  <p className="text-xs text-muted-foreground">
                    Processed locally, deleted immediately
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                <strong>Accepted:</strong> Passport, Driver's License, or National ID
              </p>
              {selectedMethod === 'document' && (
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation()
                  onSelectMethod('document')
                }}>
                  Continue with Document Upload
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Your Privacy is Protected</p>
              <p className="text-xs text-muted-foreground">
                Both methods are privacy-preserving. With ZK proofs, your birthdate never leaves your wallet.
                With document upload, your ID is processed locally and immediately deleted - we only record
                that you're 18 or older.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
