export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  changePassword: "/dashboard/change-password",
  billsNew: "/dashboard/bills/new",
  billsNewSplit: "/dashboard/bills/new/split",
  billDetail: (id: string) => `/dashboard/bills/${id}`,
} as const;
