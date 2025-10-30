"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectField } from "@/components/common/selectField";
import { CountryStateCitySelect } from "@/components/common/countryStateCity";
import { ImageUploadField } from "@/components/common/imageUploadField";
import { PhoneInputField } from "@/components/common/phoneInputField";
import { LoadingSpinner } from "@/components/common/loadingSpinner";
import {
  CreateVisitorRequest,
  useCreateVisitorMutation,
  useGetVisitorQuery,
  useUpdateVisitorMutation,
} from "@/store/api/visitorApi";
import { showSuccessToast } from "@/utils/toast";
import { routes } from "@/utils/routes";
import { User, MapPin, CreditCard, Camera, CheckCircle } from "lucide-react";
import { TextareaField } from "../common/textareaField";

const visitorSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup.object({
    street: yup.string().required("Street address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    country: yup.string().required("Country is required"),
  }),
  idProof: yup.object({
    type: yup.string().required("ID proof type is required"),
    number: yup.string().required("ID proof number is required"),
    image: yup.string().optional(),
  }),
  photo: yup.string().optional().default(""),
});

type VisitorFormData = yup.InferType<typeof visitorSchema>;

const idProofTypes = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "driving_license", label: "Driving License" },
  { value: "passport", label: "Passport" },
  { value: "other", label: "Other" },
];

interface NewVisitorModalProps {
  visitorId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NewVisitorModal({
  visitorId,
  trigger,
  onSuccess,
  open: controlledOpen,
  onOpenChange,
}: NewVisitorModalProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const isEditMode = !!visitorId;
  const isLoading = isCreating || isUpdating;

  const { data: visitorData, isLoading: isLoadingVisitor } = useGetVisitorQuery(
    visitorId!,
    {
      skip: !isEditMode,
    }
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitted },
    reset,
    setValue,
    clearErrors,
    watch,
  } = useForm({
    resolver: yupResolver(visitorSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
      },
      idProof: {
        type: "",
        number: "",
        image: "",
      },
      photo: "",
    },
  });

  React.useEffect(() => {
    if (!open) {
      reset();
      setGeneralError(null);
      clearErrors();
    }
  }, [open, reset, clearErrors]);

  React.useEffect(() => {
    if (isEditMode && visitorData) {
      reset({
        name: visitorData.name || "",
        email: visitorData.email || "",
        phone: visitorData.phone || "",
        address: {
          street: visitorData.address?.street || "",
          city: visitorData.address?.city || "",
          state: visitorData.address?.state || "",
          country: visitorData.address?.country || "",
        },
        idProof: {
          type: visitorData.idProof?.type || "",
          number: visitorData.idProof?.number || "",
          image: visitorData.idProof?.image || "",
        },
        photo: visitorData.photo || "",
      });
    }
  }, [isEditMode, visitorData, reset]);

  const clearGeneralError = () => {
    if (generalError) {
      setGeneralError(null);
    }
  };

  const onSubmit = async (data: VisitorFormData) => {
    try {
      setGeneralError(null);

      const visitorData: CreateVisitorRequest = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        idProof: {
          type: data.idProof.type,
          number: data.idProof.number,
          image: data.idProof.image || undefined,
        },
        photo: data.photo || undefined,
      };

      if (isEditMode && visitorId) {
        await updateVisitor({ id: visitorId, ...visitorData }).unwrap();
        showSuccessToast("Visitor updated successfully");
      } else {
        await createVisitor(visitorData).unwrap();
        showSuccessToast("Visitor registered successfully");
      }

      setOpen(false);
      reset();

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(routes.privateroute.VISITORLIST);
      }
    } catch (error: any) {
      if (error?.data?.message) {
        const message = error.data.message.toLowerCase();
        if (message.includes("email") && message.includes("already exists")) {
          setGeneralError("Email address is already registered");
        } else if (
          message.includes("phone") &&
          message.includes("already exists")
        ) {
          setGeneralError("Phone number is already registered");
        } else {
          setGeneralError(error.data.message);
        }
      } else {
        const errorMessage =
          error?.message ||
          (isEditMode
            ? "Failed to update visitor"
            : "Failed to register visitor");
        setGeneralError(errorMessage);
      }
    }
  };

  const defaultTrigger = (
    <Button variant="default">
      {isEditMode ? "Edit Visitor" : "New Visitor"}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-3xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? "Edit Visitor" : "Register New Visitor"}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto overflow-x-visible pr-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {isEditMode && isLoadingVisitor ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <>
              {generalError && (
                <Alert variant="destructive">
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-64 sm:mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Enter full name"
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <span className="text-sm text-destructive">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { onChange: clearGeneralError })}
                      placeholder="Enter email address"
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <span className="text-sm text-destructive">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInputField
                        id="phone"
                        label="Phone Number"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          clearGeneralError();
                        }}
                        error={errors.phone?.message}
                        required
                        placeholder="Enter phone number"
                        defaultCountry="in"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">

                <CountryStateCitySelect
                  value={{
                    country: watch("address.country") || "",
                    state: watch("address.state") || "",
                    city: watch("address.city") || "",
                  }}
                  onChange={(v) => {
                    setValue("address.country", v.country)
                    setValue("address.state", v.state)
                    setValue("address.city", v.city)
                  }}
                  errors={{
                    country: errors.address?.country?.message as string,
                    state: errors.address?.state?.message as string,
                    city: errors.address?.city?.message as string,
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                  <Label htmlFor="address.street">Street Address *</Label>
                  <Input
                    id="address.street"
                    {...register("address.street")}
                    placeholder="Enter street address"
                    className={
                      errors.address?.street ? "border-destructive" : ""
                    }
                  />
                  {errors.address?.street && (
                    <span className="text-sm text-destructive">
                      {errors.address.street.message}
                    </span>
                  )}
                  </div>
                  <Controller
                    name="idProof.type"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>ID Proof Type *</Label>
                        <SelectField
                          placeholder="Select ID proof type"
                          options={idProofTypes}
                          value={field.value}
                          onChange={(val) => field.onChange(val)}
                          error={errors.idProof?.type?.message}
                        />
                      </div>
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="idProof.number">ID Proof Number *</Label>
                    <Input
                      id="idProof.number"
                      {...register("idProof.number")}
                      placeholder="Enter ID proof number"
                      className={
                        errors.idProof?.number ? "border-destructive" : ""
                      }
                    />
                    {errors.idProof?.number && (
                      <span className="text-sm text-destructive">
                        {errors.idProof.number.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ID Proof & Photo */}
              <div className="space-y-4">
          

                {/* Image Uploads */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      ID Proof Document
                    </h4>
                    <ImageUploadField
                      key={`idProof-${visitorId}-${visitorData?.idProof?.image}`}
                      name="idProof.image"
                      register={register}
                      setValue={setValue}
                      errors={errors.idProof?.image}
                      initialUrl={visitorData?.idProof?.image}
                    />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Visitor Photo
                    </h4>
                    <ImageUploadField
                      key={`photo-${visitorId}-${visitorData?.photo}`}
                      name="photo"
                      register={register}
                      setValue={setValue}
                      errors={errors.photo}
                      initialUrl={visitorData?.photo}
                    />
                  </div>
                </div>
              </div>

            <DialogFooter>
  <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
    <Button
      type="button"
      variant="outline"
      onClick={() => setOpen(false)}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      Cancel
    </Button>

    <Button
      type="submit"
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : null}
      <CheckCircle className="h-4 w-4 mr-2" />
      {isEditMode ? "Update Visitor" : "Register Visitor"}
    </Button>
  </div>
            </DialogFooter>

            </>
          )}
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
