import { test, expect } from '@playwright/test'
import { mockBackend, API } from './helpers'

// Dad's bug #1: you couldn't leave a note-only message.
test('leave a note-only message', async ({ page }) => {
    await mockBackend(page)
    let posted: Record<string, unknown> | null = null
    await page.route(`${API}/submissions`, (route) => {
        posted = JSON.parse(route.request().postData() || '{}')
        route.fulfill({ json: { id: 5, ...posted } })
    })

    await page.goto('/message')
    await page.getByLabel('Your name').fill('A Friend')
    await page.getByLabel('Your relation to Jerry').selectOption('Friend')
    await page.getByRole('button', { name: /Continue/ }).click()
    await expect(page).toHaveURL(/\/record/)

    await page.getByRole('button', { name: /Write a note/ }).click()
    await page.getByLabel('Your message to Jerry').fill('Happy birthday Jerry, sorry I could not make it!')
    await page.getByRole('button', { name: /Save & send/ }).click()

    await expect(page).toHaveURL(/\/confirm/)
    expect(posted).toMatchObject({ type: 'note', content: 'Happy birthday Jerry, sorry I could not make it!' })
})

// Dad's bug #2: RSVP required contact. Name alone should work.
test('RSVP with only a name (no contact)', async ({ page }) => {
    await mockBackend(page)
    await page.goto('/rsvp')
    await page.getByLabel('Full name').fill('No Contact Friend')
    await page.getByRole('button', { name: /Can't make it/ }).click()
    await page.getByRole('button', { name: /Send RSVP/ }).click()
    await expect(page.getByText(/Thank you, No Contact Friend/)).toBeVisible()
})

// Report-a-bug feature.
test('submit a bug report from the footer link', async ({ page }) => {
    await mockBackend(page)
    let report: Record<string, unknown> | null = null
    await page.route(`${API}/bug-reports`, (route) => {
        report = JSON.parse(route.request().postData() || '{}')
        route.fulfill({ json: { id: 1, name: null, created_at: '', ...report } })
    })

    await page.goto('/')
    await page.getByRole('link', { name: /Report a bug/ }).click()
    await expect(page).toHaveURL(/\/report-bug/)
    await page.getByLabel('What went wrong?').fill('The note button does nothing.')
    await page.getByRole('button', { name: /Send report/ }).click()
    await expect(page.getByText(/Thanks for the report/)).toBeVisible()
    expect(report).toMatchObject({ description: 'The note button does nothing.' })
})
