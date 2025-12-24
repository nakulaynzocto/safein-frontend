import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, formatDateTime } from "@/utils/helpers"
import { Visitor } from "@/store/api/visitorApi"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar,
  Building,
  ExternalLink
} from "lucide-react"


const visitor_details_config = [
  { key: "name", label: "Full Name", icon: User },
  { key: "email", label: "Email", icon: Mail },
  { key: "phone", label: "Phone", icon: Phone },
  { key: "createdAt", label: "Registered On", icon: Calendar, format: (value: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    return isNaN(date.getTime()) ? "Invalid Date" : formatDateTime(date);
  }},
]

interface VisitorDetailsDialogProps {
  visitor: Visitor | null
  open: boolean
  onClose: () => void
}

export function VisitorDetailsDialog({ visitor, open, onClose }: VisitorDetailsDialogProps) {
  if (!visitor) return null


  const getFieldValue = (key: string): string => {
    const value = visitor[key as keyof Visitor];
    if (typeof value === 'string') return value;
    if (typeof value === 'boolean') return value.toString();
    return 'N/A';
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-4xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Visitor Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header - LinkedIn/Facebook Style */}
          <div className="flex gap-6 pb-6 border-b">
            {/* Left Side - Visitor Photo */}
            <div className="shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage src={visitor.photo} alt={visitor.name} />
                <AvatarFallback className="text-2xl">
                  {visitor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Right Side - Visitor Info */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold">{visitor.name}</h3>
                {visitor._id && (
                  <p className="text-sm text-muted-foreground font-mono mt-1">
                    ID: {visitor._id}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground break-all">{visitor.email}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{visitor.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visitor Details - Bottom Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Registered On */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Registered On
              </div>
              <div className="text-sm font-semibold text-foreground">
                {visitor.createdAt ? formatDateTime(visitor.createdAt) : 'N/A'}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Address
              </div>
              <div className="text-sm font-semibold text-foreground">
                <div>{visitor.address.street || 'N/A'}</div>
                <div>{visitor.address.city}, {visitor.address.state}</div>
                <div>{visitor.address.country}</div>
              </div>
            </div>

            {/* ID Proof Type */}
            {visitor.idProof?.type && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  ID Proof Type
                </div>
                <div className="text-sm font-semibold text-foreground">
                  <Badge variant="outline" className="text-sm">
                    {visitor.idProof.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}

            {/* ID Proof Number */}
            {(visitor.idProof?.number || visitor.idProof?.image) && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  ID Proof Number
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {visitor.idProof.image ? (
                    <button
                      onClick={() => window.open(visitor?.idProof?.image, '_blank')}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-mono"
                    >
                      <span>{visitor.idProof.number || 'N/A'}</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="font-mono">{visitor.idProof.number || 'N/A'}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              type="button" 
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

