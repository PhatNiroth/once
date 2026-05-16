export function getPriceForGuests(guestCount: number): number {
  if (guestCount <= 10) return 2
  if (guestCount <= 25) return 8
  if (guestCount <= 50) return 15
  if (guestCount <= 100) return 30
  if (guestCount <= 150) return 50
  return 75
}

export function getPricingTier(guestCount: number): string {
  if (guestCount <= 10) return 'Micro ($2)'
  if (guestCount <= 25) return 'Small ($8)'
  if (guestCount <= 50) return 'Medium ($15)'
  if (guestCount <= 100) return 'Large ($30)'
  if (guestCount <= 150) return 'XL ($50)'
  return 'XXL ($75)'
}
