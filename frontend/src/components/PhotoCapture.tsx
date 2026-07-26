import { useEffect, useRef, useState } from "react";

// Camera-based photo capture: live preview → grab a frame to a canvas → JPEG blob.
type State = 'idle' | 'requesting' | 'ready' | 'captured'

export default function PhotoCapture({ onPhotoReady }: { onPhotoReady: (blob: Blob) => void }) {
    const [state, setState] = useState<State>('idle')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const blobRef = useRef<Blob | null>(null)

    function stopStream() {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
    }

    // Stop the camera + free the preview URL on unmount
    useEffect(() => () => {
        stopStream()
        if (previewUrl) URL.revokeObjectURL(previewUrl)
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    async function startCamera() {
        setState('requesting')
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true })
            streamRef.current = stream
            if (videoRef.current) videoRef.current.srcObject = stream
            setState('ready')
        } catch (err) {
            console.error('Camera access denied:', err)
            setState('idle')
        }
    }

    function capture() {
        const video = videoRef.current
        if (!video) return
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')!.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
            if (!blob) return
            blobRef.current = blob
            setPreviewUrl(URL.createObjectURL(blob))
            setState('captured')
            stopStream()
        }, 'image/jpeg', 0.92)
    }

    function retake() {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        blobRef.current = null
        startCamera()
    }

    return (
        <div>
            <div className="camera-box">
                <video ref={videoRef} autoPlay muted playsInline
                    style={{ display: state === 'ready' ? 'block' : 'none' }} />
                {state === 'captured' && previewUrl && <img src={previewUrl} alt="Captured" style={{ width: '100%' }} />}
                {(state === 'idle' || state === 'requesting') && (
                    <div className="camera-overlay">
                        {state === 'requesting' ? 'Waiting for camera permission…' : 'Camera preview'}
                    </div>
                )}
            </div>

            {state === 'idle' && <button className="btn-outline" onClick={startCamera}>Allow camera access</button>}
            {state === 'ready' && <button className="btn-outline" onClick={capture}>📸 Take photo</button>}
            {state === 'captured' && (
                <div className="btn-row">
                    <button className="btn-ghost" onClick={retake}>Retake</button>
                    <button className="btn" onClick={() => blobRef.current && onPhotoReady(blobRef.current)}>Use this photo</button>
                </div>
            )}
        </div>
    )
}
