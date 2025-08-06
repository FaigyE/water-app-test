"use client"

import { useRef } from "react"
import { ReportCoverPage } from "@/components/report-cover-page"
import { ReportLetterPage } from "@/components/report-letter-page"
import { ReportDetailPage } from "@/components/report-detail-page"
import { ReportNotesPage } from "@/components/report-notes-page"
import { PrintButton } from "@/components/print-button"
import { EnhancedPdfButton } from "@/components/enhanced-pdf-button"
import { useReportContext } from "@/lib/report-context"
import { Toggle } from "@/components/ui/toggle"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportPage() {
  const reportContainerRef = useRef<HTMLDivElement>(null)
  const { reportData, toggleSectionEnabled } = useReportContext()

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
      <div className="no-print mb-4 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Report Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {Object.entries(reportData.sections).map(([key, section]) => (
              <div key={key} className="flex items-center space-x-2">
                <Toggle
                  id={`toggle-${key}`}
                  pressed={section.enabled}
                  onPressedChange={() => toggleSectionEnabled(key as keyof typeof reportData.sections)}
                  aria-label={`Toggle ${section.title} section`}
                >
                  {section.enabled ? "Enabled" : "Disabled"}
                </Toggle>
                <Label htmlFor={`toggle-${key}`}>{section.title}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="no-print mb-4 flex w-full max-w-4xl justify-end space-x-2">
        <PrintButton />
        <EnhancedPdfButton reportContainerRef={reportContainerRef} />
      </div>

      <div ref={reportContainerRef} className="report-container w-full max-w-4xl bg-white shadow-lg print:shadow-none">
        {reportData.sections.coverPage.enabled && <ReportCoverPage />}
        {reportData.sections.letterPage.enabled && <ReportLetterPage />}
        {reportData.sections.detailPage.enabled && <ReportDetailPage />}
        {reportData.sections.notesPage.enabled && <ReportNotesPage />}
      </div>
    </div>
  )
}