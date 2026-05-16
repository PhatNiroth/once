export type EventType = 'wedding' | 'birthday' | 'party' | 'corporate' | 'trip' | 'other'

export interface Event {
  id: string
  host_id: string
  name: string
  type: EventType
  date: string
  shot_limit: number
  guest_count: number
  reveal_at: string | null
  revealed: boolean
  paid: boolean
  join_code: string
  created_at: string
}

export interface Photo {
  id: string
  event_id: string
  guest_id: string
  storage_path: string
  url: string | null
  created_at: string
}

export interface Guest {
  id: string
  event_id: string
  name: string
  shots_taken: number
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  created_at: string
}
