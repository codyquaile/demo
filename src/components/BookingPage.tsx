import React, { useState } from 'react';
import logo from '../assets/logo.png'; // Place your logo image in src/assets/logo.png
import CustomCalendar from './CustomCalendar.tsx';

type UserType = 'new' | 'returning' | 'question' | null;
type VisitType = 'hormone' | 'sexual' | 'weightloss' | 'other' | null;

const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  let formatted = '';
  if (match[1]) {
    formatted = `(${match[1]}`;
  }
  if (match[2]) {
    formatted += match[2].length === 3 ? `) ${match[2]}` : match[2];
  }
  if (match[3]) {
    formatted += match[3] ? `-${match[3]}` : '';
  }
  return formatted;
};

const BookingPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    otherRequest: '',
  });
  const [focus, setFocus] = useState<{ [key: string]: boolean }>({});
  const [visitType, setVisitType] = useState<VisitType>(null);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    if (type === 'question') {
      window.location.href = '/chatbot';
    } else {
      setStep(2);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phoneNumber' ? formatPhoneNumber(value) : value
    }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocus(prev => ({ ...prev, [e.target.name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleVisitTypeSelect = (type: VisitType) => {
    setVisitType(type);
    setStep(4);
  };

  const cardClass =
    "w-full max-w-md mx-auto min-h-[520px] sm:min-h-[600px] p-6 sm:p-10 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col justify-center";

  const renderInput = (
    name: string,
    label: string,
    type: string = 'text',
    value: string,
    required: boolean = true
  ) => (
    <div className="relative mb-6">
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        autoComplete="off"
        className={`block w-full px-4 pt-6 pb-2 text-base bg-gray-50 rounded-lg border border-gray-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition shadow-sm ${value ? 'border-blue-300' : ''}`}
      />
      <label
        htmlFor={name}
        className={`absolute left-4 top-1.5 text-gray-500 text-sm pointer-events-none transition-all duration-200
          ${focus[name] || value ? 'text-xs -top-2.5 bg-white px-1 text-blue-600' : ''}`}
      >
        {label}
      </label>
    </div>
  );

  const renderVisitTypeStep = (showOther: boolean) => (
    <div className={cardClass + " my-8 mx-2 sm:mx-auto"}>
      <div className="flex flex-col items-center mb-6">
        <img src={logo} alt="Company Logo" className="h-20 w-20 mb-2" />
      </div>
      <h2 className="text-xl font-bold mb-8 text-center text-gray-800">Select Your Appointment Type</h2>
      <div className="space-y-4">
        <button
          onClick={() => handleVisitTypeSelect('hormone')}
          className="w-full py-3 px-4 bg-pink-200 text-gray-800 rounded-lg hover:bg-pink-300 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-pink-300"
        >
          Hormone
        </button>
        <button
          onClick={() => handleVisitTypeSelect('sexual')}
          className="w-full py-3 px-4 bg-blue-200 text-gray-800 rounded-lg hover:bg-blue-300 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Sexual Medicine
        </button>
        <button
          onClick={() => handleVisitTypeSelect('weightloss')}
          className="w-full py-3 px-4 bg-purple-200 text-gray-800 rounded-lg hover:bg-purple-300 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          Weightloss
        </button>
        {showOther && (
          <div>
            <button
              onClick={() => handleVisitTypeSelect('other')}
              className="w-full py-3 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400 mb-2"
            >
              Other
            </button>
            {visitType === 'other' && (
              <input
                type="text"
                name="otherRequest"
                placeholder="Please describe your request"
                value={formData.otherRequest}
                onChange={handleInputChange}
                className="mt-2 block w-full rounded-md border-gray-200 shadow-sm focus:border-blue-300 focus:ring-blue-200 px-4 py-3"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={cardClass + " my-8 mx-2 sm:mx-auto"}>
            <div className="flex flex-col items-center mb-6">
              <img src={logo} alt="Company Logo" className="h-20 w-20 mb-2" />
            </div>
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Book Your Appointment</h2>
            <div className="space-y-4">
              <button
                onClick={() => handleUserTypeSelect('new')}
                className="w-full py-3 px-4 bg-pink-200 text-gray-800 rounded-lg hover:bg-pink-300 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                I'm a New Customer
              </button>
              <button
                onClick={() => handleUserTypeSelect('returning')}
                className="w-full py-3 px-4 bg-blue-200 text-gray-800 rounded-lg hover:bg-blue-300 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                I'm a Returning Customer
              </button>
              <button
                onClick={() => handleUserTypeSelect('question')}
                className="w-full py-3 px-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                I Have a Question
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className={cardClass + " my-8 mx-2 sm:mx-auto"}>
            <div className="flex flex-col items-center mb-6">
              <img src={logo} alt="Company Logo" className="h-20 w-20 mb-2" />
            </div>
            <h2 className="text-xl font-bold mb-8 text-center text-gray-800">
              {userType === 'new' ? 'New Customer Information' : 'Returning Customer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              {userType === 'new' &&
                renderInput('name', 'Name', 'text', formData.name)}
              {renderInput('phoneNumber', 'Phone Number', 'tel', formData.phoneNumber)}
              <div className="mt-8">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-200 text-gray-800 rounded-lg hover:bg-blue-300 transition font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        );
      case 3:
        return renderVisitTypeStep(userType === 'new');
      case 4:
        // Custom calendar step
        return (
          <div className={cardClass + " my-8 mx-2 sm:mx-auto"}>
            <div className="flex flex-col items-center mb-6">
              <img src={logo} alt="Company Logo" className="h-20 w-20 mb-2" />
            </div>
            <CustomCalendar
              userType={userType === 'new' ? 'new' : 'returning'}
              appointmentType={visitType || ''}
              onBookingConfirmed={() => setStep(5)}
            />
          </div>
        );
      case 5:
        return (
          <div className={cardClass + " my-8 mx-2 sm:mx-auto text-center"}>
            <div className="flex flex-col items-center mb-6">
              <img src={logo} alt="Company Logo" className="h-20 w-20 mb-2" />
            </div>
            <h2 className="text-xl font-bold mb-4 text-blue-600">Thank You!</h2>
            <p className="text-gray-700">Your appointment has been booked.</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Step logic: after info, go to visit type selection
  React.useEffect(() => {
    if (step === 3 && (userType === 'new' || userType === 'returning')) {
      // Wait for visit type selection
    }
  }, [step, userType]);

  // On submit of info, go to visit type selection
  const handleSubmitWithVisitType = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-blue-200 to-gray-200 flex items-center justify-center overflow-auto">
      {renderStep()}
    </div>
  );
};

export default BookingPage;