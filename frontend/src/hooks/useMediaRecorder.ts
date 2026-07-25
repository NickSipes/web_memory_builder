import { useState, useRef, useEffect } from "react";

// The five states the recorder can be in
// This is a state machine - only certain transitions are valid
type RecordState = 'idle' | 'requesting' | 'ready' | 'recording' | 'preview'
// idle -> user hasn't interacted yet
// requesting -> getUserMedia() promise is in-flight
// ready -> camera stream is acquired, showing live preview
// recording -> MediaRecorder.start() called
// preview -> MediaRecorder.stop() called, blob is ready to review

interface UseMediaRecorderReturn {
    recordState: RecordState
    videoRef: React.RefObject<HTMLVideoElement | null>
    previewUrl: string | null
    videoBlob: Blob | null
    startCamera: () => Promise<void>
    startRecording: () => void
    stopRecording: () => void
    resetRecording: () => void
}

export function useMediaRecorder(): UseMediaRecorderReturn {
    // State - these drive re-renders and what the UI shows
    const [recordState, setRecordState] = useState<RecordState>('idle')
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null)

    // Refs - mutable values that don't cause re-renders
    const videoRef = useRef<HTMLVideoElement>(null) // the <video> DOM element
    const streamRef = useRef<MediaStream | null>(null) // the camera stream
    const recorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<BlobPart[]>([]) // raw data chunks

    // Stop camera tracks and free the stream
    function stopStream() {
        streamRef.current?.getTracks().forEach(t => t.stop())
        streamRef.current = null
    }

    // Cleanup when the component unmounts - stops the camera light
    // React calls the callback after the component renders
    useEffect(() => {
        // A cleanup function is returned
        return () => {
            // Stop all media tracks on the stream
            stopStream()
            // If a blob URL was created, release it
            if (previewUrl) URL.revokeObjectURL(previewUrl)
        }
    }, []) // The dependency array is empty, so this will only run on the first render

    async function startCamera() {
        setRecordState('requesting')
        try {
            // Asks the browser for camera + mic access.
            // Returns a MediaStream - a live feed of audio/video tracks
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            })
            streamRef.current = stream

            // Attach the live stream to the <video> element so the user
            // can see themselves before they start recording
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }

            setRecordState('ready')
        } catch (err) {
            // User denied camera access or no camera found
            console.error('Camera access denited:', err)
            setRecordState('idle')
        }
    }

    function startRecording() {
        if (!streamRef.current) return
        chunksRef.current = []

        const recorder = new MediaRecorder(streamRef.current)
        recorderRef.current = recorder

        // MediaRecorder fires this event periodically with chunks of encoded video
        // We push each chunk into an array - they'll be assembled on stop.
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        // Fires after stop() completes. We assemble all chunks into one Blob here.
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, {type: 'video/webm' })

            // createObjectURL creates a temporary browser URL for this Blob.
            // You can use it as a <video src> to play back the recording.
            const url = URL.createObjectURL(blob)

            setVideoBlob(blob)
            setPreviewUrl(url)
            setRecordState('preview')
            stopStream() // Camera light goes off - user is done recording
        }

        recorder.start()
        setRecordState('recording')
    }

    function stopRecording() {
        // stop() is async -- onstop fires when it's actually finished
        recorderRef.current?.stop()
    }

    function resetRecording() {
        // Release the blob URL from memory before discarding it
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
        setVideoBlob(null)
        setRecordState('idle')
    }

    return {
        recordState,
        videoRef,
        previewUrl,
        videoBlob,
        startCamera,
        startRecording,
        stopRecording,
        resetRecording,
    }
}