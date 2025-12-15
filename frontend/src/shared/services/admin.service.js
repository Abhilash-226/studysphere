import api from "./api.service";

/**
 * Admin API service for tutor verification and platform management
 */

// Dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get("/admin/dashboard/stats");
  return response.data;
};

// Get pending verifications with pagination and search
export const getPendingVerifications = async (params = {}) => {
  const { page = 1, limit = 10, status = "all", search = "" } = params;
  const response = await api.get("/admin/verifications", {
    params: { page, limit, status, search },
  });
  return response.data;
};

// Get tutor details for verification
export const getTutorForVerification = async (tutorId) => {
  const response = await api.get(`/admin/verifications/${tutorId}`);
  return response.data;
};

// Approve tutor
export const approveTutor = async (tutorId, notes = "") => {
  const response = await api.post(`/admin/verifications/${tutorId}/approve`, {
    notes,
  });
  return response.data;
};

// Reject tutor
export const rejectTutor = async (tutorId, reason) => {
  const response = await api.post(`/admin/verifications/${tutorId}/reject`, {
    reason,
  });
  return response.data;
};

// Request more info from tutor
export const requestMoreInfo = async (
  tutorId,
  message,
  requiredDocuments = []
) => {
  const response = await api.post(
    `/admin/verifications/${tutorId}/request-info`,
    {
      message,
      requiredDocuments,
    }
  );
  return response.data;
};

// Get all users (admin only)
export const getAllUsers = async (params = {}) => {
  const { page = 1, limit = 20, role = "all", search = "" } = params;
  const response = await api.get("/admin/users", {
    params: { page, limit, role, search },
  });
  return response.data;
};

export default {
  getDashboardStats,
  getPendingVerifications,
  getTutorForVerification,
  approveTutor,
  rejectTutor,
  requestMoreInfo,
  getAllUsers,
};
