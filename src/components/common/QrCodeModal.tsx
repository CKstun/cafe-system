import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { QrCode, Smartphone, Coffee, Link2, CheckCircle2 } from 'lucide-react';

export const QrCodeModal: React.FC = () => {
  const { tables, setCustomerDetails, setCustomerScreen, setViewMode } = useCafe();

  // Static landing URL for all physical table QR codes
  const STATIC_LANDING_URL = 'https://cafepita.railway.app/welcome';
  const staticQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    STATIC_LANDING_URL
  )}`;

  const handleSimulateScan = () => {
    // Unified Dine-in entry: No dynamic table query parameter (?table=05).
    // Directs guest to the Welcome Screen where Dine-in is preset and customer enters their name.
    setCustomerDetails('', 'dine-in', null);
    setCustomerScreen(2); // Welcome / Enter Name Screen
    setViewMode('customer');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16">
      {/* Top Banner */}
      <div className="bg-[#F4EFEB] border-b border-[#E6DDD4] px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow-sm shrink-0">
              <QrCode className="w-6 h-6 text-[#FDFBF7]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-[#2B231F]">Standardized Table QR Standees</h1>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#5C4033] text-[#FDFBF7] font-bold">
                  Unified Dine-in Model
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Static URL Active
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                All physical table standees encode a single static URL (<span className="font-mono font-semibold text-[#5C4033]">/welcome</span>). Orders are identified by customer name at counter pickup rather than dynamic table IDs.
              </p>
            </div>
          </div>

          {/* Quick Universal Scan CTA */}
          <button
            onClick={handleSimulateScan}
            className="self-start md:self-auto py-2.5 px-4 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] text-xs font-bold rounded-full transition flex items-center gap-2 shadow-sm active:scale-98 cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Simulate Customer Scan (Open Welcome)</span>
          </button>
        </div>
      </div>

      {/* Static Landing URL Info Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="bg-white border border-[#E6DDD4] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs text-[#5C4033]">
            <Link2 className="w-4 h-4 shrink-0 text-[#8C7A6B]" />
            <div>
              <span className="font-bold text-[#2B231F]">Standardized QR Target: </span>
              <code className="bg-[#F4EFEB] px-2 py-0.5 rounded text-[11px] font-mono font-bold text-[#5C4033]">
                {STATIC_LANDING_URL}
              </code>
              <p className="text-[11px] text-[#8C7A6B] mt-0.5">
                No dynamic table parameter query string (<code className="line-through text-red-400">?table=05</code>). Eliminates QR mismatches and table drift.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Name-Based Callout Ready</span>
          </div>
        </div>
      </div>

      {/* Table Standees Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {tables.map((table) => {
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
                    Table #{table.table_number} Standee
                  </div>

                  {/* Standardized Static QR Image */}
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border border-[#E6DDD4] flex items-center justify-center shadow-xs">
                    <img
                      src={staticQrUrl}
                      alt={`Standardized Dine-in QR for Table ${table.table_number}`}
                      className="w-full h-full rounded-lg"
                    />
                  </div>

                  <p className="text-[10px] text-[#8C7A6B] mt-2.5 leading-snug">
                    Scan to open <span className="font-semibold text-[#5C4033]">/welcome</span>. Customer enters their name on the Welcome Screen.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F4EFEB]">
                  <button
                    onClick={handleSimulateScan}
                    className="w-full py-2 px-3 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] text-xs font-bold rounded-full transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
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
