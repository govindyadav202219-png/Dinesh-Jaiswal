
import React from 'react';
import { type InvoiceData, type InvoiceLineItem } from '../types';

interface DataTableProps {
  invoiceData: InvoiceData;
  onReset: () => void;
  fileName: string;
}

export const DataTable: React.FC<DataTableProps> = ({ invoiceData, onReset, fileName }) => {

  const convertToCSV = (data: InvoiceData): string => {
    // User requested order: SR, INV, DT, CODE, DESC, QTY, UOM, U.P, TOT, HS, COO, STD, Lot NO, Exp, Fab
    const headers = [
      'SR', 'INV', 'DT', 'CODE', 'DESC', 'QTY', 'UOM', 'U.P', 'TOT', 'HS', 'COO', 'STD', 'Lot NO / Batch NO', 'Exp Date', 'Fab Date'
    ];
    
    const rows = data.lineItems.map(item => [
      item.sr ?? '',
      item.inv || data.invoiceNumber || '',
      item.dt || data.invoiceDate || '',
      item.code ?? '',
      item.description ?? '',
      item.qty ?? '',
      item.uom ?? '',
      item.unitPrice ?? '',
      item.total ?? '',
      item.hsCode ?? '',
      item.coo ?? '',
      item.std ?? '',
      item.lotNumber ?? '',
      item.expDate ?? '',
      item.fabDate ?? '',
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','));
    
    return [headers.join(','), ...rows].join('\n');
  };

  const handleExport = () => {
    const csvContent = convertToCSV(invoiceData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName.replace('.pdf', '')}_extracted.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-white">Extracted Invoice Data</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-400">
                <p><strong>Inv #:</strong> {invoiceData.invoiceNumber || 'N/A'}</p>
                <p><strong>Date:</strong> {invoiceData.invoiceDate || 'N/A'}</p>
                <p><strong>Total Items:</strong> {invoiceData.lineItems.length}</p>
            </div>
        </div>
        <div className="flex gap-2">
           <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            Export to Excel/CSV
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors"
          >
            New PDF
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr className="text-[10px] md:text-xs">
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">SR</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">INV</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">DT</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">CODE</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">DESC</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">QTY</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">UOM</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">U.P</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">TOT</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">HS</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">COO</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase">STD</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase whitespace-nowrap">Lot/Batch</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase whitespace-nowrap">Exp Date</th>
              <th className="px-3 py-3 text-left font-medium text-gray-400 uppercase whitespace-nowrap">Fab Date</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {invoiceData.lineItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-700/50 text-[11px] md:text-xs text-gray-300">
                <td className="px-3 py-3 font-medium text-white">{item.sr || index + 1}</td>
                <td className="px-3 py-3 truncate max-w-[80px]">{item.inv || invoiceData.invoiceNumber || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{item.dt || invoiceData.invoiceDate || '—'}</td>
                <td className="px-3 py-3 font-mono text-teal-400">{item.code || '—'}</td>
                <td className="px-3 py-3 min-w-[150px]">{item.description || '—'}</td>
                <td className="px-3 py-3 text-right font-bold text-white">{item.qty ?? '—'}</td>
                <td className="px-3 py-3">{item.uom || '—'}</td>
                <td className="px-3 py-3 text-right">{item.unitPrice ?? '—'}</td>
                <td className="px-3 py-3 text-right font-bold text-teal-300">{item.total ?? '—'}</td>
                <td className="px-3 py-3">{item.hsCode || '—'}</td>
                <td className="px-3 py-3">{item.coo || '—'}</td>
                <td className="px-3 py-3">{item.std || '—'}</td>
                <td className="px-3 py-3">{item.lotNumber || '—'}</td>
                <td className="px-3 py-3 text-red-300">{item.expDate || '—'}</td>
                <td className="px-3 py-3 text-blue-300">{item.fabDate || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {invoiceData.lineItems.length === 0 && <p className="text-center py-8 text-gray-500 italic">No products were found in this document.</p>}
    </div>
  );
};
