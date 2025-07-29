import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'; // Thêm useCallback, useMemo
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '@ant-design/v5-patch-for-react-19';
import { message } from 'antd';

const OrganizationContext = createContext(null);

export const OrganizationProvider = ({ children }) => {
    const navigate = useNavigate();
    const [organization, setOrganization] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberPagination, setMemberPagination] = useState({});

    // Bọc hàm createOrganization trong useCallback
    const createOrganization = useCallback(async (values) => {
        try {
            const payload = {
                name: values.name,
                description: values.description,
                is_openai: values.isOpenai,
            };
            await axiosInstance.post('/organizations', payload);
            message.success('Gửi yêu cầu tạo tổ chức thành công!');
            navigate('/home/pending-organization');
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Tên tổ chức có thể đã tồn tại.';
            message.error(errorMessage);
            console.error("Create organization failed:", error);
            return false;
        }
    }, [navigate]); // navigate là dependency

    // Hàm fetch danh sách phòng ban
    const fetchDepartments = useCallback(async (orgId) => {
        if (!orgId) return;
        setLoading(true);
        try {
            // GET /api/v1/departments/organization/{orgId}
            const response = await axiosInstance.get(`/departments/organization/${orgId}`);
            setDepartments(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch departments:", error);
            message.error("Không thể tải danh sách phòng ban.");
            setLoading(false);
        }
    }, []);

    // Hàm fetch danh sách thành viên (hỗ trợ phân trang)
    const fetchMembers = useCallback(async (orgId, page = 0, size = 10) => {
        if (!orgId) return;
        setLoading(true);
        try {
            // GET /api/v1/organizations/{orgId}/members
            const response = await axiosInstance.get(`/organizations/${orgId}/members`, {
                params: { page, size }
            });
            setMembers(response.data.content);
            setMemberPagination({
                current: response.data.number + 1,
                pageSize: response.data.size,
                total: response.data.totalElements,
            });
        } catch (error) {
            console.error("Failed to fetch members:", error);
            message.error("Không thể tải danh sách thành viên.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Bọc hàm fetchOrganizationDetails trong useCallback
    const fetchOrganizationDetails = useCallback(async (orgId) => {
        if (!orgId) return null;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/organizations/${orgId}`);
            setOrganization(response.data);

            // SAU KHI TẢI THÔNG TIN ORG THÀNH CÔNG, TẢI LUÔN DEPT VÀ MEMBERS
            await fetchDepartments(orgId);
            await fetchMembers(orgId, 0, 1000);

            setLoading(false);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch organization details:", error);
            message.error("Không thể tải thông tin tổ chức.");
            setLoading(false);
            return null;
        }
    }, [fetchDepartments, fetchMembers]);

    // Hàm cập nhật thông tin tổ chức
    const updateOrganization = useCallback(async (orgId, values) => {
        try {
            // PUT /api/v1/organizations/{id}
            await axiosInstance.put(`/organizations/${orgId}`, values);
            message.success('Cập nhật thông tin tổ chức thành công!');
            await fetchOrganizationDetails(orgId); // Tải lại thông tin mới nhất
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật thất bại.');
            return false;
        }
    }, [fetchOrganizationDetails]);

    // Hàm tạo phòng ban mới
    const createDepartment = useCallback(async (orgId, values) => {
        try {
            // POST /api/v1/departments
            await axiosInstance.post('/departments', { ...values, organization_id: orgId });
            message.success('Tạo phòng ban thành công!');
            await fetchDepartments(orgId); // Tải lại danh sách
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Tạo phòng ban thất bại.');
            return false;
        }
    }, [fetchDepartments]);
    
    // Hàm cập nhật phòng ban
    const updateDepartment = useCallback(async (deptId, orgId, values) => {
        try {
            // PUT /api/v1/departments/{id}
            await axiosInstance.put(`/departments/${deptId}`, values);
            message.success('Cập nhật phòng ban thành công!');
            await fetchDepartments(orgId); // Tải lại danh sách
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật phòng ban thất bại.');
            return false;
        }
    }, [fetchDepartments]);
    
    // Hàm xóa (thay đổi trạng thái) phòng ban
    const deleteDepartment = useCallback(async (deptId, orgId) => {
        try {
            // PATCH /api/v1/departments/{id}/status
            await axiosInstance.patch(`/departments/${deptId}/status`, { status: 2 }); // 2 = Inactive
            message.success('Xóa phòng ban thành công!');
            await fetchDepartments(orgId); // Tải lại danh sách
            return true;
        } catch (error) {
            message.error('Xóa phòng ban thất bại.');
            return false;
        }
    }, [fetchDepartments]);

    // Hàm mới để gán/bãi nhiệm vai trò Quản lý phòng ban
    const updateDeptManagerRole = useCallback(async (orgId, email, isManager) => {
        try {
            // PUT /api/v1/organizations/{orgId}/members/department-manager
            await axiosInstance.put(`/organizations/${orgId}/members/department-manager`, {
                email: email,
                is_manager: isManager,
            });
            const actionText = isManager ? 'Gán quyền' : 'Bãi nhiệm';
            message.success(`${actionText} thành công cho người dùng ${email}`);
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Thao tác thất bại.');
            return false;
        }
    }, []);

    // Hàm mời thành viên
    const inviteMembers = useCallback(async (orgId, usersToInvite) => {
        try {
            // POST /api/v1/organizations/{id}/invite-members
            const response = await axiosInstance.post(`/organizations/${orgId}/invite-members`, {
                users: usersToInvite
            });
            return { success: true, data: response.data };
        } catch (error) {
            message.error(error.response?.data?.message || 'Mời thành viên thất bại.');
            return { success: false };
        }
    }, []);

    const assignOrgManagerRole = useCallback(async (orgId, email) => {
        try {
            await axiosInstance.post(`/organizations/${orgId}/assign-manager`, { email });
            message.success(`Gán quyền Quản lý tổ chức thành công cho ${email}`);
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Thao tác thất bại.');
            return false;
        }
    }, []);

    const revokeOrgManagerRole = useCallback(async (orgId, email) => {
        try {
            await axiosInstance.post(`/organizations/${orgId}/recall-manager`, { email });
            message.success(`Bãi nhiệm quyền Quản lý tổ chức thành công cho ${email}`);
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Thao tác thất bại.');
            return false;
        }
    }, []);

    const removeUserFromOrg = useCallback(async (orgId, email) => {
        try {
            await axiosInstance.post(`/organizations/${orgId}/remove-member`, { email });
            message.success(`Đã xóa người dùng ${email} khỏi tổ chức.`);
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Xóa người dùng thất bại.');
            return false;
        }
    }, []);

    // Bọc đối tượng value trong useMemo để nó chỉ được tạo lại khi cần
    const value = useMemo(() => ({
        organization,
        departments,
        loading,
        members,
        memberPagination,
        createOrganization,
        fetchOrganizationDetails,
        updateOrganization,
        fetchDepartments,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        updateDeptManagerRole,
        fetchMembers,
        inviteMembers,
        assignOrgManagerRole,
        revokeOrgManagerRole,
        removeUserFromOrg,
    }), [
            organization, 
            departments, 
            loading, 
            members,
            memberPagination,
            createOrganization, 
            fetchOrganizationDetails,
            updateOrganization,
            fetchDepartments,
            createDepartment,
            updateDepartment,
            deleteDepartment,
            updateDeptManagerRole,
            fetchMembers,
            inviteMembers,
            assignOrgManagerRole,
            revokeOrgManagerRole,
            removeUserFromOrg
        ]);

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useOrganization = () => {
    return useContext(OrganizationContext);
};