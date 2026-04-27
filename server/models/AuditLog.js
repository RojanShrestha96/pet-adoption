import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: [
        "LOGIN",
        "CREATE_ADMIN",
        "DELETE_ADMIN",
        "UPDATE_PROFILE",
        "UPDATE_PASSWORD",
        "VERIFY_SHELTER",
        "SUSPEND_SHELTER",
        "UPDATE_SHELTER_NOTES",
        "APPROVE_PET",
        "REJECT_PET",
        "UPDATE_USER_STATUS",
        "SYSTEM"
      ],
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "danger", "system"],
      default: "info",
    },
  },
  { timestamps: true }
);

// Index for quicker retrieval and sorting
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
