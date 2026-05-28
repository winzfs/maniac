import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).$defaultFn(() => Date.now()).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$defaultFn(() => Date.now()).notNull(),
};
const softDelete = { deletedAt: integer("deleted_at", { mode: "timestamp_ms" }) };

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  nickname: text("nickname").notNull(),
  profileImageUrl: text("profile_image_url"),
  ...timestamps,
}, (t) => ({
  emailUnique: uniqueIndex("users_email_unique").on(t.email),
  nicknameUnique: uniqueIndex("users_nickname_unique").on(t.nickname),
}));

export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  grantedBy: text("granted_by").references(() => users.id),
  grantedAt: integer("granted_at", { mode: "timestamp_ms" }).$defaultFn(() => Date.now()).notNull(),
  revokedAt: integer("revoked_at", { mode: "timestamp_ms" }),
  ...timestamps,
}, (t) => ({
  userRoleUnique: uniqueIndex("user_roles_user_role_unique").on(t.userId, t.role),
  userIdx: index("user_roles_user_id_idx").on(t.userId),
}));

export const equipments = sqliteTable("equipments", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  category: text("category").notNull(),
  brand: text("brand"),
  model: text("model"),
  nickname: text("nickname").notNull(),
  year: integer("year"),
  description: text("description"),
  usageMetricType: text("usage_metric_type").notNull(),
  usageMetricValue: integer("usage_metric_value").notNull().default(0),
  mainImageUrl: text("main_image_url"),
  coverPhotoId: text("cover_photo_id"),
  visibility: text("visibility").notNull().default("public"),
  moderationStatus: text("moderation_status").notNull().default("normal"),
  isOperationalHidden: integer("is_operational_hidden", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
  ...softDelete,
}, (t) => ({
  userIdx: index("equipments_user_id_idx").on(t.userId),
  categoryIdx: index("equipments_category_idx").on(t.category),
  visibilityIdx: index("equipments_visibility_idx").on(t.visibility),
  moderationIdx: index("equipments_moderation_status_idx").on(t.moderationStatus),
}));

export const equipmentPhotos = sqliteTable("equipment_photos", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").references(() => equipments.id).notNull(),
  imageUrl: text("image_url"),
  storageKey: text("storage_key"),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  takenAt: integer("taken_at", { mode: "timestamp_ms" }),
  visibility: text("visibility").notNull().default("public"),
  moderationStatus: text("moderation_status").notNull().default("normal"),
  ...timestamps,
  ...softDelete,
}, (t) => ({
  equipmentIdx: index("equipment_photos_equipment_id_idx").on(t.equipmentId),
  sortOrderIdx: index("equipment_photos_sort_order_idx").on(t.sortOrder),
}));

export const maintenanceLogs = sqliteTable("maintenance_logs", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").references(() => equipments.id).notNull(),
  type: text("type").notNull(),
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
}, (t) => ({
  equipmentIdx: index("maintenance_logs_equipment_id_idx").on(t.equipmentId),
  performedAtIdx: index("maintenance_logs_performed_at_idx").on(t.performedAt),
}));

