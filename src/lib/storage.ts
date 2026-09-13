import { supabase, isSupabaseConfigured } from './supabase'
import { isDemoMode } from './runtime'

function safeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120)
}

/**
 * Uploads a recorded video file or photo to the 'captures' bucket.
 * Returns the public or secure access URL.
 */
export async function uploadCaptureVideo(
  file: Blob | File,
  captureRequestId: string,
  fileName = `recapture_${Date.now()}.webm`
): Promise<string> {
  if (isDemoMode && !isSupabaseConfigured) {
    return URL.createObjectURL(file)
  }

  if (!isSupabaseConfigured) throw new Error('Capture storage is not configured.')

  const filePath = `${captureRequestId}/${Date.now()}-${safeFileName(fileName)}`
  const { error } = await supabase.storage
    .from('captures')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || 'video/webm',
    })

  if (error) throw new Error(`Could not upload capture: ${error.message}`)

  const { data, error: signedUrlError } = await supabase.storage
    .from('captures')
    .createSignedUrl(filePath, 60 * 60)
  if (signedUrlError || !data?.signedUrl) throw new Error('Capture uploaded but a secure preview URL could not be created.')
  return data.signedUrl
}

/**
 * Uploads property hero or space media to 'property-media' bucket.
 */
export async function uploadPropertyMedia(
  file: Blob | File,
  propertyId: string,
  fileName = `media_${Date.now()}.jpg`
): Promise<string> {
  if (isDemoMode && !isSupabaseConfigured) {
    return URL.createObjectURL(file)
  }

  if (!isSupabaseConfigured) throw new Error('Property media storage is not configured.')

  const filePath = `${propertyId}/${Date.now()}-${safeFileName(fileName)}`
  const { error } = await supabase.storage
    .from('property-media')
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || 'image/jpeg',
    })

  if (error) throw new Error(`Could not upload property media: ${error.message}`)

  const { data, error: signedUrlError } = await supabase.storage
    .from('property-media')
    .createSignedUrl(filePath, 60 * 60)
  if (signedUrlError || !data?.signedUrl) throw new Error('Media uploaded but a secure preview URL could not be created.')
  return data.signedUrl
}
