import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Multi-Shop Accounting')
  })

  it('renders the description', () => {
    render(<HomePage />)

    const description = screen.getByText('ERP Dashboard Application')
    expect(description).toBeInTheDocument()
  })

  it('has proper structure and classes', () => {
    render(<HomePage />)

    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex', 'min-h-screen', 'flex-col', 'items-center', 'justify-center', 'p-24')
  })
})