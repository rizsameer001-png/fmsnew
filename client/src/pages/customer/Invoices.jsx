// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { 
//   EyeIcon, 
//   DownloadIcon, 
//   CreditCardIcon,
//   DocumentTextIcon,
//   ArrowPathIcon,
//   ExclamationTriangleIcon
// } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';
// import invoiceService from '../../services/invoice.service';
// import paymentService from '../../services/payment.service';
// import Modal from '../../components/common/Modal';
// import { formatCurrency, formatDate } from '../../utils/formatters';

// const CustomerInvoices = () => {
//   const [selectedInvoice, setSelectedInvoice] = useState(null);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [isPaying, setIsPaying] = useState(false);

//   const { data: invoices, isLoading, refetch } = useQuery({
//     queryKey: ['myInvoices'],
//     queryFn: () => invoiceService.getMyInvoices(),
//   });

//   const handleDownload = async (invoice) => {
//     try {
//       await invoiceService.downloadInvoicePDF(invoice._id);
//       toast.success('Download started');
//     } catch (error) {
//       toast.error('Failed to download invoice');
//     }
//   };

//   const handlePay = async (invoice) => {
//     setSelectedInvoice(invoice);
//     setShowPaymentModal(true);
//   };

//   const initiatePayment = async () => {
//     setIsPaying(true);
//     try {
//       const response = await paymentService.createOrder(selectedInvoice._id);
//       // Initialize Razorpay payment
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_KEY_ID,
//         amount: response.order.amount,
//         currency: response.order.currency,
//         name: 'FMS Solutions',
//         description: `Invoice ${selectedInvoice.invoiceNumber}`,
//         order_id: response.order.id,
//         handler: async (paymentResponse) => {
//           await paymentService.verifyPayment({
//             orderId: paymentResponse.razorpay_order_id,
//             paymentId: paymentResponse.razorpay_payment_id,
//             signature: paymentResponse.razorpay_signature,
//             invoiceId: selectedInvoice._id,
//           });
//           toast.success('Payment successful!');
//           refetch();
//           setShowPaymentModal(false);
//         },
//         prefill: {
//           email: selectedInvoice.customerId?.email,
//         },
//         theme: {
//           color: '#4F46E5',
//         },
//       };
//       const razorpay = new window.Razorpay(options);
//       razorpay.open();
//     } catch (error) {
//       toast.error('Failed to initiate payment');
//     } finally {
//       setIsPaying(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
//       pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
//       overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
//       draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//     };
//     return badges[status] || 'bg-gray-100 text-gray-800';
//   };

//   const totalDue = invoices?.invoices?.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.totalAmount, 0) || 0;
//   const overdueCount = invoices?.invoices?.filter(i => i.status === 'overdue').length || 0;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
//           <p className="text-gray-600 dark:text-gray-400 mt-1">View and pay your bills online</p>
//         </div>
//         <button
//           onClick={() => refetch()}
//           className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//         >
//           <ArrowPathIcon className="h-4 w-4" />
//           <span>Refresh</span>
//         </button>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <p className="text-sm text-gray-600 dark:text-gray-400">Total Due</p>
//           <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</p>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <p className="text-sm text-gray-600 dark:text-gray-400">Paid Invoices</p>
//           <p className="text-2xl font-bold text-green-600">{invoices?.invoices?.filter(i => i.status === 'paid').length || 0}</p>
//         </div>
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
//           <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
//           {overdueCount > 0 && (
//             <p className="text-xs text-red-500 mt-1">⚠️ Please pay to avoid late fees</p>
//           )}
//         </div>
//       </div>

//       {/* Invoices Table */}
//       <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Due Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//               {invoices?.invoices?.map((invoice) => (
//                 <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
//                   <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
//                   <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(invoice.issueDate)}</td>
//                   <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(invoice.dueDate)}</td>
//                   <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
//                       {invoice.status?.toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => handleDownload(invoice)}
//                         className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
//                         title="Download PDF"
//                       >
//                         <DownloadIcon className="h-5 w-5" />
//                       </button>
//                       {invoice.status !== 'paid' && (
//                         <button
//                           onClick={() => handlePay(invoice)}
//                           className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
//                           title="Pay Now"
//                         >
//                           <CreditCardIcon className="h-5 w-5" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {invoices?.invoices?.length === 0 && (
//           <div className="text-center py-12">
//             <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//             <p className="text-gray-500">No invoices found</p>
//           </div>
//         )}
//       </div>

