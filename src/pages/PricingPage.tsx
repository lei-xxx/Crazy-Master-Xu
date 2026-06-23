
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {Check, Star, ArrowRight} from 'lucide-react';

const PricingPage = () => {
  const packages = [
  {
    name: 'Starter Template',
    target: 'Perfect for freelancers and small portfolios',
    price: '$1,299',
    features: [
    '5 pages maximum',
    'Template-based design',
    'Basic SEO optimization',
    'Contact form integration',
    'Mobile responsive',
    '30 days support',
    'Basic analytics setup'],

    popular: false
  },
  {
    name: 'Business Professional',
    target: 'Ideal for growing businesses and service providers',
    price: '$2,899',
    features: [
    'Up to 15 pages',
    'Custom design & branding',
    'Advanced SEO optimization',
    'Contact forms & lead capture',
    'Content management system',
    'E-commerce ready (up to 50 products)',
    '90 days support',
    'Google Analytics & tracking',
    'Social media integration',
    'Blog functionality'],

    popular: true
  },
  {
    name: 'Enterprise Custom',
    target: 'For complex projects and large organizations',
    price: 'Custom Quote',
    features: [
    'Unlimited pages',
    'Fully custom development',
    'Advanced integrations',
    'Custom functionality',
    'Multi-language support',
    'Advanced e-commerce features',
    'User authentication system',
    '6 months support',
    'Performance optimization',
    'Security hardening',
    'Training & documentation'],

    popular: false
  }];


  return (
    <div className="pt-16 bg-black">
      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

            <h1 className="text-5xl font-semibold mb-6">
              Transparent Pricing for 
              <span className="text-[#FF5825] text-5xl">Every Need</span>
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              Choose the perfect package for your project. All plans include our signature 
              quality, attention to detail, and comprehensive support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packages.map((pkg, index) =>
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-black rounded-2xl border-2 p-8 ${
              pkg.popular ?
              'border-[#FF5825] shadow-2xl scale-105' :
              'border-gray-900 shadow-lg'}`
              }>

                {pkg.popular &&
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#FF5825] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
              }

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-2">{pkg.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{pkg.target}</p>
                  <div className="text-4xl font-semibold text-white">{pkg.price}</div>
                  {pkg.price !== 'Custom Quote' &&
                <p className="text-white/60 text-sm mt-1">One-time payment</p>
                }
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, featureIndex) =>
                <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-[#FF5825] mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-white/60 text-sm">{feature}</span>
                    </li>
                )}
                </ul>

                <Link
                to={`/contact?package=${encodeURIComponent(pkg.name)}`}
                className={`w-full py-4 rounded-full font-semibold transition-all duration-200 flex items-center justify-center group ${
                pkg.popular ?
                'bg-[#FF5825] hover:bg-[#FF5825]/90 text-white' :
                'bg-black hover:bg-black text-white'}`
                }>

                  Select This Plan
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-16 text-center">

            <div className="bg-black rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-4">
                Not Sure Which Plan is Right for You?
              </h3>
              <p className="text-white/60 mb-6 max-w-2xl mx-auto">
                Every project is unique. Let's discuss your specific requirements and 
                recommend the perfect solution for your needs and budget.
              </p>
              <Link
                to="/contact"
                className="bg-black hover:bg-black text-white px-8 py-4 rounded-full font-semibold transition-colors duration-200 inline-flex items-center">

                Get Custom Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* What's Included */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-16">

            <h3 className="text-3xl font-semibold text-white text-center mb-12">
              What's Included in Every Package
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
              {
                title: 'Professional Design',
                description: 'Custom, modern designs that reflect your brand'
              },
              {
                title: 'Mobile Responsive',
                description: 'Perfect experience across all devices and screens'
              },
              {
                title: 'SEO Optimized',
                description: 'Built for search engines from the ground up'
              },
              {
                title: 'Ongoing Support',
                description: 'Dedicated support to keep your site running smoothly'
              }].
              map((item, index) =>
              <div key={index} className="text-center">
                  <div className="h-16 w-16 bg-[#FF5825] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-white/60 text-sm">{item.description}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>);

};

export default PricingPage;
