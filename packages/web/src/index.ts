/** @module @osaas/client-web */

export { publish } from './publish';
export { createCloudfrontDistribution } from './cdn';
export { generateCommonAccessToken, validateCommonAccessToken } from './cat';
export {
  publishToMyPages,
  MyPage,
  MyPageUploadFile,
  MyPageUploadTarget,
  MyPageUploadUrlsResponse,
  MyPagePublishResult,
  MyPagesPublishResult,
  MyPageNotReadyError,
  validateMyPageName,
  MAX_PAGE_FILE_SIZE_BYTES,
  MAX_UPLOAD_FILES_PER_REQUEST
} from './mypage';