//       {/* Payment Modal */}
//       <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Make Payment" size="md">
//         <div className="space-y-4">
//           <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
//             <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</p>
//             <p className="font-semibold text-gray-900 dark:text-white">{selectedInvoice?.invoiceNumber}</p>
//             <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Amount to Pay</p>
//             <p className="text-2xl font-bold text-indigo-600">{formatCurrency(selectedInvoice?.totalAmount)}</p>
//           </div>

//           <div className="space-y-3">
//             <button
//               onClick={initiatePayment}
//               disabled={isPaying}
//               className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center space-x-2"
//             >
//               <CreditCardIcon className="h-5 w-5" />
//               <span>{isPaying ? 'Processing...' : 'Pay with Card'}</span>
//             </button>
//             <button className="w-full py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
//               Pay with UPI
//             </button>
//             <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
//               Net Banking
//             </button>
//           </div>

//           <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start space-x-2">
//             <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
//             <p className="text-xs text-blue-800 dark:text-blue-200">
//               Secure payment powered by Razorpay. Your payment information is encrypted.
//             </p>
//           </div>

//           <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
//             <button
//               onClick={() => setShowPaymentModal(false)}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default CustomerInvoices;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowDownTrayIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import invoiceService from '../../services/invoice.service';
import paymentService from '../../services/payment.service';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const { data: invoices, isLoading, refetch } = useQuery({
    queryKey: ['myInvoices'],
    queryFn: () => invoiceService.getMyInvoices(),
  });

  const handleDownload = async (invoice) => {
    try {
      await invoiceService.downloadInvoicePDF(invoice._id);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handlePay = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const initiatePayment = async () => {
    setIsPaying(true);
    try {
      const response = await paymentService.createOrder(selectedInvoice._id);
      // Initialize Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: response.order.amount,
        currency: response.order.currency,
        name: 'FMS Solutions',
        description: `Invoice ${selectedInvoice.invoiceNumber}`,
        order_id: response.order.id,
        handler: async (paymentResponse) => {
          await paymentService.verifyPayment({
            orderId: paymentResponse.razorpay_order_id,
            paymentId: paymentResponse.razorpay_payment_id,
            signature: paymentResponse.razorpay_signature,
            invoiceId: selectedInvoice._id,
          });
          toast.success('Payment successful!');
          refetch();
          setShowPaymentModal(false);
        },
        prefill: {
          email: selectedInvoice.customerId?.email,
        },
        theme: {
          color: '#4F46E5',
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Failed to initiate payment');
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const totalDue = invoices?.invoices?.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.totalAmount, 0) || 0;
  const overdueCount = invoices?.invoices?.filter(i => i.status === 'overdue').length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and pay your bills online</p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Due</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Paid Invoices</p>
          <p className="text-2xl font-bold text-green-600">{invoices?.invoices?.filter(i => i.status === 'paid').length || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
          <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
          {overdueCount > 0 && (
            <p className="text-xs text-red-500 mt-1">⚠️ Please pay to avoid late fees</p>
          )}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoices?.invoices?.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(invoice.issueDate)}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{formatDate(invoice.dueDate)}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(invoice.status)}`}>
                      {invoice.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(invoice)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                        title="Download PDF"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button
                          onClick={() => handlePay(invoice)}
                          className="p-1.5 text-green-600 hover:text-green-800 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                          title="Pay Now"
                        >
                          <CreditCardIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices?.invoices?.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No invoices found</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Make Payment" size="md">
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Number</p>
            <p className="font-semibold text-gray-900 dark:text-white">{selectedInvoice?.invoiceNumber}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Amount to Pay</p>
            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(selectedInvoice?.totalAmount)}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={initiatePayment}
              disabled={isPaying}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              <CreditCardIcon className="h-5 w-5" />
              <span>{isPaying ? 'Processing...' : 'Pay with Card'}</span>
            </button>
            <button className="w-full py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition">
              Pay with UPI
            </button>
            <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Net Banking
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Secure payment powered by Razorpay. Your payment information is encrypted.
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerInvoices;