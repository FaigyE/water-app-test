"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useReportContext } from "@/lib/report-context"
import { ImagePlus, Trash2 } from 'lucide-react'
import { type ChangeEvent, useRef } from "react"

export function ImageUploader() {
  const { reportData, updateReportData } = useReportContext()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5 MB limit
        addToast("Image size exceeds 5MB limit.", "destructive")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        updateReportData("images", [{ id: "cover", src: reader.result as string, alt: "Cover Image" }])
        addToast("Image uploaded successfully!", "success")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    updateReportData("images", [])
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Clear the file input
    }
    addToast("Cover image removed.", "info")
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="cover-image-upload" className="cursor-pointer">
        <Button asChild>
          <span>
            <ImagePlus className="mr-2 h-4 w-4" /> Upload Cover Image
          </span>
        </Button>
      </Label>
      <Input
        id="cover-image-upload"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        ref={fileInputRef}
      />
      {reportData.images.length > 0 && (
        <Button variant="destructive" onClick={handleRemoveImage}>
          <Trash2 className="mr-2 h-4 w-4" /> Remove Image
        </Button>
      )}
    </div>
  )
}