"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { FileDown } from 'lucide-react'
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface EnhancedPdfButtonProps {
  reportContainerRef: React.RefObject<HTMLDivElement>
  fileName?: string
}

export function EnhancedPdfButton({ reportContainerRef, fileName = "report.pdf" }: EnhancedPdfButtonProps) {
  const { addToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePdf = async () => {
    if (!reportContainerRef.current) {
      addToast("Report content not found.", "destructive")
      return
    }

    setIsGenerating(true)
    addToast("Generating PDF...", "info")

    try {
      const input = reportContainerRef.current
      const pdf = new jsPDF("p", "pt", "letter") // 'letter' size: 612pt x 792pt
      const padding = 20 // Padding for the PDF page

      // Get all elements with class 'print-section'
      const printSections = input.querySelectorAll(".print-section")

      for (let i = 0; i < printSections.length; i++) {
        const section = printSections[i] as HTMLElement

        // Temporarily remove elements with 'no-print' class for screenshot
        const noPrintElements = section.querySelectorAll(".no-print")
        noPrintElements.forEach((el) => ((el as HTMLElement).style.display = "none"))

        const canvas = await html2canvas(section, {
          scale: 2, // Increase scale for better resolution
          useCORS: true, // Enable CORS for images
          logging: false, // Disable logging for cleaner console
        })

        // Restore 'no-print' elements
        noPrintElements.forEach((el) => ((el as HTMLElement).style.display = ""))

        const imgData = canvas.toDataURL("image/png")
        const imgWidth = 612 - 2 * padding // PDF width minus padding
        const pageHeight = 792 - 2 * padding // PDF height minus padding
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        let heightLeft = imgHeight
        let position = 0

        if (i > 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, "PNG", padding, padding + position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight
          pdf.addPage()
          pdf.addImage(imgData, "PNG", padding, padding + position, imgWidth, imgHeight)
          heightLeft -= pageHeight
        }
      }

      pdf.save(fileName)
      addToast("PDF generated successfully!", "success")
    } catch (error) {
      console.error("Error generating PDF:", error)
      addToast("Failed to generate PDF. Please try again.", "destructive")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={generatePdf} disabled={isGenerating} className="no-print">
      <FileDown className="mr-2 h-4 w-4" /> {isGenerating ? "Generating..." : "Download PDF"}
    </Button>
  )
}