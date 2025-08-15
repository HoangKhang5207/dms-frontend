import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import các component
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout'; // Layout mới
import ProtectedRoute from './ProtectedRoute';
import AnimatedPage from '../components/AnimatedPage/AnimatedPage';

// Import các trang
import HomePage from '../pages/HomePage/HomePage';
import LoginPage from '../pages/LoginPage/LoginPage';
import RegisterPage from '../pages/RegisterPage/RegisterPage';
import VerifyEmailMessagePage from '../pages/VerifyEmailMessagePage/VerifyEmailMessagePage';
import VerifyEmailPage from '../pages/VerifyEmailPage/VerifyEmailPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage/ResetPasswordPage';
import NoOrganizationPage from '../pages/Home/NoOrganizationPage';
import CreateOrganizationPage from '../pages/Home/CreateOrganizationPage';
import PendingOrganizationPage from '../pages/Home/PendingOrganizationPage';
import MainDashboard from '../pages/Home/MainDashboard';
import OrganizationPage from '../pages/Home/Organization/OrganizationPage';
import InfoTab from '../pages/Home/Organization/Tabs/InfoTab';
import DepartmentsTab from '../pages/Home/Organization/Tabs/DepartmentsTab';
import MembersTab from '../pages/Home/Organization/Tabs/MembersTab';
import AcceptInvitationPage from '../pages/AcceptInvitationPage/AcceptInvitationPage';
import DocumentManagementPage from '../pages/Home/DocumentManagement/DocumentManagementPage';
import CategoryView from '../pages/Home/DocumentManagement/CategoryView';
import DocumentView from '../pages/Home/DocumentManagement/DocumentView';
import SearchResultsPage from '../pages/Home/DocumentManagement/SearchResultsPage';
import HomeDispatcher from '../pages/Home/HomeDispatcher';
import SharedDocumentsPage from '../pages/SharedDocumentsPage/SharedDocumentsPage';

// Placeholders for pages to be implemented
import AuditLogsPage from '../pages/Home/Audit/AuditLogsPage';
import DelegationsPage from '../pages/Home/Delegations/DelegationsPage';
import PublicViewer from '../pages/Public/PublicViewer';

const AppRouter = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* --- CÁC ROUTE PUBLIC --- */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<AnimatedPage><HomePage /></AnimatedPage>} />
                    <Route path="login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
                    <Route path="register" element={<AnimatedPage><RegisterPage /></AnimatedPage>} />
                    <Route path="forgot-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
                </Route>
                {/* Public viewer for shared documents */}
                <Route path="/public/share/:token" element={<AnimatedPage><PublicViewer /></AnimatedPage>} />
                <Route path="/verify-email-message" element={<AnimatedPage><VerifyEmailMessagePage /></AnimatedPage>} />
                <Route path="/verifired" element={<AnimatedPage><VerifyEmailPage /></AnimatedPage>} />
                <Route path="/reset-password" element={<AnimatedPage><ResetPasswordPage /></AnimatedPage>} />
                <Route path="/accepted-join" element={<AnimatedPage><AcceptInvitationPage /></AnimatedPage>} />

                {/* --- CÁC ROUTE CẦN BẢO VỆ (ĐÃ SỬA LẠI CẤU TRÚC) --- */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/home" element={<DashboardLayout />}>
                        <Route index element={<HomeDispatcher />} />
                        <Route path="dashboard" element={<AnimatedPage><MainDashboard /></AnimatedPage>} />
                        <Route path="no-organization" element={<AnimatedPage><NoOrganizationPage /></AnimatedPage>} />
                        <Route path="create-organization" element={<AnimatedPage><CreateOrganizationPage /></AnimatedPage>} />
                        <Route path="pending-organization" element={<AnimatedPage><PendingOrganizationPage /></AnimatedPage>} />

                        {/* Các route quản lý tổ chức */}
                        <Route path="organization" element={<OrganizationPage />}>
                            <Route path="info" element={<AnimatedPage><InfoTab /></AnimatedPage>} />
                            <Route path="departments" element={<AnimatedPage><DepartmentsTab /></AnimatedPage>} />
                            <Route path="members" element={<AnimatedPage><MembersTab /></AnimatedPage>} />
                        </Route>

                        {/* Các Route mới cho Quản lý tài liệu */}
                        <Route path="document-management" element={<AnimatedPage><DocumentManagementPage /></AnimatedPage>} />
                        <Route path="document-management/search" element={<AnimatedPage><SearchResultsPage /></AnimatedPage>} />
                        <Route path="document-management/:departmentId" element={<AnimatedPage><CategoryView /></AnimatedPage>} />
                        <Route path="document-management/:departmentId/:categoryId" element={<AnimatedPage><DocumentView /></AnimatedPage>} />
                        <Route path="shared" element={<AnimatedPage><SharedDocumentsPage /></AnimatedPage>} />
                        {/* Audit logs and Delegations */}
                        <Route path="audit/logs" element={<AnimatedPage><AuditLogsPage /></AnimatedPage>} />
                        <Route path="delegations" element={<AnimatedPage><DelegationsPage /></AnimatedPage>} />
                    </Route>
                </Route>
            </Routes>
        </AnimatePresence>
    );
};

export default AppRouter;