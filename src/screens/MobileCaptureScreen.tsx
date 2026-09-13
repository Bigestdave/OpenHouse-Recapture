import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { OpenHouseLogoMark } from '../components/WorkspaceShell'
import { useStore, resolveCaptureRequest } from '../data/store'
import { resumePropertyWorkflow } from '../data/workflow'
import { uploadCaptureVideo } from '../lib/storage'
import { isDemoMode } from '../lib/runtime'
import { completeProductionCapture } from '../lib/productionWorkflow'
import { useDemoContext, DEMO_PROPERTY_LABEL } from '../context/DemoContext'
import demoLiving from '../assets/demo-living-room.jpg'
import demoExterior from '../assets/demo-exterior.jpg'
import propLivingPreviewImg from '../assets/prop-living-preview.png'
import propAdmiraltyThumbImg from '../assets/prop-admiralty-thumb.png'

// Crisp custom SVG icons matching reference exactly
function GreenCheckCircle({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="#3A724B" strokeWidth="1.25" />
      <path d="M5 8.2L7 10.2L11.2 5.8" stroke="#3A724B" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilledGreenCheck({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="#2F613D" />
      <path d="M5 8.2L7 10.2L11.2 5.8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WalkingFigureIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="2" />
      <path d="M7 21l3-4 2 2 4-6-2-4-4 1-2 4" />
      <path d="M12 11l-3 4-4-1" />
    </svg>
  )
}

function DottedSpinnerIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin text-[#3A724B]`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" strokeDasharray="4 4" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </svg>
  )
}

function PlayCircleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  )
}

function VideoCamIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="13" height="14" rx="2.5" />
      <polygon points="15 10 22 6 22 18 15 14 15 10" fill="currentColor" />
    </svg>
  )
}

function SofaIllustrationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M4 18v2M20 18v2" />
    </svg>
  )
}

function BalconyIllustrationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h16v10H4z" />
      <path d="M8 10v10M12 10v10M16 10v10" />
      <path d="M2 6h20M7 6V3M17 6V3" />
    </svg>
  )
}

