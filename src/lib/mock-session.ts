// UI確認用モックセッション
export const mockSession = {
  user: {
    id: "mock-user-id",
    name: "テストユーザー",
    email: "test@example.com",
    image: null,
    role: "admin" as const,
    membershipType: "subscription" as const,
  },
};
