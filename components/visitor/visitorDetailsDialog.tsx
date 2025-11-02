import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
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
    return isNaN(date.getTime()) ? "Invalid Date" : format(date, "MMM dd, yyyy 'at' HH:mm");
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
      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl">Visitor Details</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[65vh] overflow-y-auto pr-2">
          <div className="space-y-6">
          {/* Header with Photo */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <Avatar className="h-20 w-20">
              <AvatarImage src={visitor.photo} alt={visitor.name} />
              <AvatarFallback className="text-2xl">
                {visitor.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{visitor.name}</h3>
              {visitor.visitorId && (
                <p className="text-sm text-muted-foreground font-mono">
                  ID: {visitor.visitorId}
                </p>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 pb-4 border-b">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visitor_details_config.map(({ key, label, icon: Icon, format }) => {
                const value = getFieldValue(key);
                
                return (
                  <div key={key} className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">{label}</div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className={key === 'email' ? 'break-all' : ''}>
                        {format && value ? format(value as string) : value}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4 pb-4 border-b">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </h4>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border space-y-2">
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div>{visitor.address.street}</div>
                  <div>{visitor.address.city}, {visitor.address.state}</div>
                  <div>{visitor.address.country}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ID Proof Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              ID Proof
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">ID Type</div>
                <Badge variant="outline" className="text-sm">
                  {visitor.idProof.type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">ID Number</div>
                {visitor.idProof.image ? (
                  <button
                    onClick={() => window.open(visitor.idProof.image, '_blank')}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-mono"
                  >
                    <span>{visitor.idProof.number}</span>
                    <ExternalLink className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="font-mono">{visitor.idProof.number}</div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              type="button" 
              onClick={onClose}
            >
              Close
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

