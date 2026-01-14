
import React, { useState, useMemo } from 'react';
import { type InvoiceData, type InvoiceLineItem } from '../types';

interface DataTableProps {
  invoiceData: InvoiceData;
  onReset: () => void;
  fileName: string;
}

export const DataTable: React.FC<DataTableProps> = ({ invoiceData, onReset, fileName }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return invoiceData.lineItems;
    const term = searchTerm.toLowerCase();
    return invoiceData.lineItems.filter(item => 
      (item.code?.toLowerCase().includes(term)) || 
      (item.description?.toLowerCase().includes(term)) ||
      (item.hsCode?.toLowerCase().includes(term))
    );
  }, [invoiceData.lineItems, searchTerm]);

  const convertToCSV = (data: InvoiceData): string => {
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
      link.setAttribute('download', `${fileName.replace('.pdf', '')}_OCR_Export.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700/50">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
        <div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-teal-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Extracted Inventory Data</h2>
           </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-xs text-gray-400 font-medium">
                <p>Invoice: <span className="text-teal-400">{invoiceData.invoiceNumber || 'Unknown'}</span></p>
                <p>Date: <span className="text-teal-400">{invoiceData.invoiceDate || 'Unknown'}</span></p>
                <p>Processed Items: <span className="text-white font-bold">{invoiceData.lineItems.length}</span></p>
            </div>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative flex-grow lg:min-w-[300px]">
             <input 
              type="text" 
              placeholder="Search by Code or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 transition-all pl-10"
             />
             <svg className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
           <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            Download CSV
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition-all text-sm"
          >
            Reset
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto border border-gray-700/50 rounded-xl shadow-inner bg-gray-900/30">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            <tr className="text-[10px] md:text-xs">
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">SR</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">INV</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">DT</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">CODE</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">DESC</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">QTY</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">UOM</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">U.P</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">TOT</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">HS</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">COO</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700">STD</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700 whitespace-nowrap">Lot/Batch</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700 whitespace-nowrap">Exp Date</th>
              <th className="px-3 py-4 text-left font-bold text-gray-400 uppercase tracking-widest border-b border-gray-700 whitespace-nowrap">Fab Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredItems.map((item, index) => (
              <tr key={index} className="hover:bg-teal-500/5 text-[11px] md:text-xs text-gray-300 transition-colors">
                <td className="px-3 py-3 font-medium text-gray-400 border-r border-gray-700/30">{item.sr || index + 1}</td>
                <td className="px-3 py-3 truncate max-w-[80px]">{item.inv || invoiceData.invoiceNumber || '—'}</td>
                <td className="px-3 py-3 whitespace-nowrap">{item.dt || invoiceData.invoiceDate || '—'}</td>
                <td className="px-3 py-3 font-mono text-teal-400 font-bold">{item.code || '—'}</td>
                <td className="px-3 py-3 min-w-[200px] text-white leading-relaxed">{item.description || '—'}</td>
                <td className="px-3 py-3 text-right font-black text-white bg-gray-800/20">{item.qty ?? '—'}</td>
                <td className="px-3 py-3 text-center">{item.uom || '—'}</td>
                <td className="px-3 py-3 text-right">{item.unitPrice ?? '—'}</td>
                <td className="px-3 py-3 text-right font-bold text-teal-300">{item.total ?? '—'}</td>
                <td className="px-3 py-3 font-mono">{item.hsCode || '—'}</td>
                <td className="px-3 py-3">{item.coo || '—'}</td>
                <td className="px-3 py-3">{item.std || '—'}</td>
                <td className="px-3 py-3 text-gray-400">{item.lotNumber || '—'}</td>
                <td className="px-3 py-3 text-red-400/80 font-medium">{item.expDate || '—'}</td>
                <td className="px-3 py-3 text-blue-400/80 font-medium">{item.fabDate || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 text-center">
             <svg className="w-12 h-12 text-gray-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
             <p className="text-gray-500 italic">No matching products found.</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
         <p>Showing {filteredItems.length} of {invoiceData.lineItems.length} entries</p>
         <p>Industrial OCR Engine v2.1</p>
      </div>
    </div>
  );
};
