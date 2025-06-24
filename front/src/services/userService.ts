import { getRequest } from "@/library/request";

interface getClientIPResponse {
  ip: string;
}

class UserService {
  async getClientIP(): Promise<getClientIPResponse> {
    return await getRequest<getClientIPResponse>("/user/ip");
  }
}

export const userService = new UserService();
