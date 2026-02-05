/**
 * バリデーションスキーマのエクスポート
 */

// 共通スキーマ
export {
  paginationSchema,
  dateRangeBaseSchema,
  dateRangeSchema,
  keywordSearchSchema,
  idParamSchema,
  userRoleSchema,
  reportStatusSchema,
  emailSchema,
  phoneSchema,
  datetimeSchema,
  dateSchema,
} from "./common";
export type {
  PaginationParams,
  DateRangeParams,
  KeywordSearchParams,
  IdParam,
  UserRole,
  ReportStatus,
} from "./common";

// 認証スキーマ
export { loginRequestSchema, changePasswordSchema } from "./auth";
export type { LoginRequest, ChangePasswordRequest } from "./auth";

// ユーザースキーマ
export {
  createUserSchema,
  updateUserSchema,
  userSearchSchema,
} from "./user";
export type {
  CreateUserRequest,
  UpdateUserRequest,
  UserSearchParams,
} from "./user";

// 顧客スキーマ
export {
  createCustomerSchema,
  updateCustomerSchema,
  customerSearchSchema,
} from "./customer";
export type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerSearchParams,
} from "./customer";

// 日報スキーマ
export {
  createVisitRecordSchema,
  updateVisitRecordSchema,
  createReportSchema,
  updateReportSchema,
  reportSearchSchema,
} from "./report";
export type {
  CreateVisitRecordInput,
  UpdateVisitRecordInput,
  CreateReportRequest,
  UpdateReportRequest,
  ReportSearchParams,
} from "./report";

// コメントスキーマ
export {
  createCommentSchema,
  updateCommentSchema,
  commentParamsSchema,
} from "./comment";
export type {
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentParams,
} from "./comment";
