import { useEffect } from "react";
import { useMediaRecorder } from "../hooks/useMediaRecorder";

interface VideoRecorderProps {
    onVideoReady: (blob: Blob) => void
}

export default function VideoRecorder({ onVideoReady }: VideoRecorderProps) {
    const {
        recordState,
        videoRef,
        previewUrl,
        videoBlob,
        startCamera,
        startRecording,
        stopRecording,
        resetRecording,
    } = useMediaRecorder()

    // Prompt for the camera as soon as the recorder appears (video is the default
    // mode on the record page), so people aren't stuck on an extra "Allow" click.
    useEffect(() => { startCamera() }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const showLive = recordState === 'ready' || recordState === 'recording'

    return (
        <div>
            <div className="camera-box">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    style={{ display: showLive ? 'block' : 'none' }}
                />
                {recordState === 'preview' && previewUrl && (
                    <video src={previewUrl} controls playsInline />
                )}
                {(recordState === 'idle' || recordState === 'requesting') && (
                    <div className="camera-overlay">
                        {recordState === 'requesting' ? 'Waiting for camera permission…' : 'Camera preview'}
                    </div>
                )}
            </div>

            {recordState === 'idle' && (
                <button className="btn-outline" onClick={startCamera}>Allow camera access</button>
            )}
            {recordState === 'ready' && (
                <button className="btn-outline" onClick={startRecording}>⏺ Start recording</button>
            )}
            {recordState === 'recording' && (
                <button className="btn-outline" onClick={stopRecording}>⏹ Stop recording</button>
            )}
            {recordState === 'preview' && (
                <div className="btn-row">
                    <button className="btn-ghost" onClick={resetRecording}>Re-record</button>
                    <button className="btn" onClick={() => videoBlob && onVideoReady(videoBlob)}>Use this video</button>
                </div>
            )}
        </div>
    )
}
