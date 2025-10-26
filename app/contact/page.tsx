"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare, 
  ArrowRight,
  Send,
  Headphones,
  Users,
  Briefcase
} from "lucide-react"
import Link from "next/link"
import { routes } from "@/utils/routes"
import { PublicLayout } from "@/components/layout/publicLayout"

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      details: "support@aynzo.com",
      action: "mailto:support@aynzo.com"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us directly",
      details: "+91 86999 66076",
      action: "tel:+918699966076"
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "When we're available",
      details: "Monday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST",
      action: null
    }
  ]

  const departments = [
    {
      icon: Headphones,
      title: "Technical Support",
      description: "Get help with technical issues, setup, and troubleshooting",
      email: "support@aynzo.com",
      response: "Response within 2 hours"
    },
    {
      icon: Users,
      title: "Customer Success",
      description: "Learn how to maximize your visitor management system",
      email: "success@aynzo.com",
      response: "Response within 4 hours"
    },
    {
      icon: Briefcase,
      title: "Sales & Partnerships",
      description: "Discuss pricing, enterprise solutions, and partnerships",
      email: "sales@aynzo.com",
      response: "Response within 1 hour"
    }
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to right, rgba(7, 68, 99, 0.95), rgba(56, 130, 165, 0.95))' }}>
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Have questions about our visitor management system? We're here to help. 
            Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#161718' }}>
              Contact Information
            </h2>
            <p className="text-lg" style={{ color: '#2c5aa0' }}>
              Multiple ways to reach our team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#98c7dd' }}>
                    <info.icon className="h-6 w-6" style={{ color: '#3882a5' }} />
                  </div>
                  <CardTitle className="text-lg" style={{ color: '#161718' }}>
                    {info.title}
                  </CardTitle>
                  <CardDescription style={{ color: '#2c5aa0' }}>
                    {info.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 whitespace-pre-line" style={{ color: '#2c5aa0' }}>
                    {info.details}
                  </p>
                  {info.action && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      style={{ borderColor: '#3882a5', color: '#3882a5' }}
                      asChild
                    >
                      <Link href={info.action}>Contact Us</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 px-4" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#161718' }}>
                Send us a Message
              </h2>
              <p className="text-lg" style={{ color: '#2c5aa0' }}>
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" style={{ color: '#161718' }}>First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter your first name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" style={{ color: '#161718' }}>Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter your last name"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" style={{ color: '#161718' }}>Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="Enter your email"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" style={{ color: '#161718' }}>Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="Enter your phone number"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company" style={{ color: '#161718' }}>Company Name</Label>
                    <Input 
                      id="company" 
                      placeholder="Enter your company name"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" style={{ color: '#161718' }}>Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="What can we help you with?"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" style={{ color: '#161718' }}>Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-white" 
                    style={{ backgroundColor: '#3882a5' }}
                  >
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#161718' }}>
              Contact by Department
            </h2>
            <p className="text-lg" style={{ color: '#2c5aa0' }}>
              Reach out to the right team for faster assistance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#98c7dd' }}>
                    <dept.icon className="h-6 w-6" style={{ color: '#3882a5' }} />
                  </div>
                  <CardTitle className="text-xl" style={{ color: '#161718' }}>
                    {dept.title}
                  </CardTitle>
                  <CardDescription className="text-base" style={{ color: '#2c5aa0' }}>
                    {dept.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#161718' }}>Email:</p>
                      <p className="text-sm" style={{ color: '#3882a5' }}>{dept.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#161718' }}>Response Time:</p>
                      <p className="text-sm" style={{ color: '#2c5aa0' }}>{dept.response}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      style={{ borderColor: '#3882a5', color: '#3882a5' }}
                      asChild
                    >
                      <Link href={`mailto:${dept.email}`}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Email
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to right, rgba(7, 68, 99, 0.95), rgba(56, 130, 165, 0.95))' }}>
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Don't wait - start managing your visitors more efficiently today with our free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-white" style={{ backgroundColor: '#3882a5' }} asChild>
              <Link href={routes.publicroute.REGISTER}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              <Link href={routes.publicroute.PRICING}>View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </PublicLayout>
  )
}
