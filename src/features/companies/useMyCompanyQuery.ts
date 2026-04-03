import { useQuery } from "@tanstack/react-query";
import { getMyCompany } from "./company.api";
import { useAuth } from "../auth/auth.context";

export function useMyCompanyQuery() {
  const { isAuthenticated, session } = useAuth();
  const hasCompany = Boolean(session?.user?.companyId);

  return useQuery({
    queryKey: ["myCompany"],
    queryFn: getMyCompany,
    enabled: isAuthenticated && hasCompany,
    staleTime: 60_000
  });
}
