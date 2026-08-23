import JSZip from "jszip"
import type { Submission, Rsvp } from "../types"

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
    saveBlob(out, filename)
}

// Exports the RSVP list as a CSV the honoree can hand to the caterer.
export function downloadRsvpCsv(rsvps: Rsvp[], filename = 'jerry-rsvps.csv') {
    const rows = [
        ['Name', 'Contact', 'Attending', 'Additional guests', 'Party size', 'Dietary', 'RSVP date'],
        ...rsvps.map((r) => [
            r.name,
            r.contact,
            r.attending ? 'Yes' : 'No',
            String(r.attending ? r.guests : 0),
            String(r.attending ? r.guests + 1 : 0),
            r.dietary.join('; '),
            new Date(r.created_at).toLocaleDateString(),
        ]),
    ]
    const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
    saveBlob(new Blob([csv], { type: 'text/csv' }), filename)
}

// Wrap a CSV cell in quotes and escape embedded quotes
function csvCell(value: string): string {
    return `"${String(value).replace(/"/g, '""')}"`
}

function saveBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}
