'use client'
import { useRef } from 'react'
import { pageState } from '@/lib/state'

export default function SetupPageState({ children, pageType, product, products }) {
  const initialized = useRef(false)

  if (!initialized.current) {
    pageState.setupPageState(pageType, product, products)
    initialized.current = true
  }

  return <>{children}</>
}

