"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReportData, ReportContextType, ReportSections, Note } from "./types"
import { loadNotesFromLocalStorage } from "./notes"

const ReportContext = createContext<ReportContextType | undefined>(undefined)

const getInitialReportData = (): ReportData => {
  return {
    clientName: "Client Name",
    reportDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    preparedBy: "Your Name",
    introduction:
      "This report outlines the findings and recommendations for water conservation efforts at the client's property.",
    conclusion:
      "Implementing the recommended changes will significantly reduce water consumption and lead to substantial savings.",
    aeratorData: [], // Always initialize as empty array
    notes: [], // Always initialize as empty array
    images: [], // Always initialize as empty array
    sections: {
      coverPage: { title: "Water Conservation Report", enabled: true },
      letterPage: { title: "Introduction Letter", enabled: true },
      detailPage: { title: "Aerator Details", enabled: true },
      notesPage: { title: "Additional Notes", enabled: true },
    },
  }
}

export const ReportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reportData, setReportData] = useState<ReportData>(() => {
    // Initialize with default values first
    const defaultData = getInitialReportData()
    
    // Try to load from localStorage only on client side
    if (typeof window !== "undefined") {
      try {
        const savedData = localStorage.getItem("reportData")
        if (savedData) {
          const parsedData = JSON.parse(savedData)
          // Ensure all required fields exist with proper defaults
          return {
            ...defaultData,
            ...parsedData,
            aeratorData: parsedData.aeratorData || [],
            notes: loadNotesFromLocalStorage() || [],
            images: parsedData.images || [],
            sections: {
              ...defaultData.sections,
              ...parsedData.sections,
            },
          }
        }
      } catch (error) {
        console.error("Error loading report data from localStorage:", error)
      }
    }
    
    return defaultData
  })

  // Effect to save reportData to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("reportData", JSON.stringify(reportData))
      } catch (error) {
        console.error("Error saving report data to localStorage:", error)
      }
    }
  }, [reportData])

  // Effect to listen for custom note update events
  useEffect(() => {
    const handleNoteUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Note[]>
      if (customEvent.detail) {
        setReportData((prevData) => ({
          ...prevData,
          notes: customEvent.detail,
        }))
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("notesUpdated", handleNoteUpdate)
      return () => {
        window.removeEventListener("notesUpdated", handleNoteUpdate)
      }
    }
  }, [])

  const updateReportData = useCallback(
    (key: keyof ReportData, value: any) => {
      setReportData((prevData) => ({
        ...prevData,
        [key]: value,
      }))
    },
    [],
  )

  const updateSectionTitle = useCallback(
    (section: keyof ReportSections, title: string) => {
      setReportData((prevData) => ({
        ...prevData,
        sections: {
          ...prevData.sections,
          [section]: {
            ...prevData.sections[section],
            title: title,
          },
        },
      }))
    },
    [],
  )

  const toggleSectionEnabled = useCallback(
    (section: keyof ReportSections) => {
      setReportData((prevData) => ({
        ...prevData,
        sections: {
          ...prevData.sections,
          [section]: {
            ...prevData.sections[section],
            enabled: !prevData.sections[section].enabled,
          },
        },
      }))
    },
    [],
  )

  return (
    <ReportContext.Provider
      value={{
        reportData,
        setReportData,
        updateReportData,
        updateSectionTitle,
        toggleSectionEnabled,
      }}
    >
      {children}
    </ReportContext.Provider>
  )
}

export const useReportContext = () => {
  const context = useContext(ReportContext)
  if (context === undefined) {
    throw new Error("useReportContext must be used within a ReportProvider")
  }
  return context
}