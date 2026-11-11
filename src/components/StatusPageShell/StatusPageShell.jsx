import AppHeader from '../AppHeader/AppHeader';
import AppFooter from '../AppFooter/AppFooter';

const StatusPageShell = ({ children }) => (
    <div className="aquadocs-status-shell">
        <AppHeader />
        <main className="aquadocs-status-content">{children}</main>
        <AppFooter />
    </div>
);

export default StatusPageShell;
