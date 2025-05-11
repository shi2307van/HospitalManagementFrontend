import React, { useState, useEffect, useRef } from 'react';
import {
  UserGroupIcon,
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const values = [
  {
    name: 'Patient-Centered Care',
    description: "We prioritize our patients' needs and preferences, ensuring respectful and responsive care.",
    icon: HeartIcon,
  },
  {
    name: 'Excellence',
    description: 'We are committed to providing the highest quality healthcare services with the latest medical technology.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Compassion',
    description: 'We treat every patient with kindness, empathy, and respect, recognizing their individual needs.',
    icon: HeartIcon,
  },
  {
    name: 'Innovation',
    description: 'We continuously seek new and better ways to improve healthcare delivery and patient outcomes.',
    icon: GlobeAltIcon,
  },
];

const stats = [
  { label: 'Years of Service', value: 30, suffix: '+' },
  { label: 'Medical Specialists', value: 200, suffix: '+' },
  { label: 'Patients Annually', value: 50000, suffix: '+' },
  { label: 'Specialties', value: 20, suffix: '+' },
];

const team = [
  {
    name: 'Dr. Michael Wilson',
    role: 'Chief Medical Officer',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    bio: 'Dr. Wilson has over 20 years of experience in healthcare management and clinical practice.',
  },
  {
    name: 'Dr. Sarah Johnson',
    role: 'Chief of Surgery',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    bio: 'Dr. Johnson is a pioneering surgeon with numerous awards for her innovative surgical techniques.',
  },
  {
    name: 'Dr. Robert Chen',
    role: 'Head of Research',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80',
    bio: 'Dr. Chen leads our research department, focusing on developing new treatments and therapies.',
  },
  {
    name: 'Dr. Emily Rodriguez',
    role: 'Director of Patient Care',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    bio: 'Dr. Rodriguez ensures that all patients receive the highest quality of care throughout their treatment.',
  },
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

// StatsCounter component
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
      <p className="text-5xl font-extrabold text-white relative group">
        <span className="inline-block">{formattedCount}</span>
        <span className="inline-block">{suffix}</span>
        <span className="absolute bottom-0 left-0 w-0 h-1 bg-white group-hover:w-full transition-all duration-500"></span>
      </p>
      <p className="mt-4 text-lg font-medium text-white/80">{label}</p>
    </div>
  );
};

const About = () => {
  return (
    <div className="bg-white w-full">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-primary-600 to-primary-500 py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
              About Our Hospital
            </h1>
            <p className="mt-8 text-xl text-white/90 max-w-3xl mx-auto">
              We are committed to providing the highest quality healthcare with compassion and respect for all.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-lg font-semibold text-primary uppercase tracking-wide">Our Principles</p>
            <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
              Our Core Values
            </h2>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              These principles guide everything we do and every decision we make.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Value 1 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-8 mx-auto">
                <StarIcon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Excellence</h3>
              <p className="text-gray-600 text-center">
                We are committed to achieving the highest standards in healthcare delivery, professional competence, and quality of service.
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-8 mx-auto">
                <HeartIcon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Compassion</h3>
              <p className="text-gray-600 text-center">
                We show care and empathy for all patients, understanding their experiences and respecting their dignity at all times.
              </p>
            </div>
            
            {/* Value 3 */}
            <div className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-600 mb-8 mx-auto">
                <ShieldCheckIcon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Integrity</h3>
              <p className="text-gray-600 text-center">
                We honor our commitments, act ethically, and demonstrate honesty and fairness in everything we do.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
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
      </div>

      {/* Our Team Section */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-lg font-semibold text-primary uppercase tracking-wide">Our Experts</p>
            <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
              Our Leadership Team
            </h2>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              Meet the dedicated professionals guiding our hospital towards excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Team Member 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="h-72 overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80"
                  alt="Dr. Sarah Johnson" 
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr. Sarah Johnson</h3>
                <p className="text-primary-600 font-medium mb-4">Chief Medical Officer</p>
                <p className="text-gray-600">
                  Dr. Johnson brings over 25 years of experience in healthcare management and clinical excellence.
                </p>
              </div>
            </div>
            
            {/* Team Member 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="h-72 overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                  alt="Michael Roberts" 
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Michael Roberts</h3>
                <p className="text-primary-600 font-medium mb-4">Hospital Director</p>
                <p className="text-gray-600">
                  With a background in healthcare administration, Michael ensures our hospital delivers world-class care.
                </p>
              </div>
            </div>
            
            {/* Team Member 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="h-72 overflow-hidden">
                <img 
                  className="w-full h-full object-cover" 
                  src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80"
                  alt="Dr. Emily Chen" 
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr. Emily Chen</h3>
                <p className="text-primary-600 font-medium mb-4">Head of Research</p>
                <p className="text-gray-600">
                  Dr. Chen leads our research initiatives, driving innovation in medical treatments and patient care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <p className="text-lg font-semibold text-primary uppercase tracking-wide">Our Journey</p>
              <h2 className="mt-3 text-4xl font-extrabold text-gray-900 mb-8">
                Our History
              </h2>
              <div className="prose prose-lg text-gray-500">
                <p className="text-xl">
                  Founded in 1990, our hospital has grown from a small clinic to a comprehensive healthcare center serving thousands of patients annually.
                </p>
                <p className="mt-6 text-xl">
                  Throughout our journey, we have remained dedicated to our mission of providing exceptional care and improving the health of our community.
                </p>
                <p className="mt-6 text-xl">
                  Today, we continue to expand our services and embrace innovative medical technologies while maintaining our commitment to compassionate, patient-centered care.
                </p>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="aspect-w-16 aspect-h-9 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1928&q=80" 
                  alt="Hospital history" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:py-28 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              <span className="block">Join our healthcare family</span>
              <span className="block text-2xl mt-4 text-white/90">Experience the difference of patient-centered care.</span>
            </h2>
          </div>
          <div className="mt-10 lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-full shadow">
              <a
                href="/contact"
                className="inline-flex items-center px-10 py-5 bg-white text-xl font-semibold rounded-full text-primary shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 