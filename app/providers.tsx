"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "../store/store"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" richColors />
    </Provider>
  )
}
