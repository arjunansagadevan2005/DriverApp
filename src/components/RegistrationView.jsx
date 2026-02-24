import React from 'react';
import { ICONS } from '../config';

// Helper to render icons safely
function getIcon(name, size = 24, classes = '') {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={classes} dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />;
}

export default function RegistrationView({ regData, setRegData, handleRegister, loading }) {
  
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) setRegData(prev => ({ ...prev, [field]: file }));
  };

  const updateField = (field, value) => {
    setRegData(prev => ({ ...prev, [field]: value }));
  };

  // 🔥 1. Reset specific details when switching main vehicle category
  const handleCategoryChange = (categoryId) => {
    setRegData(prev => ({
        ...prev,
        vehicleType: categoryId,
        specificModelId: '', // Reset specific model
        vehicleModelName: '',
        vehicleWeight: '',
        vehicleDimensions: '',
        bodyType: '' // Reset body type
    }));
  };

  // 🔥 2. Handle specific vehicle model selection
  const handleSpecificModelSelect = (model) => {
      setRegData(prev => ({
          ...prev,
          specificModelId: model.id,
          vehicleModelName: model.name,
          vehicleWeight: model.weight,
          vehicleDimensions: model.length
      }));
  };

  const vehicleTypes = [
    { id: '2wheeler', label: 'Bike', icon: 'truck' }, 
    { id: '3wheeler', label: 'Auto', icon: 'truck' },
    { id: '4wheeler', label: 'Car', icon: 'truck' },
    { id: 'tempo', label: 'Tempo', icon: 'truck' },
    { id: 'truck', label: 'Truck', icon: 'truck' }
  ];

  // 🔥 3. REAL-WORLD VEHICLE DATABASE
  const vehicleModelsData = {
      '3wheeler': [
          { id: '3w_ape', name: 'Piaggio Ape / Mahindra Alfa', weight: '500 kg', length: '5.5 ft' },
          { id: '3w_maxima', name: 'Bajaj Maxima C', weight: '600 kg', length: '5.5 ft' }
      ],
      '4wheeler': [
          { id: '4w_ace', name: 'Tata Ace / Super Carry', weight: '750 kg', length: '7 ft' },
          { id: '4w_jeeto', name: 'Mahindra Jeeto', weight: '600 kg', length: '6 ft' }
      ],
      'tempo': [
          { id: 'tmp_dost', name: 'Ashok Leyland Dost / Bada Dost', weight: '1.25 Ton', length: '8 ft' },
          { id: 'tmp_bolero', name: 'Mahindra Bolero Pickup', weight: '1.5 Ton', length: '9 ft' },
          { id: 'tmp_intra', name: 'Tata Intra V30 / V50', weight: '1.3 Ton', length: '8.8 ft' }
      ],
      'truck': [
          { id: 'trk_407', name: 'Tata 407 (10 ft)', weight: '2.5 Ton', length: '10 ft' },
          { id: 'trk_14', name: '14 ft LCV Truck', weight: '4 Ton', length: '14 ft' },
          { id: 'trk_17', name: '17 ft MCV Truck', weight: '5 Ton', length: '17 ft' },
          { id: 'trk_20', name: '20 ft HCV Container', weight: '7 Ton', length: '20 ft' }
      ]
  };

  const documents = [
    { key: 'aadharFile', label: 'Aadhaar Card' },
    { key: 'panFile', label: 'PAN Card' },
    { key: 'licenseFile', label: 'Driving License' },
    { key: 'rcFile', label: 'RC Book' }
  ];

  // Get the list of specific models to show based on the selected category
  const activeVehicleModels = vehicleModelsData[regData.vehicleType];

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-dark-bg overflow-y-auto no-scrollbar pb-32 pt-safe-top fade-in">
      <div className="max-w-md mx-auto px-6">
        
        {/* HEADER */}
        <div className="pt-8 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Complete Profile</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Fill in your details to start earning</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
            
            {/* PROFILE PHOTO UPLOAD */}
            <div className="text-center pb-4">
                <div className="relative inline-block">
                    <label className="block w-28 h-28 rounded-full bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden cursor-pointer group">
                    {regData.avatarFile ? (
                        <img src={URL.createObjectURL(regData.avatarFile)} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        {getIcon('user', 32, 'mb-1')}
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatarFile')} />
                    </label>
                    <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-lg pointer-events-none">
                        {getIcon('check', 16)}
                    </div>
                </div>
            </div>

            {/* PERSONAL DETAILS */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-600">Personal Details</h3>
                
                <input type="text" placeholder="Full Name (as per Bank)" required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white" 
                    value={regData.fullName || ''} onChange={(e) => updateField('fullName', e.target.value)} />
                
                <input type="tel" placeholder="Emergency Contact Number" required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white" 
                    value={regData.emergencyContact || ''} onChange={(e) => updateField('emergencyContact', e.target.value)} />

                <div className="grid grid-cols-2 gap-3">
                    <select required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white appearance-none"
                        value={regData.bloodGroup || ''} onChange={(e) => updateField('bloodGroup', e.target.value)}>
                        <option value="" disabled>Blood Group</option>
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>

                    <select required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white appearance-none"
                        value={regData.tshirtSize || ''} onChange={(e) => updateField('tshirtSize', e.target.value)}>
                        <option value="" disabled>T-Shirt Size</option>
                        {['S', 'M', 'L', 'XL', 'XXL'].map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>
                
                <select required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white appearance-none"
                    value={regData.preferredZone || ''} onChange={(e) => updateField('preferredZone', e.target.value)}>
                    <option value="" disabled>Preferred Delivery Zone</option>
                    <option value="North Chennai">North Chennai</option>
                    <option value="South Chennai">South Chennai</option>
                    <option value="Central Chennai">Central Chennai</option>
                    <option value="OMR & ECR">OMR & ECR</option>
                </select>
            </div>

            {/* VEHICLE DETAILS */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-600">Vehicle Information</h3>
                
                <div className="grid grid-cols-3 gap-2">
                    {vehicleTypes.map(v => (
                        <button key={v.id} type="button" onClick={() => handleCategoryChange(v.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${regData.vehicleType === v.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                            {getIcon(v.icon, 24, 'mb-1')}
                            <span className="text-[10px] font-bold uppercase">{v.label}</span>
                        </button>
                    ))}
                </div>

                {/* 🔥 DYNAMIC VEHICLE LIST (Shows if they pick anything other than bike) */}
                {activeVehicleModels && (
                    <div className="space-y-3 slide-down border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Select Vehicle Model</p>
                        <div className="grid grid-cols-1 gap-3">
                            {activeVehicleModels.map(model => (
                                <button key={model.id} type="button" onClick={() => handleSpecificModelSelect(model)}
                                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${regData.specificModelId === model.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={`font-bold ${regData.specificModelId === model.id ? 'text-brand-700 dark:text-brand-400' : 'text-slate-900 dark:text-white'}`}>{model.name}</h4>
                                        {regData.specificModelId === model.id && <span className="text-brand-600 dark:text-brand-400">{getIcon('check', 18)}</span>}
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        Max Load: <span className="font-bold text-slate-700 dark:text-slate-300">{model.weight}</span> • Box: <span className="font-bold text-slate-700 dark:text-slate-300">{model.length}</span>
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🔥 DYNAMIC BODY TYPE (Shows ONLY after they click a specific model) */}
                {regData.specificModelId && (
                    <div className="space-y-2 slide-down pt-2">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vehicle Body Type</p>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => updateField('bodyType', 'Open')} 
                                className={`py-3 rounded-2xl border-2 font-bold transition-all ${regData.bodyType === 'Open' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                                Open Body
                            </button>
                            <button type="button" onClick={() => updateField('bodyType', 'Closed')} 
                                className={`py-3 rounded-2xl border-2 font-bold transition-all ${regData.bodyType === 'Closed' ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                                Closed Body
                            </button>
                        </div>
                    </div>
                )}

                <input type="text" placeholder="Vehicle Number (e.g. TN01AB1234)" required className="reg-input w-full mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white uppercase" 
                    value={regData.vehicleNumber || ''} onChange={(e) => updateField('vehicleNumber', e.target.value.toUpperCase())} />
            </div>

            {/* DOCUMENT UPLOADS */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-600">KYC Documents</h3>
                <div className="grid grid-cols-2 gap-3">
                    {documents.map(doc => (
                        <label key={doc.key} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${regData[doc.key] ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                            {regData[doc.key] ? (
                                <div className="text-green-600 dark:text-green-400 text-center flex flex-col items-center">
                                    {getIcon('check', 24, 'mb-1')}
                                    <span className="text-[10px] font-bold uppercase">Uploaded</span>
                                </div>
                            ) : (
                                <div className="text-slate-400 text-center flex flex-col items-center">
                                    {getIcon('file', 24, 'mb-1')}
                                    <span className="text-[10px] font-bold uppercase">{doc.label}</span>
                                </div>
                            )}
                            <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, doc.key)} />
                        </label>
                    ))}
                </div>
            </div>

            {/* BANKING DETAILS */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-600">Banking Details (For Payouts)</h3>
                <input type="text" placeholder="Account Holder Name" required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white" 
                    value={regData.accountHolder || ''} onChange={(e) => updateField('accountHolder', e.target.value)} />
                <input type="text" placeholder="Account Number" required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white" 
                    value={regData.bankAccount || ''} onChange={(e) => updateField('bankAccount', e.target.value)} />
                <input type="text" placeholder="IFSC Code" required className="reg-input w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white uppercase" 
                    value={regData.ifscCode || ''} onChange={(e) => updateField('ifscCode', e.target.value.toUpperCase())} />
            </div>

            {/* REFERRAL CODE SECTION */}
            <div className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 p-5 rounded-3xl shadow-sm border border-brand-100 dark:border-slate-700 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-600">Referral Code (Optional)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Have a code from a friend? Enter it to claim your joining bonus!</p>
                <input type="text" placeholder="Enter Referral Code" className="reg-input w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none dark:text-white uppercase font-bold tracking-wider" 
                    value={regData.referralCode || ''} onChange={(e) => updateField('referralCode', e.target.value.toUpperCase())} />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-bold text-lg bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/30 flex justify-center items-center gap-2 active:scale-95 transition-all disabled:opacity-70">
                    {loading ? (
                        <>
                            <span className="animate-spin">{getIcon('loader', 20)}</span>
                            Saving Profile...
                        </>
                    ) : (
                        'Submit Registration'
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}