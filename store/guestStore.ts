import { create } from 'zustand'
import { Guest, Event } from '../types'

interface GuestState {
  guestId: string | null
  guestName: string | null
  currentEvent: Event | null
  shotsTaken: number
  setGuest: (id: string, name: string) => void
  setEvent: (event: Event) => void
  incrementShots: () => void
  reset: () => void
}

export const useGuestStore = create<GuestState>((set) => ({
  guestId: null,
  guestName: null,
  currentEvent: null,
  shotsTaken: 0,
  setGuest: (id, name) => set({ guestId: id, guestName: name }),
  setEvent: (event) => set({ currentEvent: event }),
  incrementShots: () => set((s) => ({ shotsTaken: s.shotsTaken + 1 })),
  reset: () => set({ guestId: null, guestName: null, currentEvent: null, shotsTaken: 0 }),
}))
