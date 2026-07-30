export const metadata = {
  title: 'CCIOS V9 MEGA ALL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
        {children}
      </body>
    </html>
  );
}