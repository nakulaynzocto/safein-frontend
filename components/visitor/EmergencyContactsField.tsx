// Emergency Contacts Component for Visitor Form
// This component handles multiple emergency contacts with simplified phone validation

import { Control, useFieldArray, UseFormRegister, FieldErrors, Controller } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { VisitorFormData } from "./visitorSchema";

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700 font-bold uppercase tracking-wider">Emergency Contacts</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        append({
                            name: "",
                            phone: "",
                        } as any)
                    }
                    className="flex items-center gap-2 border-[#3882a5] text-[#3882a5] hover:bg-[#3882a5] hover:text-white"
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

            <div className="space-y-4">
                {fields.map((field, index) => {
                    return (
                        <div
                            key={field.id}
                            className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="flex items-start justify-between mb-3 border-b pb-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-[#3882a5]">
                                    Contact #{index + 1}
                                </Label>
                                {fields.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Name Field */}
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor={`emergencyContacts.${index}.name`} className="text-sm font-medium">
                                        Contact Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id={`emergencyContacts.${index}.name`}
                                        {...register(`emergencyContacts.${index}.name` as const)}
                                        placeholder="Enter contact name"
                                        className={`h-12 bg-background border-border focus:bg-background transition-all rounded-xl text-foreground font-medium ${errors.emergencyContacts?.[index]?.name ? "border-destructive" : ""
                                            }`}
                                    />
                                    {errors.emergencyContacts?.[index]?.name && (
                                        <span className="text-xs text-destructive">
                                            {errors.emergencyContacts[index]?.name?.message}
                                        </span>
                                    )}
                                </div>

                                {/* Phone Number Field */}
                                <div className="flex flex-col gap-1.5">
                                    <Controller
                                        name={`emergencyContacts.${index}.phone` as const}
                                        control={control}
                                        render={({ field: phoneField }) => (
                                            <PhoneInputField
                                                id={`emergency-phone-${index}`}
                                                label="Phone Number"
                                                value={phoneField.value || ""}
                                                onChange={(val) => phoneField.onChange(val)}
                                                placeholder="Enter phone number"
                                                error={errors.emergencyContacts?.[index]?.phone?.message}
                                                required
                                                defaultCountry="in"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
