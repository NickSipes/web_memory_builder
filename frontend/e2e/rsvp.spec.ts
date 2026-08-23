import { test, expect } from '@playwright/test'
import { mockBackend, API } from './helpers'

test('submit an RSVP with a guest count', async ({ page }) => {
    await mockBackend(page)

    // capture the request body to verify what's sent
    let sent: Record<string, unknown> | null = null
    await page.route(`${API}/rsvps`, (route) => {
        sent = JSON.parse(route.request().postData() || '{}')
        route.fulfill({ json: { id: 1, created_at: '', ...sent } })
    })

    await page.goto('/rsvp')
    await page.getByLabel('Full name').fill('Aunt May')
    await page.getByLabel('Email or phone').fill('may@example.com')
    await page.getByLabel("Additional guests you're bringing").selectOption('2')
    await page.getByRole('button', { name: /Send RSVP/ }).click()

    await expect(page.getByText(/Thank you, Aunt May/)).toBeVisible()
    expect(sent).toEqual({
        name: 'Aunt May', contact: 'may@example.com',
        attending: true, guests: 2, dietary: [],
    })
})
