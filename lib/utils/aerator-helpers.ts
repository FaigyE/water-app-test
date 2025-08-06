import type { AeratorData } from "@/lib/types"

export const calculateAeratorSavings = (data: AeratorData[]) => {
return data.map((item) => {
  const currentGPM = Number.parseFloat(item["Current GPM"]) || 0
  const newGPM = Number.parseFloat(item["New GPM"]) || 0
  const quantity = Number.parseInt(item.Quantity) || 0

  const savings = (currentGPM - newGPM) * quantity
  return {
    ...item,
    "Water Savings (GPM)": savings,
  }
})
}

export const summarizeAeratorSavings = (data: AeratorData[]) => {
const totalSavings = data.reduce(
  (sum, item) => sum + (Number.parseFloat(item["Water Savings (GPM)"] as string) || 0),
  0,
)
return totalSavings
}

export const getAeratorSummaryTable = (data: AeratorData[]) => {
const summary: { [key: string]: { current: number; new: number; quantity: number; savings: number } } = {}

data.forEach((item) => {
  const type = item["Aerator Type"]
  const currentGPM = Number.parseFloat(item["Current GPM"]) || 0
  const newGPM = Number.parseFloat(item["New GPM"]) || 0
  const quantity = Number.parseInt(item.Quantity) || 0
  const savings = (currentGPM - newGPM) * quantity

  if (!summary[type]) {
    summary[type] = { current: 0, new: 0, quantity: 0, savings: 0 }
  }
  summary[type].current += currentGPM * quantity
  summary[type].new += newGPM * quantity
  summary[type].quantity += quantity
  summary[type].savings += savings
})

return Object.entries(summary).map(([type, values]) => ({
  "Aerator Type": type,
  "Total Current GPM": values.current.toFixed(2),
  "Total New GPM": values.new.toFixed(2),
  "Total Quantity": values.quantity,
  "Total Water Savings (GPM)": values.savings.toFixed(2),
}))
}

export function formatNote(note: string): string {
// Capitalize the first letter of the note
if (!note) return ""
return note.charAt(0).toUpperCase() + note.slice(1)
}

export const consolidateInstallationsByUnitV2 = (data: any[]) => {
  const consolidated: { [key: string]: any } = {}
  
  data.forEach((item) => {
    const unit = item.Unit || item['Bldg/Unit'] || 'Unknown'
    
    if (!consolidated[unit]) {
      consolidated[unit] = {
        Unit: unit,
        'Kitchen Aerator': 0,
        'Bathroom aerator': 0,
        'Shower Head': 0,
        'Toilets Installed': 0,
        Notes: [],
        // Keep other fields from the first occurrence
        ...Object.keys(item).reduce((acc, key) => {
          if (!['Kitchen Aerator', 'Bathroom aerator', 'Shower Head', 'Toilets Installed', 'Notes'].includes(key)) {
            acc[key] = item[key]
          }
          return acc
        }, {} as any)
      }
    }
    
    // Count installations - only count non-zero, non-empty values
    if (item['Kitchen Aerator'] && item['Kitchen Aerator'] !== '0' && item['Kitchen Aerator'] !== '') {
      consolidated[unit]['Kitchen Aerator']++
    }
    if (item['Bathroom aerator'] && item['Bathroom aerator'] !== '0' && item['Bathroom aerator'] !== '') {
      consolidated[unit]['Bathroom aerator']++
    }
    if (item['Shower Head'] && item['Shower Head'] !== '0' && item['Shower Head'] !== '') {
      consolidated[unit]['Shower Head']++
    }
    if (item['Toilets Installed'] && item['Toilets Installed'] !== '0' && item['Toilets Installed'] !== '') {
      consolidated[unit]['Toilets Installed']++
    }
    
    // Collect notes
    if (item.Notes && item.Notes.trim() !== '') {
      consolidated[unit].Notes.push(item.Notes.trim())
    }
  })
  
  // Format the consolidated data
  return Object.values(consolidated).map((unit: any) => {
    return {
      ...unit,
      'Kitchen Aerator': unit['Kitchen Aerator'] > 1 ? `${unit['Kitchen Aerator']} (${unit['Kitchen Aerator']})` : unit['Kitchen Aerator'] > 0 ? '1' : '',
      'Bathroom aerator': unit['Bathroom aerator'] > 1 ? `${unit['Bathroom aerator']} (${unit['Bathroom aerator']})` : unit['Bathroom aerator'] > 0 ? '1' : '',
      'Shower Head': unit['Shower Head'] > 1 ? `${unit['Shower Head']} (${unit['Shower Head']})` : unit['Shower Head'] > 0 ? '1' : '',
      'Toilets Installed': unit['Toilets Installed'] > 1 ? `${unit['Toilets Installed']} (${unit['Toilets Installed']})` : unit['Toilets Installed'] > 0 ? '1' : '',
      Notes: unit.Notes.join('; ')
    }
  }).sort((a, b) => {
    const unitA = parseInt(a.Unit) || 0
    const unitB = parseInt(b.Unit) || 0
    return unitA - unitB
  })
}
