export type PlanName = 'essencial' | 'pro' | 'premium'

export interface TierAnalysis {
  minimumPlan: PlanName
  featuresInUse: string[]
  downgradeWarnings: Record<string, string[]>
}
