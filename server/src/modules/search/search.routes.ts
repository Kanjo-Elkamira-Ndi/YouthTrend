import { Router } from 'express';
import { SearchService, SearchScope, SearchType, SearchAllResult } from './search.service';
import { optionalAuth } from '../auth/auth.middleware';
import { searchLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
import { BadRequestError } from '../../shared/errors/AppError';

const router = Router();

const VALID_TYPES = new Set(['all', 'posts', 'writers', 'campuses']);
const VALID_SCOPES = new Set(['campus', 'global']);

router.get(
  '/',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const q = (req.query.q as string) ?? '';
    if (q.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters.');
    }

    const typeRaw = (req.query.type as string) ?? 'all';
    const type: SearchType = VALID_TYPES.has(typeRaw) ? (typeRaw as SearchType) : 'all';

    const scopeRaw = (req.query.scope as string) ||
      (req.user?.campusId ? 'campus' : 'global');
    const scope: SearchScope = VALID_SCOPES.has(scopeRaw)
      ? (scopeRaw as SearchScope)
      : req.user?.campusId ? 'campus' : 'global';

    let campusId: string | undefined;

    if (scope === 'campus') {
      campusId = req.user?.campusId ?? (req.query.campusId as string | undefined);
      if (!campusId) {
        throw new BadRequestError('Campus ID is required for campus-scoped search. Authenticate or provide ?campusId=.');
      }
    }

    const result = await SearchService.search({
      q,
      type,
      scope,
      campusId,
      viewerId: req.user?.id,
      queryParams: req.query as Record<string, unknown>,
    });

    if (type === 'all') {
      return sendSuccess(res, result as SearchAllResult);
    }

    const paginated = result as { data: unknown[]; meta: import('../../shared/utils/response').PaginationMeta };
    return sendPaginated(res, paginated.data, paginated.meta);
  }),
);

router.get(
  '/trending',
  asyncHandler(async (_req, res) => {
    const terms = await SearchService.getTrendingSearches();
    return sendSuccess(res, terms);
  }),
);

export default router;
