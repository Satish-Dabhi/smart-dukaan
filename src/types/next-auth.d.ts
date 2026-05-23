import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    businessId?: string;
    isVerified?: boolean;
    authProvider?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      businessId?: string;
      isVerified?: boolean;
      authProvider?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    businessId?: string;
    isVerified?: boolean;
    authProvider?: string;
  }
}
