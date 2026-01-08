import { baseApi } from "./baseApi";

export interface UploadFileRequest {
    file: File;
    token?: string; // Appointment link token for public upload
}

export interface UploadFileResponse {
    success: boolean;
    data: {
        url: string;
        filename: string;
        size: number;
    };
    message?: string;
}

export const uploadApi = baseApi.injectEndpoints({
    overrideExisting: true,
    endpoints: (builder) => ({
        uploadFile: builder.mutation<UploadFileResponse["data"], UploadFileRequest>({
            query: ({ file, token }) => {
                const formData = new FormData();
                formData.append("file", file);

                if (token) {
                    return {
                        url: `/upload/public?token=${encodeURIComponent(token)}`,
                        method: "POST",
                        body: formData,
                    };
                }

                return {
                    url: "/upload",
                    method: "POST",
                    body: formData,
                };
            },
            transformResponse: (response: any) => {
                if (response && response.success && response.data) {
                    return response.data;
                }
                if (response && response.url && !response.success) {
                    return response;
                }
                throw new Error(response?.message || "Upload failed");
            },
            transformErrorResponse: (response: any, meta) => {
                if (response?.data) {
                    if (typeof response.data === "string") {
                        return { message: response.data };
                    }
                    if (response.data.message) {
                        return { message: response.data.message };
                    }
                    if (response.data.error) {
                        return { message: response.data.error };
                    }
                }

                if (response?.message) {
                    return { message: response.message };
                }

                if (meta?.response?.status === 401) {
                    return { message: "Authentication required. Please check your appointment link." };
                }

                if (meta?.response?.status === 400) {
                    return { message: "Invalid file or request. Please check the file and try again." };
                }

                if (meta?.response?.status === 413) {
                    return { message: "File too large. Maximum size is 5MB." };
                }

                return {
                    message: meta?.response?.statusText || "Failed to upload image. Please try again.",
                };
            },
        }),
    }),
    overrideExisting: false,
});

export const { useUploadFileMutation } = uploadApi;
