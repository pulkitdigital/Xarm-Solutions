import './globals.css';
import Sidebar from '../components/sidebar';

export const metadata = { title: 'XARM Solutions CRM', description: 'Event Operations CRM' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-white antialiased">
        <Sidebar />
        <main className="ml-56 min-h-screen">{children}</main>
      </body>
    </html>
  );
}