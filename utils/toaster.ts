import { toast } from "@/hooks/useToast"

export const showSuccess = (message: string) => {
  toast({
    title: "Success",
    description: message,
    variant: "default",
  })
}

export const showError = (message: string) => {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  })
}

export const showInfo = (message: string) => {
  toast({
    title: "Info",
    description: message,
    variant: "default",
  })
}

export const showWarning = (message: string) => {
  toast({
    title: "Warning",
    description: message,
    variant: "destructive",
  })
}
