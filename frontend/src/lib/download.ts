import JSZip from "jszip"
import type { Submission } from "../types"

// Fetches each item's media (presigned S3 GET) and bundles them into one zip
// with friendly filenames, then triggers a browser download.
export async function downloadZip(items: Submission[], filename = 'jerry-messages.zip') {
    const withMedia = items.filter((s) => s.s3_key && s.playback_url)
    if (withMedia.length === 0) return

    const zip = new JSZip()
    for (const s of withMedia) {
        // cache:'no-store' avoids reusing the CORS-less response the <video>/<img>
        // element already cached (those requests carry no Origin, so S3's reply
        // has no Access-Control-Allow-Origin and a plain fetch of it would fail).
        const res = await fetch(s.playback_url!, { cache: 'no-store' })
        const blob = await res.blob()
        const ext = (s.s3_key!.split('.').pop() || 'bin').replace(/[^a-z0-9]/gi, '')
        const safe = `${s.name}-${s.relation}-${s.id}`.replace(/[^a-z0-9-]/gi, '_')
        zip.file(`${safe}.${ext}`, blob)
    }

    const out = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(out)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
