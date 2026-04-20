import * as yup from "yup";
import { validatePhone } from "@/utils/phoneUtils";

export const visitorSchema = yup.object({
    name: yup.string().trim().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup
        .string()
        .trim()
        .optional()
        .test("email-format", "Please enter a valid email address", (value) => {
            if (!value || value.length === 0) return true;
            return yup.string().email().isValidSync(value);
        }),
    phone: yup
        .string()
        .trim()
        .required("Phone number is required")
        .test("is-valid-phone", "Please enter a valid global phone number with country code", (value) => 
            validatePhone(value)
        ),
    gender: yup.string().oneOf(["male", "female", "other"], "Please select gender").optional(),
    address: yup.object({
        street: yup.string().trim().optional(),
        city: yup.string().trim().required("City is required"),
        state: yup.string().trim().required("State is required"),
        country: yup.string().trim().required("Country is required"),
    }),
    idProof: yup.object({
        type: yup.string().trim().optional(),
        number: yup.string().trim().optional(),
        image: yup.mixed().optional(),
    }),
    photo: yup.mixed().optional(),
    blacklisted: yup.boolean().default(false),
    blacklistReason: yup.string().trim().optional(),
    emergencyContacts: yup
        .array()
        .of(
            yup.object({
                name: yup
                    .string()
                    .trim()
                    .notRequired()
                    .nullable()
                    .transform((value) => (value === "" ? null : value))
                    .min(2, "Name must be at least 2 characters"),
                phone: yup
                    .string()
                    .trim()
                    .notRequired()
                    .nullable()
                    .transform((value) => (value === "" ? null : value))
                    .test("is-valid-emergency-phone", "Invalid emergency contact phone", (value) => {
                        if (!value) return true;
                        return validatePhone(value);
                    }),
            })
        )
        .optional()
        .default([]),
});

export interface VisitorFormData {
    name: string;
    email?: string;
    phone: string;
    gender?: "male" | "female" | "other" | "";
    address: {
        street?: string;
        city: string;
        state: string;
        country: string;
    };
    idProof: {
        type?: string;
        number?: string;
        image?: any;
    };
    photo?: any;
    blacklisted: boolean;
    blacklistReason?: string;
    emergencyContacts?: {
        name?: string | null;
        phone?: string | null;
        countryCode?: string | null;
    }[];
}

export const idProofTypes = [
    { value: "aadhaar", label: "Aadhaar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
    { value: "other", label: "Other" },
];

export const countryCodeOptions = [
    { value: "+91", label: "+91 (India)" },
    { value: "+1", label: "+1 (USA/Canada)" },
    { value: "+44", label: "+44 (UK)" },
    { value: "+971", label: "+971 (UAE)" },
    { value: "+65", label: "+65 (Singapore)" },
    { value: "+61", label: "+61 (Australia)" },
    { value: "+86", label: "+86 (China)" },
    { value: "+81", label: "+81 (Japan)" },
    { value: "+82", label: "+82 (South Korea)" },
    { value: "+49", label: "+49 (Germany)" },
    { value: "+33", label: "+33 (France)" },
];

/**
 * Transforms VisitorFormData to CreateVisitorRequest
 * Centralized logic to avoid duplication in multiple forms
 */
export const transformToVisitorPayload = (
    data: VisitorFormData,
    photoUrl?: string,
    idProofImageUrl?: string,
) => {
    return {
        name: data.name,
        email: data.email?.trim() || undefined,
        phone: data.phone,
        gender: (data.gender as any) || undefined,
        address: {
            street: data.address.street || undefined,
            city: data.address.city,
            state: data.address.state,
            country: data.address.country,
        },
        idProof:
            data.idProof.type || data.idProof.number || idProofImageUrl
                ? {
                      type: data.idProof.type || undefined,
                      number: data.idProof.number || undefined,
                      image: idProofImageUrl || undefined,
                  }
                : undefined,
        photo: photoUrl || undefined,
        blacklisted: data.blacklisted,
        blacklistReason: data.blacklistReason || undefined,
        emergencyContacts:
            data.emergencyContacts && data.emergencyContacts.length > 0
                ? data.emergencyContacts.map((contact) => ({
                      name: contact.name || "",
                      phone: contact.phone || "",
                  }))
                : undefined,
    };
};
