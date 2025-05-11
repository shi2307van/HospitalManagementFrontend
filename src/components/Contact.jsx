import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const Contact = () => {
  // Mock form submission with no actual functionality
  const handleSubmit = (e) => {
    e.preventDefault();
    // No actual form submission or state reset
  };

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 765-4321'],
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: ['info@hospitalms.com', 'support@hospitalms.com'],
    },
    {
      icon: MapPinIcon,
      title: 'Location',
      details: ['123 Healthcare Avenue', 'Medical District, City, 12345'],
    },
    {
      icon: ClockIcon,
      title: 'Working Hours',
      details: ['Monday to Friday: 8:00 AM - 8:00 PM', 'Saturday: 9:00 AM - 5:00 PM'],
    },
  ];

  return (
    <div className="bg-white w-full">
      {/* Header section */}
      <div className="w-full bg-gradient-to-r from-primary-600 to-primary-500 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto">
              We're here to help. Reach out to us with any questions or concerns.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((item) => (
              <div 
                key={item.title}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                {item.details.map((detail, index) => (
                  <p key={index} className="text-gray-600">
                    {detail}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form & Map Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-12 text-white">
                <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
                <p className="text-white/90 text-lg">
                  We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Your Name"
                      className="w-full px-6 py-4 bg-gray-50 border-0 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="Your Email"
                      className="w-full px-6 py-4 bg-gray-50 border-0 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      placeholder="Subject"
                      className="w-full px-6 py-4 bg-gray-50 border-0 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      required
                      placeholder="Your Message"
                      className="w-full px-6 py-4 bg-gray-50 border-0 rounded-xl text-lg focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all duration-200"
                    ></textarea>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white text-lg font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Map and Address */}
            <div>
              <p className="text-lg font-semibold text-primary uppercase tracking-wide">Visit Us</p>
              <h2 className="mt-3 text-4xl font-extrabold text-gray-900 mb-8">
                Our Location
              </h2>
              {/* Map placeholder - in a real app, you would use Google Maps or similar */}
              <div className="bg-primary-50 rounded-3xl h-96 mb-8 overflow-hidden shadow-lg flex items-center justify-center">
                <div className="w-full h-full relative bg-white">
                  <div className="absolute inset-0 bg-[linear-gradient(#e6e6e6_1px,transparent_1px),linear-gradient(90deg,#e6e6e6_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary-600 h-12 w-12 rounded-full flex items-center justify-center shadow-lg">
                      <MapPinIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 right-4 bg-white/80 rounded-lg p-4 shadow-md">
                    <p className="font-bold text-lg text-gray-800">HealthConnect Hospital</p>
                    <p className="text-sm text-gray-600">123 Healthcare Avenue, Medical District</p>
                  </div>
                  {/* Simulate roads */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-0 right-0 h-8 bg-gray-300 transform -translate-y-1/2"></div>
                    <div className="absolute top-0 bottom-0 left-1/3 w-8 bg-gray-300 transform -translate-x-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
                <div className="flex items-start mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center mr-4">
                    <PhoneIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-gray-600">+1 (555) 765-4321</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center mr-4">
                    <EnvelopeIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                    <p className="text-gray-600">info@hospitalms.com</p>
                    <p className="text-gray-600">support@hospitalms.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-base font-semibold text-primary uppercase tracking-wide">Common Questions</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Find answers to common questions about our services and facilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What are your visiting hours?</h3>
              <p className="text-gray-600">Our general visiting hours are from 10:00 AM to 8:00 PM daily. Specialized wards may have different visiting hours, please check with the specific department.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How do I schedule an appointment?</h3>
              <p className="text-gray-600">You can schedule appointments through our online portal, by calling our reception desk, or by visiting us in person. Emergency cases do not require prior appointments.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">What insurance plans do you accept?</h3>
              <p className="text-gray-600">We accept a wide range of insurance plans. Please contact our insurance verification department for specific information about your coverage.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Can I access my medical records online?</h3>
              <p className="text-gray-600">Yes, registered patients can access their medical records through our secure patient portal. You'll need to set up an account with valid identification.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-6">
            Need Emergency Help?
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Our emergency services are available 24/7. Don't hesitate to contact us immediately for urgent medical care.
          </p>
          <div className="inline-flex rounded-full bg-white px-8 py-4 shadow-lg">
            <a href="tel:+1555911" className="text-2xl font-bold text-primary">
              Emergency: +1 (555) 911
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 