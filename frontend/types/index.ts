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
