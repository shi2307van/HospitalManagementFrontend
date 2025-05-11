import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

// Static data
const services = [
  {
    name: 'General Consultation',
    description: 'Regular checkups and medical consultations for common health issues.',
    icon: UserIcon,
  },
  {
    name: 'Specialist Appointments',
    description: 'Connect with specialists in cardiology, dermatology, orthopedics, and more.',
    icon: CalendarIcon,
  },
  {
    name: 'Emergency Care',
    description: '24/7 emergency services with priority treatment for critical conditions.',
    icon: ClockIcon,
  },
  {
    name: 'Online Consultation',
    description: 'Virtual appointments from the comfort of your home via video calls.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Lab Tests',
    description: 'Comprehensive diagnostic tests with quick and accurate results.',
    icon: MagnifyingGlassIcon,
  },
  {
    name: 'Specialized Treatments',
    description: 'Advanced medical treatments using cutting-edge technology.',
    icon: BuildingOffice2Icon,
  },
];

const testimonials = [
  {
    quote: "The online consultation feature saved me so much time. I got medical advice from a specialist without leaving my home.",
    author: "Sarah Johnson",
    role: "Patient",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    quote: "The doctors are extremely knowledgeable and caring. They took the time to understand my concerns and provided personalized care.",
    author: "Michael Chen",
    role: "Patient",
    image: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    quote: "Booking appointments was seamless, and the reminder system ensures I never miss a scheduled visit. Highly recommended!",
    author: "Robert Wilson",
    role: "Patient",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

const stats = [
  { label: 'Patients Treated', value: 50000, suffix: '+' },
  { label: 'Specialist Doctors', value: 200, suffix: '+' },
  { label: 'Years of Service', value: 25, suffix: '+' },
  { label: 'Satisfaction Rate', value: 98, suffix: '%' },
];

// Custom hook for counting animation
const useCountUp = (end, start = 0, duration = 2000) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const timeRef = useRef(null);
  
  useEffect(() => {
    // Reset counter when the end value changes
    countRef.current = start;
    setCount(start);
    
    const step = Math.ceil((end - start) / (duration / 16));
    let currentCount = start;
    let startTime = null;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        // Calculate the new count value based on progress
        currentCount = Math.min(
          start + Math.floor((end - start) * (progress / duration)),
          end
        );
        
        if (currentCount !== countRef.current) {
          countRef.current = currentCount;
          setCount(currentCount);
        }
        
        timeRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure we reach exactly the end value
        setCount(end);
      }
    };
    
    timeRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (timeRef.current) {
        cancelAnimationFrame(timeRef.current);
      }
    };
  }, [end, start, duration]);
  
  return count;
};

// Intersection Observer hook to trigger animations when element is visible
const useIntersectionObserver = (options = {}) => {
  const [ref, setRef] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);
    
    observer.observe(ref);
    
    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, options]);
  
  return [setRef, isVisible];
};

// Animated counter component
const StatCounter = ({ value, suffix, label }) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const count = useCountUp(
    isVisible ? value : 0,
    0,
    2000
  );
  
  const formattedCount = value >= 1000 
    ? count.toLocaleString() 
    : count;
  
  return (
    <div ref={ref} className="text-center transform transition-all duration-500 hover:scale-105">
      <div className="text-5xl font-bold text-white relative">
        <span className="inline-block">{formattedCount}</span>
        <span className="inline-block">{suffix}</span>
        <span className="absolute -bottom-2 left-0 right-0 mx-auto h-1 bg-primary-300 w-0 group-hover:w-full transition-all duration-500 opacity-50"></span>
      </div>
      <div className="mt-3 text-base font-medium text-primary-100">{label}</div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="bg-white w-full">
      {/* Hero Section */}
      <div className="relative pb-20 w-full">
        {/* Background element */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-100 to-white h-3/4 w-full -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20">
          <div className="relative z-10 lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 px-4 sm:px-6 lg:px-0 xl:pr-16">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                <span className="block">Your Health,</span>
                <span className="block text-primary-600">Our Priority</span>
              </h1>
              <p className="mt-8 text-xl text-gray-500 max-w-3xl">
                Experience healthcare that puts you first. Book appointments, consult with doctors,
                and manage your health records all in one place.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/doctors"
                  className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Browse Doctors
                </Link>
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8">
                {[
                  'Appointments 24/7',
                  'Expert Specialists',
                  'Quality Care',
                  'Affordable Prices'
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <p className="text-base text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-12 lg:mt-0 lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1280&q=80"
                  alt="Doctor with patient"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats section */}
      <section className="bg-primary-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {stats.map((stat, index) => (
              <StatCounter 
                key={index}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <div className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900">
              Our Healthcare Services
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              We offer a wide range of medical services to cater to your healthcare needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                  <service.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-500">{service.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link 
              to="/services" 
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors"
            >
              View All Services
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Get the healthcare you need in three simple steps
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold absolute -top-8 left-1/2 transform -translate-x-1/2 shadow-lg">1</div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Create an Account</h3>
                  <p className="text-gray-500">Sign up and complete your medical profile to help us understand your needs.</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold absolute -top-8 left-1/2 transform -translate-x-1/2 shadow-lg">2</div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Book an Appointment</h3>
                  <p className="text-gray-500">Choose a doctor and schedule a convenient time for your consultation.</p>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center relative">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold absolute -top-8 left-1/2 transform -translate-x-1/2 shadow-lg">3</div>
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get Treatment</h3>
                  <p className="text-gray-500">Visit for your appointment or join a video consultation for remote care.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900">
              What Our Patients Say
            </h2>
            <p className="mt-4 text-xl text-gray-500 max-w-3xl mx-auto">
              Read testimonials from patients who have experienced our care
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative"
              >
                <div className="absolute -top-5 left-10 text-primary-500 text-7xl">"</div>
                <p className="text-gray-700 relative z-10 text-lg mb-8">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author}
                      className="h-12 w-12 rounded-full object-cover" 
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{testimonial.author}</h4>
                    <p className="text-gray-500">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primary-100">Schedule your appointment today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="ml-4 inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-primary-500 hover:bg-primary-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 