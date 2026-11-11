import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider, App as AntApp } from 'antd'; // Import thêm 'App' và đổi tên thành 'AntApp' để tránh trùng lặp
import AppRouter from './routes/AppRouter';
import aquadocsTheme from './styles/aquadocsTheme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext'; // Import
import { OrganizationProvider } from './contexts/OrganizationContext';
import { DocumentProvider } from './contexts/DocumentContext'; // Import
import { SearchProvider } from './contexts/SearchContext';

// Existing context/services use Ant Design's static feedback APIs.
// Those render outside the application provider and need the same theme.
ConfigProvider.config({
  holderRender: children => <ConfigProvider theme={aquadocsTheme}>{children}</ConfigProvider>,
});

const App = () => {
  return (
    <ConfigProvider
      theme={aquadocsTheme}
    >
      {/* Bọc toàn bộ ứng dụng bằng AntApp */}
      <AntApp className="aquadocs-app">
        <ToastContainer />
        <AuthProvider>
          <OrganizationProvider> {/* Bọc ở đây */}
            <DocumentProvider> {/* Bọc ở đây */}
              <SearchProvider> {/* Bọc ở đây */}
                <AppRouter />
              </SearchProvider>
            </DocumentProvider>
          </OrganizationProvider>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
