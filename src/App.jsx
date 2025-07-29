import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { ConfigProvider, App as AntApp } from 'antd'; // Import thêm 'App' và đổi tên thành 'AntApp' để tránh trùng lặp
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext'; // Import
import { OrganizationProvider } from './contexts/OrganizationContext';
import { DocumentProvider } from './contexts/DocumentContext'; // Import
import { SearchProvider } from './contexts/SearchContext';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0d5bb5',
          fontFamily: "'Be Vietnam Pro', sans-serif", // Thêm dòng này
        },
      }}
    >
      {/* Bọc toàn bộ ứng dụng bằng AntApp */}
      <AntApp> 
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
