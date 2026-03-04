import { supabase } from './supabase/client'

// Helper to get current user from session
async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/session')
    const data = await response.json()
    return data.authenticated ? data.user : null
  } catch (error) {
    console.error('Failed to get session:', error)
    return null
  }
}

export const dreamOperations = {
  // Create a new dream
  async createDream(dreamData: Partial<Dream>) {
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data, error } = await supabase
      .from('dreams')
      .insert({
        title: dreamData.title,
        description: dreamData.description,
        category: dreamData.category || 'travel',
        estimated_cost: dreamData.estimated_cost,
        estimated_date: dreamData.estimated_date,
        created_by: user.email,
        created_by_type: user.userType,
        status: 'new'
      })
      .select()
      .single()

    if (error) {
      console.error('Create dream error:', error)
      throw error
    }
    
    return { data, error: null }
  },

  // Get all dreams
  async getDreams() {
    const { data, error } = await supabase
      .from('dreams')
      .select(`
        *,
        mutual_dreams(*),
        fulfill_requests(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Get dreams error:', error)
      throw error
    }
    
    return (data || []).map((dream: any) => {
      let status = 'new'
      
      if (dream.fulfilled_at) {
        status = 'fulfilled'
      } else {
        const pendingRequest = dream.fulfill_requests?.find((r: any) => r.status === 'pending')
        if (pendingRequest) {
          status = 'fulfill_requested'
        } else if (dream.mutual_dreams?.length > 0) {
          status = 'active'
        }
      }
      
      return {
        ...dream,
        status,
        activated_at: dream.mutual_dreams?.[0]?.activated_at,
        fulfill_requested_at: dream.fulfill_requests?.find((r: any) => r.status === 'pending')?.created_at,
        fulfill_requested_by: dream.fulfill_requests?.find((r: any) => r.status === 'pending')?.created_by
      }
    })
  },

  // Activate a dream (partner only)
  async activateDream(dreamId: number) {
    console.log('🔵 Activating dream:', dreamId)
    
    const user = await getCurrentUser()
    console.log('👤 Current user:', user)
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    if (user.userType !== 'partner') {
      throw new Error('Only partner can activate dreams')
    }

    // Check if already activated
    const { data: existing, error: checkError } = await supabase
      .from('mutual_dreams')
      .select('*')
      .eq('dream_id', dreamId)
      .maybeSingle()

    if (checkError) {
      console.error('Check existing error:', checkError)
      throw checkError
    }

    if (existing) {
      throw new Error('Dream is already active')
    }

    // Insert into mutual_dreams
    const { data, error } = await supabase
      .from('mutual_dreams')
      .insert({
        dream_id: dreamId,
        activated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Activate dream error:', error)
      throw error
    }

    console.log('✅ Dream activated successfully:', data)
    return { data, error: null }
  },

  // Request fulfillment (partner only)
  async requestFulfillment(dreamId: number) {
    console.log('🔵 Requesting fulfillment for dream:', dreamId)
    
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    if (user.userType !== 'partner') {
      throw new Error('Only partner can request fulfillment')
    }

    // Check if already requested
    const { data: existing, error: checkError } = await supabase
      .from('fulfill_requests')
      .select('*')
      .eq('dream_id', dreamId)
      .eq('status', 'pending')
      .maybeSingle()

    if (checkError) {
      console.error('Check existing error:', checkError)
      throw checkError
    }

    if (existing) {
      throw new Error('Fulfillment already requested')
    }

    const { data, error } = await supabase
      .from('fulfill_requests')
      .insert({
        dream_id: dreamId,
        created_by: user.email,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Request fulfillment error:', error)
      throw error
    }

    console.log('✅ Fulfillment requested successfully:', data)
    return { data, error: null }
  },

  // Approve fulfillment (you only)
  async approveFulfillment(dreamId: number) {
    console.log('🔵 Approving fulfillment for dream:', dreamId)
    
    const user = await getCurrentUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    if (user.userType !== 'me') {
      throw new Error('Only you can approve fulfillment')
    }

    // Update dream status
    const { error: dreamError } = await supabase
      .from('dreams')
      .update({
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString()
      })
      .eq('id', dreamId)

    if (dreamError) {
      console.error('Update dream error:', dreamError)
      throw dreamError
    }

    // Update fulfill request status
    const { error: requestError } = await supabase
      .from('fulfill_requests')
      .update({ status: 'approved' })
      .eq('dream_id', dreamId)

    if (requestError) {
      console.error('Update request error:', requestError)
      throw requestError
    }

    console.log('✅ Fulfillment approved successfully')
    return { success: true }
  }
}

export type Dream = {
  id: number
  title: string
  description: string
  category: string
  estimated_cost: number | null
  estimated_date: string | null
  created_at: string
  created_by: string
  created_by_type: 'me' | 'partner'
  status: 'new' | 'active' | 'fulfill_requested' | 'fulfilled'
  fulfilled_at: string | null
  image_url: string | null
  mutual_dreams?: any[]
  fulfill_requests?: any[]
  activated_at?: string
  fulfill_requested_at?: string
  fulfill_requested_by?: string
}