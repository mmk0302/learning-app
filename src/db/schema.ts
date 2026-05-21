import { sql, relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ユーザー（next-auth互換 + 拡張カラム）
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  role: text("role", { enum: ["admin", "member"] })
    .notNull()
    .default("member"),
  membershipType: text("membership_type", {
    enum: ["none", "single", "subscription"],
  })
    .notNull()
    .default("none"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// next-auth用テーブル（カラム名はアダプターが要求する形式）
export const accounts = sqliteTable("accounts", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

// 講座
export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  accessType: text("access_type", { enum: ["single", "subscription"] })
    .notNull()
    .default("single"),
  published: integer("published", { mode: "boolean" })
    .notNull()
    .default(false),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// セクション
export const sections = sqliteTable("sections", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// 動画
export const videos = sqliteTable("videos", {
  id: text("id").primaryKey(),
  sectionId: text("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  youtubeId: text("youtube_id").notNull(),
  description: text("description"),
  duration: text("duration"),
  order: integer("order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// パスワード（講座解放用）
export const coursePasswords = sqliteTable("course_passwords", {
  id: text("id").primaryKey(),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  password: text("password").notNull(),
  // null = 未使用、メールが入ったら使用済み
  usedByEmail: text("used_by_email"),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// サブスクパスワード
export const subscriptionPasswords = sqliteTable("subscription_passwords", {
  id: text("id").primaryKey(),
  password: text("password").notNull(),
  usedByEmail: text("used_by_email"),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ユーザーの講座アクセス権
export const courseAccess = sqliteTable("course_access", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  grantedAt: integer("granted_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Relations
export const coursesRelations = relations(courses, ({ many }) => ({
  sections: many(sections),
  coursePasswords: many(coursePasswords),
  courseAccess: many(courseAccess),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, { fields: [sections.courseId], references: [courses.id] }),
  videos: many(videos),
}));

export const videosRelations = relations(videos, ({ one }) => ({
  section: one(sections, { fields: [videos.sectionId], references: [sections.id] }),
}));

export const coursePasswordsRelations = relations(coursePasswords, ({ one }) => ({
  course: one(courses, { fields: [coursePasswords.courseId], references: [courses.id] }),
}));

export const courseAccessRelations = relations(courseAccess, ({ one }) => ({
  user: one(users, { fields: [courseAccess.userId], references: [users.id] }),
  course: one(courses, { fields: [courseAccess.courseId], references: [courses.id] }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  courseAccess: many(courseAccess),
}));
