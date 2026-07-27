import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RelationSelect from '../components/RelationSelect'

describe('RelationSelect', () => {
    it('renders all relation options', () => {
        render(<RelationSelect value="" onChange={() => {}} />)
        expect(screen.getByRole('option', { name: 'Son' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Navy Buddy' })).toBeInTheDocument()
        expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
    })

    it('calls onChange with selected value', async () => {
        const onChange = vi.fn()
        render(<RelationSelect value="" onChange={onChange} />)
        await userEvent.selectOptions(screen.getByRole('combobox'), 'Daughter')
        expect(onChange).toHaveBeenCalledWith('Daughter')
    })

    it('shows placeholder when value is empty string', () => {
        render(<RelationSelect value="" onChange={() => {}} />)
        expect(screen.getByRole('combobox')).toHaveValue('')
        expect(screen.getByText('Your relation to Jerry...')).toBeInTheDocument()
    })
})
