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
import { PageSEOHead } from "@/components/seo/pageSEOHead"

export default function HelpPage() {
  const helpCategories = [
    {
      icon: Calendar,
      title: "Getting Started",
      description: "Learn the basics of setting up your SafeIn management system",
      articles: [
        "How to create your first appointment",
        "Setting up visitor registration",
        "Configuring email notifications",
        "Basic dashboard overview"
      ]
    },
    {
      icon: Users,
      title: "User Management",
      description: "Manage employees, visitors, and user permissions",
      articles: [
        "Adding and managing employees",
        "Visitor registration process",
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
    <>
      <PageSEOHead
        title="Help & Support"
        description="Get help with SafeIn visitor management system. Find guides, tutorials, and support resources."
        keywords={[
          "help",
          "support",
          "documentation",
          "tutorials",
          "guides",
          "visitor management help",
          "SafeIn support"
        ]}
        url="https://safein.aynzo.com/help"
      />
      <PublicLayout>
        <div className="min-h-screen bg-white">
          {/* Hero Section */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-hero-gradient">
            <div className="container mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
                How can we help you?
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
                Find answers to your questions, learn new features, and get the most out of your
                SafeIn management system with our comprehensive help resources.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto px-4 sm:px-0">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    placeholder="Search for help articles..."
                    className="pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Support Options */}
          <section className="py-20 px-4">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
                  Get Support
                </h2>
                <p className="text-lg text-accent">
                  Choose the support option that works best for you
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {supportOptions.map((option, index) => (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 bg-brand-tint">
                        <option.icon className="h-6 w-6 text-brand-strong" />
                      </div>
                      <CardTitle className="text-lg text-brand">
                        {option.title}
                      </CardTitle>
                      <CardDescription className="text-accent">
                        {option.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-brand text-brand-strong hover:!text-white"
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
          <section className="py-20 px-4 bg-white">
            <div className="container mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
                  Browse by Category
                </h2>
                <p className="text-lg text-accent">
                  Find help organized by topic
                </p>
              </div>

              <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-brand-tint">
                        <category.icon className="h-6 w-6 text-brand-strong" />
                      </div>
                      <CardTitle className="text-lg text-brand">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-accent">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.map((article, articleIndex) => (
                          <li key={articleIndex} className="text-sm text-accent">
                            • {article}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full border-brand text-brand-strong hover:!text-white"
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
                <h2 className="text-3xl md:text-4xl font-bold mb-4 heading-main">
                  Popular Articles
                </h2>
                <p className="text-lg text-accent">
                  Most frequently viewed help articles
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {popularArticles.map((article, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full">
                    <CardContent className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-gray-500">{article.readTime}</span>
                      </div>
                      <h3 className="font-semibold mb-4 text-brand">
                        {article.title}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-auto border-brand text-brand-strong hover:!text-white transition-all duration-200 group"
                      >
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-hero-gradient">
            <div className="container mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
                Ready to Get Started?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
                Start your free trial today and see how easy SafeIn management can be.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Button size="lg" className="text-white bg-brand py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                  <Link href={routes.publicroute.REGISTER}>
                    Start 3 Day Trial
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white hover:bg-white hover:text-gray-900 py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto" asChild>
                  <Link href={routes.publicroute.CONTACT}>Contact Sales</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </PublicLayout>
    </>
  )
}
