"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { ImageUploadField } from "@/components/common/imageUploadField";

interface VehicleInfoSectionProps {
    appointmentToken?: string;
    variant?: "switch" | "button";
    onUploadStatusChange?: (isUploading: boolean) => void;
}

/**
 * Common section for vehicle information (number and photo).
 */
export function VehicleInfoSection({
    appointmentToken,
    variant = "switch",
    onUploadStatusChange
}: VehicleInfoSectionProps) {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const [showFields, setShowFields] = useState(!!(watch("vehicleNumber") || watch("vehiclePhoto")));
    const [isFileUploading, setIsFileUploadingLocal] = useState(false);

    const setIsFileUploading = (isUploading: boolean) => {
        setIsFileUploadingLocal(isUploading);
        if (onUploadStatusChange) {
            onUploadStatusChange(isUploading);
        }
    };

    const toggleFields = (checked: boolean) => {
        setShowFields(checked);
        if (!checked) {
            setValue("vehicleNumber", "");
            setValue("vehiclePhoto", "");
        }
    };

    return (
        <div className="space-y-4 pt-4 border-t">
            {variant === "switch" ? (
                <div className="bg-background flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <Car className="text-muted-foreground h-5 w-5" />
                        <div>
                            <Label className="cursor-pointer text-sm font-medium">
                                Add Vehicle Information
                            </Label>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                Include vehicle number and photo if applicable
                            </p>
                        </div>
                    </div>
                    <Switch
                        checked={showFields}
                        onCheckedChange={toggleFields}
                        className="data-[state=unchecked]:bg-gray-200 dark:data-[state=unchecked]:bg-gray-700"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-gray-600" />
                        <div>
                            <Label className="cursor-pointer text-sm font-medium">
                                Vehicle Information
                            </Label>
                            <p className="text-muted-foreground text-xs">Add vehicle details if applicable</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFields(!showFields)}
                        className="shrink-0"
                    >
                        {showFields ? "Hide" : "Add Vehicle"}
                    </Button>
                </div>
            )}

            {showFields && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-4 pt-4 duration-200">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-start">
                        {/* Vehicle Photo */}
                        <div className="flex flex-col space-y-2">
                            <Label className="text-foreground text-sm font-medium">
                                Vehicle Photo <span className="text-muted-foreground font-normal">(optional)</span>
                            </Label>
                            <div className="flex justify-start">
                                <ImageUploadField
                                    name="vehiclePhoto"
                                    label=""
                                    register={register}
                                    setValue={setValue}
                                    errors={errors.vehiclePhoto}
                                    initialUrl={watch("vehiclePhoto")}
                                    enableImageCapture={true}
                                    appointmentToken={appointmentToken}
                                    onUploadStatusChange={setIsFileUploading}
                                    variant="avatar"
                                />
                            </div>
                            {errors.vehiclePhoto && (
                                <p className="text-xs text-red-500 mt-1">{errors.vehiclePhoto.message as string}</p>
                            )}
                        </div>

                        {/* Vehicle Number */}
                        <div className="flex flex-col space-y-2">
                            <Label className="text-foreground text-sm font-medium">
                                Vehicle Number <span className="text-muted-foreground font-normal">(optional)</span>
                            </Label>
                            <Input
                                {...register("vehicleNumber")}
                                placeholder="e.g., DL01AB1234"
                                className={`h-12 rounded-xl bg-background font-medium ${errors.vehicleNumber ? "border-destructive" : ""}`}
                            />
                            {errors.vehicleNumber && (
                                <p className="text-xs text-red-500 mt-1">{errors.vehicleNumber.message as string}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
