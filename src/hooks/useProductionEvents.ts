import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../data/api'

export interface WorkflowEvent {
  id: string
  event_type: string
  payload: any
  created_at: string
  shot_id?: string
}

export function useProductionEvents(productionId: string | null) {
  const [events, setEvents] = useState<WorkflowEvent[]>([])
  const [lastEvent, setLastEvent] = useState<WorkflowEvent | null>(null)
  
  useEffect(() => {
    if (!productionId) return

    const eventSource = new EventSource(`${API_BASE_URL}/productions/${productionId}/events/stream`)

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as WorkflowEvent
        setEvents(prev => [...prev, data])
        setLastEvent(data)
      } catch (err) {
        console.error('Failed to parse SSE event:', err)
      }
    }

    eventSource.onerror = (e) => {
      console.error('SSE Error:', e)
    }

    return () => {
      eventSource.close()
    }
  }, [productionId])

  return { events, lastEvent }
}
