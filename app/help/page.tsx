"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { routes } from "@/utils/routes"
import { 
  Search, 
  Book, 
  Video, 
  MessageSquare, 
  Phone, 
  Mail, 
  ArrowRight,
  HelpCircle,
  FileText,
  PlayCircle,
  Users,
  Calendar,
  Shield
} from "lucide-react"
import Link from "next/link"
import { PublicLayout } from "@/components/layout/publicLayout"

export default function HelpPage() {
  const helpCategories = [
    {
      icon: Calendar,
      title: "Getting Started",
      description: "Learn the basics of setting up your SafeIn management system",
      articles: [
        "How to create your first appointment",
        "Setting up visitor registration",
        "Configuring notifications",
        "Basic dashboard overview"
      ]
    },
    {
      icon: Users,
      title: "User Management",
      description: "Manage employees, visitors, and user permissions",
      articles: [
        "Adding and managing employees",
        "SafeIn registration process",
        "User roles and permissions",
        "Bulk user import"
      ]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Learn about security features and data protection",
      articles: [
        "Data encryption and security",
        "Privacy policy compliance",
        "Access control settings",
        "Audit trail features"
      ]
    }
  ]

  const popularArticles = [
    {
      title: "How to schedule your first visitor appointment",
      category: "Getting Started",
      readTime: "3 min read"
    },
    {
      title: "Setting up email notifications for visitors",
      category: "Configuration",
      readTime: "5 min read"
    },
    {
      title: "Managing visitor check-in and check-out",
      category: "User Management",
      readTime: "4 min read"
    },
    {
      title: "Troubleshooting common login issues",
      category: "Troubleshooting",
      readTime: "2 min read"
    },
    {
      title: "Exporting visitor reports and analytics",
      category: "Reporting",
      readTime: "6 min read"
    }
  ]

  const supportOptions = [
    {
      icon: Book,
      title: "Knowledge Base",
      description: "Browse our comprehensive documentation and guides",
      action: "Browse Articles",
      color: "#3882a5"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides and tutorials",
      action: "Watch Videos",
      color: "#3882a5"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us for immediate assistance",
      action: "Call Now",
      color: "#3882a5"
    }
  ]

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20 px-4" style={{ background: 'linear-gradient(to right, rgba(7, 68, 99, 0.95), rgba(56, 130, 165, 0.95))' }}>
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Find answers to your questions, learn new features, and get the most out of your 
            SafeIn management system with our comprehensive help resources.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="Search for help articles, guides, and tutorials..."
                className="pl-12 pr-4 py-3 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#161718' }}>
              Get Support
            </h2>
            <p className="text-lg" style={{ color: '#2c5aa0' }}>
              Choose the support option that works best for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#98c7dd' }}>
                    <option.icon className="h-6 w-6" style={{ color: option.color }} />
                  </div>
                  <CardTitle className="text-lg" style={{ color: '#161718' }}>
                    {option.title}
                  </CardTitle>
                  <CardDescription style={{ color: '#2c5aa0' }}>
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    size="sm"
                    style={{ borderColor: option.color, color: option.color }}
                  >
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 px-4" style={{ backgroundColor: '#d1d8e2' }}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#161718' }}>
              Browse by Category
            </h2>
            <p className="text-lg" style={{ color: '#2c5aa0' }}>
              Find help organized by topic
            </p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#98c7dd' }}>
                    <category.icon className="h-6 w-6" style={{ color: '#3882a5' }} />
                  </div>
                  <CardTitle className="text-lg" style={{ color: '#161718' }}>
                    {category.title}
                  </CardTitle>
                  <CardDescription style={{ color: '#2c5aa0' }}>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex} className="text-sm" style={{ color: '#2c5aa0' }}>
                        • {article}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 w-full"
                    style={{ borderColor: '#3882a5', color: '#3882a5' }}
                  >
                    View All Articles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#161718' }}>
              Popular Articles
            </h2>
            <p className="text-lg" style={{ color: '#2c5aa0' }}>
              Most frequently viewed help articles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {popularArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {article.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: '#161718' }}>
                    {article.title}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto text-sm"
                    style={{ color: '#3882a5' }}
                  >
                    Read Article
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
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
            Start your free trial today and see how easy SafeIn management can be.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-white" style={{ backgroundColor: '#3882a5' }} asChild>
              <Link href={routes.publicroute.REGISTER}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </PublicLayout>
  )
}
