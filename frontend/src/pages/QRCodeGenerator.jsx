import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, FileImage, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import { businessAPI } from '../config/api';
import jsPDF from 'jspdf';

const QRCodeGenerator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        const data = await businessAPI.getQRCode(id);
        setQrData(data);
      } catch (err) {
        console.error('Error fetching QR code:', err);
        setError(err.message || 'Failed to load QR code');
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [id]);

  const downloadPNG = () => {
    if (!qrData?.qrCode) return;

    // Create a link element
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `${qrData.businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    if (!qrData?.qrCode) return;

    try {
      // Create new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 100], // Square format for QR code
      });

      // Add QR code image to PDF
      const img = new Image();
      img.src = qrData.qrCode;
      
      img.onload = () => {
        // Calculate dimensions to fit QR code in PDF
        const qrSize = 80; // mm
        const x = (100 - qrSize) / 2;
        const y = 5;

        pdf.addImage(qrData.qrCode, 'PNG', x, y, qrSize, qrSize);
        
        // Add business name below QR code
        pdf.setFontSize(10);
        pdf.text(qrData.businessName, 50, 95, { align: 'center', maxWidth: 90 });
        
        // Save PDF
        const filename = `${qrData.businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qrcode.pdf`;
        pdf.save(filename);
      };

      img.onerror = () => {
        alert('Error loading image for PDF. Please try again.');
      };
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating QR code...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8 md:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-semibold">{error}</p>
              <Link
                to="/profile"
                className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Profile</span>
            </Link>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-200">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">QR Code Generator</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{qrData?.businessName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Display */}
          {qrData && (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 border border-gray-200 mb-6">
              <div className="flex flex-col items-center">
                {/* QR Code Image */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-6 border-4 border-gray-100">
                  <img
                    src={qrData.qrCode}
                    alt={`QR Code for ${qrData.businessName}`}
                    className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
                  />
                </div>

                {/* URL Display */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 w-full max-w-md">
                  <p className="text-xs text-gray-600 mb-1 text-center">Website URL</p>
                  <p className="text-sm sm:text-base font-mono text-gray-900 break-all text-center">{qrData.url}</p>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md">
                  <button
                    onClick={downloadPNG}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <FileImage className="w-5 h-5" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-purple-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-6 h-6 text-purple-600" />
              How to Use
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold text-lg">1.</span>
                <span>Download the QR code as PNG or PDF</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold text-lg">2.</span>
                <span>Print it on your visiting cards, shop boards, or marketing materials</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold text-lg">3.</span>
                <span>Customers can scan the QR code with their phone camera to instantly visit your website</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold text-lg">4.</span>
                <span>Perfect for offline marketing and increasing online presence</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default QRCodeGenerator;

