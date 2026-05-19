import AuditLog from "../models/AuditLog.js";
import Admin from "../models/Admin.js";

/**
 * Helper to log an admin action to the AuditLog collection
 * 
 * @param {String} adminId - The ObjectId of the Admin
 * @param {String} action - The action type (e.g. 'LOGIN', 'CREATE_ADMIN')
 * @param {String} target - Description of what was affected
 * @param {String} details - More details about the action
 * @param {String} type - Log type ('info', 'success', 'warning', 'danger', 'system')
 */
export const logAdminAction = async (adminId, action, target, details, type = "info") => {
  try {
    if (!adminId) return;

    let adminName = "Unknown Admin";
    try {
      const admin = await Admin.findById(adminId);
      if (admin) adminName = admin.name || admin.username;
    } catch (e) {
      console.warn("Could not fetch admin name for audit log", e);
    }

    await AuditLog.create({
      adminId,
      adminName,
      action,
      target,
      details,
      type,
    });
  } catch (error) {
    console.error("Failed to write to audit log:", error);
  }
};
