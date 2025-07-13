import { BaseApplicationCustomizer } from '@microsoft/sp-application-base';
import { SPPermission } from '@microsoft/sp-page-context';

/**
 * Utility functions for checking SharePoint user permissions
 */
export class PermissionUtils {
  /**
   * Check if the current user has permission to edit navigation and theme settings
   * Only Site Owners (Manage Web permission) can edit
   * 
   * @param context SPFx extension context
   * @returns boolean indicating if user can edit
   */
  public static canUserEdit(
    context: BaseApplicationCustomizer<unknown>["context"]
  ): boolean {
    try {
      // Site Owner (Manage Web permission)
      if (context.pageContext.web.permissions.hasPermission(SPPermission.manageWeb)) {
        return true;
      }
      // Default: not allowed
      return false;
    } catch {
      console.warn('Permission check failed, defaulting to hide edit options');
      // Default to hide (more secure) if permission check fails
      return false;
    }
  }

  /**
   * Get user's display name for logging purposes
   * 
   * @param context SPFx extension context
   * @returns user display name or 'Unknown User'
   */
  public static getUserDisplayName(
    context: BaseApplicationCustomizer<unknown>["context"]
  ): string {
    try {
      return context.pageContext.user.displayName || 'Unknown User';
    } catch {
      return 'Unknown User';
    }
  }

  /**
   * Get user's email for logging purposes
   * 
   * @param context SPFx extension context
   * @returns user email or 'unknown@email.com'
   */
  public static getUserEmail(
    context: BaseApplicationCustomizer<unknown>["context"]
  ): string {
    try {
      return context.pageContext.user.email || 'unknown@email.com';
    } catch {
      return 'unknown@email.com';
    }
  }
} 