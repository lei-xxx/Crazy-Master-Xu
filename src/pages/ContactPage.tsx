
import React from 'react';
import { motion } from 'framer-motion';
import { publicAsset } from '@/lib/utils';
import './ContactPage.css';

const ContactPage = () => {
  return (
    <div className="relative overflow-hidden pt-16 bg-black">
      <img
        className="contact-spotlight-right"
        src={publicAsset('/effects/contact-spotlight-right.png')}
        alt=""
        aria-hidden="true"
      />
      <div className="relative z-10">
      {/* Hero Section */}
      <section className="text-white pb-8 pt-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

            <h1 className="mb-0 text-5xl">
              <span className="text-5xl font-semibold text-white">Let's</span>
              <span className="text-5xl font-light text-white">Start Building</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="pb-12 pt-4 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center">
              <div className="space-y-10 lg:space-y-14">
                <div>
                  <h3 className="mb-5 text-[16px] font-semibold text-white lg:mb-7 lg:text-[18px]">Email</h3>
                  <div className="flex flex-col items-center justify-center gap-3 text-[16px] text-white/60 lg:flex-row lg:gap-20 lg:text-[18px]">
                    <p className="text-[16px] lg:text-[18px]">xuleixulei2021@qq.com</p>
                    <p className="text-[16px] lg:text-[18px]">xuleixulei2021@gmail.com</p>
                  </div>
                </div>

                <div>
                  <h3 className="mb-5 text-[16px] font-semibold text-white lg:mb-7 lg:text-[18px]">Phone</h3>
                  <p className="text-[16px] text-white/60 lg:text-[18px]">18406593255</p>
                </div>

                <div>
                  <h3 className="mb-5 text-[16px] font-semibold text-white lg:mb-7 lg:text-[18px]">Location</h3>
                  <p className="text-[16px] text-white/60 lg:text-[18px]">China, Shenzhen</p>
                </div>

                <div>
                  <h3 className="mb-5 text-[16px] font-semibold text-white lg:mb-7 lg:text-[18px]">ZCOOL</h3>
                  <a
                    href="https://www.zcool.com.cn/u/24205250"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[16px] text-white/60 transition-colors hover:text-[#FF5825] lg:text-[18px]"
                  >
                    zcool.com.cn/u/24205250
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      </div>
    </div>);

};

export default ContactPage;
