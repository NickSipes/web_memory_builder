import type { Page } from '@playwright/test'

// Must match VITE_API_URL in .env.production. Routing mocks by this exact host
// means a build that targets the wrong origin (e.g. the /api fallback) won't be
// intercepted, its API call hits the SPA, and the test fails — catching the
// class of bug where the frontend ships without the API URL baked in.
export const API = 'https://3uphtjpwsh.us-east-1.awsapprunner.com'

export interface Submission {
    id: number
    name: string
    relation: string
    type: 'video' | 'photo' | 'note'
    s3_key: string | null
    content: string | null
    created_at: string
    approved: boolean
    playback_url: string | null
}

export function submission(over: Partial<Submission> = {}): Submission {
    return {
        id: 1, name: 'Alice', relation: 'Daughter', type: 'note',
        s3_key: null, content: 'Happy birthday!', created_at: '2026-01-01T00:00:00',
        approved: true, playback_url: null, ...over,
    }
}

// Registers deterministic backend + S3 mocks. Pass `submissions` for browse/admin.
export async function mockBackend(page: Page, opts: { submissions?: Submission[] } = {}) {
    const subs = opts.submissions ?? []

    await page.route(`${API}/upload/presigned`, (route) =>
        route.fulfill({ json: { presigned_url: 'https://s3.mock.local/put/photo.jpg', s3_key: 'submissions/x/photo.jpg', content_type: 'image/jpeg' } }),
    )
    // the direct-to-S3 PUT (XHR) from useUpload
    await page.route('https://s3.mock.local/**', (route) => route.fulfill({ status: 200, body: '' }))

    await page.route(`${API}/submissions`, (route) => {
        if (route.request().method() === 'POST') {
            const body = JSON.parse(route.request().postData() || '{}')
            return route.fulfill({ json: submission({ id: 99, approved: false, ...body }) })
        }
        return route.fulfill({ json: subs })
    })

    await page.route(`${API}/rsvps`, (route) => {
        const body = JSON.parse(route.request().postData() || '{}')
        return route.fulfill({ json: { id: 1, created_at: '2026-01-01T00:00:00', ...body } })
    })

    await page.route(`${API}/bug-reports`, (route) => {
        const body = JSON.parse(route.request().postData() || '{}')
        return route.fulfill({ json: { id: 1, name: null, created_at: '2026-01-01T00:00:00', ...body } })
    })

    // admin reads (auth header present but not checked by the mock)
    await page.route(`${API}/admin/submissions`, (route) => route.fulfill({ json: subs }))
    await page.route(`${API}/admin/rsvps`, (route) => route.fulfill({ json: [] }))
    await page.route(`${API}/admin/bug-reports`, (route) => route.fulfill({ json: [] }))
}

// Collects the console errors that actually matter (the "got HTML not JSON",
// failed-fetch family) so a broken API wiring shows up as a failing assertion.
export function collectApiErrors(page: Page): string[] {
    const errors: string[] = []
    page.on('console', (m) => {
        if (m.type() !== 'error') return
        const t = m.text()
        if (/Unexpected token|is not valid JSON|Failed to fetch|Couldn't load/i.test(t)) errors.push(t)
    })
    page.on('pageerror', (e) => {
        if (/Unexpected token|is not valid JSON|Failed to fetch/i.test(e.message)) errors.push(e.message)
    })
    return errors
}
