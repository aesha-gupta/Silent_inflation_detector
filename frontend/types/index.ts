export interface MonthlySpending {
  month: string
  food: number
  housing: number
  transport: number
  clothing: number
  healthcare: number
  entertainment: number
  others: number
}

export interface InflationResult {
  month: string
  personal_inflation_rate: number
  national_cpi_rate: number
  difference: number
  category_contributions: Record<string, number>
  entertainment_spend: number
  entertainment_flagged: boolean
}

export interface ForecastPoint {
  month: string
  predicted: number
  lower: number
  upper: number
}

export interface ForecastResult {
  category: string
  forecast: ForecastPoint[]
}

export interface AnomalyResult {
  month: string
  method?: 'zscore' | 'isolation_forest' | 'small_sample_guardrail'
  confidence?: 'low' | 'medium' | 'high'
  category: string
  is_anomaly: boolean
  zscore: number
  direction: string
  message: string
}

export interface InsightCard {
  type: 'warning' | 'info' | 'positive' | 'flag'
  title: string
  body: string
  category: string | null
}

export interface WhatIfResult {
  original_inflation: number
  new_inflation: number
  delta: number
  message: string
}

export interface VulnerabilityResult {
  score: number
  band: 'Low' | 'Medium' | 'High'
  color: 'green' | 'amber' | 'red'
  dominant_driver: string
  message: string
  category_contributions: Record<string, number>
  month: string
}

export interface BusinessInflationResult {
  business_inflation_rate: number
  wpi_general_rate: number
  difference: number
  category_contributions: Record<string, number>
  top_cost_driver: string
  should_raise_prices: 'Yes' | 'Monitor' | 'No'
  raise_prices_message: string
  sector_display_name: string
}

export interface BusinessInflationHistoryPoint extends BusinessInflationResult {
  month: string
}

export interface SectorDefinition {
  display_name: string
  categories: Record<string, string>
}
