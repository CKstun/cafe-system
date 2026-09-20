import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { QrCode, Smartphone, Coffee, ExternalLink } from 'lucide-react';

export const QrCodeModal: React.FC = () => {
  const { tables, setCustomerDetails, setCustomerScreen, setViewMode } = useCafe();

  const handleSimulateScan = (tableId: number) => {
    setCustomerDetails('Walk-in Guest', 'dine-in', tableId);
    setCustomerScreen(3); // Direct into catalog with table set
    setViewMode('customer');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16">
      {/* Top Banner */}
      <div className="bg-[#F4EFEB] border-b border-[#E6DDD4] px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow-sm">
              <QrCode className="w-6 h-6 text-[#FDFBF7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-[#2B231F]">Table QR Code Standees</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5C4033] text-[#FDFBF7] font-bold">
                  Dine-in Tables 1–10
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B]">
                In the physical cafe, customers scan these table tent QR codes with their smartphone camera to open the menu without installing any app.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {tables.map((table) => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://cafepita.railway.app/order?table=${table.id}`;

            return (
              <div
                key={table.id}
                className="bg-white border-2 border-[#E6DDD4] rounded-3xl p-5 text-center flex flex-col justify-between shadow-sm hover:shadow-md hover:border-[#5C4033] transition group"
              >
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-[#5C4033] mb-2">
                    <Coffee className="w-4 h-4" />
                    <span className="font-display font-bold text-sm">Café Pepita</span>
                  </div>

                  <div className="bg-[#F4EFEB] py-1 px-3 rounded-full inline-block text-[11px] font-bold text-[#5C4033] mb-3">
                    Table #{table.table_number}
                  </div>

                  {/* QR Image */}
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border border-[#E6DDD4] flex items-center justify-center shadow-xs">
                    <img
                      src={qrUrl}
                      alt={`Table ${table.id} QR`}
                      className="w-full h-full rounded-lg"
                    />
                  </div>

                  <p className="text-[10px] text-[#8C7A6B] mt-2.5">
                    Scan to order from Table {table.table_number}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F4EFEB]">
                  <button
                    onClick={() => handleSimulateScan(table.id)}
                    className="w-full py-2 px-3 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] text-xs font-bold rounded-full transition flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Simulate Scan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
