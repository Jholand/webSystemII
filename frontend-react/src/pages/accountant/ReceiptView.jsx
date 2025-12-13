import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { showInfoToast } from '../../utils/sweetAlertHelper';

const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample receipt data
  const receipt = {
    id: id,
    receiptNo: `RCP-2025-${String(id).padStart(3, '0')}`,
    date: '2025-12-01',
    time: '10:30 AM',
    donor: 'John Doe',
    donorType: 'Member',
    paymentType: 'Donation', // or 'Event Fee'
    category: 'Tithes',
    amount: 5000,
    amountInWords: 'Five Thousand Pesos',
    paymentMethod: 'Walk-in',
    collector: 'Maria Santos',
    notes: 'Monthly tithe'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    showInfoToast('Downloading', 'Downloading receipt as PDF');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Action Buttons (Hide on Print) */}
      <div className="no-print">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:shadow transition-all"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:shadow transition-all"
            >
              <Printer size={16} className="inline mr-1.5" />
              Print Receipt
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:opacity-90 transition-all"
            >
              <Download size={16} className="inline mr-1.5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Print Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            <strong>Thermal Printer Receipt (58mm)</strong> - Click "Print Receipt" to print on thermal printer.
          </p>
        </div>
      </div>

      {/* Thermal Receipt Container - 58mm width */}
      <div className="flex justify-center items-start py-6 print:py-0">
        <div className="thermal-receipt bg-white shadow-lg print:shadow-none">
          {/* Church Header */}
          <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
            <div className="font-bold text-base mb-1">OLPGVMA CHURCH</div>
            <div className="text-xs leading-tight">
              123 Church Street<br />
              Manila, Philippines<br />
              Tel: +63 2 1234 5678
            </div>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-2">
            <div className="font-bold text-sm uppercase">Official Receipt</div>
            <div className="text-xs font-mono mt-1">{receipt.receiptNo}</div>
          </div>

          {/* Divider */}
          <div className="border-b border-dashed border-gray-400 mb-2"></div>

          {/* Receipt Details */}
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-semibold">{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-semibold">{receipt.time}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-dashed border-gray-400 my-2"></div>

          {/* Donor Information */}
          <div className="text-xs mb-2">
            <div className="font-semibold mb-1">RECEIVED FROM:</div>
            <div className="font-bold text-sm">{receipt.donor}</div>
            <div className="text-gray-600 print:text-gray-900">({receipt.donorType})</div>
          </div>

          {/* Payment Type & Category */}
          <div className="text-xs space-y-1 mb-2">
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-semibold">{receipt.paymentType}</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="font-semibold">{receipt.category}</span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-semibold">{receipt.paymentMethod}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-dashed border-gray-400 my-2"></div>

          {/* Amount */}
          <div className="text-center py-2 bg-gray-100 print:bg-gray-200 mb-2">
            <div className="text-xs text-gray-600 print:text-gray-900 mb-1">AMOUNT</div>
            <div className="text-2xl font-bold">₱{receipt.amount.toLocaleString()}</div>
            <div className="text-xs italic mt-1 px-2 break-words">
              {receipt.amountInWords}
            </div>
          </div>

          {/* Notes */}
          {receipt.notes && (
            <>
              <div className="border-b border-dashed border-gray-400 my-2"></div>
              <div className="text-xs mb-2">
                <div className="font-semibold mb-1">Notes:</div>
                <div className="break-words">{receipt.notes}</div>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="border-b border-dashed border-gray-400 my-2"></div>

          {/* Collector Info */}
          <div className="text-xs mb-2">
            <div>Collected by: <span className="font-semibold">{receipt.collector}</span></div>
            <div className="text-gray-600 print:text-gray-900">Accountant</div>
          </div>

          {/* Footer */}
          <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
            <div className="text-center text-xs leading-tight text-gray-600 print:text-gray-900">
              This is an official receipt.<br />
              Please keep for your records.<br />
              Thank you for your support!
            </div>
          </div>

          {/* Barcode Placeholder */}
          <div className="text-center mt-2 pt-2 border-t border-dashed border-gray-400">
            <div className="text-xs font-mono tracking-wider">*{receipt.receiptNo}*</div>
          </div>
        </div>
      </div>

      <style>{`
        .thermal-receipt {
          width: 58mm;
          padding: 8mm;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          margin: 0 auto;
        }

        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .thermal-receipt {
            width: 58mm;
            padding: 3mm;
            margin: 0;
            box-shadow: none !important;
            font-size: 10px;
            line-height: 1.3;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptView;
