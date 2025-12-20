"use client"

import { type ReactNode } from "react"

import { Provider } from "react-redux"
import { store } from "../store/store"
import { Toaster } from "sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster position="top-right" richColors />
    </Provider>
  )
}
