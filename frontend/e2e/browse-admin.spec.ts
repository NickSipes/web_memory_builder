import { test, expect } from '@playwright/test'
import { mockBackend, submission } from './helpers'

test('browse shows approved submissions and filters by type', async ({ page }) => {
    await mockBackend(page, { submissions: [
        submission({ id: 1, name: 'Alice', relation: 'Daughter', type: 'video', s3_key: 'k', content: null, playback_url: 'https://s3.mock.local/v#t=0.1' }),
        submission({ id: 2, name: 'Bob', relation: 'Son', type: 'note', content: 'Happy birthday!' }),
    ] })

    await page.goto('/browse')
    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('"Happy birthday!"')).toBeVisible()

    // filter to notes → the video (Alice) disappears
    await page.getByLabel('Filter by type').selectOption('note')
    await expect(page.getByText('Alice')).toHaveCount(0)
    await expect(page.getByText('Bob')).toBeVisible()
})

test('admin logs in and sees the moderation + RSVP sections', async ({ page }) => {
    await mockBackend(page, { submissions: [
        submission({ id: 1, name: 'Pending Person', approved: false }),
    ] })

    await page.goto('/admin')
    await page.getByPlaceholder('Username').fill('admin')
    await page.getByPlaceholder('Password').fill('katienick')
    await page.getByRole('button', { name: 'Log in' }).click()

    await expect(page.getByText(/Pending review \(1\)/)).toBeVisible()
    await expect(page.getByText('Pending Person')).toBeVisible()
    await expect(page.getByText(/No RSVPs yet/)).toBeVisible()
})
