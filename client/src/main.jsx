// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { HelmetProvider } from 'react-helmet-async';
// import { Toaster } from 'react-hot-toast';
// import App from './App';
// import { AuthProvider } from './contexts/AuthContext';
// import { SocketProvider } from './contexts/SocketContext';
// import { ThemeProvider } from './contexts/ThemeContext';
// import { NotificationProvider } from './contexts/NotificationContext';
// import './index.css';

// // Create a client for React Query
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// });

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <HelmetProvider>
//       <QueryClientProvider client={queryClient}>
//         <BrowserRouter>
//           <ThemeProvider>
//             <AuthProvider>
//               <SocketProvider>
//                 <NotificationProvider>
//                   <App />
//                   <Toaster
//                     position="top-right"
//                     toastOptions={{
//                       duration: 4000,
//                       style: {
//                         background: '#363636',
//                         color: '#fff',
//                       },
//                       success: {
//                         duration: 3000,
//                         iconTheme: {
//                           primary: '#10B981',
//                           secondary: '#fff',
//                         },
//                       },
//                       error: {
//                         duration: 4000,
//                         iconTheme: {
//                           primary: '#EF4444',
//                           secondary: '#fff',
//                         },
//                       },
//                     }}
//                   />
//                 </NotificationProvider>
//               </SocketProvider>
//             </AuthProvider>
//           </ThemeProvider>
//         </BrowserRouter>
//       </QueryClientProvider>
//     </HelmetProvider>
//   </React.StrictMode>
// );


import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './index.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Get the root element
const rootElement = document.getElementById('root');

// Create root and render
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <SocketProvider>
                  <NotificationProvider>
                    <App />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 4000,
                          iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </NotificationProvider>
                </SocketProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}