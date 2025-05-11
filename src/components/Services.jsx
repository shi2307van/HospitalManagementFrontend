import {
  HeartIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const services = [
  {
    name: 'Emergency Care',
    description: '24/7 emergency medical care for critical conditions with immediate attention from our specialists.',
    icon: HeartIcon,
  },
  {
    name: 'Laboratory Services',
    description: 'Comprehensive lab testing with state-of-the-art equipment for accurate and timely results.',
    icon: BeakerIcon,
  },
  {
    name: 'Medical Check-ups',
    description: 'Routine health examinations to prevent illness and promote overall wellness.',
    icon: ClipboardDocumentListIcon,
  },
  {
    name: 'Specialized Consultations',
    description: 'Expert consultations with specialists in various medical fields to address specific health concerns.',
    icon: UserGroupIcon,
  },
  {
    name: 'Health Education',
    description: 'Educational programs and resources to help patients understand and manage their health conditions.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Online Appointments',
    description: 'Convenient online scheduling system for booking appointments with healthcare providers.',
    icon: ClockIcon,
  },
];

const Services = () => {
  return (
    <div className="bg-white w-full">
      {/* Header section */}
      <div className="w-full bg-gradient-to-r from-primary-600 to-primary-500 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
              Our Services
            </h1>
            <p className="mt-8 text-xl text-white/90 max-w-3xl mx-auto">
              Comprehensive healthcare services designed to meet all your medical needs with excellence and compassion.
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-base font-semibold text-primary uppercase tracking-wide">What We Offer</p>
            <h2 className="mt-4 text-4xl font-extrabold text-gray-900">
              Comprehensive Healthcare Services
            </h2>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              Our hospital provides a range of services to ensure comprehensive care for all patients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-white rounded-2xl shadow-lg p-10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-8">
                  <service.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.name}</h3>
                <p className="text-base text-gray-500">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-base font-semibold text-primary uppercase tracking-wide">Our Process</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Getting the care you need is simple and straightforward with our streamlined process.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="hidden lg:block w-full border-t-2 border-gray-200"></div>
            </div>
            
            <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="font-bold text-xl mt-6 mb-4">Book Appointment</h3>
                <p className="text-gray-500">Schedule your appointment online or by calling our reception desk.</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="font-bold text-xl mt-6 mb-4">Consultation</h3>
                <p className="text-gray-500">Meet with our healthcare professionals for diagnosis and treatment plans.</p>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="font-bold text-xl mt-6 mb-4">Treatment & Follow-up</h3>
                <p className="text-gray-500">Receive personalized care and schedule follow-up appointments as needed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Section */}
      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <p className="text-base font-semibold text-primary uppercase tracking-wide">Coverage Options</p>
              <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
                Insurance Coverage
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                We work with a variety of insurance providers to ensure that you can access the care you need. Our administrative team can help verify your coverage and explain any out-of-pocket costs.
              </p>
              <div className="mt-8">
                <ul className="space-y-4">
                  {['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Medicare', 'Medicaid'].map((insurance) => (
                    <li key={insurance} className="flex items-center">
                      <svg className="h-5 w-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600">{insurance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-primary-50 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Need help with insurance?</h3>
                <p className="text-gray-600 mb-6">
                  Our dedicated team is here to help you navigate insurance coverage and billing questions.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-primary mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Phone Support</p>
                      <p className="text-gray-500">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-primary mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-500">insurance@hospitalms.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to book your appointment?</span>
              <span className="block text-xl mt-2 text-white/90">Our team is ready to provide the care you deserve.</span>
            </h2>
          </div>
          <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-full shadow">
              <a 
                href="/login" 
                className="inline-flex items-center px-8 py-4 bg-white text-lg font-semibold rounded-full text-primary shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl"
              >
                Book Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services; 