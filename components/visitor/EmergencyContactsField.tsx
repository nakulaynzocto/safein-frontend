// Emergency Contacts Component for Visitor Form
// This component handles multiple emergency contacts with country code validation

import { Control, useFieldArray, UseFormRegister, FieldErrors } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/common/selectField";
import { VisitorFormData, countryCodeOptions } from "./visitorSchema";

interface EmergencyContactsFieldProps {
    control: Control<VisitorFormData>;
    register: UseFormRegister<VisitorFormData>;
    errors: FieldErrors<VisitorFormData>;
}

export function EmergencyContactsField({ control, register, errors }: EmergencyContactsFieldProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "emergencyContacts",
    });

    const calculateRemainingDigits = (selectedCountryCode: string, currentPhone: string): string => {
        if (!selectedCountryCode) return "15";
        const countryCodeDigits = selectedCountryCode.replace(/^\+/, "").length;
        const phoneDigits = currentPhone.replace(/\D/g, "").length;
        const total = countryCodeDigits + phoneDigits;
        const remaining = 15 - countryCodeDigits;
        return `${phoneDigits}/${remaining} digits (Total: ${total}/15)`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">Emergency Contacts</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        append({
                            name: "",
                            countryCode: "+91",
                            phone: "",
                        })
                    }
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Add Contact
                </Button>
            </div>

            {fields.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <p className="text-sm text-gray-500">No emergency contacts added yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Click "Add Contact" to add an emergency contact.</p>
                </div>
            )}

            <div className="space-y-3">
                {fields.map((field, index) => {
                    const countryCode = control._formValues?.emergencyContacts?.[index]?.countryCode || "+91";
                    const phone = control._formValues?.emergencyContacts?.[index]?.phone || "";

                    return (
                        <div
                            key={field.id}
                            className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Label className="text-xs font-semibold text-gray-600">
                                    Contact #{index + 1}
                                </Label>
                                {fields.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                {/* Name Field */}
                                <div className="flex flex-col gap-1.5 md:col-span-3">
                                    <Label htmlFor={`emergencyContacts.${index}.name`} className="text-xs font-medium">
                                        Contact Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`emergencyContacts.${index}.name`}
                                        {...register(`emergencyContacts.${index}.name` as const)}
                                        placeholder="Enter contact name"
                                        className={`h-10 ${errors.emergencyContacts?.[index]?.name ? "border-destructive" : ""
                                            }`}
                                    />
                                    {errors.emergencyContacts?.[index]?.name && (
                                        <span className="text-xs text-destructive">
                                            {errors.emergencyContacts[index]?.name?.message}
                                        </span>
                                    )}
                                </div>

                                {/* Country Code Field */}
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor={`emergencyContacts.${index}.countryCode`} className="text-xs font-medium">
                                        Country Code <span className="text-destructive">*</span>
                                    </Label>
                                    <SelectField
                                        label=""
                                        placeholder="Select"
                                        options={countryCodeOptions}
                                        value={countryCode}
                                        onChange={(value) => {
                                            control._formValues.emergencyContacts[index].countryCode = value;
                                        }}
                                        error={errors.emergencyContacts?.[index]?.countryCode?.message}
                                    />
                                </div>

                                {/* Phone Number Field */}
                                <div className="flex flex-col gap-1.5 md:col-span-2">
                                    <Label htmlFor={`emergencyContacts.${index}.phone`} className="text-xs font-medium">
                                        Phone Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`emergencyContacts.${index}.phone`}
                                        {...register(`emergencyContacts.${index}.phone` as const)}
                                        placeholder="Enter phone number (digits only)"
                                        type="tel"
                                        className={`h-10 ${errors.emergencyContacts?.[index]?.phone ? "border-destructive" : ""
                                            }`}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">{calculateRemainingDigits(countryCode, phone)}</span>
                                        {errors.emergencyContacts?.[index]?.phone && (
                                            <span className="text-xs text-destructive">
                                                {errors.emergencyContacts[index]?.phone?.message}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
