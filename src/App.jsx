import React, { useState, useMemo } from 'react';
import { Map, Wallet, Users, Calendar, Utensils, TrainFront, Receipt, Info, Settings, Shield, X } from 'lucide-react';

// ข้อมูลอัตราค่าใช้จ่ายประเมินต่อคนต่อวัน (แยกค่าอาหารและค่าเดินทาง)
const initialCountryData = {
  japan: {
    name: 'ญี่ปุ่น',
    currency: 'JPY',
    symbol: '¥',
    rates: {
      budget: { food: 2500, transport: 1000 },
      moderate: { food: 6500, transport: 3000 },
      comfort: { food: 14000, transport: 5000 },
      luxury: { food: 45000, transport: 20000 }
    }
  },
  china: {
    name: 'จีน',
    currency: 'CNY',
    symbol: '¥',
    rates: {
      budget: { food: 100, transport: 30 },
      moderate: { food: 250, transport: 100 },
      comfort: { food: 500, transport: 200 },
      luxury: { food: 2000, transport: 1000 }
    }
  },
  korea: {
    name: 'เกาหลีใต้',
    currency: 'KRW',
    symbol: '₩',
    rates: {
      budget: { food: 30000, transport: 7500 },
      moderate: { food: 75000, transport: 20000 },
      comfort: { food: 140000, transport: 40000 },
      luxury: { food: 300000, transport: 200000 }
    }
  },
  taiwan: {
    name: 'ไต้หวัน',
    currency: 'TWD',
    symbol: 'NT$',
    rates: {
      budget: { food: 500, transport: 200 },
      moderate: { food: 1200, transport: 500 },
      comfort: { food: 2300, transport: 1000 },
      luxury: { food: 7500, transport: 3000 }
    }
  },
  hongkong: {
    name: 'ฮ่องกง',
    currency: 'HKD',
    symbol: 'HK$',
    rates: {
      budget: { food: 200, transport: 80 },
      moderate: { food: 500, transport: 150 },
      comfort: { food: 1200, transport: 300 },
      luxury: { food: 3800, transport: 1000 }
    }
  },
  vietnam: {
    name: 'เวียดนาม',
    currency: 'VND',
    symbol: '₫',
    rates: {
      budget: { food: 275000, transport: 85000 },
      moderate: { food: 900000, transport: 325000 },
      comfort: { food: 2650000, transport: 600000 },
      luxury: { food: 10500000, transport: 2500000 }
    }
  },
  singapore: {
    name: 'สิงคโปร์',
    currency: 'SGD',
    symbol: 'S$',
    rates: {
      budget: { food: 25, transport: 10 },
      moderate: { food: 50, transport: 20 },
      comfort: { food: 150, transport: 40 },
      luxury: { food: 600, transport: 250 }
    }
  }
};

const budgetLevels = [
  {
    id: 'budget',
    title: 'แบบประหยัด',
    emoji: '🎒',
    description: [
      'กินร้านสะดวกซื้อ ร้านเชน หรือ supermarket',
      'เดินทางด้วยวิธีสาธารณะและเดินไกลๆได้',
      'ไม่แวะกินขนมหรือคาเฟ่เยอะ'
    ]
  },
  {
    id: 'moderate',
    title: 'แบบปานกลาง',
    emoji: '☕',
    description: [
      'กินร้านอาหารไม่แพงสลับกับร้านชื่อดังบ้าง',
      'เดินทางด้วยวิธีสาธารณะ',
      'แวะกินกาแฟหรือซื้อขนมบ้างเล็กน้อย'
    ]
  },
  {
    id: 'comfort',
    title: 'แบบสบาย',
    emoji: '🚕',
    description: [
      'กินร้านอาหารขึ้นชื่อของท้องถิ่น',
      'เดินทางด้วยวิธีสาธารณะและมีเรียก taxi บ้าง',
      'แวะกินกาแฟหรือซื้อขนมทุกวัน'
    ]
  },
  {
    id: 'luxury',
    title: 'แบบหรูหรา',
    emoji: '✨',
    description: [
      'กินร้านหรูหรือมิชลิน',
      'เดินทางด้วย taxi รัวๆ',
      'cafe hopping วันละหลายที่'
    ]
  }
];

const bookingLinks = [
  { title: 'จองที่พักราคาถูก', url: 'https://www.trip.com/t/CvHltNRnPU2', icon: '🏨' },
  { title: 'หาดีลตั๋วเครื่องบิน', url: 'https://www.trip.com/t/BPCOfsPnPU2', icon: '✈️' },
  { title: 'รวมตั๋วรถไฟและตั๋วเข้าชมต่างๆ', url: 'https://www.trip.com/t/AOMkiPTnPU2', icon: '🎟️' },
  { title: 'เช่ารถขับ', url: 'https://www.trip.com/t/Eev8LqUnPU2', icon: '🚗' },
  { title: 'จองรถรับส่งสนามบิน', url: 'https://www.trip.com/t/xTUBN2WnPU2', icon: '🚐' },
  { title: 'esim ราคาถูกสุด', url: 'https://www.trip.com/t/rB8JCAanPU2', icon: '📱' },
  { title: 'เลือกซื้อประกันเดินทางด้วยตัวเอง', url: 'https://prakun.com/travel-insurance/?agt_id=18120', icon: '🛡️' },
];

