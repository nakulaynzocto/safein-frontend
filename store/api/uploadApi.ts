import { baseApi } from './baseApi'

export interface UploadFileRequest {
  file: File
}

export interface UploadFileResponse {
  success: boolean
  data: {
    url: string
    filename: string
    size: number
  }
  message?: string
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<UploadFileResponse['data'], UploadFileRequest>({
      query: ({ file }) => {
        const formData = new FormData()
        formData.append('file', file)
        
        return {
          url: '/upload',
          method: 'POST',
          body: formData,
        }
      },
      transformResponse: (response: any) => {
        // Handle ResponseUtil format: {success: true, data: {...}}
        if (response && response.success && response.data) {
          return response.data
        }
        // If response is already the data object
        if (response && response.url && !response.success) {
          return response
        }
        throw new Error(response?.message || 'Upload failed')
      },
    }),
  }),
  overrideExisting: false,
})

export const { useUploadFileMutation } = uploadApi

