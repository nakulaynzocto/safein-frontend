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
      <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-hero-gradient">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
            Have questions about our visitor management system? We're here to help. 
            Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
              Contact Information
            </h2>
            <p className="text-lg text-accent">
              Multiple ways to reach our team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 bg-brand-tint">
                    <info.icon className="h-6 w-6 text-brand-strong" />
                  </div>
                  <CardTitle className="text-lg text-brand">
                    {info.title}
                  </CardTitle>
                  <CardDescription className="text-accent">
                    {info.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 whitespace-pre-line text-accent">
                    {info.details}
                  </p>
                  {info.action && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-brand text-brand-strong hover:!text-white"
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
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
                Send us a Message
              </h2>
              <p className="text-lg text-accent">
                Fill out the form below and we'll get back to you within 24 hours
              </p>
            </div>

            <Card className="shadow-lg">
              <CardContent className="p-8">
                <form className="space-y-6">
                  {/* Name */}
                  <div>
                    <Label htmlFor="name" className="text-brand">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter your full name"
                      className="mt-2"
                    />
                  </div>

                  {/* Email and Phone */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-brand">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        placeholder="Enter your email"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-brand">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="Enter your phone number"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-brand">Message</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      className="mt-2 min-h-[120px]"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full text-white bg-brand"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
              Contact by Department
            </h2>
            <p className="text-lg text-accent">
              Reach out to the right team for faster assistance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 bg-brand-tint">
                    <dept.icon className="h-6 w-6 text-brand-strong" />
                  </div>
                  <CardTitle className="text-xl text-brand">
                    {dept.title}
                  </CardTitle>
                  <CardDescription className="text-base text-accent">
                    {dept.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-brand">Email:</p>
                      <p className="text-sm text-brand-strong">{dept.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand">Response Time:</p>
                      <p className="text-sm text-accent">{dept.response}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-brand text-brand-strong hover:!text-white"
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
      <section className="py-20 px-4 bg-hero-gradient">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Don't wait - start managing your visitors more efficiently today with our free trial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-white bg-brand" asChild>
              <Link href={routes.publicroute.REGISTER}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-gray-900 border-white hover:bg-white hover:text-gray-900">
              <Link href={routes.publicroute.PRICING}>View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </PublicLayout>
  )
}
