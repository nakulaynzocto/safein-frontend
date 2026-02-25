import * as yup from "yup";

export const visitorSchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").optional(),
    phone: yup
        .string()
        .required("Phone number is required")
        .matches(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
    gender: yup.string().oneOf(["male", "female", "other"], "Please select gender").optional(),
    address: yup.object({
        street: yup.string().optional(),
        city: yup.string().required("City is required"),
        state: yup.string().required("State is required"),
        country: yup.string().required("Country is required"),
    }),
    idProof: yup.object({
        type: yup.string().optional(),
        number: yup.string().optional(),
        image: yup.string().optional(),
    }),
    photo: yup.string().optional().default(""),
    blacklisted: yup.boolean().default(false),
    blacklistReason: yup.string().optional(),
    tags: yup.string().optional(),
    emergencyContacts: yup
        .array()
        .of(
            yup.object({
                name: yup
                    .string()
                    .notRequired()
                    .nullable()
                    .transform((value) => (value === "" ? null : value))
                    .min(2, "Name must be at least 2 characters"),
                phone: yup
                    .string()
                    .notRequired()
                    .nullable()
                    .transform((value) => (value === "" ? null : value))
                    .matches(/^\d{10,15}$/, {
                        message: "Phone number must be between 10 and 15 digits",
                        excludeEmptyString: true,
                    }),
            })
        )
        .optional()
        .default([]),
});

export type VisitorFormData = yup.InferType<typeof visitorSchema>;

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
