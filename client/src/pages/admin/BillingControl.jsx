import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, EyeIcon, ArrowDownTrayIcon, CurrencyRupeeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import invoiceService from '../../services/invoice.service';
import paymentService from '../../services/payment.service';
import Modal from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';

const BillingControl = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({ customerId: '', items: [{ description: '', quantity: 1, unitPrice: 0 }], dueDate: '' });
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading } = useQuery({ queryKey: ['invoices'], queryFn: () => invoiceService.getInvoices() });
  const { data: statsData } = useQuery({ queryKey: ['paymentStats'], queryFn: () => paymentService.getPaymentStats() });

  const createMutation = useMutation({ mutationFn: (data) => invoiceService.createInvoice(data), onSuccess: () => { queryClient.invalidateQueries(['invoices']); setShowModal(false); toast.success('Invoice created'); } });

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }] });
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  const updateItem = (index, field, value) => { const newItems = [...formData.items]; newItems[index][field] = value; if (field === 'quantity' || field === 'unitPrice') newItems[index].total = newItems[index].quantity * newItems[index].unitPrice; setFormData({ ...formData, items: newItems }); };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-900">Billing Control</h1><p className="text-gray-600 mt-1">Manage invoices, payments, and revenue tracking</p></div><button onClick={() => setShowModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><PlusIcon className="h-5 w-5" /><span>Create Invoice</span></button></div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Revenue</p><p className="text-2xl font-bold text-green-600">{formatCurrency(statsData?.totalRevenue || 0)}</p></div><div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center"><CurrencyRupeeIcon className="h-6 w-6 text-green-600" /></div></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Pending Payments</p><p className="text-2xl font-bold text-yellow-600">{formatCurrency(statsData?.pendingAmount || 0)}</p><p className="text-xs text-gray-500">{statsData?.pendingCount} invoices</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">Overdue</p><p className="text-2xl font-bold text-red-600">{formatCurrency(statsData?.overdueAmount || 0)}</p><p className="text-xs text-gray-500">{statsData?.overdueCount} invoices</p></div></div>
        <div className="bg-white rounded-xl shadow-md p-6"><div><p className="text-sm text-gray-600">This Month</p><p className="text-2xl font-bold text-indigo-600">{formatCurrency(statsData?.monthlyRevenue || 0)}</p><p className="text-xs text-green-600">↑ 12% vs last month</p></div></div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{['Invoice #', 'Customer', 'Amount', 'Status', 'Issue Date', 'Due Date', 'Actions'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoicesData?.invoices?.map((inv) => (
              <tr key={inv._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{inv.customerId?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatCurrency(inv.totalAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : inv.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{inv.status.toUpperCase()}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.issueDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.dueDate)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm"><div className="flex space-x-2"><button className="text-blue-600 hover:text-blue-800"><EyeIcon className="h-5 w-5" /></button><button onClick={() => invoiceService.downloadInvoicePDF(inv._id)} className="text-green-600 hover:text-green-800"><DownloadIcon className="h-5 w-5" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Invoice" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Customer</label><select required value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg"><option value="">Select Customer</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Items</label>{formData.items.map((item, idx) => (<div key={idx} className="flex gap-2 mb-2"><input placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" /><input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))} className="w-20 px-3 py-2 border border-gray-300 rounded-lg" /><input type="number" placeholder="Price" value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', parseInt(e.target.value))} className="w-28 px-3 py-2 border border-gray-300 rounded-lg" /><button type="button" onClick={() => removeItem(idx)} className="text-red-500">✕</button></div>))}<button type="button" onClick={addItem} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Item</button></div>
          <div className="border-t pt-4"><div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div><div className="flex justify-between"><span>GST (18%):</span><span>{formatCurrency(gst)}</span></div><div className="flex justify-between font-bold"><span>Total:</span><span>{formatCurrency(total)}</span></div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input type="date" required value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" /></div>
          <div className="flex justify-end space-x-3"><button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create Invoice</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default BillingControl;