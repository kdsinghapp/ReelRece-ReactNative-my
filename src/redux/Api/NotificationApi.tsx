/**
 * Notification API Service
 * 
 * Handles group invitations and notification-related API calls.
 */

import axiosInstance from "@redux/Api/axiosInstance";
import { Group, PaginatedResponse } from "@types/api.types";
import { ApiResponse, safeApiCall } from "@utils/apiErrorHandler";
import { 
  validateString,
  throwValidationError 
} from "@utils/apiInputValidator";

interface GroupInvitation extends Group {
  invited_at?: string;
  invited_by?: string;
}

interface InvitationResponse {
  results: GroupInvitation[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

/**
 * Get pending group invitations for the current user
 * @returns ApiResponse with paginated group invitations
 */
export const getPendingGroupInvites = (): Promise<ApiResponse<InvitationResponse>> =>
  safeApiCall(
    async () => {
      const response = await axiosInstance.get('/group/pending-invitations');
      return response.data;
    },
    'Failed to fetch pending invitations'
  );

/**
 * Respond to a group invitation (accept or decline)
 * @param groupId - ID of the group
 * @param accepted - Whether to accept the invitation
 * @returns ApiResponse with response result
 */
export const respondToGroupInvitation = (
  groupId: string,
  accepted: boolean
): Promise<ApiResponse<{ success: boolean; message?: string }>> =>
  safeApiCall(
    async () => {
      // Validate groupId
      const groupIdValidation = validateString(groupId, {
        fieldName: 'Group ID',
        required: true,
        minLength: 1,
        maxLength: 100,
      });

      if (!groupIdValidation.isValid) {
        throwValidationError('Group ID', groupIdValidation.error);
      }

      const response = await axiosInstance.put('group/accept-invitation', {
        group_id: groupIdValidation.sanitized,
        invitation_accepted: accepted ? 'yes' : 'no',
      });
      return response.data;
    },
    accepted ? 'Failed to accept invitation' : 'Failed to decline invitation'
  );