export function MobileCaptureScreen() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setStage } = useDemoContext()
  const { properties, captureRequests } = useStore()
  const [mode, setMode] = useState<'intro' | 'recording' | 'checking' | 'submitted'>('intro')

  const isDemo = id === 'homestead-pool' || id === 'homestead-pd' || id?.includes('homestead') || id?.includes('pool') || id === 'laurel-balcony' || id === 'orchid-balcony' || id?.includes('laurel') || id?.includes('balcony') || !id

  // Find associated capture request or property
  const request = captureRequests.find(r => r.id === id || r.propertyId === id || r.status !== 'resolved') || captureRequests[0]
  const property = properties.find(p => p.id === request?.propertyId || p.id === id) || properties[0]

  // Recording & Media state
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [hasCameraStream, setHasCameraStream] = useState(false)

  const [seconds, setSeconds] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null)
  const [customVideoFile, setCustomVideoFile] = useState<File | null>(null)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [blurPrivate, setBlurPrivate] = useState(true)
  const [showExampleModal, setShowExampleModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [isPlayingCheck, setIsPlayingCheck] = useState(false)

  const propertyTitle = isDemo ? DEMO_PROPERTY_LABEL : (property?.title || '72691 Homestead Road, Palm Desert')
  const propertyLocation = isDemo ? 'Palm Desert, CA 92260' : (property?.address || 'Palm Desert, CA 92260')
  const propertyThumb = isDemo ? demoExterior : propAdmiraltyThumbImg
  const targetPreviewImg = isDemo ? demoLiving : propLivingPreviewImg

  // Initialize camera and recording when entering 'recording' mode
  useEffect(() => {
    if (mode === 'recording') {
      setSeconds(0)
      setIsRecording(true)
      recordedChunksRef.current = []

      // Attempt to get user camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream
              videoRef.current.play().catch(() => {})
              setHasCameraStream(true)
            }
            try {
              const recorder = new MediaRecorder(stream)
              recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                  recordedChunksRef.current.push(e.data)
                }
              }
              recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
                const url = URL.createObjectURL(blob)
                setRecordedVideoUrl(url)
              }
              recorder.start(500)
              mediaRecorderRef.current = recorder
            } catch (err) {
              console.warn('MediaRecorder error:', err)
            }
          })
          .catch((err) => {
            console.warn('Camera stream unavailable, using simulation:', err)
            setHasCameraStream(false)
          })
      }
    } else {
      // Clean up camera stream on leaving recording mode
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoRef.current.srcObject = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [mode])

  // Live timer for recording mode
  useEffect(() => {
    let interval: any
    if (mode === 'recording' && isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 15) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop()
            }
            setMode('checking')
            return 15
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [mode, isRecording])

  const handleSubmitCapture = async () => {
    setSubmissionError(null)
    setIsSubmitting(true)
    if (isDemo) {
      setStage(4)
    }
    try {
      const recordedFile = recordedChunksRef.current.length > 0
        ? new File(
            [new Blob(recordedChunksRef.current, { type: 'video/webm' })],
            `recapture_${Date.now()}.webm`,
            { type: 'video/webm' },
          )
        : null
      const captureFile = customVideoFile ?? recordedFile
      if (!isDemoMode) {
        if (!id) throw new Error('This capture link is missing its secure token.')
        if (!captureFile) throw new Error('Record or select a video before submitting.')
        await completeProductionCapture(id, captureFile)
        setMode('submitted')
        return
      }
      if (request) {
        if (captureFile) {
          const videoUrl = await uploadCaptureVideo(captureFile, request.id, captureFile.name)
          resolveCaptureRequest(request.id, [
            {
              id: `media-${Date.now()}`,
              url: videoUrl,
              type: 'video',
              room: request.room,
              quality: 'unchecked',
              uploadedAt: Date.now(),
            },
          ])
        } else {
          resolveCaptureRequest(request.id)
        }
        resumePropertyWorkflow(request.propertyId)
      } else if (property) {
        resumePropertyWorkflow(property.id)
      }
      setMode('submitted')
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'The capture could not be submitted. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formattedTime = `00:${seconds < 10 ? `0${seconds}` : seconds}`

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-0 sm:p-6 font-sans antialiased selection:bg-stone-200">
      
      {/* Mobile Device Frame Canvas */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[880px] sm:max-h-[920px] bg-[#FAF8F5] sm:rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.12)] sm:border-[6px] sm:border-[#1E2321] overflow-hidden flex flex-col justify-between relative">
        
        {/* ========================================================================= */}
        {/* VIEW 1: INTRO (CAPTURE REQUEST INTRODUCTION) */}
        {/* ========================================================================= */}
        {mode === 'intro' && (
          <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              
              {/* Top Header */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <OpenHouseLogoMark className="h-6 w-6 object-contain" />
                  <span className="text-[17px] font-extrabold tracking-tight text-[#0B1713]">
                    OpenHouse
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500 font-normal">
                  <svg className="h-3.5 w-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Secure capture</span>
                </div>
              </div>

              {/* Property Header */}
              <div className="flex items-center gap-3.5 pt-1">
                <img
                  src={propertyThumb}
                  alt={propertyTitle}
                  className="h-12 w-16 rounded-xl object-cover shadow-xs shrink-0"
                />
                <div>
                  <h2 className="text-[15px] font-bold text-stone-900 tracking-tight leading-tight">
                    {propertyTitle}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">{propertyLocation}</p>
                </div>
              </div>

              <div className="h-px bg-stone-200/80 my-1" />

              {/* Capture Needed Section */}
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#E06D2E] shrink-0" />
                  <span className="text-[11px] font-bold tracking-wider text-[#E06D2E] uppercase">
                    CAPTURE NEEDED
                  </span>
                </div>
                <h1 className="text-[22px] font-bold text-stone-900 tracking-tight leading-tight mt-1.5">
                  {isDemo ? 'Capture the pool & guest house path' : 'Capture the balcony entrance'}
                </h1>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {isDemo
                    ? 'OpenHouse needs to see how the main patio connects to the detached guest house.'
                    : 'OpenHouse needs to see how the living room connects to the balcony.'}
                </p>
              </div>

              {/* Living Room / Patio Perspective Preview with Orange Reticle */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-xs bg-stone-100">
                <img
                  src={targetPreviewImg}
                  alt="Target preview"
                  className="h-full w-full object-cover"
                />
                {/* Glowing Orange Target Bounding Reticle */}
                <div className="absolute inset-y-4 inset-x-8 sm:inset-y-5 sm:inset-x-10 rounded-xl border-2 border-[#E06D2E] shadow-[0_0_15px_rgba(224,109,46,0.35)] pointer-events-none" />
              </div>

              {/* How to capture row */}
              <div className="flex items-start gap-3 pt-1">
                <div className="h-10 w-10 rounded-full bg-[#EBF2EC] text-[#2F613D] flex items-center justify-center shrink-0 mt-0.5">
                  <WalkingFigureIcon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-[13px] font-bold text-stone-900">How to capture</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {isDemo
                      ? 'Start at the main living room patio. Walk slowly past the pool towards the guest house entrance.'
                      : 'Start in the living room. Walk slowly through the balcony doorway and finish after showing the full balcony.'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium pt-0.5">
                    <svg className="h-3.5 w-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>About 15 seconds</span>
                  </div>
                </div>
              </div>

              {/* Key points checklist */}
              <div className="rounded-2xl border border-stone-200/80 bg-[#FDFDFD] p-4 space-y-2 shadow-xs">
                <h3 className="text-xs font-bold text-stone-900">Key points</h3>
                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <GreenCheckCircle className="h-4 w-4 shrink-0" />
                    <span>{isDemo ? 'Show the patio pathway clearly' : 'Show the doorway clearly'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GreenCheckCircle className="h-4 w-4 shrink-0" />
                    <span>{isDemo ? 'Walk smoothly past the pool terrace' : 'Walk smoothly through'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GreenCheckCircle className="h-4 w-4 shrink-0" />
                    <span>{isDemo ? 'Finish with a view of the guest house' : 'Finish with a view of the balcony'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <button
                onClick={() => setShowExampleModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-stone-900 bg-white py-3.5 text-xs font-semibold text-stone-900 hover:bg-stone-50 active:scale-[0.99] transition-all"
              >
                <PlayCircleIcon className="h-4 w-4 text-stone-800" />
                <span>See a 10-second example</span>
              </button>

              <button
                onClick={() => {
                  setSeconds(0)
                  setIsRecording(true)
                  setMode('recording')
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0B1713] py-3.5 text-xs font-bold text-white hover:bg-black active:scale-[0.98] transition-all shadow-sm"
              >
                <VideoCamIcon className="h-4 w-4" />
                <span>Start capture</span>
              </button>

              {/* Optional: Load custom video file */}
              <div className="pt-1">
                <label className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 py-2.5 text-[11.5px] font-medium text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors">
                  <svg className="h-3.5 w-3.5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>{customVideoUrl ? '✓ Custom video loaded' : 'Load pre-recorded video (optional)'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const url = URL.createObjectURL(file)
                        setCustomVideoFile(file)
                        setCustomVideoUrl(url)
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-stone-500">
                <svg className="h-3.5 w-3.5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
                <span>No app or account required</span>
              </div>
            </div>

            {/* Example Modal */}
            {showExampleModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-stone-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">10-Second Example</h3>
                    <button
                      onClick={() => setShowExampleModal(false)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-stone-900 flex items-center justify-center">
                    <img src={propLivingPreviewImg} alt="Example preview" className="h-full w-full object-cover opacity-80" />
                    <div className="h-12 w-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg pl-0.5">
                      <PlayCircleIcon className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Walk steadily through the doorway into the balcony without fast panning.
                  </p>
                  <button
                    onClick={() => setShowExampleModal(false)}
                    className="w-full rounded-xl bg-[#0B1713] py-2.5 text-xs font-semibold text-white hover:bg-black"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: RECORDING (AR CAMERA VIEW HUD) */}
        {/* ========================================================================= */}
        {mode === 'recording' && (
          <div className="relative h-full flex-1 bg-black flex flex-col justify-between select-none overflow-hidden text-white font-sans">
            
            {/* Viewfinder Video / Background */}
            <div className="absolute inset-0 z-0 bg-black">
              {hasCameraStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : customVideoUrl ? (
                <video
                  src={customVideoUrl}
                  autoPlay
                  loop
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={demoLiving}
                  alt="AR Viewfinder"
                  className={`h-full w-full object-cover transition-transform duration-10000 ease-linear ${
                    isRecording ? 'scale-115 translate-y-[-10px]' : ''
                  }`}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75" />
            </div>

            {/* Top HUD Bar */}
            <div className="relative z-20 pt-5 px-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsRecording(false)
                  setMode('intro')
                }}
                className="h-9 w-9 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-black/80 transition-colors"
              >
                ✕
              </button>

              <div className="bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-xl text-xs font-medium text-white border border-white/10">
                Balcony entrance
              </div>

              <button
                onClick={() => setShowHelpModal(true)}
                className="h-9 px-3 rounded-xl bg-black/60 backdrop-blur-md text-white flex items-center gap-1.5 text-xs font-medium border border-white/10 hover:bg-black/80 transition-colors"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Help</span>
              </button>
            </div>

            {/* Center AR Guidance HUD */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-4 px-4">
              
              {/* Guidance Badges */}
              <div className="space-y-2 w-full max-w-[280px]">
                <div className="bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-2.5 border border-white/10 shadow-lg">
                  <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <span>Good position</span>
                </div>

                <div className="bg-black/65 backdrop-blur-md px-3.5 py-2 rounded-xl text-xs font-medium text-white flex items-center gap-2.5 border border-white/10 shadow-lg">
                  <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <WalkingFigureIcon className="h-3.5 w-3.5" />
                  </span>
                  <span>Move slowly through the doorway</span>
                </div>
              </div>

              {/* AR Target Reticle on Doorway */}
              <div className="w-[74%] h-[52%] rounded-3xl border-2 border-white/80 shadow-[0_0_20px_rgba(255,255,255,0.2)] pointer-events-none relative my-auto">
                <div className="absolute top-2 left-2 h-3 w-3 border-t-2 border-l-2 border-white" />
                <div className="absolute top-2 right-2 h-3 w-3 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-white" />
              </div>

              {/* Connection Progress Indicator Card */}
              <div className="bg-black/75 backdrop-blur-md px-5 py-3 rounded-2xl text-center border border-white/10 w-full max-w-[260px] shadow-2xl">
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Capturing connection</p>
                <p className="text-xs text-white font-semibold mt-0.5">Living room → Balcony</p>
                
                {/* Node progress bar */}
                <div className="relative flex items-center justify-between pt-2 px-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 z-10 ring-2 ring-emerald-400/30" />
                  <div className="flex-1 h-0.5 bg-white/20 mx-1.5 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-emerald-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, (seconds / 15) * 100)}%` }}
                    />
                  </div>
                  <div
                    className={`h-2 w-2 rounded-full z-10 transition-colors ${
                      seconds >= 14 ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-white/40'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Camera Controls Bar */}
            <div className="relative z-20 pb-5 px-5 space-y-3">
              <div className="flex items-center justify-between max-w-[300px] mx-auto">
                {/* Gallery Thumbnail */}
                <div className="flex flex-col items-center">
                  <img
                    src={propertyThumb}
                    alt="Gallery"
                    className="h-11 w-11 rounded-xl object-cover border border-white/30 shadow-md"
                  />
                </div>

                {/* Pause Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className="h-11 w-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-white/20 active:scale-95 transition-all"
                  >
                    {isRecording ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 pl-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </button>
                  <span className="text-[10px] text-white/80 mt-1 font-medium">
                    {isRecording ? 'Pause' : 'Resume'}
                  </span>
                </div>

                {/* Shutter Button with Countdown */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      setIsRecording(false)
                      setMode('checking')
                    }}
                    className="h-16 w-16 rounded-full border-[3.5px] border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="h-full w-full rounded-full bg-[#E03E3E]" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-white tracking-wider mt-1">
                    {formattedTime}
                  </span>
                </div>

                {/* Finish Button */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => {
                      setIsRecording(false)
                      setMode('checking')
                    }}
                    className="h-11 w-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center border border-white/10 hover:bg-white/20 active:scale-95 transition-all"
                  >
                    <div className="h-3 w-3 bg-white rounded-xs" />
                  </button>
                  <span className="text-[10px] text-white/80 mt-1 font-medium">Finish</span>
                </div>
              </div>

              {/* Privacy Blur Option */}
              <div className="border-t border-white/15 pt-2 flex items-center justify-center">
                <button
                  onClick={() => setBlurPrivate(!blurPrivate)}
                  className="flex items-center gap-1.5 text-xs text-white/90 font-medium hover:text-white"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke={blurPrivate ? '#52B788' : 'currentColor'} strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Blur private information</span>
                </button>
              </div>
            </div>

            {/* Help Modal */}
            {showHelpModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl text-stone-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Capture Tips</h3>
                    <button
                      onClick={() => setShowHelpModal(false)}
                      className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                    >
                      ✕
                    </button>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    <li>• Keep your phone upright at chest level.</li>
                    <li>• Walk slowly at a natural pace.</li>
                    <li>• Maintain visibility through the balcony doorway.</li>
                  </ul>
                  <button
                    onClick={() => setShowHelpModal(false)}
                    className="w-full rounded-xl bg-[#0B1713] py-2.5 text-xs font-semibold text-white hover:bg-black"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: CHECKING (QUALITY CHECK & PREVIEW) */}
        {/* ========================================================================= */}
        {mode === 'checking' && (
          <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              
              {/* Header */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <OpenHouseLogoMark className="h-6 w-6 object-contain" />
                  <span className="text-[17px] font-extrabold tracking-tight text-[#0B1713]">
                    OpenHouse
                  </span>
                </div>
                <h1 className="text-[22px] font-bold text-stone-900 tracking-tight leading-tight mt-3">
                  Checking your capture
                </h1>
              </div>

              {/* Property Row */}
              <div className="flex items-center gap-3 pt-0.5">
                <img
                  src={propertyThumb}
                  alt={propertyTitle}
                  className="h-11 w-14 rounded-lg object-cover shadow-xs shrink-0"
                />
                <div>
                  <h2 className="text-sm font-bold text-stone-900">{propertyTitle}</h2>
                  <p className="text-xs text-stone-500">{propertyLocation}</p>
                </div>
              </div>

              {/* Video Player Frame with Scrubber / Real Video */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden shadow-xs bg-stone-900 group">
                {recordedVideoUrl ? (
                  <video
                    src={recordedVideoUrl}
                    autoPlay
                    loop
                    playsInline
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={targetPreviewImg}
                    alt="Captured video playback"
                    className="h-full w-full object-cover"
                  />
                )}
                
                {!recordedVideoUrl && (
                  <div className="absolute inset-0 flex flex-col justify-between p-3.5 bg-gradient-to-t from-black/75 via-transparent to-black/20">
                    <div />
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => setIsPlayingCheck(!isPlayingCheck)}
                        className="h-12 w-12 rounded-full bg-white/95 text-stone-900 flex items-center justify-center hover:bg-white active:scale-95 transition-all shadow-lg pl-0.5"
                      >
                        {isPlayingCheck ? (
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {/* Timeline Scrubber */}
                    <div className="flex items-center gap-2.5 text-white text-[11px] font-mono">
                      <div className="flex-1 h-1 rounded-full bg-white/30 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-2/3 bg-white rounded-full" />
                        <div className="absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-white shadow-md" />
                      </div>
                      <span>00:15</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-1">
                <h3 className="text-[13px] font-bold text-stone-900">Capture looks good</h3>
                <div className="space-y-1.5 text-xs text-stone-700 font-medium">
                  <div className="flex items-center gap-2">
                    <GreenCheckCircle className="h-4 w-4 shrink-0" />
                    <span>Doorway remained visible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GreenCheckCircle className="h-4 w-4 shrink-0" />
                    <span>Movement was slow enough</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GreenCheckCircle className="h-4 w-4 shrink-0" />
                    <span>Lighting was sufficient</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GreenCheckCircle className="h-4 w-4 shrink-0" />
                    <span>Balcony was fully shown</span>
                  </div>
                </div>
              </div>

              {/* Privacy Banner */}
              <div className="rounded-xl border border-[#E0E8E2] bg-[#F2F5F3] p-3 text-xs text-stone-700 flex items-center gap-2 font-medium">
                <svg className="h-4 w-4 text-stone-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>No private information detected</span>
              </div>

              {/* Capture Path Diagram */}
              <div className="space-y-2 pt-1">
                <h3 className="text-[13px] font-bold text-stone-900">Capture path</h3>
                <div className="flex items-center justify-between px-6 py-3">
                  {/* Living Room Node */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-12 w-12 rounded-full bg-stone-100/90 border border-stone-200 flex items-center justify-center text-stone-700 shadow-xs">
                      <SofaIllustrationIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-stone-600">Living room</span>
                  </div>

                  {/* Arrow Line */}
                  <div className="flex-1 flex items-center justify-center px-4">
                    <div className="h-0.5 w-full bg-stone-900 relative">
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                        <svg className="h-3 w-3 text-stone-900" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="0 0 24 12 0 24" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Balcony Node */}
                  <div className="flex flex-col items-center gap-1.5 relative">
                    <div className="h-12 w-12 rounded-full bg-stone-100/90 border border-stone-200 flex items-center justify-center text-stone-700 shadow-xs">
                      <BalconyIllustrationIcon className="h-5 w-5" />
                    </div>
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#2F613D] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ✓
                    </span>
                    <span className="text-xs font-medium text-stone-600">Balcony</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4">
              <button
                onClick={handleSubmitCapture}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0B1713] py-3.5 text-xs font-bold text-white hover:bg-black active:scale-[0.98] transition-all shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l3 3 5-5" />
                </svg>
                <span>{isSubmitting ? 'Submitting capture…' : 'Use this capture'}</span>
              </button>
              {submissionError && <p className="text-[11px] text-center text-red-700">{submissionError}</p>}

              <button
                onClick={() => {
                  setSeconds(0)
                  setIsRecording(true)
                  setMode('recording')
                }}
                className="w-full rounded-xl border border-stone-900 bg-white py-3.5 text-xs font-semibold text-stone-900 hover:bg-stone-50 active:scale-[0.99] transition-all"
              >
                Record again
              </button>

              <p className="text-[11px] text-center text-stone-500 leading-snug px-2">
                OpenHouse will use this footage to resume preparation of the property experience.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: SUBMITTED (CAPTURE RECEIVED) */}
        {/* ========================================================================= */}
        {mode === 'submitted' && (
          <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar">
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-center gap-2 pt-1">
                <OpenHouseLogoMark className="h-6 w-6 object-contain" />
                <span className="text-[17px] font-extrabold tracking-tight text-[#0B1713]">
                  OpenHouse
                </span>
              </div>

              {/* Success Badge */}
              <div className="text-center space-y-2 pt-3">
                <div className="h-20 w-20 rounded-full bg-[#EBF2EC] flex items-center justify-center mx-auto shadow-xs">
                  <div className="h-10 w-10 rounded-full bg-[#2F613D] text-white flex items-center justify-center shadow-sm">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-[22px] font-bold text-stone-900 tracking-tight leading-tight">
                  Capture received
                </h1>
                <p className="text-xs text-stone-500 leading-relaxed max-w-[280px] mx-auto">
                  The balcony footage passed its initial check. OpenHouse has resumed preparation of {propertyTitle}.
                </p>
              </div>

              {/* Status Card */}
              <div className="rounded-2xl border border-stone-200/80 bg-[#FDFDFD] p-4 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={propertyThumb}
                    alt={propertyTitle}
                    className="h-11 w-14 rounded-lg object-cover shadow-xs shrink-0"
                  />
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">{propertyTitle}</h2>
                    <p className="text-xs text-stone-500">{propertyLocation}</p>
                  </div>
                </div>

                <div className="h-px bg-stone-200/80" />

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">Status</span>
                    <div className="flex items-center gap-1.5 font-medium text-stone-800">
                      <DottedSpinnerIcon className="h-3.5 w-3.5" />
                      <span>Preparing experience</span>
                    </div>
                  </div>
                  <div className="border-l border-stone-200/80 pl-3">
                    <span className="text-stone-400 text-[10px] uppercase tracking-wider font-semibold block mb-1">Expected update</span>
                    <div className="flex items-center gap-1.5 font-medium text-stone-800">
                      <svg className="h-3.5 w-3.5 text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>18–25 minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Happens Next Card */}
              <div className="rounded-2xl border border-stone-200/80 bg-[#FDFDFD] p-4 space-y-3.5 shadow-xs">
                <h3 className="text-xs font-bold text-stone-900">What happens next</h3>
                
                <div className="space-y-3 pl-1 text-xs">
                  {/* Step 1 */}
                  <div className="flex items-center gap-3">
                    <FilledGreenCheck className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-stone-800">New footage added</span>
                  </div>

                  <div className="border-l border-dashed border-stone-300 ml-[7px] h-3 my-0.5" />

                  {/* Step 2 */}
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full bg-[#2F613D] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      →
                    </div>
                    <span className="font-medium text-stone-800">Property experience resumed</span>
                  </div>

                  <div className="border-l border-dashed border-stone-300 ml-[7px] h-3 my-0.5" />

                  {/* Step 3 */}
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border border-stone-300 bg-white shrink-0" />
                    <span className="text-stone-400 font-normal">Final quality review</span>
                  </div>

                  <div className="border-l border-dashed border-stone-300 ml-[7px] h-3 my-0.5" />

                  {/* Step 4 */}
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border border-stone-300 bg-white shrink-0" />
                    <span className="text-stone-400 font-normal">Ready for approval</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-2 pt-4">
              <button
                onClick={() => navigate(isDemo ? '/property/homestead-pd' : (property ? `/show/${property.id}` : '/properties'))}
                className="w-full rounded-xl bg-[#0B1713] py-3.5 text-xs font-bold text-white hover:bg-black active:scale-[0.98] transition-all shadow-sm"
              >
                Return to Property Overview →
              </button>
              <p className="text-[11px] text-center text-stone-400">
                You can safely close this page or return to the overview.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
