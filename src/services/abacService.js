import axiosInstance from "../api/axiosInstance";

/**
 * Service cho ABAC (Attribute-Based Access Control)
 */
class ABACService {
  /**
   * Đánh giá quyền truy cập ABAC
   * @param {number} docId - ID của document
   * @param {string} action - Hành động (READ, WRITE, SHARE, etc.)
   * @returns {Promise<Object>} Kết quả đánh giá ABAC
   */
  async evaluateAccess(docId, action = "READ") {
    try {
      const response = await axiosInstance.get(`/api/abac/evaluate/${docId}`, {
        params: { action },
      });
      return response.data;
    } catch (error) {
      console.error("Error evaluating ABAC access:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra user có thể chia sẻ document không
   * @param {number} docId - ID của document
   * @returns {Promise<boolean>} Có thể chia sẻ hay không
   */
  async canShareDocument(docId) {
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${docId}/can-share`
      );
      return response.data.canShare;
    } catch (error) {
      console.error("Error checking share permission:", error);
      return false;
    }
  }

  /**
   * Lấy danh sách user có thể chia sẻ
   * @param {number} docId - ID của document
   * @param {Array<string>} permissionTypes - Danh sách loại permissions
   * @returns {Promise<Array<number>>} Danh sách user IDs
   */
  async getShareableUsers(docId, permissionTypes = []) {
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${docId}/shareable-users`,
        {
          params: { permissionTypes },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting shareable users:", error);
      return [];
    }
  }

  /**
   * Chia sẻ document với ABAC permissions
   * @param {number} docId - ID của document
   * @param {Object} shareRequest - Thông tin chia sẻ
   * @returns {Promise<Object>} Kết quả chia sẻ
   */
  async shareDocument(docId, shareRequest) {
    try {
      const response = await axiosInstance.post(
        `/api/abac/documents/${docId}/share`,
        shareRequest
      );
      return response.data;
    } catch (error) {
      console.error("Error sharing document:", error);
      throw error;
    }
  }

  /**
   * Kiểm tra quyền chia sẻ external
   * @param {number} docId - ID của document
   * @returns {Promise<boolean>} Có quyền chia sẻ external hay không
   */
  async hasExternalSharePermission(docId) {
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${docId}/external-permission`
      );
      return response.data.hasPermission;
    } catch (error) {
      console.error("Error checking external share permission:", error);
      return false;
    }
  }

  /**
   * Kiểm tra quyền truy cập external
   * @param {number} docId - ID của document
   * @returns {Promise<boolean>} Có quyền truy cập external hay không
   */
  async checkExternalAccess(docId) {
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${docId}/external-access`
      );
      return response.data.hasAccess;
    } catch (error) {
      console.error("Error checking external access:", error);
      return false;
    }
  }

  /**
   * Kiểm tra quyền truy cập trong phạm vi tổ chức
   * @param {number} docId - ID của document
   * @returns {Promise<boolean>} Có quyền truy cập org scope hay không
   */
  async checkOrgScopeAccess(docId) {
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${docId}/orgscope-access`
      );
      return response.data.hasAccess;
    } catch (error) {
      console.error("Error checking org scope access:", error);
      return false;
    }
  }

  /**
   * Lấy thông tin permissions của document
   * @param {number} docId - ID của document
   * @returns {Promise<Object>} Thông tin permissions
   */
  async getDocumentPermissions(docId) {
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${docId}/permissions`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting document permissions:", error);
      return {
        permissions: [],
        accessRights: {},
        documentInfo: null,
      };
    }
  }

  /**
   * Xóa permission của user
   * @param {number} docId - ID của document
   * @param {number} userId - ID của user
   * @param {string} permissionType - Loại permission
   * @returns {Promise<Object>} Kết quả xóa
   */
  async removePermission(docId, userId, permissionType) {
    try {
      const response = await axiosInstance.delete(
        `/api/abac/documents/${docId}/permissions`,
        {
          data: { userId, permissionType },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error removing permission:", error);
      throw error;
    }
  }

  /**
   * Cập nhật permission
   * @param {number} docId - ID của document
   * @param {number} userId - ID của user
   * @param {Object} permissionData - Dữ liệu permission mới
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async updatePermission(docId, userId, permissionData) {
    try {
      const response = await axiosInstance.put(
        `/api/abac/documents/${docId}/permissions`,
        {
          userId,
          ...permissionData,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating permission:", error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả permissions của document
   * @param {number} docId - ID của document
   * @returns {Promise<Array>} Danh sách permissions
   */
  async getAllDocumentPermissions(docId) {
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${docId}/all-permissions`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting all document permissions:", error);
      return [];
    }
  }

  /**
   * Kiểm tra permission có hợp lệ không
   * @param {string} permissionType - Loại permission
   * @returns {boolean} Permission có hợp lệ hay không
   */
  isValidPermissionType(permissionType) {
    const validPermissions = [
      "documents:share:readonly",
      "documents:share:forwardable",
      "documents:share:timebound",
      "documents:share:external",
      "documents:share:orgscope",
    ];
    return validPermissions.includes(permissionType);
  }

  /**
   * Lấy label cho permission type
   * @param {string} permissionType - Loại permission
   * @returns {string} Label của permission
   */
  getPermissionLabel(permissionType) {
    const labels = {
      "documents:share:readonly": "Chỉ đọc",
      "documents:share:forwardable": "Có thể chia sẻ tiếp",
      "documents:share:timebound": "Có thời hạn",
      "documents:share:external": "Ngoài tổ chức",
      "documents:share:orgscope": "Trong tổ chức",
    };
    return labels[permissionType] || permissionType;
  }

  /**
   * Lấy icon cho permission type
   * @param {string} permissionType - Loại permission
   * @returns {string} Icon class
   */
  getPermissionIcon(permissionType) {
    const icons = {
      "documents:share:readonly": "fas fa-eye",
      "documents:share:forwardable": "fas fa-share",
      "documents:share:timebound": "fas fa-clock",
      "documents:share:external": "fas fa-external-link-alt",
      "documents:share:orgscope": "fas fa-building",
    };
    return icons[permissionType] || "fas fa-key";
  }

  /**
   * Lấy màu badge cho permission type
   * @param {string} permissionType - Loại permission
   * @returns {string} Bootstrap badge variant
   */
  getPermissionBadgeVariant(permissionType) {
    const variants = {
      "documents:share:readonly": "success",
      "documents:share:forwardable": "primary",
      "documents:share:timebound": "warning",
      "documents:share:external": "danger",
      "documents:share:orgscope": "info",
    };
    return variants[permissionType] || "secondary";
  }
}

export default new ABACService();
