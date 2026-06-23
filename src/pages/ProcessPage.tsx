
import React from 'react';
import { motion } from 'framer-motion';
import {MessageCircleDashed as MessageCircle, FileText, Code, GraduationCap, HeadphonesIcon} from 'lucide-react';

const ProcessPage = () => {
  const processSteps = [
    {
      step: 1,
      title: 'Consultation & Plan',
      icon: MessageCircle,
      description: 'We discuss your vision, goals, and requirements. I then recommend the most suitable website package for your needs.',
      details: [
        'In-depth discovery call to understand your business',
        'Analysis of your target audience and competitors',
        'Recommendation of the best package and approach',
        'Timeline and milestone planning',
        'Technical requirements assessment'
      ],
      timeline: '1-2 days'
    },
    {
      step: 2,
      title: 'Agreement & Payment',
      icon: FileText,
      description: 'We formalize the project scope with a clear contract. Upon signing, an initial payment secures your project timeline.',
      details: [
        'Detailed project scope and deliverables',
        'Clear terms and conditions',
        'Payment schedule (typically 50% upfront)',
        'Project timeline with key milestones',
        'Communication and feedback protocols'
      ],
      timeline: '1 day'
    },
    {
      step: 3,
      title: 'Development & Delivery',
      icon: Code,
      description: 'I build and rigorously test your website. You\'ll receive a complete, fully functional site, ready for launch.',
      details: [
        'Custom design and development',
        'Regular progress updates and previews',
        'Thorough testing across devices and browsers',
        'SEO optimization and performance tuning',
        'Content integration and final review'
      ],
      timeline: '2-6 weeks'
    },
    {
      step: 4,
      title: 'Training & Handover',
      icon: GraduationCap,
      description: 'I provide comprehensive training for your team on how to manage and update the website confidently.',
      details: [
        'Content management system training',
        'Basic maintenance and update procedures',
        'SEO best practices guidance',
        'Analytics and performance monitoring setup',
        'Documentation and resource materials'
      ],
      timeline: '1-2 days'
    },
    {
      step: 5,
      title: 'Ongoing Support',
      icon: HeadphonesIcon,
      description: 'My dedicated support team is available to answer any questions and ensure your site runs smoothly long after launch.',
      details: [
        'Technical support and troubleshooting',
        'Regular security and performance updates',
        'Content updates and modifications',
        'Feature enhancements and additions',
        'Backup and maintenance services'
      ],
      timeline: 'Ongoing'
    }
  ];

  return (
    <div className="pt-16 bg-black">
      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-semibold mb-6">
              Our 
              <span className="text-[#FF5825] text-5xl"> Development Process</span>
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
              A transparent, step-by-step approach that ensures your project is delivered 
              on time, on budget, and exceeds your expectations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vertical Timeline */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/20"></div>
            
            {/* Timeline Steps */}
            <div className="space-y-12">
              {processSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="relative flex items-start"
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="h-16 w-16 bg-[#FF5825] rounded-full flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-black border-2 border-[#FF5825] rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#FF5825]">{step.step}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-8 flex-1">
                    <div className="bg-black rounded-xl p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                        <span className="bg-[#FF5825] text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {step.timeline}
                        </span>
                      </div>
                      
                      <p className="text-lg text-white/60 mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-start">
                            <div className="h-2 w-2 bg-[#FF5825] rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-white/60 text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProcessPage;
