import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Landing from '../pages/Landing'

const navigate = vi.fn()
vi.mock('react-router-dom', async (orig) => ({
    ...(await orig<typeof import('react-router-dom')>()),
    useNavigate: () => navigate,
}))

function setup() {
    render(<MemoryRouter><Landing /></MemoryRouter>)
}

describe('Landing', () => {
    beforeEach(() => navigate.mockClear())

    it('renders name input and relation select', () => {
        setup()
        expect(screen.getByLabelText('Your name')).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('continue button is disabled when fields are empty', () => {
        setup()
        expect(screen.getByRole('button', { name: /Continue/ })).toBeDisabled()
    })

    it('continue button enables when both fields filled', async () => {
        setup()
        await userEvent.type(screen.getByLabelText('Your name'), 'Alice')
        await userEvent.selectOptions(screen.getByRole('combobox'), 'Daughter')
        expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled()
    })

    it('spaces-only name keeps button disabled', async () => {
        setup()
        await userEvent.type(screen.getByLabelText('Your name'), '   ')
        await userEvent.selectOptions(screen.getByRole('combobox'), 'Daughter')
        expect(screen.getByRole('button', { name: /Continue/ })).toBeDisabled()
    })

    it('navigates to /record with name and relation on submit', async () => {
        setup()
        await userEvent.type(screen.getByLabelText('Your name'), '  Alice  ')
        await userEvent.selectOptions(screen.getByRole('combobox'), 'Daughter')
        await userEvent.click(screen.getByRole('button', { name: /Continue/ }))
        expect(navigate).toHaveBeenCalledWith('/record', {
            state: { name: 'Alice', relation: 'Daughter' },
        })
    })
})
