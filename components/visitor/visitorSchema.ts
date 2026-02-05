import * as yup from "yup";

export const visitorSchema = yup.object({
    name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email address").required("Email is required"),
    phone: yup.string().required("Phone number is required"),
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
                    .required("Contact name is required")
                    .min(2, "Name must be at least 2 characters"),
                countryCode: yup
                    .string()
                    .required("Country code is required")
                    .matches(/^\+\d{1,4}$/, "Country code must start with + and contain 1-4 digits (e.g., +91)"),
                phone: yup
                    .string()
                    .required("Phone number is required")
                    .matches(/^\d+$/, "Phone number must contain only digits")
                    .test(
                        "total-length",
                        "Total phone number (country code + phone) must be exactly 15 digits",
                        function (value) {
                            const { countryCode } = this.parent;
                            if (!countryCode || !value) return false;

                            // Remove + from country code and count digits
                            const countryCodeDigits = countryCode.replace(/^\+/, "");
                            const totalDigits = countryCodeDigits.length + value.length;

                            return totalDigits === 15;
                        }
                    ),
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