export default function App() {
  const [country, setCountry] = useState('japan');
  const [budgetLevel, setBudgetLevel] = useState('moderate');
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [buffer, setBuffer] = useState(0);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configData, setConfigData] = useState(initialCountryData);
  const [editingCountry, setEditingCountry] = useState('japan');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH').format(amount);
  };

  const handleRateChange = (countryKey, levelKey, type, value) => {
    setConfigData(prev => ({
      ...prev,
      [countryKey]: {
        ...prev[countryKey],
        rates: {
          ...prev[countryKey].rates,
          [levelKey]: {
            ...prev[countryKey].rates[levelKey],
            [type]: Math.max(0, parseInt(value) || 0)
          }
        }
      }
    }));
  };

  const calculation = useMemo(() => {
    const selectedCountry = configData[country];
    const rates = selectedCountry.rates[budgetLevel];
    const dailyPerPerson = rates.food + rates.transport;
    const baseTotal = dailyPerPerson * days * people;
    const bufferAmount = (baseTotal * buffer) / 100;
    const total = baseTotal + bufferAmount;

    return {
      currency: selectedCountry.currency,
      symbol: selectedCountry.symbol,
      foodRate: rates.food,
      transportRate: rates.transport,
      dailyPerPerson,
      baseTotal,
      bufferAmount,
      total
    };
  }, [country, budgetLevel, days, people, buffer, configData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 relative">
        
        {/* Header */}
        <div className="relative text-center bg-cover bg-center bg-no-repeat rounded-2xl overflow-hidden shadow-md" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop')" }}>
          <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm"></div>
          <div className="relative p-8 md:p-12 space-y-3">
            <button 
              onClick={() => setIsConfigModalOpen(true)}
              className="absolute right-4 top-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all"
              title="ตั้งค่าอัตราค่าใช้จ่าย"
            >
              <Settings className="w-6 h-6" />
            </button>
            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center justify-center gap-3">
              <Wallet className="w-8 h-8 md:w-10 md:h-10 text-blue-300" />
              Travel Budget Calculator
            </h1>
            <p className="text-blue-100 text-sm md:text-base font-medium">คำนวณงบประมาณค่าอาหารและค่าเดินทางต่างประเทศ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            
            {/* Country Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Map className="w-4 h-4" />
                ประเทศที่จะไป
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(configData).map(([key, data]) => (
                  <button
                    key={key}
                    onClick={() => setCountry(key)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      country === key
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {data.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Level */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Receipt className="w-4 h-4" />
                ระดับงบประมาณ
              </label>
              <div className="space-y-3">
                {budgetLevels.map((level) => (
                  <label
                    key={level.id}
                    className={`relative flex cursor-pointer rounded-xl border p-4 transition-all focus:outline-none ${
                      budgetLevel === level.id
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="budget_level"
                      value={level.id}
                      className="sr-only"
                      onChange={(e) => setBudgetLevel(e.target.value)}
                      checked={budgetLevel === level.id}
                    />
                    <div className="flex flex-col">
                      <span className={`block text-sm font-semibold flex items-center gap-2 ${budgetLevel === level.id ? 'text-blue-900' : 'text-gray-900'}`}>
                        <span className="text-xl">{level.emoji}</span> {level.title}
                      </span>
                      <ul className={`mt-2 space-y-1 text-xs list-disc pl-5 ${budgetLevel === level.id ? 'text-blue-700' : 'text-gray-500'}`}>
                        {level.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Days and People */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  จำนวนวัน
                </label>
                <div className="flex items-center">
                  <button onClick={() => setDays(Math.max(1, days - 1))} className="px-4 py-2 bg-gray-100 rounded-l-lg hover:bg-gray-200 font-bold">-</button>
                  <input
                    type="number"
                    min="1"
                    value={days}
                    onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center py-2 border-y border-gray-100 focus:outline-none"
                  />
                  <button onClick={() => setDays(days + 1)} className="px-4 py-2 bg-gray-100 rounded-r-lg hover:bg-gray-200 font-bold">+</button>
                </div>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4" />
                  จำนวนคน
                </label>
                <div className="flex items-center">
                  <button onClick={() => setPeople(Math.max(1, people - 1))} className="px-4 py-2 bg-gray-100 rounded-l-lg hover:bg-gray-200 font-bold">-</button>
                  <input
                    type="number"
                    min="1"
                    value={people}
                    onChange={(e) => setPeople(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center py-2 border-y border-gray-100 focus:outline-none"
                  />
                  <button onClick={() => setPeople(people + 1)} className="px-4 py-2 bg-gray-100 rounded-r-lg hover:bg-gray-200 font-bold">+</button>
                </div>
              </div>
            </div>

            {/* Buffer Selection */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Shield className="w-4 h-4" />
                ส่วนเผื่อฉุกเฉิน (Contingency Buffer)
              </label>
              <div className="flex flex-wrap gap-3">
                {[0, 5, 10, 15, 20].map((percent) => (
                  <button
                    key={percent}
                    onClick={() => setBuffer(percent)}
                    className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      buffer === percent
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Results Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg sticky top-8">
              <h2 className="text-lg font-medium text-blue-100 mb-1">งบประมาณรวมทั้งหมด</h2>
              <div className="text-4xl font-bold mb-1 break-all">
                {calculation.symbol}{formatCurrency(calculation.total)}
              </div>
              <div className="text-blue-200 text-sm mb-8">
                สกุลเงิน {calculation.currency} ({configData[country].name})
              </div>

              <div className="space-y-4 pt-4 border-t border-blue-500/50">
                <div>
                  <div className="text-sm text-blue-100 mb-1">งบประมาณ / วัน / คน</div>
                  <div className="text-2xl font-semibold">
                    {calculation.symbol}{formatCurrency(calculation.dailyPerPerson)}
                  </div>
                </div>

                <div className="bg-blue-700/50 rounded-xl p-4 mt-6">
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4" />
                    แจกแจงอัตราการคำนวณ
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-blue-50">
                      <span className="flex items-center gap-2"><Utensils className="w-3 h-3"/> ค่าอาหาร/วัน:</span>
                      <span>{formatCurrency(calculation.foodRate)} {calculation.currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-50">
                      <span className="flex items-center gap-2"><TrainFront className="w-3 h-3"/> ค่าเดินทาง/วัน:</span>
                      <span>{formatCurrency(calculation.transportRate)} {calculation.currency}</span>
                    </div>
                    <div className="border-t border-blue-500/50 my-2 pt-2 text-blue-200 text-xs leading-relaxed">
                      <strong>สูตร:</strong> <br/>
                      (ค่าอาหาร {formatCurrency(calculation.foodRate)} + ค่าเดินทาง {formatCurrency(calculation.transportRate)}) 
                      <br/>× {days} วัน 
                      <br/>× {people} คน
                      <br/>= <strong>{formatCurrency(calculation.baseTotal)} {calculation.currency}</strong>
                      {buffer > 0 && (
                        <>
                          <br/>+ เผื่อฉุกเฉิน {buffer}% ({formatCurrency(calculation.bufferAmount)})
                          <br/>= <strong>{formatCurrency(calculation.total)} {calculation.currency}</strong>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>

        </div>

        {/* Booking Links Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            ✨ แนะนำช่องทางจองประหยัดงบ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {bookingLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-sm transition-all group bg-gray-50/50"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{link.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 leading-snug">
                  {link.title}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-sm font-medium text-gray-400">
            &copy; {new Date().getFullYear()} Travel Budget Calculator by ampmie152. All rights reserved.
          </p>
        </footer>

        {/* Configuration Modal */}
        {isConfigModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  ตั้งค่าอัตราค่าใช้จ่ายต่อวัน (สกุลเงินท้องถิ่น)
                </h2>
                <button onClick={() => setIsConfigModalOpen(false)} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">เลือกประเทศที่ต้องการแก้ไข:</label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {Object.entries(configData).map(([key, data]) => (
                      <button
                        key={key}
                        onClick={() => setEditingCountry(key)}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          editingCountry === key
                            ? 'bg-gray-800 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {data.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {budgetLevels.map((level) => (
                    <div key={level.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h3 className="font-semibold text-gray-800 mb-3">{level.title}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1">
                            <Utensils className="w-3 h-3" /> ค่าอาหาร / วัน
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={configData[editingCountry].rates[level.id].food}
                              onChange={(e) => handleRateChange(editingCountry, level.id, 'food', e.target.value)}
                              className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="absolute right-3 top-2 text-gray-400 text-sm">{configData[editingCountry].symbol}</span>
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1">
                            <TrainFront className="w-3 h-3" /> ค่าเดินทาง / วัน
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              value={configData[editingCountry].rates[level.id].transport}
                              onChange={(e) => handleRateChange(editingCountry, level.id, 'transport', e.target.value)}
                              className="w-full pl-3 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="absolute right-3 top-2 text-gray-400 text-sm">{configData[editingCountry].symbol}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                >
                  เสร็จสิ้น
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}