"use client"

import { ReactNode } from "react"
import { LoadingSpinner } from "./loadingSpinner"

interface FormContainerProps {
  children: ReactNode
  isPage?: boolean
  isLoading?: boolean
  isEditMode?: boolean
}

export function FormContainer({
  children,
  isPage = false,
  isLoading = false,
  isEditMode = false,
}: FormContainerProps) {
  const containerContent = (
    <div className={`${isPage ? "bg-card rounded-xl border shadow-sm pt-4 pb-8 px-8 sm:pt-4 sm:pb-10 sm:px-10" : ""}`}>
      {isEditMode && isLoading ? (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className={isPage ? "" : "max-h-[65vh] overflow-y-auto pr-2"}>
          {children}
        </div>
      )}
    </div>
  )

  if (isPage) {
    return (
      <div className="w-full">
        {containerContent}
      </div>
    )
  }

  return containerContent
}

