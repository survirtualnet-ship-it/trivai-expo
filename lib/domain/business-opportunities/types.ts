export type OpportunityPriority = 'high' | 'medium' | 'low'

export type OpportunityPriorityLabel = 'Alta' | 'Media' | 'Baja'

export type BusinessOpportunity = {
  id: string
  title: string
  description: string
  priority: OpportunityPriority
  priorityLabel: OpportunityPriorityLabel
  estimatedImpact: string
  action: string
  deepLink?: string
  completed: boolean
}

export type OpportunitiesInput = {
  placeId: string
  healthDimensions: { id: string; percent: number; hints: string[] }[]
  unansweredReviews: number
  productCount: number
  galleryCount: number
  hasPromotions: boolean
  descriptionLength: number
  hoursComplete: boolean
  completedIds?: string[]
}
