import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicLayout } from "@/components/layout/public-layout"
import { Calendar, Users, Shield, Clock, CheckCircle, UserCheck } from "lucide-react"

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="text-primary">Gatekeeper</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Streamline your visitor management process with our comprehensive appointment system. Secure, efficient, and
            user-friendly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Gatekeeper?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our visitor appointment system provides everything you need to manage visitors efficiently and securely.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Simple and intuitive appointment booking system for visitors and staff.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Employee Management</CardTitle>
                <CardDescription>
                  Comprehensive employee directory with role-based access and management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Secure Access</CardTitle>
                <CardDescription>
                  Advanced security features to ensure only authorized visitors gain access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>Live status updates and notifications for all appointment changes.</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>
                  Streamlined approval process with automated notifications and tracking.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <UserCheck className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Visitor Tracking</CardTitle>
                <CardDescription>Complete visitor lifecycle management from check-in to check-out.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Perfect for Any Organization</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Gatekeeper adapts to your organization's needs, whether you're a small office or large enterprise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Corporate Offices</CardTitle>
                <CardDescription>
                  Manage client meetings, vendor visits, and employee guests with professional efficiency.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Healthcare Facilities</CardTitle>
                <CardDescription>
                  Ensure patient privacy and security while managing visitor access to sensitive areas.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Educational Institutions</CardTitle>
                <CardDescription>
                  Secure campus access for parents, contractors, and guest speakers with ease.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Government Buildings</CardTitle>
                <CardDescription>
                  High-security visitor management with comprehensive audit trails and compliance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manufacturing Plants</CardTitle>
                <CardDescription>
                  Safety-first visitor management with proper clearance and escort coordination.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Residential Communities</CardTitle>
                <CardDescription>
                  Streamlined guest management for apartment complexes and gated communities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of organizations that trust Gatekeeper for their visitor management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