export const parts = sqliteTable("parts", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").references(() => equipments.id).notNull(),
  category: text("category").notNull(),
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
}, (t) => ({
  equipmentIdx: index("parts_equipment_id_idx").on(t.equipmentId),
  categoryIdx: index("parts_category_idx").on(t.category),
}));

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  equipmentId: text("equipment_id").references(() => equipments.id).notNull(),
  label: text("label").notNull(),
  dueAt: integer("due_at", { mode: "timestamp_ms" }),
  isDone: integer("is_done", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
  ...softDelete,
});
export const themes = sqliteTable("themes", { id: text("id").primaryKey(), name: text("name").notNull(), code: text("code").notNull(), isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true), ...timestamps });
export const sitePages = sqliteTable("site_pages", { id: text("id").primaryKey(), slug: text("slug").notNull(), title: text("title").notNull(), status: text("status").notNull(), ...timestamps }, (t) => ({ slugUnique: uniqueIndex("site_pages_slug_unique").on(t.slug) }));
export const siteSections = sqliteTable("site_sections", { id: text("id").primaryKey(), pageId: text("page_id").references(() => sitePages.id).notNull(), type: text("type").notNull(), title: text("title").notNull(), body: text("body"), image: text("image"), cta: text("cta"), sortOrder: integer("sort_order").notNull().default(0), isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true), ...timestamps }, (t) => ({ pageSortUnique: uniqueIndex("site_sections_page_sort_unique").on(t.pageId, t.sortOrder) }));
export const banners = sqliteTable("banners", { id: text("id").primaryKey(), title: text("title").notNull(), description: text("description"), ctaLabel: text("cta_label"), linkUrl: text("link_url"), sortOrder: integer("sort_order").notNull().default(0), isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true), ...timestamps, ...softDelete });
export const notices = sqliteTable("notices", { id: text("id").primaryKey(), title: text("title").notNull(), body: text("body").notNull(), status: text("status").notNull(), isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false), publishedAt: integer("published_at", { mode: "timestamp_ms" }), ...timestamps, ...softDelete });
export const faqItems = sqliteTable("faq_items", { id: text("id").primaryKey(), question: text("question").notNull(), answer: text("answer").notNull(), sortOrder: integer("sort_order").notNull().default(0), isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false), ...timestamps, ...softDelete });
export const boards = sqliteTable("boards", { id: text("id").primaryKey(), slug: text("slug").notNull(), title: text("title").notNull(), status: text("status").notNull(), permission: text("permission").notNull(), ...timestamps }, (t) => ({ slugUnique: uniqueIndex("boards_slug_unique").on(t.slug) }));
export const posts = sqliteTable("posts", { id: text("id").primaryKey(), boardId: text("board_id").references(() => boards.id).notNull(), authorId: text("author_id").references(() => users.id).notNull(), title: text("title").notNull(), body: text("body").notNull(), status: text("status").notNull(), visibility: text("visibility").notNull(), moderationStatus: text("moderation_status").notNull(), ...timestamps, ...softDelete }, (t) => ({ boardStatusIdx: index("posts_board_status_idx").on(t.boardId, t.status) }));
export const comments = sqliteTable("comments", { id: text("id").primaryKey(), postId: text("post_id").references(() => posts.id).notNull(), authorId: text("author_id").references(() => users.id).notNull(), body: text("body").notNull(), status: text("status").notNull(), moderationStatus: text("moderation_status").notNull(), ...timestamps, ...softDelete }, (t) => ({ postIdx: index("comments_post_id_idx").on(t.postId) }));
export const reports = sqliteTable("reports", { id: text("id").primaryKey(), reporterUserId: text("reporter_user_id").references(() => users.id).notNull(), targetType: text("target_type").notNull(), targetId: text("target_id").notNull(), reasonCode: text("reason_code").notNull(), reasonText: text("reason_text"), status: text("status").notNull().default("open"), ...timestamps }, (t) => ({ statusIdx: index("reports_status_idx").on(t.status), targetIdx: index("reports_target_idx").on(t.targetType, t.targetId) }));
export const moderationActions = sqliteTable("moderation_actions", { id: text("id").primaryKey(), reportId: text("report_id").references(() => reports.id), moderatorId: text("moderator_id").references(() => users.id).notNull(), action: text("action").notNull(), note: text("note"), ...timestamps });
export const adminAuditLogs = sqliteTable("admin_audit_logs", { id: text("id").primaryKey(), adminUserId: text("admin_user_id").references(() => users.id).notNull(), action: text("action").notNull(), resourceType: text("resource_type").notNull(), resourceId: text("resource_id").notNull(), beforeValueJson: text("before_value_json"), afterValueJson: text("after_value_json"), reason: text("reason"), ipAddress: text("ip_address"), userAgent: text("user_agent"), createdAt: integer("created_at", { mode: "timestamp_ms" }).$defaultFn(() => Date.now()).notNull() }, (t) => ({ adminCreatedIdx: index("admin_audit_logs_admin_created_idx").on(t.adminUserId, t.createdAt) }));
