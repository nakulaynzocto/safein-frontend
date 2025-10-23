"use client"

import { ImageUploadField } from "@/components/common/imageUploadField"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Upload } from "lucide-react"

export function CameraTestComponent() {
  const { register, setValue, formState: { errors } } = useForm()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Camera Upload Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">ID Proof Document</h3>
              <ImageUploadField
                name="idProof"
                label="Upload ID Proof"
                register={register}
                setValue={setValue}
                errors={errors.idProof}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Visitor Photo</h3>
              <ImageUploadField
                name="photo"
                label="Upload Photo"
                register={register}
                setValue={setValue}
                errors={errors.photo}
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Camera Features:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Upload from Gallery:</strong> Select existing photos from device</li>
              <li>• <strong>Take Photo (Rear Camera):</strong> Opens rear camera for document photos</li>
              <li>• <strong>Take Photo (Front Camera):</strong> Opens front camera for selfies</li>
              <li>• <strong>Auto-detection:</strong> Automatically detects camera support</li>
              <li>• <strong>Mobile optimized:</strong> Works perfectly on mobile devices</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
