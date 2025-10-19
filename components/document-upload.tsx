"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  Info
} from "lucide-react"
import {
  validateDocumentFile,
  fileToBase64,
  getDocumentTypeName,
  type DocumentType,
} from "@/lib/document-verification"

interface DocumentUploadProps {
  userId: string;
  onSuccess: (result: any) => void;
  onCancel?: () => void;
}

export function DocumentUpload({ userId, onSuccess, onCancel }: DocumentUploadProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('passport')
  const [birthdate, setBirthdate] = useState('')
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file
    const validation = validateDocumentFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setDocumentFile(file)

    // Generate preview
    try {
      const base64 = await fileToBase64(file)
      setPreviewUrl(base64)
    } catch (err) {
      console.error('Failed to generate preview:', err)
      setError('Failed to preview document')
    }
  }

  const handleRemoveFile = () => {
    setDocumentFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate inputs
    if (!documentFile) {
      setError('Please upload a document')
      return
    }

    if (!birthdate) {
      setError('Please enter your birthdate')
      return
    }

    // Validate birthdate format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(birthdate)) {
      setError('Please enter birthdate in YYYY-MM-DD format')
      return
    }

    setIsUploading(true)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('userId', userId)
      formData.append('birthdate', birthdate)
      formData.append('documentType', documentType)
      formData.append('document', documentFile)

      // Submit to API
      const response = await fetch('/api/verify-age-document', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Verification failed')
      }

      if (result.isOver18) {
        setSuccess(true)
        // Clear file from memory
        handleRemoveFile()
        // Notify parent component
        setTimeout(() => onSuccess(result), 1500)
      } else {
        setError(result.error || 'Age verification failed')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsUploading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-500">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Age Verified Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your age credential has been issued. You can now apply to testing projects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Upload Government ID
        </CardTitle>
        <CardDescription>
          Verify your age by uploading a government-issued ID document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Privacy Notice */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              <strong>Privacy First:</strong> Your document is processed locally and <strong>never stored</strong>.
              Only your age verification (18+) is recorded. We cannot see your name, address, or document number.
            </AlertDescription>
          </Alert>

          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={(value) => setDocumentType(value as DocumentType)}
            >
              <SelectTrigger id="documentType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="national_id">National ID Card</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the type of government-issued ID you're uploading
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="document">Upload {getDocumentTypeName(documentType)}</Label>
            {!documentFile ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or PDF (max 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  id="document"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {previewUrl && documentFile.type.startsWith('image/') ? (
                      <img
                        src={previewUrl}
                        alt="Document preview"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded border flex items-center justify-center">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{documentFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(documentFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Birthdate Entry */}
          <div className="space-y-2">
            <Label htmlFor="birthdate">Your Birthdate</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              placeholder="YYYY-MM-DD"
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter your birthdate as shown on the document
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={!documentFile || !birthdate || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Verify Age
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Supported formats: JPG, PNG, PDF (max 5MB)</p>
            <p>• Document must be clear and readable</p>
            <p>• You must be 18 years or older</p>
            <p>• Your document is processed securely and never stored</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
