import { StatusPage } from "@/components/common/statusPage"
import { routes } from "@/utils/routes"

export default function NotFound() {
  return (
    <StatusPage
      type="error"
      title="Page Not Found"
      message="The page you are looking for does not exist."
      description="The requested page could not be found. It may have been moved, deleted, or the URL may be incorrect."
      primaryAction={{
        label: "Go to Home",
        href: routes.publicroute.HOME,
        onClick: () => {},
      }}
      showBackButton={true}
    />
  )
}




