import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch() * 1000)`;
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(now),
};
const softDelete = { deletedAt: integer("deleted_at", { mode: "timestamp_ms" }) };

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  nickname: text("nickname").notNull(),
  profileImageUrl: text("profile_image_url"),
  provider: text("provider"),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
  nicknameIdx: index("users_nickname_idx").on(table.nickname),
}));

export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  grantedBy: text("granted_by").references(() => users.id, { onDelete: "set null" }),
  grantedAt: integer("granted_at", { mode: "timestamp_ms" }).notNull().default(now),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  ...timestamps,
}, (table) => ({
  userRoleIdx: index("user_roles_user_role_idx").on(table.userId, table.role),
}));

export const equipments = sqliteTable("equipments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull().default("motorcycle"),
  brand: text("brand"),
  model: text("model"),
  nickname: text("nickname").notNull(),
  slug: text("slug").notNull(),
  year: integer("year"),
  description: text("description"),
  mainImageUrl: text("main_image_url"),
  usageMetricType: text("usage_metric_type").notNull().default("km"),
  usageMetricValue: integer("usage_metric_value"),
  visibility: text("visibility").notNull().default("private"),
  moderationStatus: text("moderation_status").notNull().default("normal"),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  userIdx: index("equipments_user_idx").on(table.userId),
  categoryIdx: index("equipments_category_idx").on(table.category),
  publicIdx: index("equipments_public_idx").on(table.visibility, table.moderationStatus),
  userSlugUnique: uniqueIndex("equipments_user_slug_unique").on(table.userId, table.slug),
}));

export const equipmentPhotos = sqliteTable("equipment_photos", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").notNull().references(() => equipments.id, { onDelete: "cascade" }),
  imageUrl: text("image_url"),
  storageKey: text("storage_key").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  takenAt: integer("taken_at", { mode: "timestamp_ms" }),
  sortOrder: integer("sort_order").notNull().default(0),
  isCover: integer("is_cover", { mode: "boolean" }).notNull().default(false),
  visibility: text("visibility").notNull().default("public"),
  moderationStatus: text("moderation_status").notNull().default("normal"),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  equipmentOrderIdx: index("equipment_photos_equipment_order_idx").on(table.equipmentId, table.sortOrder),
  storageKeyUnique: uniqueIndex("equipment_photos_storage_key_unique").on(table.storageKey),
}));

export const maintenanceLogs = sqliteTable("maintenance_logs", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").notNull().references(() => equipments.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("custom"),
  title: text("title").notNull(),
  description: text("description"),
  performedAt: integer("performed_at", { mode: "timestamp_ms" }).notNull(),
  usageMetricValue: integer("usage_metric_value"),
  cost: integer("cost"),
  shopName: text("shop_name"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
  visibility: text("visibility").notNull().default("public"),
  moderationStatus: text("moderation_status").notNull().default("normal"),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  equipmentPerformedIdx: index("maintenance_logs_equipment_performed_idx").on(table.equipmentId, table.performedAt),
  typeIdx: index("maintenance_logs_type_idx").on(table.type),
}));

export const parts = sqliteTable("parts", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").notNull().references(() => equipments.id, { onDelete: "cascade" }),
  category: text("category").notNull().default("custom"),
  brand: text("brand"),
  name: text("name").notNull(),
  price: integer("price"),
  installedAt: integer("installed_at", { mode: "timestamp_ms" }),
  purchaseUrl: text("purchase_url"),
  imageUrl: text("image_url"),
  memo: text("memo"),
  visibility: text("visibility").notNull().default("public"),
  moderationStatus: text("moderation_status").notNull().default("normal"),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  equipmentIdx: index("parts_equipment_idx").on(table.equipmentId),
  categoryIdx: index("parts_category_idx").on(table.category),
}));

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").notNull().references(() => equipments.id, { onDelete: "cascade" }),
  maintenanceType: text("maintenance_type").notNull().default("custom"),
  title: text("title").notNull(),
  baseUsageMetricValue: integer("base_usage_metric_value"),
  intervalUsageMetricValue: integer("interval_usage_metric_value"),
  nextDueUsageMetricValue: integer("next_due_usage_metric_value"),
  nextDueDate: integer("next_due_date", { mode: "timestamp_ms" }),
  channel: text("channel").notNull().default("web"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
  ...softDelete,
}, (table) => ({
  equipmentIdx: index("reminders_equipment_idx").on(table.equipmentId),
  dueDateIdx: index("reminders_due_date_idx").on(table.nextDueDate),
}));

export const themes = sqliteTable("themes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  price: integer("price").notNull().default(0),
  previewImageUrl: text("preview_image_url"),
  isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
}, (table) => ({ codeUnique: uniqueIndex("themes_code_unique").on(table.code) }));

export const sitePages = sqliteTable("site_pages", { id: text("id").primaryKey(), slug: text("slug").notNull(), title: text("title").notNull(), status: text("status").notNull().default("draft"), ...timestamps }, (table) => ({ slugUnique: uniqueIndex("site_pages_slug_unique").on(table.slug) }));
export const siteSections = sqliteTable("site_sections", { id: text("id").primaryKey(), pageId: text("page_id").notNull().references(() => sitePages.id, { onDelete: "cascade" }), type: text("type").notNull(), title: text("title").notNull(), body: text("body"), image: text("image"), cta: text("cta"), sortOrder: integer("sort_order").notNull().default(0), isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true), ...timestamps });
export const banners = sqliteTable("banners", { id: text("id").primaryKey(), title: text("title").notNull(), description: text("description"), ctaLabel: text("cta_label"), linkUrl: text("link_url"), sortOrder: integer("sort_order").notNull().default(0), isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true), ...timestamps });
export const notices = sqliteTable("notices", { id: text("id").primaryKey(), title: text("title").notNull(), body: text("body").notNull(), status: text("status").notNull().default("draft"), isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false), publishedAt: integer("published_at", { mode: "timestamp_ms" }), ...timestamps });
export const faqItems = sqliteTable("faq_items", { id: text("id").primaryKey(), question: text("question").notNull(), answer: text("answer").notNull(), sortOrder: integer("sort_order").notNull().default(0), isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false), ...timestamps });
export const boards = sqliteTable("boards", { id: text("id").primaryKey(), slug: text("slug").notNull(), title: text("title").notNull(), status: text("status").notNull().default("active"), permission: text("permission").notNull().default("public"), ...timestamps }, (table) => ({ slugUnique: uniqueIndex("boards_slug_unique").on(table.slug) }));
export const posts = sqliteTable("posts", { id: text("id").primaryKey(), boardId: text("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }), authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }), title: text("title").notNull(), body: text("body").notNull(), status: text("status").notNull().default("published"), visibility: text("visibility").notNull().default("public"), moderationStatus: text("moderation_status").notNull().default("normal"), ...timestamps, ...softDelete });
export const comments = sqliteTable("comments", { id: text("id").primaryKey(), postId: text("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }), authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }), body: text("body").notNull(), status: text("status").notNull().default("published"), moderationStatus: text("moderation_status").notNull().default("normal"), ...timestamps, ...softDelete });
export const reports = sqliteTable("reports", { id: text("id").primaryKey(), resourceType: text("resource_type").notNull(), resourceId: text("resource_id").notNull(), reporterId: text("reporter_id").references(() => users.id, { onDelete: "set null" }), reason: text("reason").notNull(), status: text("status").notNull().default("pending"), ...timestamps });
export const moderationActions = sqliteTable("moderation_actions", { id: text("id").primaryKey(), reportId: text("report_id").references(() => reports.id, { onDelete: "set null" }), moderatorId: text("moderator_id").notNull().references(() => users.id, { onDelete: "cascade" }), action: text("action").notNull(), note: text("note"), ...timestamps });
export const adminAuditLogs = sqliteTable("admin_audit_logs", { id: text("id").primaryKey(), adminUserId: text("admin_user_id").notNull().references(() => users.id, { onDelete: "cascade" }), action: text("action").notNull(), resourceType: text("resource_type").notNull(), resourceId: text("resource_id").notNull(), beforeValueJson: text("before_value_json"), afterValueJson: text("after_value_json"), reason: text("reason"), ipAddress: text("ip_address"), userAgent: text("user_agent"), createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(now) });
